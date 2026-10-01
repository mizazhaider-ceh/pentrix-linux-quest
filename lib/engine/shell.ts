/**
 * NEXUS: Linux Quest - shell parser and Shell implementation.
 *
 * Supports: single/double quotes, backslash escapes, pipes, redirects
 * (>, >>, <, 2>, 2>>, 2>&1, 1>&2, &>, &>>), ";" chaining, && and ||,
 * background jobs with &, $VAR / ${VAR} / $? expansion, ~ expansion,
 * glob (* ? [...]), exit codes, and simple for-loops. Everything is
 * synchronous and execute() never throws: weird input always yields a
 * bash-like message.
 */

import { COMMANDS, describeSleepJob, formatMode, resetSysProcs, unknownCommandMessage, type CmdIO, type CmdResult } from "./commands";
import { FsError, VirtualFS, type UserCtx } from "./fs";
import type { EngineSetup, Shell } from "./types";

export interface Job {
  id: number;
  pid: number;
  command: string;
  nice: number;
  started: Date;
}

/* ------------------------------------------------------------------ */
/* tokenizer                                                           */
/* ------------------------------------------------------------------ */

type QuoteKind = "none" | "single" | "double" | "mixed";

interface Tok {
  text: string;
  quote: QuoteKind;
  magic: boolean; // contains an unquoted * ? [
  op: string | null;
}

function tokenize(input: string): Tok[] {
  const toks: Tok[] = [];
  let cur = "";
  let quote: QuoteKind = "none";
  let magic = false;
  let inS = false;
  let inD = false;
  const setQ = (q: "single" | "double") => {
    if (quote === "none") quote = q;
    else if (quote !== q) quote = "mixed";
  };
  const flush = () => {
    if (cur !== "" || quote !== "none") toks.push({ text: cur, quote, magic, op: null });
    cur = "";
    quote = "none";
    magic = false;
  };
  const pushOp = (op: string) => {
    flush();
    toks.push({ text: op, quote: "none", magic: false, op });
  };

  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    if (inS) {
      if (c === "'") inS = false;
      else cur += c;
      continue;
    }
    if (inD) {
      if (c === '"') {
        inD = false;
        continue;
      }
      if (c === "\\" && i + 1 < input.length && '"\\$`'.includes(input[i + 1])) {
        cur += input[i + 1];
        i++;
        continue;
      }
      cur += c;
      continue;
    }
    if (c === "'") {
      inS = true;
      setQ("single");
      continue;
    }
    if (c === '"') {
      inD = true;
      setQ("double");
      continue;
    }
    if (c === "\\" && i + 1 < input.length) {
      cur += input[i + 1];
      i++;
      continue;
    }
    if (c === " " || c === "\t") {
      flush();
      continue;
    }
    if (c === "|") {
      if (input[i + 1] === "|") {
        pushOp("||");
        i++;
      } else pushOp("|");
      continue;
    }
    if (c === "&") {
      if (input[i + 1] === "&") {
        pushOp("&&");
        i++;
      } else if (input[i + 1] === ">") {
        // &> and &>> : redirect both stdout and stderr (bash shorthand)
        if (input[i + 2] === ">") {
          pushOp("&>>");
          i += 2;
        } else {
          pushOp("&>");
          i++;
        }
      } else pushOp("&");
      continue;
    }
    if (c === ";") {
      pushOp(";");
      continue;
    }
    if (c === "<") {
      pushOp("<");
      continue;
    }
    if (c === ">") {
      // "N>" merges only when N is a lone fd digit glued to the > with no space
      if (/^[12]$/.test(cur) && quote === "none" && !magic) {
        const fd = cur;
        cur = "";
        quote = "none";
        if (input[i + 1] === ">") {
          pushOp(fd + ">>");
          i++;
        } else if (input[i + 1] === "&" && /^[12]$/.test(input[i + 2] ?? "")) {
          pushOp(fd + ">&" + input[i + 2]);
          i += 2;
        } else pushOp(fd + ">");
        continue;
      }
      if (input[i + 1] === "&") {
        // >&file : same as &>file (both stdout and stderr)
        if (input[i + 2] === ">") {
          pushOp("&>>");
          i += 2;
        } else {
          pushOp("&>");
          i++;
        }
        continue;
      }
      if (input[i + 1] === ">") {
        pushOp(">>");
        i++;
      } else pushOp(">");
      continue;
    }
    if (c === "*" || c === "?" || c === "[") magic = true;
    cur += c;
  }
  flush();
  return toks;
}

/* ------------------------------------------------------------------ */
/* parser                                                              */
/* ------------------------------------------------------------------ */

class ShellSyntaxError extends Error {}

interface Predir {
  kind: "in" | "out" | "err";
  word: Tok;
  append: boolean;
  toStdout: boolean; // 2>&1 : stderr follows stdout
  toStderr: boolean; // 1>&2 : stdout follows stderr
  toBoth: boolean; // &> / &>> : both fds go to the file
}

interface PSimple {
  words: Tok[];
  redirects: Predir[];
}

interface PPipeline {
  commands: PSimple[];
}

interface PAndOr {
  pipelines: PPipeline[];
  ops: ("&&" | "||")[];
  background: boolean;
}

function parseSimple(toks: Tok[], ref: { i: number }): PSimple {
  const words: Tok[] = [];
  const redirects: Predir[] = [];
  for (;;) {
    const t = toks[ref.i];
    if (!t || (t.op && ["|", "||", "&&", ";", "&"].includes(t.op))) break;
    if (t.op) {
      const op = t.op;
      const append = op === ">>" || op === "2>>" || op === "1>>" || op === "&>>";
      const toStdout = op === "2>&1";
      const toStderr = op === "1>&2";
      const toBoth = op === "&>" || op === "&>>";
      const kind = op === "<" ? "in" : op[0] === "2" ? "err" : "out";
      ref.i++;
      if (toStdout || toStderr) {
        // fd duplications take no target word: one fd follows the other
        const dummy: Tok = { text: "", quote: "none", magic: false, op: null };
        redirects.push({ kind, word: dummy, append, toStdout, toStderr, toBoth: false });
        continue;
      }
      const w = toks[ref.i];
      if (!w || w.op) {
        throw new ShellSyntaxError(`syntax error near unexpected token \`${w && w.op ? w.op : "newline"}'`);
      }
      redirects.push({ kind, word: w, append, toStdout: false, toStderr: false, toBoth });
      ref.i++;
      continue;
    }
    words.push(t);
    ref.i++;
  }
  if (words.length === 0 && redirects.length === 0) {
    const t = toks[ref.i];
    throw new ShellSyntaxError(`syntax error near unexpected token \`${t && t.op ? t.op : t ? t.text : "newline"}'`);
  }
  return { words, redirects };
}

function parsePipeline(toks: Tok[], ref: { i: number }): PPipeline {
  const commands = [parseSimple(toks, ref)];
  while (toks[ref.i]?.op === "|") {
    ref.i++;
    commands.push(parseSimple(toks, ref));
  }
  return { commands };
}

function parseAndOr(toks: Tok[], ref: { i: number }): PAndOr {
  const pipelines = [parsePipeline(toks, ref)];
  const ops: ("&&" | "||")[] = [];
  while (toks[ref.i]?.op === "&&" || toks[ref.i]?.op === "||") {
    ops.push(toks[ref.i].op as "&&" | "||");
    ref.i++;
    pipelines.push(parsePipeline(toks, ref));
  }
  return { pipelines, ops, background: false };
}

function parseSequence(toks: Tok[]): PAndOr[] {
  const ref = { i: 0 };
  const list: PAndOr[] = [];
  while (ref.i < toks.length) {
    const t = toks[ref.i];
    if (t.op === ";" || t.op === "&") {
      ref.i++;
      continue;
    }
    const andor = parseAndOr(toks, ref);
    const sep = toks[ref.i]?.op;
    if (sep === "&") {
      andor.background = true;
      ref.i++;
    } else if (sep === ";") {
      ref.i++;
    }
    list.push(andor);
  }
  return list;
}

/* ------------------------------------------------------------------ */
/* Shell                                                               */
/* ------------------------------------------------------------------ */

const DEFAULT_ENV: Record<string, string> = {
  USER: "agent",
  LOGNAME: "agent",
  HOME: "/home/agent",
  PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
  HOSTNAME: "nexus",
  SHELL: "/bin/bash",
  TERM: "xterm-256color",
  PWD: "/home/agent",
  OLDPWD: "/home/agent",
  LANG: "en_US.UTF-8",
};

interface StageResult {
  code: number;
  out: string;
  err: string;
  piped: string;
}

type Target = { kind: "capture" } | { kind: "pipe" } | { kind: "file"; path: string; append: boolean };

export class ShellImpl implements Shell {
  fs = new VirtualFS();
  cwd = "/home/agent";
  oldpwd = "/home/agent";
  home = "/home/agent";
  env: Record<string, string> = { ...DEFAULT_ENV };
  umask = 0o022;
  euid = 1000;
  jobs: Job[] = [];
  nextPid = 100;
  nextJobId = 1;
  exited = false;
  shellPid = 4242;
  bootTime = new Date();

  private history: string[] = [];
  private lastOutput = "";
  private exitCodeVal = 0;

  constructor() {
    this.reset();
  }

  /* -- Shell interface (arrow fields: survive object spread) -- */

  execute = (input: string): string => {
    if (input.trim() === "") return "";
    this.history.push(input);
    let out: string;
    let code: number;
    try {
      const r = this.runLine(input);
      out = r.out;
      code = r.code;
    } catch (e) {
      if (e instanceof ShellSyntaxError) {
        out = `bash: ${e.message}\n`;
        code = 2;
      } else {
        out = "bash: internal error\n";
        code = 1;
      }
    }
    this.exitCodeVal = code;
    this.lastOutput = out;
    return out;
  };

  getHistory = (): string[] => [...this.history];

  getLastOutput = (): string => this.lastOutput;

  getExitCode = (): number => this.exitCodeVal;

  fileExists = (path: string): boolean => this.fs.exists(this.resolve(path));

  readFile = (path: string): string | null => {
    const node = this.fs.getNode(this.resolve(path));
    return node && node.type === "file" ? node.content : null;
  };

  getMode = (path: string): string | null => {
    const node = this.fs.getNode(this.resolve(path));
    return node ? formatMode(node.mode) : null;
  };

  getOwner = (path: string): string | null => {
    const node = this.fs.getNode(this.resolve(path));
    return node ? node.owner : null;
  };

  applySetup = (setup: EngineSetup): void => {
    this.fs.applySetup(setup);
  };

  reset = (): void => {
    this.fs = new VirtualFS();
    resetSysProcs();
    this.cwd = "/home/agent";
    this.oldpwd = "/home/agent";
    this.env = { ...DEFAULT_ENV };
    this.umask = 0o022;
    this.euid = 1000;
    this.jobs = [];
    this.nextPid = 100;
    this.nextJobId = 1;
    this.history = [];
    this.lastOutput = "";
    this.exitCodeVal = 0;
    this.exited = false;
    this.bootTime = new Date();
  };

  completeTab = (line: string): string[] => {
    let toks: Tok[];
    try {
      toks = tokenize(line);
    } catch {
      return [];
    }
    const endsWithSpace = /[\s]$/.test(line);
    const words = toks.filter((t) => !t.op);
    if (words.length === 0 || (words.length === 1 && !endsWithSpace)) {
      const prefix = words.length === 1 ? words[0].text : "";
      return Object.keys(COMMANDS)
        .filter((c) => c.startsWith(prefix))
        .sort();
    }
    const word = endsWithSpace ? "" : words[words.length - 1].text;
    const expanded = word.startsWith("~") ? this.home + word.slice(1) : word;
    const abs = expanded.startsWith("/") ? expanded : (this.cwd === "/" ? "" : this.cwd) + "/" + expanded;
    const slash = abs.lastIndexOf("/");
    const dirAbs = slash <= 0 ? "/" : abs.slice(0, slash);
    const prefix = abs.slice(slash + 1);
    const wslash = word.lastIndexOf("/");
    const displayPrefix = wslash === -1 ? "" : word.slice(0, wslash + 1);
    const node = this.fs.getNode(dirAbs);
    if (!node || node.type !== "dir") return [];
    const out: string[] = [];
    for (const name of [...node.children.keys()].sort()) {
      if (name.startsWith(".") && !prefix.startsWith(".")) continue;
      if (!name.startsWith(prefix)) continue;
      const child = node.children.get(name);
      if (!child) continue;
      out.push(displayPrefix + name + (child.type === "dir" ? "/" : ""));
    }
    return out;
  };

  /* -- extras for the interactive terminal (also spread-safe) -- */

  getCwd = (): string => this.cwd;

  getUser = (): string => "agent";

  getHostname = (): string => "nexus";

  displayPath = (): string => {
    if (this.cwd === this.home) return "~";
    if (this.cwd.startsWith(this.home + "/")) return "~" + this.cwd.slice(this.home.length);
    return this.cwd;
  };

  clearHistory = (): void => {
    this.history = [];
  };

  /* -- internals (prototype methods) -- */

  resolve(p: string): string {
    return this.fs.resolvePath(p, this.cwd, this.home);
  }

  uptimeSecs(): number {
    return (Date.now() - this.bootTime.getTime()) / 1000;
  }

  userFor(euid: number): UserCtx {
    return euid === 0 ? { name: "root", uid: 0, groups: ["root"] } : { name: "agent", uid: 1000, groups: ["agents"] };
  }

  /** Run a single command by name (used by sudo/nice/nohup). */
  runCommandAs(name: string, args: string[], stdin: string, env: Record<string, string>, euid: number): CmdResult {
    const impl = COMMANDS[name];
    if (!impl) return { code: 127, out: "", err: unknownCommandMessage(name) };
    const io: CmdIO = { args, stdin, env: { ...env }, user: this.userFor(euid), shell: this };
    try {
      return impl(io);
    } catch (e) {
      return { code: 1, out: "", err: `bash: ${name}: ${e instanceof FsError ? e.message : "internal error"}\n` };
    }
  }

  private expandTok(tok: Tok, env: Record<string, string>): string {
    if (tok.quote === "single") return tok.text;
    let s = tok.text;
    if (s === "~" || s.startsWith("~/")) s = this.home + s.slice(1);
    s = s.replace(/\$(\{([^}]*)\}|([A-Za-z_][A-Za-z0-9_]*)|\?|\$)/g, (m, _g1, braced: string, name: string) => {
      if (m === "$?") return String(this.exitCodeVal);
      if (m === "$$") return String(this.shellPid);
      if (braced !== undefined) {
        // ${VAR:-default} / ${VAR-default}: default when unset (:- also when empty)
        const defM = /^([A-Za-z_][A-Za-z0-9_]*)(:-|-)(.*)$/.exec(braced);
        if (defM) {
          const val = env[defM[1]];
          const missing = defM[2] === ":-" ? val === undefined || val === "" : val === undefined;
          return missing ? defM[3] : val ?? "";
        }
        // ${VAR:+alt} / ${VAR+alt}: alt when set (non-empty for :+)
        const altM = /^([A-Za-z_][A-Za-z0-9_]*)(:\+|\+)(.*)$/.exec(braced);
        if (altM) {
          const val = env[altM[1]];
          const present = altM[2] === ":+" ? val !== undefined && val !== "" : val !== undefined;
          return present ? altM[3] : "";
        }
        return env[braced] ?? "";
      }
      if (name !== undefined) return env[name] ?? "";
      return m;
    });
    return s;
  }

  private expandRedirectTarget(word: Tok, env: Record<string, string>): string {
    const e = this.expandTok(word, env);
    if (word.magic && word.quote !== "single") {
      const matches = this.fs.glob(e, this.cwd, this.home);
      if (matches.length > 1) throw new Error("ambiguous");
      return matches[0];
    }
    return e;
  }

  private writeTarget(data: string, t: Target, user: UserCtx): string | null {
    if (t.kind !== "file") return null;
    const abs = this.resolve(t.path);
    if (abs === "/dev/null") return null; // the void: writes vanish, always succeed
    try {
      const parent = this.fs.getNode(this.fs.dirname(abs));
      if (!parent || parent.type !== "dir") return `bash: ${t.path}: No such file or directory\n`;
      if (!this.fs.canWrite(parent, user) || !this.fs.canExec(parent, user)) {
        return `bash: ${t.path}: Permission denied\n`;
      }
      const node = this.fs.getNode(abs);
      if (node) {
        if (node.type !== "file") return `bash: ${t.path}: Is a directory\n`;
        if (!this.fs.canWrite(node, user)) return `bash: ${t.path}: Permission denied\n`;
        node.content = t.append ? node.content + data : data;
        node.mtime = new Date();
      } else {
        this.fs.writeFile(abs, data, { owner: user.name, group: user.groups[0] ?? "agents", umask: this.umask });
      }
      return null;
    } catch (e) {
      return `bash: ${t.path}: ${e instanceof FsError ? e.message : "I/O error"}\n`;
    }
  }

  private runSimple(cmd: PSimple, stdin: string, env: Record<string, string>, euid: number, stdoutMode: "capture" | "pipe"): StageResult {
    const noop: StageResult = { code: 0, out: "", err: "", piped: "" };
    // 1. expand words
    const expanded: string[] = [];
    for (const w of cmd.words) {
      const e = this.expandTok(w, env);
      if (w.magic && w.quote !== "single") expanded.push(...this.fs.glob(e, this.cwd, this.home));
      else expanded.push(e);
    }
    // 2. leading VAR=val assignments
    const assigns: Record<string, string> = {};
    let k = 0;
    while (k < expanded.length && cmd.words[k].quote !== "single" && /^[A-Za-z_][A-Za-z0-9_]*=/.test(expanded[k])) {
      const eq = expanded[k].indexOf("=");
      assigns[expanded[k].slice(0, eq)] = expanded[k].slice(eq + 1);
      k++;
    }
    const cmdEnv = { ...env, ...assigns };
    const user = this.userFor(euid);

    // 3. redirects
    let stdoutTarget: Target = { kind: stdoutMode };
    let stderrTarget: Target = { kind: "capture" };
    let stdinData = stdin;
    for (const r of cmd.redirects) {
      if (r.toStdout) {
        stderrTarget = stdoutTarget;
        continue;
      }
      if (r.toStderr) {
        stdoutTarget = stderrTarget;
        continue;
      }
      let target: string;
      try {
        target = this.expandRedirectTarget(r.word, cmdEnv);
      } catch {
        return { ...noop, code: 1, err: `bash: ${r.word.text}: ambiguous redirect\n` };
      }
      if (r.kind === "in") {
        const abs = this.resolve(target);
        try {
          stdinData = this.fs.readFile(abs, user);
        } catch (e) {
          return { ...noop, code: 1, err: `bash: ${target}: ${e instanceof FsError ? e.message : "I/O error"}\n` };
        }
      } else if (r.kind === "out") {
        stdoutTarget = { kind: "file", path: target, append: r.append };
        if (r.toBoth) stderrTarget = stdoutTarget;
      } else {
        stderrTarget = { kind: "file", path: target, append: r.append };
      }
    }

    // redirect-only command, e.g. `> file`, or bare assignments like `X=42`
    if (k >= expanded.length) {
      Object.assign(env, assigns);
      const werr = this.writeTarget("", stdoutTarget, user);
      if (werr) return { ...noop, code: 1, err: werr };
      return noop;
    }

    const name = expanded[k];
    const args = expanded.slice(k + 1);
    const impl = COMMANDS[name];
    let res: CmdResult;
    if (!impl) {
      res = { code: 127, out: "", err: unknownCommandMessage(name) };
    } else {
      const io: CmdIO = { args, stdin: stdinData, env: cmdEnv, user, shell: this };
      try {
        res = impl(io);
      } catch (e) {
        res = { code: 1, out: "", err: `bash: ${name}: ${e instanceof FsError ? e.message : "internal error"}\n` };
      }
    }

    // 4. deliver outputs. When both fds point at the same target (2>&1,
    // 1>&2, &>), write once so the second write cannot clobber the first.
    if (stderrTarget === stdoutTarget) {
      const werr = this.writeTarget(res.out + res.err, stdoutTarget, user);
      if (werr) return { ...noop, code: 1, err: werr };
    } else {
      const werr = this.writeTarget(res.out, stdoutTarget, user);
      if (werr) return { ...noop, code: 1, err: werr };
      const werr2 = this.writeTarget(res.err, stderrTarget, user);
      if (werr2) return { ...noop, code: 1, err: werr2 };
    }

    const piped = stdoutTarget.kind === "pipe" ? res.out + (stderrTarget === stdoutTarget ? res.err : "") : "";
    return {
      code: res.code,
      out: stdoutTarget.kind === "capture" ? res.out : "",
      err: stderrTarget.kind === "capture" ? res.err : "",
      piped,
    };
  }

  private runPipeline(p: PPipeline, stdin: string, env: Record<string, string>, euid: number): CmdResult {
    let input = stdin;
    let errAll = "";
    let code = 0;
    let lastOut = "";
    for (let idx = 0; idx < p.commands.length; idx++) {
      const last = idx === p.commands.length - 1;
      const r = this.runSimple(p.commands[idx], input, env, euid, last ? "capture" : "pipe");
      code = r.code;
      errAll += r.err;
      input = r.piped;
      if (last) lastOut = r.out;
      this.exitCodeVal = code;
    }
    return { code, out: lastOut, err: errAll };
  }

  private runAndOr(andor: PAndOr, stdin: string, env: Record<string, string>, euid: number): CmdResult {
    let result: CmdResult = { code: 0, out: "", err: "" };
    andor.pipelines.forEach((p, idx) => {
      if (idx === 0) {
        result = this.runPipeline(p, stdin, env, euid);
      } else {
        const op = andor.ops[idx - 1];
        if ((op === "&&" && result.code === 0) || (op === "||" && result.code !== 0)) {
          const r = this.runPipeline(p, stdin, env, euid);
          result = { code: r.code, out: result.out + r.out, err: result.err + r.err };
        }
      }
      this.exitCodeVal = result.code;
    });
    return result;
  }

  private runBackground(andor: PAndOr): string {
    const id = this.nextJobId++;
    if (andor.pipelines.length === 1 && andor.pipelines[0].commands.length === 1) {
      const simple = andor.pipelines[0].commands[0];
      if (simple.redirects.length === 0) {
        const words = simple.words.map((w) => this.expandTok(w, this.env));
        let k = 0;
        while (k < words.length && /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[k])) k++;
        const desc = k < words.length ? describeSleepJob(words[k], words.slice(k + 1)) : null;
        if (desc) {
          const display = words.slice(k).join(" ");
          const pid = this.nextPid++;
          this.jobs.push({ id, pid, command: display, nice: desc.nice, started: new Date() });
          this.exitCodeVal = 0;
          return `[${id}] ${pid}\n`;
        }
      }
    }
    // generic background: run synchronously, job completes immediately
    const pid = this.nextPid++;
    const r = this.runAndOr(andor, "", this.env, this.euid);
    this.exitCodeVal = r.code;
    return `[${id}] ${pid}\n` + r.out + r.err;
  }

  private runForLoop(name: string, wordsStr: string, body: string): { out: string; code: number } {
    const wtoks = tokenize(wordsStr);
    const values: string[] = [];
    for (const w of wtoks) {
      if (w.op) throw new ShellSyntaxError(`syntax error near unexpected token \`${w.op}'`);
      const e = this.expandTok(w, this.env);
      if (w.magic && w.quote !== "single") values.push(...this.fs.glob(e, this.cwd, this.home));
      else values.push(e);
    }
    let out = "";
    let code = 0;
    for (const v of values) {
      this.env[name] = v;
      const r = this.runLine(body);
      out += r.out;
      code = r.code;
    }
    this.exitCodeVal = code;
    return { out, code };
  }

  private runWhileReadLoop(varName: string, body: string, inputFile: string | null): { out: string; code: number } {
    let content = "";
    if (inputFile) {
      const abs = this.resolve(inputFile);
      const node = this.fs.getNode(abs);
      if (!node || node.type !== "file") {
        return { out: `bash: ${inputFile}: No such file or directory\n`, code: 1 };
      }
      content = node.content;
    }
    const lines = content === "" ? [] : content.split("\n");
    if (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
    let out = "";
    let code = 0;
    for (const line of lines) {
      this.env[varName] = line;
      const r = this.runLine(body);
      out += r.out;
      code = r.code;
    }
    this.exitCodeVal = code;
    return { out, code };
  }

  private runLine(line: string): { out: string; code: number } {
    const trimmed = line.trim();
    // for-loops may be followed by more commands: `for i in 1 2; do echo $i; done; echo fin`
    const fm = /^for\s+([A-Za-z_][A-Za-z0-9_]*)\s+in\s+(.+?);\s*do\s+(.+?);\s*done(\s*;|$)/.exec(trimmed);
    if (fm) {
      const r = this.runForLoop(fm[1], fm[2], fm[3]);
      const rest = trimmed.slice(fm[0].length).replace(/^\s*;\s*/, "");
      this.exitCodeVal = r.code;
      if (!rest) return r;
      const r2 = this.runLine(rest);
      return { out: r.out + r2.out, code: r2.code };
    }
    // while-read loops: `while read h; do echo "checking $h"; done < /path/file`
    const wm = /^while\s+read\s+([A-Za-z_][A-Za-z0-9_]*)\s*;\s*do\s+(.+?);\s*done\s*(?:<\s*(\S+))?\s*(;|$)/.exec(trimmed);
    if (wm) {
      const r = this.runWhileReadLoop(wm[1], wm[2], wm[3] ?? null);
      const rest = trimmed.slice(wm[0].length).replace(/^\s*;\s*/, "");
      this.exitCodeVal = r.code;
      if (!rest) return r;
      const r2 = this.runLine(rest);
      return { out: r.out + r2.out, code: r2.code };
    }
    const toks = tokenize(line);
    const seq = parseSequence(toks);
    let out = "";
    let code = 0;
    for (const andor of seq) {
      if (andor.background) {
        out += this.runBackground(andor);
      } else {
        const r = this.runAndOr(andor, "", this.env, this.euid);
        out += r.out + r.err;
        code = r.code;
      }
      this.exitCodeVal = code;
    }
    return { out, code };
  }
}

export function createShell(): Shell {
  return new ShellImpl();
}
