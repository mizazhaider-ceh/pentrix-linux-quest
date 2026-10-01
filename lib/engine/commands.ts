/**
 * NEXUS: Linux Quest - command implementations.
 *
 * Every command is a pure-ish function: (args, stdin, env, user, shell)
 * -> { code, out, err }. All output and error strings mimic real
 * bash/coreutils wording. Nothing here touches the network; network
 * commands (ping/curl/wget/ssh/scp) serve canned station responses.
 */

import type { ShellImpl } from "./shell";
import { FsError, type FsNode, type UserCtx } from "./fs";

export interface CmdIO {
  args: string[];
  stdin: string;
  env: Record<string, string>;
  user: UserCtx;
  shell: ShellImpl;
}

export interface CmdResult {
  code: number;
  out: string;
  err: string;
}

export type CommandFn = (io: CmdIO) => CmdResult;

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

const pad2 = (n: number): string => String(n).padStart(2, "0");

/** "drwxr-xr-x" style string for a mode. */
export function modeToString(mode: number, isDir: boolean): string {
  const chars = isDir ? "d" : "-";
  const bits = "rwxrwxrwx";
  const arr = (chars + [...bits].map((b, i) => (mode & (1 << (8 - i)) ? b : "-")).join("")).split("");
  if (mode & 0o4000) arr[3] = arr[3] === "x" ? "s" : "S";
  if (mode & 0o2000) arr[6] = arr[6] === "x" ? "s" : "S";
  if (mode & 0o1000) arr[9] = arr[9] === "x" ? "t" : "T";
  return arr.join("");
}

/** "755", or "1777" when setuid/setgid/sticky bits are present. */
export function formatMode(mode: number): string {
  const s = (mode & 0o7777).toString(8);
  return mode & 0o7000 ? s.padStart(4, "0") : s.padStart(3, "0");
}

export function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  const units = ["K", "M", "G", "T"];
  let v = bytes / 1024;
  let u = 0;
  while (v >= 1024 && u < units.length - 1) {
    v /= 1024;
    u++;
  }
  return `${v >= 100 ? Math.round(v) : v.toFixed(1)}${units[u]}`;
}

export function lsDate(d: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, " ")} ${pad2(d.getHours())}:${pad2(
    d.getMinutes()
  )}`;
}

export interface ParsedFlags {
  flags: Set<string>;
  rest: string[];
  err: string | null;
}

/** Parse GNU-style short flags ("-la"). Unknown flags mimic coreutils errors. */
export function parseShortFlags(args: string[], allowed: string, cmd: string): ParsedFlags {
  const flags = new Set<string>();
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--") {
      rest.push(...args.slice(i + 1));
      break;
    }
    if (a.startsWith("--") && a.length > 2) {
      return { flags, rest, err: `${cmd}: unrecognized option '${a}'\nTry '${cmd} --help' for more information.\n` };
    }
    if (a.length > 1 && a.startsWith("-") && a[1] !== "." && Number.isNaN(Number(a))) {
      for (const ch of a.slice(1)) {
        if (!allowed.includes(ch)) {
          return { flags, rest, err: `${cmd}: invalid option -- '${ch}'\nTry '${cmd} --help' for more information.\n` };
        }
        flags.add(ch);
      }
      continue;
    }
    rest.push(a);
  }
  return { flags, rest, err: null };
}

/** Translate a BRE pattern (grep/sed default) into a JS RegExp source. */
export function breToJs(pat: string): string {
  let out = "";
  for (let i = 0; i < pat.length; i++) {
    const c = pat[i];
    if (c === "\\" && i + 1 < pat.length) {
      const n = pat[i + 1];
      if ("(){}+?|".includes(n)) out += n;
      else out += "\\" + n;
      i++;
    } else if ("()+?|".includes(c)) {
      out += "\\" + c;
    } else {
      out += c;
    }
  }
  return out;
}

function compilePattern(pat: string, extended: boolean, ignoreCase: boolean): RegExp {
  return new RegExp(extended ? pat : breToJs(pat), ignoreCase ? "i" : "");
}

/** Read one input source (file or stdin) for the text commands. */
function readInput(
  io: CmdIO,
  name: string,
  opts: { dirOk?: boolean; missingMsg?: (p: string) => string } = {}
): { label: string; content: string | null; err: string | null } {
  // Used with explicit file args; callers handle stdin themselves.
  const p = name;
  const abs = io.shell.resolve(p);
  try {
    if (!io.shell.fs.canTraverse(abs, io.user)) throw new FsError("Permission denied");
    const node = io.shell.fs.getNode(abs);
    if (!node) {
      const msg = opts.missingMsg ? opts.missingMsg(p) : `${p}: No such file or directory`;
      return { label: p, content: null, err: msg };
    }
    if (node.type === "dir") {
      if (opts.dirOk) return { label: p, content: null, err: null };
      return { label: p, content: null, err: `${p}: Is a directory` };
    }
    if (!io.shell.fs.canRead(node, io.user)) return { label: p, content: null, err: `${p}: Permission denied` };
    return { label: p, content: node.content, err: null };
  } catch (e) {
    const msg = e instanceof FsError ? e.message : "Input/output error";
    return { label: p, content: null, err: `${p}: ${msg}` };
  }
}

function splitLines(s: string): string[] {
  if (s === "") return [];
  const parts = s.split("\n");
  if (parts.length > 0 && parts[parts.length - 1] === "") parts.pop();
  return parts;
}

/* ------------------------------------------------------------------ */
/* tar archive format (NXSTAR): header line + JSON manifest             */
/* ------------------------------------------------------------------ */

export interface TarEntry {
  p: string; // relative path inside the archive
  t: "f" | "d";
  m: number; // mode
  c: string; // content for files
}

export function buildTar(entries: TarEntry[]): string {
  return "NXSTAR1\n" + JSON.stringify(entries);
}

export function parseTar(data: string): TarEntry[] | null {
  if (!data.startsWith("NXSTAR1\n")) return null;
  try {
    const entries = JSON.parse(data.slice(8)) as TarEntry[];
    if (!Array.isArray(entries)) return null;
    return entries.filter((e) => e && typeof e.p === "string" && (e.t === "f" || e.t === "d"));
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* fake station network                                                */
/* ------------------------------------------------------------------ */

const GATEWAY = "10.0.0.1";
const RELAY = "10.0.0.2";

/** Hosts on the station network. Anything else fails DNS like the real thing. */
function isStationHost(host: string): boolean {
  return host === GATEWAY || host === RELAY || host === "gateway" || host === "relay";
}

const FAKE_HTTP: Record<string, { status: number; body: string; contentType: string }> = {
  "http://10.0.0.1/status": {
    status: 200,
    body: '{"station":"NEXUS-9","status":"degraded","relay":"silent","breach":"03:12"}\n',
    contentType: "application/json",
  },
  "http://10.0.0.1/files/": {
    status: 200,
    body: "<html><head><title>Index of /files/</title></head><body><h1>Index of /files/</h1><pre><a href=\"bundle.tar\">bundle.tar</a>\n<a href=\"firmware/\">firmware/</a>\n</pre></body></html>\n",
    contentType: "text/html",
  },
  "http://10.0.0.1/bundle.tar": {
    status: 200,
    body: buildTar([
      { p: "bundle/", t: "d", m: 0o755, c: "" },
      { p: "bundle/readme.txt", t: "f", m: 0o644, c: "NEXUS-9 relay bundle.\nRestored by the night shift.\n" },
      { p: "bundle/checksums.txt", t: "f", m: 0o644, c: "relay.conf ok\nroutes.ok ok\n" },
    ]),
    contentType: "application/x-tar",
  },
  "http://10.0.0.1/firmware/patch.bin": {
    status: 200,
    body: "NXFW-1.4.2-patch-binary-placeholder\n",
    contentType: "application/octet-stream",
  },
};

function httpHeaders(status: number, contentType: string, length: number): string {
  const reason = status === 200 ? "OK" : status === 404 ? "Not Found" : "Error";
  return (
    `HTTP/1.1 ${status} ${reason}\r\n` +
    `Server: nexus-relay/1.4.2\r\n` +
    `Content-Type: ${contentType}\r\n` +
    `Content-Length: ${length}\r\n` +
    `Connection: close\r\n\r\n`
  );
}

/* ------------------------------------------------------------------ */
/* fake system processes                                               */
/* ------------------------------------------------------------------ */

export interface SysProc {
  pid: number;
  user: string;
  cmd: string;
  tty: string;
  stat: string;
  time: string;
}

const SYS_PROCS_SEED: SysProc[] = [
  { pid: 1, user: "root", cmd: "/sbin/init splash", tty: "?", stat: "Ss", time: "0:03" },
  { pid: 88, user: "root", cmd: "/usr/sbin/sshd -D", tty: "?", stat: "Ss", time: "0:00" },
  { pid: 207, user: "axiom", cmd: "/usr/bin/axiom-daemon --watch", tty: "?", stat: "Ssl", time: "0:41" },
  { pid: 313, user: "root", cmd: "/usr/sbin/relay-svc --port 8443", tty: "?", stat: "Ss", time: "0:12" },
  { pid: 666, user: "nobody", cmd: "./beacon --daemon --port 4444", tty: "?", stat: "S", time: "1:17" },
];

/** Fake system process table. Mutable: kill/pkill/killall remove entries. */
export const SYS_PROCS: SysProc[] = [];

/** Restore the fake system process table. Called on boot and on shell.reset(). */
export function resetSysProcs(): void {
  SYS_PROCS.length = 0;
  for (const p of SYS_PROCS_SEED) SYS_PROCS.push({ ...p });
}
resetSysProcs();

/** Short process name: basename of argv[0], like pkill/pgrep match by default. */
function procName(cmd: string): string {
  const first = cmd.split(" ")[0];
  const slash = first.lastIndexOf("/");
  return slash === -1 ? first : first.slice(slash + 1);
}

/**
 * Gameplay permission rule for signalling fake system processes: root can
 * signal anything; anyone can signal their own processes and unprivileged
 * daemon processes (the rogue beacon runs as "nobody"). Signalling root's
 * or axiom's processes as agent fails like the real thing.
 */
function canSignalSys(io: CmdIO, p: SysProc): boolean {
  return io.user.uid === 0 || p.user === io.user.name || p.user === "nobody";
}

export const ok = (out: string, code = 0): CmdResult => ({ code, out, err: "" });
export const fail = (err: string, code = 1): CmdResult => ({ code, out: "", err });

/* ------------------------------------------------------------------ */
/* file and directory commands                                         */
/* ------------------------------------------------------------------ */

function cmdPwd(io: CmdIO): CmdResult {
  return ok(io.shell.cwd + "\n");
}

function cmdLs(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "lah1", "ls");
  if (err) return fail(err, 2);
  const long = flags.has("l");
  const all = flags.has("a");
  const human = flags.has("h");
  const targets = rest.length > 0 ? rest : ["."];
  let out = "";
  let errOut = "";
  let code = 0;

  const showLong = (abs: string, node: FsNode, name: string): string => {
    const size = node.type === "dir" ? 4096 : io.shell.fs.byteSize(node.content);
    const sizeStr = human ? humanSize(size).padStart(4) : String(size).padStart(8);
    return `${modeToString(node.mode, node.type === "dir")} 1 ${node.owner} ${node.group} ${sizeStr} ${lsDate(
      node.mtime
    )} ${name}\n`;
  };

  const listDir = (abs: string, display: string): string => {
    const node = io.shell.fs.getNode(abs);
    if (!node) {
      errOut += `ls: cannot access '${display}': No such file or directory\n`;
      code = 2;
      return "";
    }
    if (!io.shell.fs.canTraverse(abs, io.user)) {
      errOut += `ls: cannot open directory '${display}': Permission denied\n`;
      code = 2;
      return "";
    }
    if (node.type !== "dir") {
      // single file target
      return long ? showLong(abs, node, display) : display + "\n";
    }
    if (!io.shell.fs.canRead(node, io.user)) {
      errOut += `ls: cannot open directory '${display}': Permission denied\n`;
      code = 2;
      return "";
    }
    let names = [...node.children.keys()].sort();
    if (!all) names = names.filter((n) => !n.startsWith("."));
    if (all) names = [".", "..", ...names];
    if (!long) {
      return names.map((n) => n + "\n").join("");
    }
    let total = 0;
    const lines: string[] = [];
    for (const n of names) {
      let child: FsNode | undefined;
      if (n === ".") child = node;
      else if (n === "..") child = io.shell.fs.getNode(io.shell.fs.dirname(abs)) ?? node;
      else child = node.children.get(n);
      if (!child) continue;
      total += Math.max(1, Math.ceil((child.type === "dir" ? 4096 : io.shell.fs.byteSize(child.content)) / 1024));
      lines.push(showLong(abs, child, n));
    }
    return `total ${total}\n` + lines.join("");
  };

  const results: { display: string; body: string; isDir: boolean }[] = [];
  for (const t of targets) {
    const abs = io.shell.resolve(t);
    const node = io.shell.fs.getNode(abs);
    results.push({ display: t, body: listDir(abs, t), isDir: node?.type === "dir" });
  }
  if (targets.length > 1) {
    // like real ls: headers and blank separators only around directory listings
    out = results.map((r, i) => (i > 0 && r.isDir ? "\n" : "") + (r.isDir ? `${r.display}:\n` : "") + r.body).join("");
  } else {
    out = results[0].body;
  }
  return { code, out, err: errOut };
}

function cmdCd(io: CmdIO): CmdResult {
  if (io.args.length > 1) return fail("bash: cd: too many arguments\n");
  let target = io.args[0] ?? io.env.HOME ?? "/home/agent";
  if (target === "-") {
    target = io.shell.oldpwd;
    const r = cmdCd({ ...io, args: [target] });
    if (r.code === 0) return ok(io.shell.cwd + "\n");
    return r;
  }
  const abs = io.shell.resolve(target);
  const node = io.shell.fs.getNode(abs);
  if (!node) return fail(`bash: cd: ${io.args[0] ?? ""}: No such file or directory\n`);
  if (node.type !== "dir") return fail(`bash: cd: ${io.args[0]}: Not a directory\n`);
  if (!io.shell.fs.canTraverse(abs, io.user) || !io.shell.fs.canExec(node, io.user)) {
    return fail(`bash: cd: ${io.args[0]}: Permission denied\n`);
  }
  io.shell.oldpwd = io.shell.cwd;
  io.shell.cwd = abs;
  return ok("");
}

function cmdMkdir(io: CmdIO): CmdResult {
  // manual flag parse: -p and -m MODE
  let p = false;
  let mode: number | undefined;
  const rest: string[] = [];
  for (let i = 0; i < io.args.length; i++) {
    const a = io.args[i];
    if (a === "-p" || a === "--parents") {
      p = true;
      continue;
    }
    if (a === "-m" || a === "--mode") {
      const m = io.args[++i];
      if (m === undefined || !/^[0-7]{3,4}$/.test(m)) return fail(`mkdir: invalid mode '${m ?? ""}'\n`);
      mode = parseInt(m, 8);
      continue;
    }
    if (a.startsWith("-m") && /^[0-7]{3,4}$/.test(a.slice(2))) {
      mode = parseInt(a.slice(2), 8);
      continue;
    }
    if (a.startsWith("-") && a !== "-") return fail(`mkdir: invalid option -- '${a.slice(1, 2)}'\nTry 'mkdir --help' for more information.\n`);
    rest.push(a);
  }
  if (rest.length === 0) return fail("mkdir: missing operand\nTry 'mkdir --help' for more information.\n");
  let errOut = "";
  let code = 0;
  for (const t of rest) {
    const abs = io.shell.resolve(t);
    try {
      if (io.shell.fs.exists(abs)) {
        if (!p) {
          errOut += `mkdir: cannot create directory '${t}': File exists\n`;
          code = 1;
        }
        continue;
      }
      const parent = io.shell.fs.getNode(io.shell.fs.dirname(abs));
      if (!parent || parent.type !== "dir") {
        if (!p) {
          errOut += `mkdir: cannot create directory '${t}': No such file or directory\n`;
          code = 1;
          continue;
        }
      } else if (!io.shell.fs.canWrite(parent, io.user) || !io.shell.fs.canExec(parent, io.user)) {
        errOut += `mkdir: cannot create directory '${t}': Permission denied\n`;
        code = 1;
        continue;
      }
      if (p) {
        io.shell.fs.mkdirp(abs, { mode, owner: io.user.name, group: io.user.groups[0] ?? "agents", umask: io.shell.umask });
      } else {
        const par = io.shell.fs.getNode(io.shell.fs.dirname(abs));
        if (!par || par.type !== "dir") {
          errOut += `mkdir: cannot create directory '${t}': No such file or directory\n`;
          code = 1;
          continue;
        }
        const node: FsNode = {
          type: "dir",
          content: "",
          mode: mode ?? (0o777 & ~io.shell.umask),
          owner: io.user.name,
          group: io.user.groups[0] ?? "agents",
          mtime: new Date(),
          children: new Map(),
        };
        par.children.set(io.shell.fs.basename(abs), node);
      }
    } catch (e) {
      errOut += `mkdir: cannot create directory '${t}': ${e instanceof FsError ? e.message : "error"}\n`;
      code = 1;
    }
  }
  return { code, out: "", err: errOut };
}

function cmdTouch(io: CmdIO): CmdResult {
  const { rest, err } = parseShortFlags(io.args, "acm", "touch");
  if (err) return fail(err, 2);
  if (rest.length === 0) return fail("touch: missing file operand\nTry 'touch --help' for more information.\n");
  let errOut = "";
  let code = 0;
  for (const t of rest) {
    const abs = io.shell.resolve(t);
    try {
      const node = io.shell.fs.getNode(abs);
      if (node) {
        if (node.type === "dir") continue; // touch on a dir just updates times; skip
        node.mtime = new Date();
        continue;
      }
      const parent = io.shell.fs.getNode(io.shell.fs.dirname(abs));
      if (!parent || parent.type !== "dir") {
        errOut += `touch: cannot touch '${t}': No such file or directory\n`;
        code = 1;
        continue;
      }
      if (!io.shell.fs.canWrite(parent, io.user) || !io.shell.fs.canExec(parent, io.user)) {
        errOut += `touch: cannot touch '${t}': Permission denied\n`;
        code = 1;
        continue;
      }
      io.shell.fs.writeFile(abs, "", { owner: io.user.name, group: io.user.groups[0] ?? "agents", umask: io.shell.umask });
    } catch (e) {
      errOut += `touch: cannot touch '${t}': ${e instanceof FsError ? e.message : "error"}\n`;
      code = 1;
    }
  }
  return { code, out: "", err: errOut };
}

function cmdRm(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "rfR", "rm");
  if (err) return fail(err, 2);
  if (rest.length === 0) return fail("rm: missing operand\nTry 'rm --help' for more information.\n");
  const recursive = flags.has("r") || flags.has("R");
  const force = flags.has("f");
  let errOut = "";
  let code = 0;
  for (const t of rest) {
    const abs = io.shell.resolve(t);
    try {
      io.shell.fs.remove(abs, recursive, io.user);
    } catch (e) {
      const msg = e instanceof FsError ? e.message : "error";
      if (force && msg === "No such file or directory") continue;
      errOut += `rm: cannot remove '${t}': ${msg}\n`;
      code = 1;
    }
  }
  return { code, out: "", err: errOut };
}

function cmdCp(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "rR", "cp");
  if (err) return fail(err, 2);
  if (rest.length === 0) return fail("cp: missing file operand\nTry 'cp --help' for more information.\n");
  if (rest.length === 1) return fail(`cp: missing destination file operand after '${rest[0]}'\nTry 'cp --help' for more information.\n`);
  const recursive = flags.has("r") || flags.has("R");
  const dst = rest[rest.length - 1];
  const srcs = rest.slice(0, -1);
  const dstAbs = io.shell.resolve(dst);
  if (srcs.length > 1 && !io.shell.fs.isDir(dstAbs)) {
    return fail(`cp: target '${dst}': No such file or directory\n`);
  }
  let errOut = "";
  let code = 0;
  for (const s of srcs) {
    const srcAbs = io.shell.resolve(s);
    try {
      io.shell.fs.copy(srcAbs, dstAbs, recursive, io.user, io.shell.umask);
    } catch (e) {
      const msg = e instanceof FsError ? e.message : "error";
      if (msg.startsWith("cannot stat") || msg.startsWith("-r not specified")) errOut += `cp: ${msg}\n`;
      else errOut += `cp: cannot copy '${s}': ${msg}\n`;
      code = 1;
    }
  }
  return { code, out: "", err: errOut };
}

function cmdMv(io: CmdIO): CmdResult {
  const { rest, err } = parseShortFlags(io.args, "", "mv");
  if (err) return fail(err, 2);
  if (rest.length === 0) return fail("mv: missing file operand\nTry 'mv --help' for more information.\n");
  if (rest.length === 1) return fail(`mv: missing destination file operand after '${rest[0]}'\nTry 'mv --help' for more information.\n`);
  const dst = rest[rest.length - 1];
  const srcs = rest.slice(0, -1);
  const dstAbs = io.shell.resolve(dst);
  if (srcs.length > 1 && !io.shell.fs.isDir(dstAbs)) {
    return fail(`mv: target '${dst}': Not a directory\n`);
  }
  let errOut = "";
  let code = 0;
  for (const s of srcs) {
    const srcAbs = io.shell.resolve(s);
    try {
      io.shell.fs.move(srcAbs, dstAbs, io.user);
    } catch (e) {
      const msg = e instanceof FsError ? e.message : "error";
      if (msg.startsWith("cannot stat")) errOut += `mv: ${msg}\n`;
      else errOut += `mv: cannot move '${s}': ${msg}\n`;
      code = 1;
    }
  }
  return { code, out: "", err: errOut };
}

/* ------------------------------------------------------------------ */
/* reading files                                                       */
/* ------------------------------------------------------------------ */

function cmdCat(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "n", "cat");
  if (err) return fail(err, 2);
  const number = flags.has("n");
  if (rest.length === 0) return ok(io.stdin);
  let out = "";
  let errOut = "";
  let code = 0;
  for (const t of rest) {
    const r = readInput(io, t);
    if (r.err) {
      errOut += `cat: ${r.err}\n`;
      code = 1;
      continue;
    }
    const content = r.content ?? "";
    out += number
      ? splitLines(content)
          .map((l, i) => `${String(i + 1).padStart(6)}  ${l}\n`)
          .join("")
      : content;
  }
  return { code, out, err: errOut };
}

function headTail(io: CmdIO, cmd: "head" | "tail"): CmdResult {
  const args = [...io.args];
  let count = 10;
  let bytes = false;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    const numShort = /^-(\d+)$/.exec(a);
    if (numShort) {
      count = parseInt(numShort[1], 10);
      continue;
    }
    if (a === "-n" || a === "-c") {
      const v = args[++i];
      if (v === undefined || !/^\d+$/.test(v)) return fail(`${cmd}: invalid number of ${a === "-n" ? "lines" : "bytes"}: '${v ?? ""}'\n`);
      count = parseInt(v, 10);
      bytes = a === "-c";
      continue;
    }
    if (/^-[nc]\d+$/.test(a)) {
      count = parseInt(a.slice(2), 10);
      bytes = a[1] === "c";
      continue;
    }
    if (a.startsWith("-") && a !== "-") return fail(`${cmd}: invalid option -- '${a.slice(1, 2)}'\nTry '${cmd} --help' for more information.\n`);
    rest.push(a);
  }
  const inputs: { label: string; content: string }[] = [];
  let errOut = "";
  let code = 0;
  if (rest.length === 0) inputs.push({ label: "", content: io.stdin });
  for (const t of rest) {
    const r = readInput(io, t);
    if (r.err) {
      errOut += `${cmd}: ${r.err}\n`;
      code = 1;
      continue;
    }
    inputs.push({ label: t, content: r.content ?? "" });
  }
  let out = "";
  inputs.forEach((input, idx) => {
    if (inputs.length > 1 || rest.length > 1) out += `${idx > 0 ? "\n" : ""}==> ${input.label} <==\n`;
    if (bytes) {
      out += cmd === "head" ? input.content.slice(0, count) : input.content.slice(Math.max(0, input.content.length - count));
    } else {
      const lines = splitLines(input.content);
      const picked = cmd === "head" ? lines.slice(0, count) : lines.slice(Math.max(0, lines.length - count));
      if (picked.length > 0) out += picked.join("\n") + "\n";
    }
  });
  return { code, out, err: errOut };
}

function cmdFile(io: CmdIO): CmdResult {
  if (io.args.length === 0) return fail("Usage: file [-b] FILE...\n");
  let out = "";
  let code = 0;
  for (const t of io.args) {
    if (t === "-b" || t === "--brief") continue;
    const abs = io.shell.resolve(t);
    const node = io.shell.fs.getNode(abs);
    if (!node) {
      out += `${t}: cannot open \`${t}' (No such file or directory)\n`;
      code = 1;
      continue;
    }
    let desc: string;
    if (node.type === "dir") desc = "directory";
    else if (node.content === "") desc = "empty";
    else if (node.content.startsWith("NXSTAR1\n")) desc = "POSIX tar archive";
    else if (node.content.startsWith("\x7fELF")) desc = "ELF 64-bit LSB executable, x86-64, version 1 (SYSV)";
    else if (node.content.startsWith("#!")) {
      const interp = node.content.slice(2).split("\n")[0].trim().split(" ").pop() ?? "sh";
      desc = `a ${interp} script, ASCII text executable`;
    } else if (/^[\x09\x0a\x0d\x20-\x7e]*$/.test(node.content)) desc = "ASCII text";
    else desc = "data";
    out += `${t}: ${desc}\n`;
  }
  return { code, out, err: "" };
}

function cmdWc(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "lwcm", "wc");
  if (err) return fail(err, 2);
  const showL = flags.has("l");
  const showW = flags.has("w");
  const showC = flags.has("c") || flags.has("m");
  const show = showL || showW || showC ? { l: showL, w: showW, c: showC } : { l: true, w: true, c: true };
  const inputs: { label: string; content: string }[] = [];
  let errOut = "";
  let code = 0;
  if (rest.length === 0) inputs.push({ label: "", content: io.stdin });
  for (const t of rest) {
    const r = readInput(io, t);
    if (r.err) {
      errOut += `wc: ${t}: ${r.err.split(": ").slice(1).join(": ") || r.err}\n`;
      code = 1;
      continue;
    }
    inputs.push({ label: t, content: r.content ?? "" });
  }
  const fmt = (n: number) => String(n).padStart(7);
  const stats = (content: string) => {
    const lines = splitLines(content);
    const words = content.trim() === "" ? 0 : content.trim().split(/\s+/).length;
    return { l: lines.length, w: words, c: io.shell.fs.byteSize(content) };
  };
  let out = "";
  let total = { l: 0, w: 0, c: 0 };
  for (const input of inputs) {
    const s = stats(input.content);
    total = { l: total.l + s.l, w: total.w + s.w, c: total.c + s.c };
    out += (show.l ? fmt(s.l) : "") + (show.w ? fmt(s.w) : "") + (show.c ? fmt(s.c) : "") + (input.label ? ` ${input.label}` : "") + "\n";
  }
  if (inputs.length > 1) {
    out += (show.l ? fmt(total.l) : "") + (show.w ? fmt(total.w) : "") + (show.c ? fmt(total.c) : "") + " total\n";
  }
  return { code, out, err: errOut };
}

function cmdDiff(io: CmdIO): CmdResult {
  const { rest, err } = parseShortFlags(io.args, "qsu", "diff");
  if (err) return fail(err, 2);
  if (rest.length < 2) return fail("diff: missing operand\nTry 'diff --help' for more information.\n");
  const ra = readInput(io, rest[0]);
  const rb = readInput(io, rest[1]);
  if (ra.err) return fail(`diff: ${ra.err}\n`, 2);
  if (rb.err) return fail(`diff: ${rb.err}\n`, 2);
  const a = splitLines(ra.content ?? "");
  const b = splitLines(rb.content ?? "");
  if (a.join("\n") === b.join("\n")) return ok("");
  // LCS table
  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  type Op = { t: "eq" | "del" | "ins"; line: string };
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ t: "eq", line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ t: "del", line: a[i] });
      i++;
    } else {
      ops.push({ t: "ins", line: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ t: "del", line: a[i++] });
  while (j < m) ops.push({ t: "ins", line: b[j++] });
  // group into hunks
  let out = "";
  let ai = 0;
  let bi = 0;
  let k = 0;
  const range = (s: number, e: number) => (e - s <= 1 ? `${s + 1}` : `${s + 1},${e}`);
  while (k < ops.length) {
    if (ops[k].t === "eq") {
      ai++;
      bi++;
      k++;
      continue;
    }
    const aStart = ai;
    const bStart = bi;
    const dels: string[] = [];
    const inss: string[] = [];
    while (k < ops.length && ops[k].t !== "eq") {
      if (ops[k].t === "del") {
        dels.push(ops[k].line);
        ai++;
      } else {
        inss.push(ops[k].line);
        bi++;
      }
      k++;
    }
    const cmd = dels.length > 0 && inss.length > 0 ? "c" : dels.length > 0 ? "d" : "a";
    out += `${range(aStart, ai)}${cmd}${range(bStart, bi)}\n`;
    for (const l of dels) out += `< ${l}\n`;
    if (cmd === "c") out += "---\n";
    for (const l of inss) out += `> ${l}\n`;
  }
  return ok(out, 1);
}

/* ------------------------------------------------------------------ */
/* text processing                                                     */
/* ------------------------------------------------------------------ */

function cmdEcho(io: CmdIO): CmdResult {
  const args = [...io.args];
  let trailingNewline = true;
  let interpret = false;
  while (args.length > 0 && /^-[neE]+$/.test(args[0]) && args[0] !== "-") {
    const f = args.shift()!;
    if (f.includes("n")) trailingNewline = false;
    if (f.includes("e")) interpret = true;
    if (f.includes("E")) interpret = false;
  }
  let text = args.join(" ");
  if (interpret) {
    text = text
      .replace(/\\\\/g, "\x00")
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\r/g, "\r")
      .replace(/\x00/g, "\\");
  }
  return ok(text + (trailingNewline ? "\n" : ""));
}

function cmdGrep(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "inrvcoElqsh", "grep");
  if (err) return fail(err, 2);
  if (rest.length === 0) return fail("Usage: grep [OPTION]... PATTERNS [FILE]...\nTry 'grep --help' for more information.\n", 2);
  const pattern = rest[0];
  const files = rest.slice(1);
  let rx: RegExp;
  try {
    rx = compilePattern(pattern, flags.has("E"), flags.has("i"));
  } catch {
    return fail(`grep: invalid pattern '${pattern}'\n`, 2);
  }
  const invert = flags.has("v");
  const countOnly = flags.has("c");
  const listOnly = flags.has("l");
  const onlyMatching = flags.has("o");
  const showNum = flags.has("n");

  interface Input {
    label: string;
    content: string;
    missing?: string;
  }
  const inputs: Input[] = [];
  let hadError = false;
  let errOut = "";
  const pushFile = (display: string, abs: string, prefix: string) => {
    const node = io.shell.fs.getNode(abs);
    if (!node) {
      errOut += `grep: ${display}: No such file or directory\n`;
      hadError = true;
      return;
    }
    if (node.type === "dir") {
      if (flags.has("r") || flags.has("R")) {
        for (const p of io.shell.fs.walk(abs)) {
          const child = io.shell.fs.getNode(p);
          if (child && child.type === "file") pushFile(p, p, prefix);
        }
      } else {
        errOut += `grep: ${display}: Is a directory\n`;
        hadError = true;
      }
      return;
    }
    if (!io.shell.fs.canTraverse(abs, io.user) || !io.shell.fs.canRead(node, io.user)) {
      errOut += `grep: ${display}: Permission denied\n`;
      hadError = true;
      return;
    }
    inputs.push({ label: prefix + display, content: node.content });
  };

  if (files.length === 0) {
    inputs.push({ label: "", content: io.stdin });
  } else {
    for (const f of files) pushFile(f, io.shell.resolve(f), "");
  }
  // fix labels for recursion: walk produced absolute paths already
  const multi = inputs.length > 1 || files.length > 1 || flags.has("r") || flags.has("R");
  const labelOf = (inp: Input) => (multi ? (inp.label === "" ? "(standard input)" : inp.label) : inp.label);

  let out = "";
  let totalMatches = 0;
  for (const inp of inputs) {
    const label = labelOf(inp);
    const prefix = label ? label + ":" : "";
    const lines = splitLines(inp.content);
    let fileMatches = 0;
    const matchedLines: string[] = [];
    lines.forEach((line, idx) => {
      const matched = rx.test(line) !== invert;
      // reset lastIndex safety (non-global regex, fine)
      if (matched) fileMatches++;
      if (listOnly) return;
      if (countOnly) return;
      if (onlyMatching) {
        if (!invert) {
          const gflags = rx.flags.includes("g") ? rx.flags : rx.flags + "g";
          const grx = new RegExp(rx.source, gflags);
          let m: RegExpExecArray | null;
          while ((m = grx.exec(line)) !== null) {
            matchedLines.push(`${prefix}${showNum ? `${idx + 1}:` : ""}${m[0]}`);
            if (m[0] === "") grx.lastIndex++;
          }
        } else if (matched) {
          matchedLines.push(`${prefix}${showNum ? `${idx + 1}:` : ""}${line}`);
        }
        return;
      }
      if (matched) matchedLines.push(`${prefix}${showNum ? `${idx + 1}:` : ""}${line}`);
    });
    totalMatches += fileMatches;
    if (listOnly) {
      if (fileMatches > 0) out += label + "\n";
    } else if (countOnly) {
      out += (label ? label + ":" : "") + fileMatches + "\n";
    } else {
      out += matchedLines.join("\n") + (matchedLines.length > 0 ? "\n" : "");
    }
  }
  const code = hadError && totalMatches === 0 ? 2 : totalMatches > 0 ? 0 : 1;
  return { code, out, err: errOut };
}

function cmdSort(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "rnuc", "sort");
  if (err) return fail(err, 2);
  const inputs: { label: string; content: string }[] = [];
  let errOut = "";
  let code = 0;
  if (rest.length === 0) inputs.push({ label: "-", content: io.stdin });
  for (const t of rest) {
    const r = readInput(io, t);
    if (r.err) {
      errOut += `sort: cannot read: ${t}: ${r.err.split(": ").slice(1).join(": ") || r.err}\n`;
      code = 2;
      continue;
    }
    inputs.push({ label: t, content: r.content ?? "" });
  }
  let lines: string[] = [];
  for (const inp of inputs) lines.push(...splitLines(inp.content));
  const numKey = (l: string) => {
    const m = /^\s*([+-]?(?:\d+\.?\d*|\.\d+))/.exec(l);
    return m ? parseFloat(m[1]) : 0;
  };
  if (flags.has("c")) {
    for (let k = 1; k < lines.length; k++) {
      const bad = flags.has("n") ? numKey(lines[k]) < numKey(lines[k - 1]) : lines[k] < lines[k - 1];
      if (bad) {
        errOut += `sort: -:${k + 1}: disorder: ${lines[k]}\n`;
        return { code: 1, out: "", err: errOut };
      }
    }
    return { code, out: "", err: errOut };
  }
  lines.sort((a, b) => {
    let c: number;
    if (flags.has("n")) {
      const na = numKey(a);
      const nb = numKey(b);
      c = na - nb || (a < b ? -1 : a > b ? 1 : 0);
    } else {
      c = a < b ? -1 : a > b ? 1 : 0;
    }
    return flags.has("r") ? -c : c;
  });
  if (flags.has("u")) lines = [...new Set(lines)];
  return { code, out: lines.length > 0 ? lines.join("\n") + "\n" : "", err: errOut };
}

function cmdUniq(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "cdui", "uniq");
  if (err) return fail(err, 2);
  const inputs: string[] = [];
  let errOut = "";
  let code = 0;
  if (rest.length === 0) inputs.push(io.stdin);
  for (const t of rest.slice(0, 2)) {
    const r = readInput(io, t);
    if (r.err) {
      errOut += `uniq: ${t}: ${r.err.split(": ").slice(1).join(": ") || r.err}\n`;
      code = 1;
      continue;
    }
    inputs.push(r.content ?? "");
  }
  const key = (l: string) => (flags.has("i") ? l.toLowerCase() : l);
  let out = "";
  for (const content of inputs) {
    const lines = splitLines(content);
    let prev: string | null = null;
    let count = 0;
    const flush = () => {
      if (prev === null) return;
      const show = !flags.has("d") && !flags.has("u") ? true : flags.has("d") ? count > 1 : count === 1;
      if (show) out += (flags.has("c") ? `${String(count).padStart(7)} ` : "") + prev + "\n";
    };
    for (const line of lines) {
      if (prev !== null && key(line) === key(prev)) count++;
      else {
        flush();
        prev = line;
        count = 1;
      }
    }
    flush();
  }
  return { code, out, err: errOut };
}

function parseCutList(spec: string): [number, number][] | null {
  const ranges: [number, number][] = [];
  for (const part of spec.split(",")) {
    const m = /^(?:(\d+))?(?:-(?:(\d+))?)?$/.exec(part.trim());
    if (!m || part.trim() === "") return null;
    if (m[1] !== undefined && m[2] !== undefined) ranges.push([parseInt(m[1], 10), parseInt(m[2], 10)]);
    else if (m[1] !== undefined && part.includes("-")) ranges.push([parseInt(m[1], 10), Infinity]);
    else if (m[1] !== undefined) ranges.push([parseInt(m[1], 10), parseInt(m[1], 10)]);
    else if (m[2] !== undefined) ranges.push([1, parseInt(m[2], 10)]);
    else return null;
  }
  return ranges;
}

function cmdCut(io: CmdIO): CmdResult {
  let delim: string | null = null;
  let fieldSpec: string | null = null;
  let charSpec: string | null = null;
  let suppress = false;
  const rest: string[] = [];
  const args = [...io.args];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-d" || a === "--delimiter") delim = args[++i] ?? "";
    else if (a.startsWith("-d") && a.length > 2) delim = a.slice(2);
    else if ((a === "-f" || a === "--fields") ) fieldSpec = args[++i] ?? "";
    else if (a.startsWith("-f") && a.length > 2) fieldSpec = a.slice(2);
    else if (a === "-c" || a === "--characters") charSpec = args[++i] ?? "";
    else if (a.startsWith("-c") && a.length > 2) charSpec = a.slice(2);
    else if (a === "-s" || a === "--only-delimited") suppress = true;
    else if (a === "--") rest.push(...args.slice(i + 1));
    else if (a.startsWith("-") && a !== "-") return fail(`cut: invalid option -- '${a.slice(1, 2)}'\nTry 'cut --help' for more information.\n`);
    else rest.push(a);
  }
  if (!fieldSpec && !charSpec) return fail("cut: you must specify a list of bytes, characters, or fields\nTry 'cut --help' for more information.\n");
  if (delim !== null && ![...delim].length) delim = null;
  if (delim !== null && [...(delim ?? "")].length > 1) return fail("cut: the delimiter must be a single character\nTry 'cut --help' for more information.\n");
  const d = delim ?? "\t";
  const spec = fieldSpec ?? charSpec ?? "";
  const ranges = parseCutList(spec);
  if (!ranges) return fail(`cut: invalid field value '${spec}'\n`);
  const pick = (parts: string[]): string => {
    const out: string[] = [];
    for (const [lo, hi] of ranges) {
      for (let k = lo; k <= Math.min(hi, parts.length); k++) out.push(parts[k - 1]);
    }
    return out.join(fieldSpec ? d : "");
  };
  const inputs: string[] = [];
  let errOut = "";
  let code = 0;
  if (rest.length === 0) inputs.push(io.stdin);
  for (const t of rest) {
    const r = readInput(io, t);
    if (r.err) {
      errOut += `cut: ${t}: ${r.err.split(": ").slice(1).join(": ") || r.err}\n`;
      code = 1;
      continue;
    }
    inputs.push(r.content ?? "");
  }
  let out = "";
  for (const content of inputs) {
    for (const line of splitLines(content)) {
      if (fieldSpec) {
        if (!line.includes(d)) {
          if (!suppress) out += line + "\n";
          continue;
        }
        out += pick(line.split(d)) + "\n";
      } else {
        const chars = [...line];
        const mapped = chars.map((ch) => ch);
        out += pick(mapped) + "\n";
      }
    }
  }
  return { code, out, err: errOut };
}

interface AwkRule {
  pattern: string | null;
  action: string | null;
}

function parseAwkProgram(prog: string): AwkRule[] | null {
  const rules: AwkRule[] = [];
  let i = 0;
  const skipWs = () => {
    while (i < prog.length && /\s/.test(prog[i])) i++;
  };
  while (i < prog.length) {
    skipWs();
    if (i >= prog.length) break;
    let pattern: string | null = null;
    let action: string | null = null;
    if (prog[i] === "/") {
      i++;
      let pat = "";
      while (i < prog.length && prog[i] !== "/") {
        if (prog[i] === "\\" && i + 1 < prog.length) {
          pat += prog[i] + prog[i + 1];
          i += 2;
        } else pat += prog[i++];
      }
      if (i >= prog.length) return null;
      i++; // closing /
      pattern = pat;
      skipWs();
    }
    if (prog[i] === "{") {
      i++;
      let depth = 1;
      let act = "";
      while (i < prog.length && depth > 0) {
        if (prog[i] === "{") depth++;
        else if (prog[i] === "}") depth--;
        if (depth > 0) act += prog[i];
        i++;
      }
      if (depth !== 0) return null;
      action = act.trim();
    } else if (pattern === null) {
      return null;
    }
    rules.push({ pattern, action });
  }
  return rules;
}

function cmdAwk(io: CmdIO): CmdResult {
  const args = [...io.args];
  let fieldSep: string | null = null;
  let prog: string | null = null;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-F") fieldSep = args[++i] ?? "";
    else if (a.startsWith("-F") && a.length > 2) fieldSep = a.slice(2);
    else if (a === "--") rest.push(...args.slice(i + 1));
    else if (a.startsWith("-") && a !== "-" && prog === null) return fail(`awk: invalid option -- '${a.slice(1, 2)}'\n`);
    else if (prog === null) prog = a;
    else rest.push(a);
  }
  if (prog === null) return fail("awk: no program given\n");
  const rules = parseAwkProgram(prog);
  if (!rules) return fail("awk: syntax error\n");
  const inputs: string[] = [];
  let errOut = "";
  let code = 0;
  if (rest.length === 0) inputs.push(io.stdin);
  for (const t of rest) {
    const r = readInput(io, t);
    if (r.err) {
      errOut += `awk: ${t}: ${r.err.split(": ").slice(1).join(": ") || r.err}\n`;
      code = 2;
      continue;
    }
    inputs.push(r.content ?? "");
  }
  const evalExpr = (expr: string, fields: string[], line: string, nr: number): string => {
    const e = expr.trim();
    if (/^".*"$/.test(e) || /^'.*'$/.test(e)) return e.slice(1, -1);
    if (/^\d+$/.test(e)) return e;
    if (e === "$0") return line;
    const fm = /^\$(\d+)$/.exec(e);
    if (fm) {
      const n = parseInt(fm[1], 10);
      return n === 0 ? line : fields[n - 1] ?? "";
    }
    if (e === "NF") return String(fields.length);
    if (e === "NR") return String(nr);
    return e;
  };
  const runAction = (action: string, fields: string[], line: string, nr: number): string | null => {
    const a = action.trim();
    if (!/^print\b/.test(a)) return null; // only print supported
    const body = a.slice(5).trim().replace(/;$/, "");
    if (body === "") return line;
    // split by commas respecting quotes
    const parts: string[] = [];
    let cur = "";
    let q: string | null = null;
    for (let k = 0; k < body.length; k++) {
      const c = body[k];
      if (q) {
        cur += c;
        if (c === q) q = null;
      } else if (c === '"' || c === "'") {
        q = c;
        cur += c;
      } else if (c === ",") {
        parts.push(cur);
        cur = "";
      } else cur += c;
    }
    parts.push(cur);
    const rendered = parts.map((part) => {
      const exprs = part.trim().split(/\s+/).filter(Boolean);
      return exprs.map((e) => evalExpr(e, fields, line, nr)).join("");
    });
    return rendered.join(" ");
  };
  let out = "";
  let nr = 0;
  for (const content of inputs) {
    for (const line of splitLines(content)) {
      nr++;
      const flds = line === "" ? [] : fieldSep !== null ? line.split(fieldSep) : line.trim().split(/\s+/);
      for (const rule of rules) {
        let matched = true;
        if (rule.pattern !== null) {
          try {
            matched = new RegExp(rule.pattern).test(line);
          } catch {
            return fail(`awk: invalid regex /${rule.pattern}/\n`, 2);
          }
        }
        if (matched) {
          if (rule.action === null) out += line + "\n";
          else {
            const res = runAction(rule.action, flds, line, nr);
            if (res === null) return fail(`awk: unsupported action: ${rule.action}\n`, 2);
            out += res + "\n";
          }
        }
      }
    }
  }
  return { code, out, err: errOut };
}

interface SedOp {
  addr: string | null;
  kind: "s" | "d" | "p";
  pat?: string;
  rep?: string;
  global?: boolean;
}

function parseSedProgram(prog: string): SedOp[] | null {
  const ops: SedOp[] = [];
  // split on unescaped semicolons
  const parts: string[] = [];
  let cur = "";
  for (let i = 0; i < prog.length; i++) {
    if (prog[i] === ";" && prog[i - 1] !== "\\") {
      parts.push(cur);
      cur = "";
    } else cur += prog[i];
  }
  parts.push(cur);
  for (let part of parts) {
    part = part.trim();
    if (part === "") continue;
    let addr: string | null = null;
    if (part.startsWith("/")) {
      const end = part.indexOf("/", 1);
      if (end === -1) return null;
      addr = part.slice(1, end);
      part = part.slice(end + 1);
    }
    if (part.startsWith("s") && part.length > 2) {
      const delim = part[1];
      const segs: string[] = [];
      let seg = "";
      for (let i = 2; i < part.length; i++) {
        if (part[i] === delim && part[i - 1] !== "\\") {
          segs.push(seg);
          seg = "";
        } else seg += part[i];
      }
      segs.push(seg);
      if (segs.length < 2) return null;
      ops.push({ addr, kind: "s", pat: segs[0], rep: segs[1], global: (segs[2] ?? "").includes("g") });
    } else if (part === "d") {
      ops.push({ addr, kind: "d" });
    } else if (part === "p") {
      ops.push({ addr, kind: "p" });
    } else {
      return null;
    }
  }
  return ops;
}

function cmdSed(io: CmdIO): CmdResult {
  const args = [...io.args];
  let inPlace = false;
  let quiet = false;
  let prog: string | null = null;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-i" || a === "--in-place") inPlace = true;
    else if (a === "-n" || a === "--quiet" || a === "--silent") quiet = true;
    else if (a === "-e" || a === "--expression") prog = (prog ? prog + ";" : "") + (args[++i] ?? "");
    else if (a === "--") rest.push(...args.slice(i + 1));
    else if (a.startsWith("-") && a !== "-" && prog === null) return fail(`sed: invalid option -- '${a.slice(1, 2)}'\n`);
    else if (prog === null) prog = a;
    else rest.push(a);
  }
  if (prog === null) return fail("sed: no script given\n");
  const ops = parseSedProgram(prog);
  if (!ops) return fail(`sed: -e expression #1, char 1: unknown command\n`);
  const applyLine = (line: string): { out: string[]; drop: boolean } => {
    const printed: string[] = [];
    let cur = line;
    let drop = false;
    for (const op of ops) {
      const addrOk = op.addr === null || new RegExp(breToJs(op.addr)).test(cur);
      if (!addrOk) continue;
      if (op.kind === "d") {
        drop = true;
        break;
      }
      if (op.kind === "p") {
        printed.push(cur);
        continue;
      }
      if (op.kind === "s") {
        let rx: RegExp;
        try {
          rx = new RegExp(breToJs(op.pat ?? ""), op.global ? "g" : "");
        } catch {
          return { out: [], drop: false };
        }
        cur = cur.replace(rx, (...m: string[]) => {
          const match = m[0];
          const groups = m.slice(1, -2);
          return (op.rep ?? "").replace(/\\([1-9&])/g, (s, g) => (g === "&" ? match : groups[parseInt(g, 10) - 1] ?? ""));
        });
      }
    }
    if (!drop && !quiet) printed.unshift(cur);
    else if (!drop && quiet && printed.length === 0) {
      // -n: only explicit p prints
    }
    return { out: printed, drop };
  };
  let out = "";
  let errOut = "";
  let code = 0;
  const process = (content: string): string => {
    let res = "";
    for (const line of splitLines(content)) {
      const r = applyLine(line);
      if (!r.drop) for (const l of r.out) res += l + "\n";
    }
    return res;
  };
  if (rest.length === 0) {
    out += process(io.stdin);
  }
  for (const t of rest) {
    const r = readInput(io, t);
    if (r.err) {
      errOut += `sed: can't read ${t}: ${r.err.split(": ").slice(1).join(": ") || r.err}\n`;
      code = 2;
      continue;
    }
    const transformed = process(r.content ?? "");
    if (inPlace) {
      const abs = io.shell.resolve(t);
      const node = io.shell.fs.getNode(abs);
      if (abs === "/dev/null") continue; // the void eats in-place edits too
      if (node && node.type === "file") {
        if (!io.shell.fs.canWrite(node, io.user)) {
          errOut += `sed: couldn't open file ${t}: Permission denied\n`;
          code = 2;
          continue;
        }
        node.content = transformed;
        node.mtime = new Date();
      }
    } else {
      out += transformed;
    }
  }
  return { code, out, err: errOut };
}

function expandTrSet(set: string): string[] {
  const out: string[] = [];
  for (let i = 0; i < set.length; i++) {
    const c = set[i];
    if (c === "\\" && i + 1 < set.length) {
      const n = set[i + 1];
      out.push(n === "n" ? "\n" : n === "t" ? "\t" : n === "r" ? "\r" : n);
      i++;
    } else if (i + 2 < set.length && set[i + 1] === "-" && set[i + 2] !== "]") {
      const from = set.charCodeAt(i);
      const to = set.charCodeAt(i + 2);
      if (from <= to) {
        for (let k = from; k <= to; k++) out.push(String.fromCharCode(k));
        i += 2;
      } else out.push(c);
    } else out.push(c);
  }
  return out;
}

function cmdTr(io: CmdIO): CmdResult {
  const args = [...io.args];
  let del = false;
  let squeeze = false;
  let complement = false;
  const sets: string[] = [];
  for (const a of args) {
    if (/^-[dsc]+$/.test(a) && a !== "-") {
      if (a.includes("d")) del = true;
      if (a.includes("s")) squeeze = true;
      if (a.includes("c")) complement = true;
    } else if (a.startsWith("-") && a !== "-") {
      return fail(`tr: invalid option -- '${a.slice(1, 2)}'\nTry 'tr --help' for more information.\n`);
    } else sets.push(a);
  }
  if (sets.length === 0) return fail("tr: missing operand\nTry 'tr --help' for more information.\n");
  let set1 = expandTrSet(sets[0]);
  if (complement) {
    const present = new Set(set1);
    const comp: string[] = [];
    for (let k = 1; k < 256; k++) {
      const ch = String.fromCharCode(k);
      if (!present.has(ch)) comp.push(ch);
    }
    set1 = comp;
  }
  const input = io.stdin;
  let out: string;
  if (del) {
    const bad = new Set(set1);
    out = [...input].filter((ch) => !bad.has(ch)).join("");
  } else {
    if (sets.length < 2) return fail("tr: missing operand after '" + sets[0] + "'\n");
    const set2 = expandTrSet(sets[1]);
    const map = new Map<string, string>();
    set1.forEach((ch, idx) => {
      if (!map.has(ch)) map.set(ch, set2[Math.min(idx, set2.length - 1)] ?? ch);
    });
    out = [...input].map((ch) => map.get(ch) ?? ch).join("");
  }
  if (squeeze) {
    const sq = new Set(sets.length >= 2 && !del ? expandTrSet(sets[1]) : set1);
    let res = "";
    let prev = "";
    for (const ch of out) {
      if (ch === prev && sq.has(ch)) continue;
      res += ch;
      prev = ch;
    }
    out = res;
  }
  return ok(out);
}

/* ------------------------------------------------------------------ */
/* find and tar                                                        */
/* ------------------------------------------------------------------ */

function cmdFind(io: CmdIO): CmdResult {
  const args = [...io.args];
  const paths: string[] = [];
  let i = 0;
  while (i < args.length && !args[i].startsWith("-")) {
    paths.push(args[i]);
    i++;
  }
  if (paths.length === 0) paths.push(".");
  const names: string[] = [];
  const inames: string[] = [];
  let typeF: string | null = null;
  let doDelete = false;
  let maxDepth = Infinity;
  let j = i;
  while (j < args.length) {
    const a = args[j];
    if (a === "-name") names.push(args[++j] ?? "");
    else if (a === "-iname") inames.push(args[++j] ?? "");
    else if (a === "-type") typeF = args[++j] ?? "";
    else if (a === "-delete") doDelete = true;
    else if (a === "-print") {
      /* default */
    } else if (a === "-maxdepth") maxDepth = parseInt(args[++j] ?? "0", 10);
    else if (a === "-print0") {
      /* treat like print */
    } else return fail(`find: unknown predicate \`${a}'\n`);
    j++;
  }
  const globMatch = (pat: string, name: string, ci: boolean): boolean => {
    const src = "^" + pat.replace(/[.+^${}()|\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$";
    return new RegExp(src, ci ? "i" : "").test(name);
  };
  let out = "";
  let errOut = "";
  let code = 0;
  for (const p of paths) {
    const abs = io.shell.resolve(p);
    const node = io.shell.fs.getNode(abs);
    if (!node) {
      errOut += `find: '${p}': No such file or directory\n`;
      code = 1;
      continue;
    }
    const all = io.shell.fs.walk(abs);
    for (const ap of all) {
      const depth = ap === abs ? 0 : ap.slice(abs.length).split("/").filter(Boolean).length;
      if (depth > maxDepth) continue;
      const n = io.shell.fs.getNode(ap);
      if (!n) continue;
      const base = io.shell.fs.basename(ap);
      if (typeF === "f" && n.type !== "file") continue;
      if (typeF === "d" && n.type !== "dir") continue;
      if (typeF === "l") continue;
      if (!names.every((pat) => globMatch(pat, base, false))) continue;
      if (!inames.every((pat) => globMatch(pat, base, true))) continue;
      if (doDelete) {
        if (ap === abs) continue;
        try {
          if (n.type === "dir" && n.children.size > 0) {
            errOut += `find: cannot delete '${p}': Directory not empty\n`;
            code = 1;
            continue;
          }
          io.shell.fs.remove(ap, false, io.user);
        } catch (e) {
          errOut += `find: cannot delete '${p}': ${e instanceof FsError ? e.message : "error"}\n`;
          code = 1;
        }
        continue;
      }
      // print with the path as the user gave it
      const rel = ap === abs ? "" : ap.slice(abs.length);
      out += (p.endsWith("/") && rel ? p.slice(0, -1) : p) + rel + "\n";
    }
  }
  return { code, out, err: errOut };
}

function cmdTar(io: CmdIO): CmdResult {
  const args = [...io.args];
  if (args.length === 0) return fail("tar: You must specify one of the '-Acdtrux', '--delete' or '--test-label' options\nTry 'tar --help' for more information.\n");
  let flagStr = args[0].startsWith("-") ? args[0].slice(1) : args[0];
  const rest = args.slice(1);
  let archive: string | null = null;
  let changeDir: string | null = null;
  let verbose = false;
  // -f and -C take arguments
  const cleaned: string[] = [];
  for (let k = 0; k < flagStr.length; k++) {
    const c = flagStr[k];
    if (c === "f") {
      archive = rest.shift() ?? null;
    } else if (c === "C") {
      changeDir = rest.shift() ?? null;
    } else if (c === "v") verbose = true;
    else if (c === "z") {
      /* accepted, format is stored plain */
    } else cleaned.push(c);
  }
  flagStr = cleaned.join("");
  // standalone -C / -f options mixed with file args (GNU tar accepts these anywhere)
  const files: string[] = [];
  for (let k = 0; k < rest.length; k++) {
    const a = rest[k];
    if ((a === "-C" || a === "--directory") && k + 1 < rest.length) changeDir = rest[++k];
    else if ((a === "-f" || a === "--file") && k + 1 < rest.length && !archive) archive = rest[++k];
    else files.push(a);
  }
  const mode = flagStr.includes("c") ? "c" : flagStr.includes("x") ? "x" : flagStr.includes("t") ? "t" : null;
  if (!mode) return fail("tar: You must specify one of the '-Acdtrux' options\nTry 'tar --help' for more information.\n");
  if (!archive) return fail("tar: -f option requires an argument\n");
  const archiveAbs = io.shell.resolve(archive);
  const baseDir = changeDir ? io.shell.resolve(changeDir) : io.shell.cwd;

  if (mode === "c") {
    if (files.length === 0) return fail("tar: Cowardly refusing to create an empty archive\nTry 'tar --help' for more information.\n");
    const entries: TarEntry[] = [];
    let errOut = "";
    for (const src of files) {
      const srcAbs = io.shell.resolve(src.startsWith("/") ? src : baseDir + "/" + src);
      const node = io.shell.fs.getNode(srcAbs);
      if (!node) {
        errOut += `tar: ${src}: Cannot stat: No such file or directory\n`;
        continue;
      }
      const relBase = srcAbs === baseDir ? io.shell.fs.basename(srcAbs) : srcAbs.slice(baseDir.length + 1) || io.shell.fs.basename(srcAbs);
      for (const p of io.shell.fs.walk(srcAbs)) {
        const n = io.shell.fs.getNode(p)!;
        const rel = p === srcAbs ? relBase : relBase + p.slice(srcAbs.length);
        entries.push({ p: rel, t: n.type === "dir" ? "d" : "f", m: n.mode, c: n.type === "file" ? n.content : "" });
        if (verbose) errOut += rel + "\n";
      }
    }
    const data = buildTar(entries);
    try {
      io.shell.fs.writeFile(archiveAbs, data, { owner: io.user.name, group: io.user.groups[0] ?? "agents", umask: io.shell.umask });
    } catch (e) {
      return fail(`tar: ${archive}: Cannot open: ${e instanceof FsError ? e.message : "error"}\n`);
    }
    return { code: errOut ? 2 : 0, out: "", err: errOut };
  }

  // x / t need to read the archive
  let data: string;
  try {
    data = io.shell.fs.readFile(archiveAbs, io.user);
  } catch (e) {
    return fail(`tar: ${archive}: Cannot open: ${e instanceof FsError ? e.message : "error"}\ntar: Error is not recoverable: exiting now\n`);
  }
  const entries = parseTar(data);
  if (!entries) return fail(`tar: This does not look like a tar archive\ntar: Error is not recoverable: exiting now\n`);

  if (mode === "t") {
    let out = "";
    for (const e of entries) {
      if (verbose) {
        out += `${modeToString(e.m, e.t === "d")} agent/agents ${String(io.shell.fs.byteSize(e.c)).padStart(8)} 2026-10-01 03:12 ${e.p}\n`;
      } else out += e.p + "\n";
    }
    return ok(out);
  }

  // extract
  let errOut = "";
  let code = 0;
  for (const e of entries) {
    const target = (baseDir + "/" + e.p).replace(/\/+/g, "/");
    try {
      if (e.t === "d") {
        io.shell.fs.mkdirp(target, { mode: e.m, owner: io.user.name, group: io.user.groups[0] ?? "agents", umask: 0 });
      } else {
        io.shell.fs.mkdirp(io.shell.fs.dirname(target), { owner: io.user.name, group: io.user.groups[0] ?? "agents", umask: 0 });
        io.shell.fs.writeFile(target, e.c, { mode: e.m, owner: io.user.name, group: io.user.groups[0] ?? "agents", umask: 0 });
      }
      if (verbose) errOut += e.p + "\n";
    } catch (err) {
      errOut += `tar: ${e.p}: Cannot create: ${err instanceof FsError ? err.message : "error"}\n`;
      code = 2;
    }
  }
  if (code !== 0) errOut += "tar: Error is not recoverable: exiting now\n";
  return { code, out: "", err: errOut };
}

/* ------------------------------------------------------------------ */
/* permissions                                                         */
/* ------------------------------------------------------------------ */

/** Apply one symbolic chmod clause set to a mode. Returns null on invalid spec. */
export function applySymbolicMode(spec: string, cur: number, isDir: boolean): number | null {
  let mode = cur;
  const clauses = spec.split(",");
  for (const clause of clauses) {
    const m = /^([ugoa]*)([+=-])([rwxXstugo]*)$/.exec(clause);
    if (!m) return null;
    const [, whoRaw, op, permsRaw] = m;
    const who = whoRaw === "" ? "a" : whoRaw;
    let perms = permsRaw;
    const classes = new Set<string>();
    for (const c of who) {
      if (c === "a") {
        classes.add("u");
        classes.add("g");
        classes.add("o");
      } else classes.add(c);
    }
    // copy form, e.g. g=u
    let copyFrom: string | null = null;
    if (/^[ugo]$/.test(perms)) {
      copyFrom = perms;
      perms = "rwx";
    }
    const bitVal = (cls: string, p: string): number => {
      const shift = cls === "u" ? 6 : cls === "g" ? 3 : 0;
      if (p === "r") return 4 << shift;
      if (p === "w") return 2 << shift;
      if (p === "x") return 1 << shift;
      if (p === "X") {
        if (isDir || mode & 0o111) return 1 << shift;
        return 0;
      }
      if (p === "s") return cls === "u" ? 0o4000 : cls === "g" ? 0o2000 : 0;
      if (p === "t") return 0o1000;
      return 0;
    };
    let addBits = 0;
    for (const cls of classes) {
      if (copyFrom) {
        const fromShift = copyFrom === "u" ? 6 : copyFrom === "g" ? 3 : 0;
        const toShift = cls === "u" ? 6 : cls === "g" ? 3 : 0;
        const srcBits = (mode >> fromShift) & 0o7;
        addBits |= srcBits << toShift;
      } else {
        for (const p of perms) addBits |= bitVal(cls, p);
      }
    }
    // mask of bits this clause may touch
    let touch = 0;
    for (const cls of classes) {
      touch |= 0o7 << (cls === "u" ? 6 : cls === "g" ? 3 : 0);
      if (cls === "u") touch |= 0o4000;
      if (cls === "g") touch |= 0o2000;
    }
    if (perms.includes("t") || who.includes("o") || who === "a") {
      // sticky may be set via o+t / a+t; = clears it when class o/a present
      if ([...classes].some((c) => c === "o")) touch |= 0o1000;
    }
    if (op === "=") {
      mode = mode & ~touch;
      mode |= addBits;
    } else if (op === "+") {
      mode |= addBits;
    } else {
      mode &= ~addBits;
    }
  }
  return mode & 0o7777;
}

function cmdChmod(io: CmdIO): CmdResult {
  const args = [...io.args];
  let recursive = false;
  let modeSpec: string | null = null;
  const rest: string[] = [];
  for (const a of args) {
    if (a === "-R" || a === "--recursive") recursive = true;
    else if (a === "--") rest.push(...args.slice(args.indexOf(a) + 1));
    else if (a.startsWith("-") && a !== "-" && modeSpec === null) {
      return fail(`chmod: invalid option -- '${a.slice(1, 2)}'\nTry 'chmod --help' for more information.\n`);
    } else if (modeSpec === null) modeSpec = a;
    else rest.push(a);
  }
  if (modeSpec === null) return fail("chmod: missing operand\nTry 'chmod --help' for more information.\n");
  if (rest.length === 0) return fail(`chmod: missing operand after '${modeSpec}'\nTry 'chmod --help' for more information.\n`);
  let errOut = "";
  let code = 0;
  for (const t of rest) {
    const abs = io.shell.resolve(t);
    const node = io.shell.fs.getNode(abs);
    if (!node) {
      errOut += `chmod: cannot access '${t}': No such file or directory\n`;
      code = 1;
      continue;
    }
    let newMode: number | null;
    if (/^[0-7]{3,4}$/.test(modeSpec)) {
      newMode = parseInt(modeSpec, 8);
    } else {
      newMode = applySymbolicMode(modeSpec, node.mode, node.type === "dir");
    }
    if (newMode === null) {
      errOut += `chmod: invalid mode: '${modeSpec}'\nTry 'chmod --help' for more information.\n`;
      code = 1;
      continue;
    }
    io.shell.fs.chmod(abs, newMode, recursive);
  }
  return { code, out: "", err: errOut };
}

function parseOwnerSpec(spec: string): { owner: string | null; group: string | null } | null {
  if (spec === "") return null;
  const idx = spec.indexOf(":");
  if (idx === -1) return /^[A-Za-z0-9_.-]+$/.test(spec) ? { owner: spec, group: null } : null;
  const owner = spec.slice(0, idx);
  const group = spec.slice(idx + 1);
  if (owner !== "" && !/^[A-Za-z0-9_.-]+$/.test(owner)) return null;
  if (group !== "" && !/^[A-Za-z0-9_.-]+$/.test(group)) return null;
  return { owner: owner || null, group: group || null };
}

function cmdChown(io: CmdIO): CmdResult {
  const args = [...io.args];
  let recursive = false;
  let spec: string | null = null;
  const rest: string[] = [];
  for (const a of args) {
    if (a === "-R" || a === "--recursive") recursive = true;
    else if (a.startsWith("-") && a !== "-" && spec === null) {
      return fail(`chown: invalid option -- '${a.slice(1, 2)}'\nTry 'chown --help' for more information.\n`);
    } else if (spec === null) spec = a;
    else rest.push(a);
  }
  if (spec === null) return fail("chown: missing operand\nTry 'chown --help' for more information.\n");
  if (rest.length === 0) return fail(`chown: missing operand after '${spec}'\nTry 'chown --help' for more information.\n`);
  const parsed = parseOwnerSpec(spec);
  if (!parsed || (!parsed.owner && !parsed.group)) return fail(`chown: invalid spec: '${spec}'\n`);
  if (io.user.uid !== 0) {
    return fail(`chown: changing ownership of '${rest[0]}': Operation not permitted\n`);
  }
  let errOut = "";
  let code = 0;
  for (const t of rest) {
    const abs = io.shell.resolve(t);
    if (!io.shell.fs.exists(abs)) {
      errOut += `chown: cannot access '${t}': No such file or directory\n`;
      code = 1;
      continue;
    }
    io.shell.fs.chown(abs, parsed.owner, parsed.group, recursive);
  }
  return { code, out: "", err: errOut };
}

function cmdChgrp(io: CmdIO): CmdResult {
  const args = [...io.args];
  let recursive = false;
  let group: string | null = null;
  const rest: string[] = [];
  for (const a of args) {
    if (a === "-R" || a === "--recursive") recursive = true;
    else if (a.startsWith("-") && a !== "-" && group === null) {
      return fail(`chgrp: invalid option -- '${a.slice(1, 2)}'\nTry 'chgrp --help' for more information.\n`);
    } else if (group === null) group = a;
    else rest.push(a);
  }
  if (group === null) return fail("chgrp: missing operand\nTry 'chgrp --help' for more information.\n");
  if (rest.length === 0) return fail(`chgrp: missing operand after '${group}'\nTry 'chgrp --help' for more information.\n`);
  if (!/^[A-Za-z0-9_.-]+$/.test(group)) return fail(`chgrp: invalid group: '${group}'\n`);
  if (io.user.uid !== 0) {
    return fail(`chgrp: changing group of '${rest[0]}': Operation not permitted\n`);
  }
  let errOut = "";
  let code = 0;
  for (const t of rest) {
    const abs = io.shell.resolve(t);
    if (!io.shell.fs.exists(abs)) {
      errOut += `chgrp: cannot access '${t}': No such file or directory\n`;
      code = 1;
      continue;
    }
    io.shell.fs.chown(abs, null, group, recursive);
  }
  return { code, out: "", err: errOut };
}

function cmdUmask(io: CmdIO): CmdResult {
  if (io.args.length === 0) {
    return ok(io.shell.umask.toString(8).padStart(4, "0") + "\n");
  }
  if (io.args.length > 1) return fail("bash: umask: too many arguments\n");
  const v = io.args[0];
  if (!/^[0-7]{1,4}$/.test(v)) return fail(`bash: umask: '${v}': invalid octal number\n`);
  io.shell.umask = parseInt(v, 8) & 0o777;
  return ok("");
}

/* ------------------------------------------------------------------ */
/* sudo                                                                */
/* ------------------------------------------------------------------ */

const SUDO_BLOCKED = new Set(["cd", "export", "umask", "history", "jobs", "bg", "fg", "exit", ":"]);

function cmdSudo(io: CmdIO): CmdResult {
  let args = [...io.args];
  if (args.length === 0) return fail("usage: sudo command\n", 1);
  if (args[0] === "-u" || args[0] === "--user") args = args.slice(2);
  if (args.length === 0) return fail("usage: sudo command\n", 1);
  const name = args[0];
  if (SUDO_BLOCKED.has(name)) return fail(`sudo: ${name}: command not found\n`, 1);
  return io.shell.runCommandAs(name, args.slice(1), io.stdin, io.env, 0);
}

/* ------------------------------------------------------------------ */
/* processes                                                           */
/* ------------------------------------------------------------------ */

/** Unwrap nice/nohup prefixes to detect a backgroundable sleep command. */
export function describeSleepJob(name: string, args: string[]): { secs: number; nice: number } | null {
  let n = name;
  let a = [...args];
  let nice = 0;
  for (;;) {
    if (n === "nice") {
      const ni = a.indexOf("-n");
      if (ni !== -1 && a[ni + 1] !== undefined) {
        nice = parseInt(a[ni + 1], 10) || 0;
        a = a.slice(ni + 2);
      } else {
        a = a[0]?.startsWith("-") ? a.slice(1) : a;
      }
      n = a.shift() ?? "";
      continue;
    }
    if (n === "nohup") {
      n = a.shift() ?? "";
      continue;
    }
    break;
  }
  if (n !== "sleep" || a.length === 0) return null;
  const m = /^(\d+(?:\.\d+)?)([smhd])?$/.exec(a[0]);
  if (!m) return null;
  const mult = m[2] === "m" ? 60 : m[2] === "h" ? 3600 : m[2] === "d" ? 86400 : 1;
  return { secs: parseFloat(m[1]) * mult, nice };
}

function psTable(io: CmdIO, full: boolean): string {
  const user = io.user.name;
  let out = "";
  if (full) {
    out += "USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n";
    for (const p of SYS_PROCS) {
      out += `${p.user.padEnd(12)} ${String(p.pid).padStart(5)}  0.0  0.1  22520  5120 ${p.tty.padEnd(8)} ${p.stat.padEnd(4)} 03:12   ${p.time} ${p.cmd}\n`;
    }
    out += `${user.padEnd(12)} ${"4242".padStart(5)}  0.0  0.2  24180  6140 pts/0    Ss   03:12   0:00 -bash\n`;
    for (const j of io.shell.jobs) {
      out += `${user.padEnd(12)} ${String(j.pid).padStart(5)}  0.0  0.0   8080   640 pts/0    S    03:54   0:00 ${j.command}\n`;
    }
  } else {
    out += "    PID TTY          TIME CMD\n";
    out += "   4242 pts/0    00:00:00 bash\n";
    for (const j of io.shell.jobs) {
      out += `  ${String(j.pid).padStart(5)} pts/0    00:00:00 ${j.command}\n`;
    }
  }
  return out;
}

function cmdPs(io: CmdIO): CmdResult {
  const args = io.args.join(" ");
  const full = /a/.test(args) || /e/.test(args) || /f/.test(args);
  return ok(psTable(io, full));
}

function matchProcs(io: CmdIO, pattern: string, fullCmd: boolean): { pid: number; jobIdx: number }[] {
  const out: { pid: number; jobIdx: number }[] = [];
  let rx: RegExp;
  try {
    rx = new RegExp(pattern);
  } catch {
    rx = new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  }
  io.shell.jobs.forEach((j, idx) => {
    const target = fullCmd ? j.command : procName(j.command);
    if (rx.test(target)) out.push({ pid: j.pid, jobIdx: idx });
  });
  for (const p of SYS_PROCS) {
    const target = fullCmd ? p.cmd : procName(p.cmd);
    if (rx.test(target)) out.push({ pid: p.pid, jobIdx: -1 });
  }
  return out;
}

function cmdPgrep(io: CmdIO): CmdResult {
  const args = [...io.args];
  let full = false;
  const rest: string[] = [];
  for (const a of args) {
    if (a === "-f" || a === "--full") full = true;
    else if (a.startsWith("-") && a !== "-") return fail(`pgrep: invalid option -- '${a.slice(1, 2)}'\n`, 2);
    else rest.push(a);
  }
  if (rest.length === 0) return fail("pgrep: no pattern specified\n", 2);
  const hits = matchProcs(io, rest[0], full);
  if (hits.length === 0) return ok("", 1);
  return ok(hits.map((h) => String(h.pid)).join("\n") + "\n");
}

function cmdPkill(io: CmdIO): CmdResult {
  const args = [...io.args];
  let full = false;
  let sig = "TERM";
  const rest: string[] = [];
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (a === "-f" || a === "--full") full = true;
    else if (a === "-9" || a === "-KILL" || a === "-kill") sig = "KILL";
    else if (/^-\d+$/.test(a) || /^-[A-Z]+$/.test(a)) sig = a.slice(1);
    else if (a.startsWith("-")) return fail(`pkill: invalid option -- '${a.slice(1, 2)}'\n`, 2);
    else rest.push(a);
  }
  if (rest.length === 0) return fail("pkill: no pattern specified\n", 2);
  const hits = matchProcs(io, rest[0], full);
  if (hits.length === 0) return ok("", 1);
  let errOut = "";
  let code = 0;
  // own background jobs go first
  const jobIdxs = [...new Set(hits.filter((h) => h.jobIdx >= 0).map((h) => h.jobIdx))].sort((a, b) => b - a);
  for (const idx of jobIdxs) io.shell.jobs.splice(idx, 1);
  // then fake system processes, honouring the signal permission rule
  for (const h of hits.filter((hh) => hh.jobIdx === -1)) {
    const sidx = SYS_PROCS.findIndex((p) => p.pid === h.pid);
    if (sidx === -1) continue;
    const p = SYS_PROCS[sidx];
    if (canSignalSys(io, p)) {
      SYS_PROCS.splice(sidx, 1);
    } else {
      errOut += `pkill: killing pid ${p.pid} failed: Operation not permitted\n`;
      code = 1;
    }
  }
  void sig;
  return { code, out: "", err: errOut };
}

function cmdKillall(io: CmdIO): CmdResult {
  if (io.args.length === 0) return fail("killall: no process name specified\n", 2);
  const name = io.args[0];
  let killed = 0;
  let errOut = "";
  let code = 0;
  const before = io.shell.jobs.length;
  io.shell.jobs = io.shell.jobs.filter(
    (j) => procName(j.command) !== name && j.command !== name
  );
  killed += before - io.shell.jobs.length;
  for (let i = SYS_PROCS.length - 1; i >= 0; i--) {
    const p = SYS_PROCS[i];
    if (procName(p.cmd) === name || p.cmd === name) {
      if (canSignalSys(io, p)) {
        SYS_PROCS.splice(i, 1);
        killed++;
      } else {
        errOut += `killall: kill(${p.pid}) failed: Operation not permitted\n`;
        code = 1;
      }
    }
  }
  if (killed === 0 && code === 0) return ok("", 1);
  return { code, out: "", err: errOut };
}

const SIGNALS: Record<string, number> = {
  HUP: 1, INT: 2, QUIT: 3, ILL: 4, TRAP: 5, ABRT: 6, BUS: 7, FPE: 8,
  KILL: 9, USR1: 10, SEGV: 11, USR2: 12, PIPE: 13, ALRM: 14, TERM: 15,
};

function cmdKill(io: CmdIO): CmdResult {
  const args = [...io.args];
  let sig = 15;
  const rest: string[] = [];
  for (let k = 0; k < args.length; k++) {
    const a = args[k];
    if (a === "-l") return ok(Object.entries(SIGNALS).map(([n, v]) => `${v}) SIG${n}`).join("\n") + "\n");
    if (a === "-s" || a === "--signal") {
      const s = (args[++k] ?? "").toUpperCase().replace(/^SIG/, "");
      if (!(s in SIGNALS)) return fail(`kill: ${args[k]}: invalid signal specification\n`);
      sig = SIGNALS[s];
    } else if (/^-\d+$/.test(a)) sig = parseInt(a.slice(1), 10);
    else if (/^-[A-Za-z]+$/.test(a)) {
      const s = a.slice(1).toUpperCase().replace(/^SIG/, "");
      if (!(s in SIGNALS)) return fail(`kill: ${a}: invalid signal specification\n`);
      sig = SIGNALS[s];
    } else if (a === "--") continue;
    else rest.push(a);
  }
  if (rest.length === 0) return fail("kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ... or kill -l [sigspec]\n", 2);
  let errOut = "";
  let code = 0;
  for (const t of rest) {
    if (t.startsWith("%")) {
      const id = parseInt(t.slice(1), 10);
      const idx = io.shell.jobs.findIndex((j) => j.id === id);
      if (idx === -1) {
        errOut += `bash: kill: %${id}: no such job\n`;
        code = 1;
        continue;
      }
      io.shell.jobs.splice(idx, 1);
      continue;
    }
    const pid = parseInt(t, 10);
    if (Number.isNaN(pid)) {
      errOut += `bash: kill: ${t}: arguments must be process or job IDs\n`;
      code = 1;
      continue;
    }
    const idx = io.shell.jobs.findIndex((j) => j.pid === pid);
    if (idx !== -1) {
      io.shell.jobs.splice(idx, 1);
      continue;
    }
    const sidx = SYS_PROCS.findIndex((p) => p.pid === pid);
    if (sidx !== -1) {
      const p = SYS_PROCS[sidx];
      if (canSignalSys(io, p)) {
        SYS_PROCS.splice(sidx, 1);
      } else {
        errOut += `bash: kill: (${pid}) - Operation not permitted\n`;
        code = 1;
      }
      continue;
    }
    errOut += `bash: kill: (${pid}) - No such process\n`;
    code = 1;
  }
  void sig;
  return { code, out: "", err: errOut };
}

function cmdJobs(io: CmdIO): CmdResult {
  const long = io.args.includes("-l");
  if (io.shell.jobs.length === 0) return ok("");
  let out = "";
  io.shell.jobs.forEach((j, idx) => {
    const cur = idx === io.shell.jobs.length - 1 ? "+" : "-";
    out += `[${j.id}]${cur}${long ? ` ${j.pid}` : ""}   Running                 ${j.command} &\n`;
  });
  return ok(out);
}

function cmdSleep(io: CmdIO): CmdResult {
  if (io.args.length === 0) return fail("sleep: missing operand\nTry 'sleep --help' for more information.\n");
  const m = /^(\d+(?:\.\d+)?)([smhd])?$/.exec(io.args[0]);
  if (!m) return fail(`sleep: invalid time interval '${io.args[0]}'\nTry 'sleep --help' for more information.\n`);
  // Foreground sleep is simulated as instant; background sleep becomes a job (handled by the shell).
  return ok("");
}

function cmdBg(io: CmdIO): CmdResult {
  if (io.shell.jobs.length === 0) return fail("bash: bg: current: no such job\n");
  const j = io.shell.jobs[io.shell.jobs.length - 1];
  return ok(`[${j.id}]   Running                 ${j.command} &\n`);
}

function cmdFg(io: CmdIO): CmdResult {
  const arg = io.args[0];
  let idx = io.shell.jobs.length - 1;
  if (arg) {
    const id = parseInt(arg.replace("%", ""), 10);
    idx = io.shell.jobs.findIndex((j) => j.id === id);
    if (idx === -1) return fail(`bash: fg: ${arg}: no such job\n`);
  }
  if (idx < 0) return fail("bash: fg: current: no such job\n");
  const [j] = io.shell.jobs.splice(idx, 1);
  return ok(`${j.command}\n`);
}

function cmdNice(io: CmdIO): CmdResult {
  const args = [...io.args];
  if (args.length === 0) return ok("0\n");
  // handled as a job wrapper by the shell for background sleep; otherwise run through
  let a = args;
  if (a[0] === "-n" || a[0] === "--adjustment") a = a.slice(2);
  else if (/^-\d+$/.test(a[0])) a = a.slice(1);
  if (a.length === 0) return ok("0\n");
  return io.shell.runCommandAs(a[0], a.slice(1), io.stdin, io.env, io.user.uid);
}

function cmdNohup(io: CmdIO): CmdResult {
  if (io.args.length === 0) return fail("nohup: missing operand\nTry 'nohup --help' for more information.\n", 1);
  return io.shell.runCommandAs(io.args[0], io.args.slice(1), io.stdin, io.env, io.user.uid);
}

function cmdTop(io: CmdIO): CmdResult {
  const now = new Date();
  const up = io.shell.uptimeSecs();
  const upStr = up < 3600 ? `${Math.floor(up / 60)} min` : `${Math.floor(up / 3600)}:${pad2(Math.floor((up % 3600) / 60))}`;
  let out = `top - ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())} up ${upStr},  1 user,  load average: 0.12, 0.08, 0.05\n`;
  out += "Tasks:  12 total,   1 running,  11 sleeping,   0 stopped,   0 zombie\n";
  out += "%Cpu(s):  2.1 us,  1.0 sy,  0.0 ni, 96.9 id,  0.0 wa,  0.0 hi,  0.0 si,  0.0 st\n";
  out += "MiB Mem :   3920.4 total,   2451.2 free,    598.1 used,    871.1 buff/cache\n";
  out += "MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.   3102.4 avail Mem\n\n";
  out += "    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n";
  for (const p of SYS_PROCS) {
    out += `  ${String(p.pid).padStart(5)} ${p.user.padEnd(8)}  20   0   22520   5120   2300 S   0.0   0.1   ${p.time} ${p.cmd}\n`;
  }
  for (const j of io.shell.jobs) {
    out += `  ${String(j.pid).padStart(5)} ${(io.user.name).padEnd(8)}  20  ${String(j.nice).padStart(2)}    8080    640    512 S   0.0   0.0   0:00.00 ${j.command}\n`;
  }
  return ok(out);
}

/* ------------------------------------------------------------------ */
/* network (simulated station peers)                                   */
/* ------------------------------------------------------------------ */

function cmdPing(io: CmdIO): CmdResult {
  const args = [...io.args];
  let count = 4;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-c" || a === "--count") count = parseInt(args[++i] ?? "4", 10);
    else if (/^-c\d+$/.test(a)) count = parseInt(a.slice(2), 10);
    else if (a.startsWith("-")) return fail(`ping: invalid option -- '${a.slice(1, 2)}'\n`);
    else rest.push(a);
  }
  if (rest.length === 0) return fail("ping: usage error: Destination address required\n", 2);
  const host = rest[0];
  const alive = host === GATEWAY || host === RELAY || host === "127.0.0.1" || host === "localhost";
  const ip = host === "localhost" ? "127.0.0.1" : host;
  if (!alive) return fail(`ping: ${host}: Name or service not known\n`, 2);
  if (!(count > 0)) count = 4;
  let out = `PING ${host} (${ip}) 56(84) bytes of data.\n`;
  for (let s = 1; s <= count; s++) {
    const ms = (0.35 + ((s * 37) % 10) / 100).toFixed(2);
    out += `64 bytes from ${ip}: icmp_seq=${s} ttl=64 time=${ms} ms\n`;
  }
  out += `\n--- ${host} ping statistics ---\n`;
  out += `${count} packets transmitted, ${count} received, 0% packet loss, time ${(count - 1) * 1000 + 12}ms\n`;
  out += `rtt min/avg/max/mdev = 0.351/0.398/0.442/0.031 ms\n`;
  return ok(out);
}

function cmdCurl(io: CmdIO): CmdResult {
  const args = [...io.args];
  let headersOnly = false;
  let silent = false;
  let outFile: string | null = null;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-I" || a === "--head") headersOnly = true;
    else if (a === "-s" || a === "--silent") silent = true;
    else if (a === "-S" || a === "--show-error") {
      /* accepted */
    } else if (a === "-o" || a === "--output") outFile = args[++i] ?? null;
    else if (a === "-O" || a === "--remote-name") outFile = "@remote";
    else if (a.startsWith("-") && a !== "-") return fail(`curl: option ${a}: is unknown\ncurl: try 'curl --help' for more information\n`, 2);
    else rest.push(a);
  }
  if (rest.length === 0) return fail("curl: no URL specified!\ncurl: try 'curl --help' for more information\n", 2);
  const url = rest[0];
  const m = /^(https?):\/\/([^/:]+)(:\d+)?(\/.*)?$/.exec(url);
  if (!m) return fail(`curl: (3) URL rejected: Malformed input to a URL function\n`);
  const host = m[2];
  const path = m[4] || "/";
  const full = `${m[1]}://${host}${path}`;
  if (!isStationHost(host)) return fail(`curl: (6) Could not resolve host: ${host}\n`);
  const page = FAKE_HTTP[full] ?? FAKE_HTTP[full.replace(/\/$/, "")];
  const status = page?.status ?? 404;
  const body = page?.body ?? `<html><body><h1>404 Not Found</h1></body></html>\n`;
  const ctype = page?.contentType ?? "text/html";
  if (headersOnly) {
    return ok(httpHeaders(status, ctype, io.shell.fs.byteSize(body)).replace(/\r\n/g, "\n"));
  }
  if (outFile) {
    const target = outFile === "@remote" ? path.split("/").filter(Boolean).pop() ?? "index.html" : outFile;
    const abs = io.shell.resolve(target);
    try {
      const parent = io.shell.fs.getNode(io.shell.fs.dirname(abs));
      if (!parent || parent.type !== "dir") throw new FsError("No such file or directory");
      io.shell.fs.writeFile(abs, body, { owner: io.user.name, group: io.user.groups[0] ?? "agents", umask: io.shell.umask });
    } catch (e) {
      return fail(`curl: (23) Failed writing body: ${e instanceof FsError ? e.message : "error"}\n`);
    }
    return ok("");
  }
  if (!silent && status !== 200) return fail(`curl: (22) The requested URL returned error: ${status}\n`);
  return ok(body, status === 200 ? 0 : 22);
}

function cmdWget(io: CmdIO): CmdResult {
  const args = [...io.args];
  let outFile: string | null = null;
  let quiet = false;
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "-O" || a === "--output-document") outFile = args[++i] ?? null;
    else if (a === "-q" || a === "--quiet") quiet = true;
    else if (a.startsWith("-") && a !== "-") return fail(`wget: invalid option -- '${a.slice(1, 2)}'\n`);
    else rest.push(a);
  }
  if (rest.length === 0) return fail("wget: missing URL\nUsage: wget [OPTION]... [URL]...\n", 2);
  const url = rest[0];
  const m = /^(https?):\/\/([^/:]+)(:\d+)?(\/.*)?$/.exec(url);
  if (!m) return fail(`wget: invalid URL '${url}'\n`, 2);
  const host = m[2];
  const path = m[4] || "/";
  const full = `${m[1]}://${host}${path}`;
  if (!isStationHost(host)) return fail(`wget: unable to resolve host address '${host}'\n`, 4);
  const page = FAKE_HTTP[full];
  if (!page) {
    if (!quiet) return fail(`--${nowStamp()}--  ${url}\nConnecting to ${host}:80... connected.\nHTTP request sent, awaiting response... 404 Not Found\nERROR 404: Not Found.\n`, 8);
    return fail("", 8);
  }
  const target = outFile ?? path.split("/").filter(Boolean).pop() ?? "index.html";
  const abs = io.shell.resolve(target);
  try {
    const parent = io.shell.fs.getNode(io.shell.fs.dirname(abs));
    if (!parent || parent.type !== "dir") throw new FsError("No such file or directory");
    if (!io.shell.fs.canWrite(parent, io.user)) throw new FsError("Permission denied");
    io.shell.fs.writeFile(abs, page.body, { owner: io.user.name, group: io.user.groups[0] ?? "agents", umask: io.shell.umask });
  } catch (e) {
    return fail(`wget: cannot write to '${target}': ${e instanceof FsError ? e.message : "error"}\n`, 3);
  }
  const len = io.shell.fs.byteSize(page.body);
  let out = "";
  if (!quiet) {
    out =
      `--${nowStamp()}--  ${url}\n` +
      `Connecting to ${host}:80... connected.\n` +
      `HTTP request sent, awaiting response... 200 OK\n` +
      `Length: ${len} [${page.contentType}]\n` +
      `Saving to: '${target}'\n\n` +
      `${target}  100%[${"=".repeat(38)}>]  ${humanSize(len).padStart(7)}  --.-KB/s    in 0s\n\n` +
      `${nowStamp()} (${humanSize(len)}/s) - '${target}' saved [${len}/${len}]\n`;
  }
  return ok(out);
}

function nowStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

const REMOTE_CMDS: Record<string, (io: CmdIO) => string> = {
  uptime: () => ` 03:54:49 up 2:14,  1 user,  load average: 0.05, 0.03, 0.01\n`,
  whoami: () => "relay\n",
  hostname: () => "relay\n",
  date: () => new Date().toString() + "\n",
  pwd: () => "/home/relay\n",
};

function cmdSsh(io: CmdIO): CmdResult {
  if (io.args.length === 0) return fail("usage: ssh [-l login_name] hostname [command]\n", 2);
  const dest = io.args[0];
  const at = dest.indexOf("@");
  const user = at === -1 ? io.user.name : dest.slice(0, at);
  const host = at === -1 ? dest : dest.slice(at + 1);
  const remoteCmd = io.args.slice(1);
  if (host !== RELAY && host !== "relay") return fail(`ssh: Could not resolve hostname ${host}: Name or service not known\n`, 255);
  if (user !== "relay") return fail(`${user}@${RELAY}: Permission denied (publickey,password).\n`, 255);
  if (remoteCmd.length > 0) {
    const name = remoteCmd[0];
    if (name === "ls") {
      const target = remoteCmd[1] ?? "";
      if (target === "/incoming" || target === "/incoming/" || target === "") {
        return ok("manifest.txt  evidence/\n");
      }
      return fail(`ls: cannot access '${target}': No such file or directory\n`, 2);
    }
    const fn = REMOTE_CMDS[name];
    if (!fn) return fail(`bash: ${name}: command not found\n`, 127);
    return ok(fn(io));
  }
  return ok(
    `Warning: Permanently added '${RELAY}' (ED25519) to the list of known hosts.\n` +
      `Welcome to NEXUS-9 relay node.\n` +
      `Last login: Thu Oct  1 03:10:22 2026 from 10.0.0.1\n` +
      `relay@relay:~$ uptime\n` +
      ` 03:54:49 up 2:14,  1 user,  load average: 0.05, 0.03, 0.01\n` +
      `relay@relay:~$ logout\n` +
      `Connection to ${RELAY} closed.\n`
  );
}

function parseScpSpec(spec: string): { user: string | null; host: string | null; path: string } {
  const colon = spec.indexOf(":");
  if (colon === -1) return { user: null, host: null, path: spec };
  const left = spec.slice(0, colon);
  const at = left.indexOf("@");
  return {
    user: at === -1 ? null : left.slice(0, at),
    host: at === -1 ? left : left.slice(at + 1),
    path: spec.slice(colon + 1),
  };
}

function cmdScp(io: CmdIO): CmdResult {
  const args = io.args.filter((a) => a !== "-r" && a !== "-v" && a !== "-q");
  if (args.length < 2) return fail("usage: scp [-r] source ... target\n", 1);
  const dst = parseScpSpec(args[args.length - 1]);
  const srcs = args.slice(0, -1).map(parseScpSpec);
  let out = "";
  for (const src of srcs) {
    if (src.host === null && dst.host !== null) {
      // local -> remote
      if (dst.host !== RELAY) return fail(`scp: Could not resolve hostname ${dst.host}: Name or service not known\n`, 1);
      const abs = io.shell.resolve(src.path);
      const node = io.shell.fs.getNode(abs);
      if (!node || node.type !== "file") return fail(`scp: ${src.path}: No such file or directory\n`, 1);
      if (!io.shell.fs.canRead(node, io.user)) return fail(`scp: ${src.path}: Permission denied\n`, 1);
      const size = io.shell.fs.byteSize(node.content);
      const base = io.shell.fs.basename(abs);
      out += `${base}${" ".repeat(Math.max(1, 50 - base.length))}100% ${String(size).padStart(5)}     0.0KB/s   00:00\n`;
    } else if (src.host !== null && dst.host === null) {
      // remote -> local (canned)
      if (src.host !== RELAY) return fail(`scp: Could not resolve hostname ${src.host}: Name or service not known\n`, 1);
      if (src.path === "/incoming/manifest.txt" || src.path.endsWith("manifest.txt")) {
        const abs = io.shell.resolve(dst.path);
        io.shell.fs.writeFile(abs, "relay manifest: 3 evidence bundles pending pickup\n", {
          owner: io.user.name,
          group: io.user.groups[0] ?? "agents",
          umask: io.shell.umask,
        });
        out += `manifest.txt${" ".repeat(37)}100%    48     0.0KB/s   00:00\n`;
      } else {
        return fail(`scp: ${src.path}: No such file or directory\n`, 1);
      }
    } else {
      return fail("scp: station relay only supports transfers with relay@10.0.0.2\n", 1);
    }
  }
  return ok(out);
}

function cmdSs(io: CmdIO): CmdResult {
  const argStr = io.args.join("");
  const wantTcp = argStr.includes("t") || (!argStr.includes("t") && !argStr.includes("u"));
  const wantUdp = argStr.includes("u");
  const listeningOnly = argStr.includes("l");
  const showProc = argStr.includes("p");
  interface Row { netid: string; state: string; local: string; peer: string; proc: string }
  const rows: Row[] = [];
  if (wantTcp) {
    rows.push(
      { netid: "tcp", state: "LISTEN", local: "0.0.0.0:22", peer: "0.0.0.0:*", proc: 'users:(("sshd",pid=88,fd=3))' },
      { netid: "tcp", state: "LISTEN", local: "0.0.0.0:80", peer: "0.0.0.0:*", proc: 'users:(("relay-svc",pid=313,fd=5))' },
      { netid: "tcp", state: "LISTEN", local: "0.0.0.0:8443", peer: "0.0.0.0:*", proc: 'users:(("relay-svc",pid=313,fd=6))' },
      { netid: "tcp", state: "LISTEN", local: "0.0.0.0:4444", peer: "0.0.0.0:*", proc: 'users:(("beacon",pid=666,fd=4))' }
    );
    if (!listeningOnly) {
      rows.push({ netid: "tcp", state: "ESTAB", local: "10.0.0.9:22", peer: "10.0.0.5:51234", proc: 'users:(("sshd",pid=88,fd=9))' });
    }
  }
  if (wantUdp) {
    rows.push({ netid: "udp", state: "UNCONN", local: "0.0.0.0:68", peer: "0.0.0.0:*", proc: 'users:(("dhclient",pid=95,fd=7))' });
  }
  const filtered = listeningOnly ? rows.filter((r) => r.state === "LISTEN" || r.state === "UNCONN") : rows;
  let out = "Netid State   Recv-Q Send-Q Local Address:Port   Peer Address:Port  " + (showProc ? "Process\n" : "\n");
  for (const r of filtered) {
    out += `${r.netid.padEnd(5)} ${r.state.padEnd(7)} 0      128    ${r.local.padEnd(19)} ${r.peer.padEnd(19)}${showProc ? r.proc : ""}\n`;
  }
  return ok(out);
}

function cmdIp(io: CmdIO): CmdResult {
  const sub = io.args[0];
  if (!sub) return fail("Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }\n       ip addr\n       ip route\n", 1);
  if (sub === "addr" || sub === "a" || sub === "address") {
    return ok(
      `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000\n` +
        `    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n` +
        `    inet 127.0.0.1/8 scope host lo\n` +
        `       valid_lft forever preferred_lft forever\n` +
        `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000\n` +
        `    link/ether 02:42:ac:11:00:09 brd ff:ff:ff:ff:ff:ff\n` +
        `    inet 10.0.0.9/24 brd 10.0.0.255 scope global eth0\n` +
        `       valid_lft forever preferred_lft forever\n`
    );
  }
  if (sub === "route" || sub === "r") {
    return ok(`default via 10.0.0.1 dev eth0 proto dhcp metric 100\n10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.9 metric 100\n`);
  }
  if (sub === "link" || sub === "l") {
    return ok(
      `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN mode DEFAULT group default qlen 1000\n` +
        `2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP mode DEFAULT group default qlen 1000\n`
    );
  }
  return fail(`ip: unknown command '${sub}'\n`, 1);
}

/* ------------------------------------------------------------------ */
/* system information                                                  */
/* ------------------------------------------------------------------ */

function cmdDf(io: CmdIO): CmdResult {
  const inodes = io.args.includes("-i") || io.args.includes("--inodes");
  const human = io.args.includes("-h") || io.args.includes("--human-readable");
  if (inodes) {
    return ok(
      `Filesystem     Inodes IUsed  IFree IUse% Mounted on\n` +
        `/dev/vda1      1310720 48211 1262509    4% /\n` +
        `tmpfs           502048   212  501836    1% /dev/shm\n`
    );
  }
  void human;
  return ok(
    `Filesystem      Size  Used Avail Use% Mounted on\n` +
      `/dev/vda1        20G  6.2G   13G  33% /\n` +
      `tmpfs           2.0G     0  2.0G   0% /dev/shm\n` +
      `tmpfs           786M  1.2M  785M   1% /run\n`
  );
}

function duSize(io: CmdIO, abs: string): number {
  const node = io.shell.fs.getNode(abs);
  if (!node) return 0;
  if (node.type === "file") return io.shell.fs.byteSize(node.content);
  let total = 4096;
  for (const child of node.children.values()) {
    total += duSize(io, (abs === "/" ? "" : abs) + "/" + [...node.children.entries()].find(([, v]) => v === child)![0]);
  }
  return total;
}

function cmdDu(io: CmdIO): CmdResult {
  const { flags, rest, err } = parseShortFlags(io.args, "sh", "du");
  if (err) return fail(err, 2);
  const targets = rest.length > 0 ? rest : ["."];
  let out = "";
  let errOut = "";
  let code = 0;
  for (const t of targets) {
    const abs = io.shell.resolve(t);
    const node = io.shell.fs.getNode(abs);
    if (!node) {
      errOut += `du: cannot access '${t}': No such file or directory\n`;
      code = 1;
      continue;
    }
    if (node.type === "file") {
      const s = io.shell.fs.byteSize(node.content);
      out += `${flags.has("h") ? humanSize(s) : Math.max(4, Math.ceil(s / 1024))}\t${t}\n`;
      continue;
    }
    const total = duSize(io, abs);
    const shown = flags.has("h") ? humanSize(total) : Math.ceil(total / 1024);
    if (flags.has("s")) {
      out += `${shown}\t${t}\n`;
    } else {
      // list each subdirectory too
      const subs: string[] = [];
      const walk2 = (a: string, disp: string) => {
        const n = io.shell.fs.getNode(a)!;
        if (n.type !== "dir") return;
        const s = duSize(io, a);
        subs.push(`${flags.has("h") ? humanSize(s) : Math.ceil(s / 1024)}\t${disp}`);
        for (const [name, child] of n.children) {
          if (child.type === "dir") walk2(a === "/" ? `/${name}` : `${a}/${name}`, `${disp}/${name}`);
        }
      };
      walk2(abs, t);
      out += subs.join("\n") + "\n";
    }
  }
  return { code, out, err: errOut };
}

function cmdFree(io: CmdIO): CmdResult {
  const human = io.args.includes("-h") || io.args.includes("--human");
  const mega = io.args.includes("-m");
  const fmt = (kb: number): string => {
    if (human) return humanSize(kb * 1024).padStart(7);
    if (mega) return String(Math.round(kb / 1024)).padStart(7);
    return String(kb).padStart(7);
  };
  return ok(
    `               total        used        free      shared  buff/cache   available\n` +
      `Mem:       ${fmt(4014436)} ${fmt(626688)} ${fmt(2512344)} ${fmt(12288)} ${fmt(875404)} ${fmt(3072000)}\n` +
      `Swap:      ${fmt(1048576)} ${fmt(0)} ${fmt(1048576)}\n`
  );
}

function cmdUname(io: CmdIO): CmdResult {
  const args = io.args.join("");
  if (args === "" || args === "-s") return ok("Linux\n");
  let parts: string[] = [];
  const push = (s: string) => parts.push(s);
  for (const ch of args.replace(/^-/, "")) {
    if (ch === "s") push("Linux");
    else if (ch === "n") push("nexus");
    else if (ch === "r") push("6.8.0-nexus");
    else if (ch === "v") push("#1 SMP PREEMPT_DYNAMIC Thu Oct  1 03:00:00 CEST 2026");
    else if (ch === "m" || ch === "p" || ch === "i") push("x86_64");
    else if (ch === "o") push("GNU/Linux");
    else if (ch === "a") {
      parts = ["Linux", "nexus", "6.8.0-nexus", "#1 SMP PREEMPT_DYNAMIC Thu Oct  1 03:00:00 CEST 2026", "x86_64", "GNU/Linux"];
      break;
    } else return fail(`uname: invalid option -- '${ch}'\nTry 'uname --help' for more information.\n`);
  }
  return ok(parts.join(" ") + "\n");
}

function cmdUptime(io: CmdIO): CmdResult {
  const now = new Date();
  const up = io.shell.uptimeSecs();
  const days = Math.floor(up / 86400);
  const hrs = Math.floor((up % 86400) / 3600);
  const mins = Math.floor((up % 3600) / 60);
  const upStr = days > 0 ? `${days} day${days > 1 ? "s" : ""}, ${hrs}:${pad2(mins)}` : hrs > 0 ? `${hrs}:${pad2(mins)}` : `${mins} min`;
  return ok(` ${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())} up ${upStr},  1 user,  load average: 0.12, 0.08, 0.05\n`);
}

function cmdHistory(io: CmdIO): CmdResult {
  if (io.args[0] === "-c") {
    io.shell.clearHistory();
    return ok("");
  }
  const hist = io.shell.getHistory();
  let n = hist.length;
  if (io.args[0] !== undefined) {
    const parsed = parseInt(io.args[0], 10);
    if (!Number.isNaN(parsed)) n = Math.min(parsed, hist.length);
  }
  return ok(hist.slice(hist.length - n).map((h, i) => ` ${String(hist.length - n + i + 1).padStart(4)}  ${h}`).join("\n") + (n > 0 ? "\n" : ""));
}

function cmdEnv(io: CmdIO): CmdResult {
  return ok(Object.entries(io.env).map(([k, v]) => `${k}=${v}`).join("\n") + "\n");
}

function cmdExport(io: CmdIO): CmdResult {
  if (io.args.length === 0) {
    return ok(Object.entries(io.shell.env).map(([k, v]) => `declare -x ${k}="${v}"`).join("\n") + "\n");
  }
  let errOut = "";
  let code = 0;
  for (const a of io.args) {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)(=(.*))?$/.exec(a);
    if (!m) {
      errOut += `bash: export: '${a}': not a valid identifier\n`;
      code = 1;
      continue;
    }
    if (m[2] !== undefined) io.shell.env[m[1]] = m[3] ?? "";
    else if (!(m[1] in io.shell.env)) io.shell.env[m[1]] = "";
  }
  return { code, out: "", err: errOut };
}

function cmdClear(): CmdResult {
  return ok("\x1b[H\x1b[2J");
}

function cmdWhoami(io: CmdIO): CmdResult {
  return ok(io.user.name + "\n");
}

function cmdId(io: CmdIO): CmdResult {
  const target = io.args[0];
  if (target && target !== io.user.name && target !== "root" && target !== "agent") {
    return fail(`id: '${target}': no such user\n`, 1);
  }
  const name = target ?? io.user.name;
  if (name === "root") return ok("uid=0(root) gid=0(root) groups=0(root)\n");
  return ok("uid=1000(agent) gid=1000(agents) groups=1000(agents)\n");
}

function cmdDate(io: CmdIO): CmdResult {
  const d = new Date();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmt = io.args[0];
  if (fmt && fmt.startsWith("+")) {
    const out = fmt
      .slice(1)
      .replace(/%%/g, "\x00")
      .replace(/%Y/g, String(d.getFullYear()))
      .replace(/%m/g, pad2(d.getMonth() + 1))
      .replace(/%d/g, pad2(d.getDate()))
      .replace(/%e/g, String(d.getDate()).padStart(2, " "))
      .replace(/%H/g, pad2(d.getHours()))
      .replace(/%M/g, pad2(d.getMinutes()))
      .replace(/%S/g, pad2(d.getSeconds()))
      .replace(/%a/g, days[d.getDay()])
      .replace(/%A/g, ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][d.getDay()])
      .replace(/%b/g, months[d.getMonth()])
      .replace(/%B/g, ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.getMonth()])
      .replace(/%T/g, `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`)
      .replace(/%F/g, `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`)
      .replace(/%s/g, String(Math.floor(d.getTime() / 1000)))
      .replace(/\x00/g, "%");
    return ok(out + "\n");
  }
  return ok(`${days[d.getDay()]} ${months[d.getMonth()]} ${String(d.getDate()).padStart(2, " ")} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())} CEST ${d.getFullYear()}\n`);
}

function cmdHostname(): CmdResult {
  return ok("nexus\n");
}

function cmdExit(io: CmdIO): CmdResult {
  io.shell.exited = true;
  return ok("logout\n");
}

function cmdLessMore(io: CmdIO): CmdResult {
  if (io.args.length === 0) {
    // pager on stdin: just dump it
    return ok(io.stdin);
  }
  return cmdCat({ ...io, args: io.args.filter((a) => a !== "-") });
}

function cmdTrue(): CmdResult {
  return ok("", 0);
}

/** Commands bash implements internally (a subset of the real list). */
const SHELL_BUILTINS = new Set([
  "cd", "pwd", "echo", "export", "umask", "history", "jobs", "bg", "fg",
  "exit", ":", ".", "source", "alias", "unalias", "type", "kill", "true",
  "false", "test", "[", "read", "shift", "trap", "wait",
]);

function cmdWhich(io: CmdIO): CmdResult {
  let out = "";
  let code = 0;
  for (const a of io.args) {
    if (a.startsWith("-")) continue;
    if (SHELL_BUILTINS.has(a) || !COMMANDS[a]) {
      // like Debian's which: builtins and unknown names are silent, exit 1
      code = 1;
      continue;
    }
    out += `/usr/bin/${a}\n`;
  }
  return { code, out, err: "" };
}

function cmdType(io: CmdIO): CmdResult {
  let out = "";
  let code = 0;
  for (const a of io.args) {
    if (a.startsWith("-")) continue;
    if (SHELL_BUILTINS.has(a)) out += `${a} is a shell builtin\n`;
    else if (COMMANDS[a]) out += `${a} is /usr/bin/${a}\n`;
    else {
      out += `bash: type: ${a}: not found\n`;
      code = 1;
    }
  }
  return { code, out, err: "" };
}

function cmdFalse(): CmdResult {
  return ok("", 1);
}

/* ------------------------------------------------------------------ */
/* registry                                                            */
/* ------------------------------------------------------------------ */

export const COMMANDS: Record<string, CommandFn> = {
  pwd: cmdPwd,
  ls: cmdLs,
  cd: cmdCd,
  mkdir: cmdMkdir,
  touch: cmdTouch,
  rm: cmdRm,
  cp: cmdCp,
  mv: cmdMv,
  cat: cmdCat,
  head: (io) => headTail(io, "head"),
  tail: (io) => headTail(io, "tail"),
  file: cmdFile,
  wc: cmdWc,
  diff: cmdDiff,
  echo: cmdEcho,
  grep: cmdGrep,
  sort: cmdSort,
  uniq: cmdUniq,
  cut: cmdCut,
  awk: cmdAwk,
  sed: cmdSed,
  tr: cmdTr,
  find: cmdFind,
  tar: cmdTar,
  chmod: cmdChmod,
  chown: cmdChown,
  chgrp: cmdChgrp,
  umask: cmdUmask,
  sudo: cmdSudo,
  ps: cmdPs,
  pgrep: cmdPgrep,
  pkill: cmdPkill,
  killall: cmdKillall,
  kill: cmdKill,
  jobs: cmdJobs,
  sleep: cmdSleep,
  bg: cmdBg,
  fg: cmdFg,
  nice: cmdNice,
  nohup: cmdNohup,
  top: cmdTop,
  ping: cmdPing,
  curl: cmdCurl,
  wget: cmdWget,
  ssh: cmdSsh,
  scp: cmdScp,
  ss: cmdSs,
  ip: cmdIp,
  df: cmdDf,
  du: cmdDu,
  free: cmdFree,
  uname: cmdUname,
  uptime: cmdUptime,
  history: cmdHistory,
  man: (io) => cmdMan(io),
  env: cmdEnv,
  export: cmdExport,
  clear: cmdClear,
  whoami: cmdWhoami,
  id: cmdId,
  date: cmdDate,
  hostname: cmdHostname,
  exit: cmdExit,
  less: (io) => cmdLessMore(io),
  more: (io) => cmdLessMore(io),
  true: cmdTrue,
  false: cmdFalse,
  which: cmdWhich,
  type: cmdType,
};

export const COMMAND_COUNT = Object.keys(COMMANDS).length;

/* ------------------------------------------------------------------ */
/* man pages                                                           */
/* ------------------------------------------------------------------ */

function manPage(name: string, section: string, synopsis: string, desc: string, opts: string, examples: string): string {
  const title = name.toUpperCase();
  const head = `${title}(1)${" ".repeat(Math.max(1, 28 - title.length - 4))}NEXUS Manual${" ".repeat(20)}${title}(1)\n\n`;
  return (
    head +
    `NAME\n       ${name} - ${section}\n\n` +
    `SYNOPSIS\n       ${synopsis}\n\n` +
    `DESCRIPTION\n       ${desc}\n\n` +
    (opts ? `OPTIONS\n${opts}\n\n` : "") +
    `EXAMPLES\n${examples}\n`
  );
}

const M = (name: string, section: string, synopsis: string, desc: string, opts: [string, string][], examples: string[]): string =>
  manPage(
    name,
    section,
    synopsis,
    desc,
    opts.map(([f, d]) => `       ${f.padEnd(12)} ${d}`).join("\n"),
    examples.map((e) => `       ${e}`).join("\n")
  );

export const MAN_PAGES: Record<string, string> = {
  ls: M("ls", "list directory contents", "ls [OPTION]... [FILE]...",
    "List information about the FILEs (the current directory by default). Entries are sorted alphabetically.",
    [["-l", "use a long listing format"], ["-a", "do not ignore entries starting with ."], ["-h", "with -l, print sizes in human readable format"], ["-1", "list one entry per line"]],
    ["ls -l /home/agent", "ls -la", "ls /home/agent/*.log"]),
  cd: M("cd", "change the working directory", "cd [DIR]",
    "Change the current working directory to DIR. With no argument, return to your home directory. cd - jumps back to the previous directory.",
    [], ["cd /home/agent/ops", "cd ..", "cd -"]),
  pwd: M("pwd", "print the working directory", "pwd",
    "Print the full filename of the current working directory.",
    [], ["pwd"]),
  mkdir: M("mkdir", "make directories", "mkdir [OPTION]... DIRECTORY...",
    "Create the DIRECTORY(ies), if they do not already exist.",
    [["-p", "make parent directories as needed, no error if existing"], ["-m MODE", "set file mode (permissions) at creation, e.g. 1777"]],
    ["mkdir /home/agent/ops/logs", "mkdir -p /home/agent/ops/logs/2026/oct", "mkdir -m 1777 /home/agent/vault/shared"]),
  touch: M("touch", "create empty files / update timestamps", "touch FILE...",
    "Create each FILE if it does not exist, otherwise update its modification time to now.",
    [], ["touch /home/agent/ops/status.txt"]),
  rm: M("rm", "remove files or directories", "rm [OPTION]... FILE...",
    "Remove (unlink) the FILE(s). Directories require -r.",
    [["-r, -R", "remove directories and their contents recursively"], ["-f", "ignore nonexistent files, never prompt"]],
    ["rm /home/agent/ops/junk.tmp", "rm -r /home/agent/ops/trash", "rm -rf /home/agent/ops/trash"]),
  cp: M("cp", "copy files and directories", "cp [OPTION]... SOURCE DEST",
    "Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.",
    [["-r, -R", "copy directories recursively"]],
    ["cp report.txt report.bak", "cp -r /home/agent/ops/casefiles /home/agent/ops/casefiles_backup"]),
  mv: M("mv", "move (rename) files", "mv [OPTION]... SOURCE DEST",
    "Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY. Moving onto a new name is how renaming works.",
    [], ["mv report.bak report.final", "mv a.tmp b.tmp /home/agent/ops/quarantine/"]),
  cat: M("cat", "concatenate and print files", "cat [OPTION]... [FILE]...",
    "Concatenate FILE(s) to standard output. With no FILE, or when FILE is -, read standard input.",
    [["-n", "number all output lines"]],
    ["cat /home/agent/intel/memo.txt", "cat -n /home/agent/intel/access.log"]),
  head: M("head", "output the first part of files", "head [OPTION]... [FILE]...",
    "Print the first 10 lines of each FILE to standard output.",
    [["-n N", "print the first N lines instead of 10"], ["-c N", "print the first N bytes"]],
    ["head -n 3 /home/agent/intel/access.log", "head -c 60 /home/agent/intel/payload.bin"]),
  tail: M("tail", "output the last part of files", "tail [OPTION]... [FILE]...",
    "Print the last 10 lines of each FILE to standard output.",
    [["-n N", "print the last N lines instead of 10"], ["-c N", "print the last N bytes"]],
    ["tail -n 5 /home/agent/intel/access.log"]),
  grep: M("grep", "print lines matching a pattern", "grep [OPTION]... PATTERNS [FILE]...",
    "Search for PATTERNS in each FILE. A line is selected if the pattern matches anywhere in it.",
    [["-i", "ignore case distinctions"], ["-v", "invert the match: select non-matching lines"], ["-n", "prefix each line with its line number"], ["-r", "read all files under each directory, recursively"], ["-c", "print only a count of matching lines per FILE"], ["-o", "print only the matched parts of a matching line"], ["-E", "interpret PATTERNS as extended regular expressions"]],
    ["grep Failed /home/agent/logs/auth.log", "grep -i failed /home/agent/logs/auth.log", "grep -r breach /home/agent/data", "grep -c Failed /home/agent/logs/auth.log"]),
  sort: M("sort", "sort lines of text files", "sort [OPTION]... [FILE]...",
    "Write sorted concatenation of all FILE(s) to standard output.",
    [["-r", "reverse the result of comparisons"], ["-n", "compare according to numeric value"], ["-u", "with -c, or output only the first of an equal run"]],
    ["sort /home/agent/logs/names.txt", "sort -n /home/agent/logs/sizes.txt", "sort -u /home/agent/logs/names.txt"]),
  uniq: M("uniq", "report or omit repeated lines", "uniq [OPTION]... [INPUT]",
    "Filter adjacent matching lines from INPUT. Input must already be sorted for this to dedupe fully.",
    [["-c", "prefix lines by the number of occurrences"], ["-d", "only print duplicate lines"], ["-u", "only print unique lines"]],
    ["uniq /home/agent/logs/names_sorted.txt", "sort names.txt | uniq -c"]),
  cut: M("cut", "remove sections from each line of files", "cut OPTION... [FILE]...",
    "Print selected parts of lines from each FILE to standard output.",
    [["-d DELIM", "use DELIM instead of TAB as the field delimiter"], ["-f LIST", "select only these fields, e.g. 1, 1-3"], ["-c LIST", "select only these characters"]],
    ["cut -d, -f1 /home/agent/logs/access.csv", "cut -d: -f1,3 /etc/passwd"]),
  awk: M("awk", "pattern scanning and processing language", "awk 'program' [FILE]...",
    "Scan each input line for patterns of the form /pattern/ { action }. $0 is the whole line, $1..$N are whitespace-separated fields, NF is the field count, NR the line number.",
    [["-F SEP", "use SEP as the field separator"]],
    ["awk '{print $5}' auth.log", "grep FAILED auth.log | awk '{print $5}'", "awk -F, '{print $1}' access.csv"]),
  sed: M("sed", "stream editor for filtering and transforming text", "sed 'script' [FILE]...",
    "Apply the script to each input line. s/a/b/ substitutes the first match, s/a/b/g all matches, /pattern/d deletes matching lines.",
    [["-i", "edit files in place"], ["-n", "suppress automatic printing; only p prints"]],
    ["sed 's/old-relay/new-relay/' config.txt", "sed '/^#/d' config.txt"]),
  tr: M("tr", "translate or delete characters", "tr [OPTION]... SET1 [SET2]",
    "Translate, squeeze, and/or delete characters from standard input, writing to standard output. Ranges like a-z are allowed in sets.",
    [["-d", "delete characters in SET1, do not translate"], ["-s", "squeeze repeated characters listed in the last set"]],
    ["tr 'a-z' 'A-Z' < mixed.txt", "cat mixed.txt | tr 'a-z' 'A-Z'"]),
  find: M("find", "search for files in a directory hierarchy", "find [PATH]... [EXPRESSION]",
    "Search PATH for entries matching EXPRESSION, which is a combination of tests like -name and actions like -delete.",
    [["-name PAT", "file name matches shell pattern PAT"], ["-type f|d", "entry is a regular file (f) or directory (d)"], ["-delete", "delete matching files"], ["-maxdepth N", "descend at most N levels"]],
    ["find /home/agent -name flag.txt", "find /home/agent/data -name '*.tmp' -delete"]),
  tar: M("tar", "archive files", "tar [OPTION]... [FILE]...",
    "Create, extract, or list an archive. The -z flag is accepted for gzip-style invocations.",
    [["-c", "create a new archive"], ["-x", "extract files from an archive"], ["-t", "list the contents of an archive"], ["-f FILE", "use archive FILE"], ["-C DIR", "change to DIR first"], ["-v", "verbosely list files processed"]],
    ["tar -cf project.tar project", "tar -czf data.tar.gz /home/agent/data", "tar -tzf data.tar.gz", "tar -xzf data.tar.gz -C /home/agent/data/restored"]),
  chmod: M("chmod", "change file mode bits", "chmod [OPTION]... MODE FILE...",
    "Change the permissions of each FILE to MODE, which can be octal (755) or symbolic (u+x, go-w, a=rw).",
    [["-R", "change files and directories recursively"]],
    ["chmod 600 key.txt", "chmod 755 scan.sh", "chmod u+x tool.sh", "chmod go-rwx key.txt", "chmod -R 700 drop"]),
  chown: M("chown", "change file owner and group", "chown [OPTION]... [OWNER][:[GROUP]] FILE...",
    "Change the owner and/or group of each FILE. Only root can change ownership, so this is usually run under sudo.",
    [["-R", "operate on files and directories recursively"]],
    ["sudo chown agent stolen.txt", "sudo chown agent:agents shared.txt"]),
  umask: M("umask", "set the file mode creation mask", "umask [MODE]",
    "With no argument, print the current mask. Otherwise set it: new files get 666 minus the mask, new directories 777 minus the mask.",
    [], ["umask", "umask 077"]),
  sudo: M("sudo", "execute a command as another user", "sudo command [ARGS]...",
    "Run command as root. On this station sudo is passwordless: no password prompt, the command just runs with full privileges.",
    [], ["sudo whoami", "sudo cat /home/agent/vault/rootnote.txt", "sudo chown agent stolen.txt"]),
  ps: M("ps", "report a snapshot of the current processes", "ps [options]",
    "Show information about active processes.",
    [["aux", "show every process on the system"], ["-ef", "full-format listing of every process"]],
    ["ps", "ps aux", "ps -ef"]),
  kill: M("kill", "send a signal to a process", "kill [-SIGNAL] PID...",
    "Send a signal to each PID or job (%1). The default signal is TERM; -9 sends KILL, which cannot be ignored.",
    [], ["kill %1", "kill 101", "kill -9 101"]),
  jobs: M("jobs", "list active background jobs", "jobs [-l]",
    "List the shell's background jobs. jobs -l also shows process IDs.",
    [["-l", "list process IDs in addition to the normal information"]],
    ["sleep 60 &", "jobs", "jobs -l"]),
  ping: M("ping", "send ICMP ECHO_REQUEST to network hosts", "ping [-c COUNT] HOST",
    "Send echo requests to HOST and report the replies. The station gateway is 10.0.0.1 and the relay is 10.0.0.2.",
    [["-c COUNT", "stop after sending COUNT packets"]],
    ["ping -c 3 10.0.0.1"]),
  curl: M("curl", "transfer data from a URL", "curl [OPTION]... URL",
    "Fetch a URL and print the response body. The relay serves status, files, and firmware at http://10.0.0.1/.",
    [["-I", "fetch the headers only"], ["-s", "silent mode: no progress meter"], ["-o FILE", "write output to FILE instead of stdout"]],
    ["curl http://10.0.0.1/status", "curl -I http://10.0.0.1/status"]),
  wget: M("wget", "download files from the web", "wget [OPTION]... URL",
    "Download URL and save it to a local file.",
    [["-O FILE", "save the download as FILE instead of the remote name"], ["-q", "quiet: no output"]],
    ["wget -O /home/agent/patch.bin http://10.0.0.1/firmware/patch.bin"]),
  ssh: M("ssh", "secure shell to a remote host", "ssh [user@]host [command]",
    "Connect to a remote host. With a command appended, run it remotely and print the output. The relay is relay@10.0.0.2.",
    [], ["ssh relay@10.0.0.2", "ssh relay@10.0.0.2 uptime"]),
  which: M("which", "locate a command", "which COMMAND...",
    "Print the full path of the COMMAND that would be executed. Shell builtins and unknown names print nothing.",
    [], ["which ls", "which cd"]),
  type: M("type", "describe a command", "type COMMAND...",
    "Describe how COMMAND would be interpreted: a shell builtin, an executable path, or not found.",
    [], ["type cd", "type ls"]),
  df: M("df", "report file system disk space usage", "df [OPTION]... [FILE]...",
    "Show the amount of available disk space on file systems.",
    [["-h", "print sizes in human readable format"], ["-i", "list inode information instead of block usage"]],
    ["df -h", "df -i"]),
  du: M("du", "estimate file space usage", "du [OPTION]... [FILE]...",
    "Summarize disk usage of each FILE, recursively for directories.",
    [["-s", "display only a total for each argument"], ["-h", "print sizes in human readable format"]],
    ["du -sh /home/agent/logs"]),
  free: M("free", "display amount of free and used memory", "free [OPTION]",
    "Show total, used, free, shared, and cached memory.",
    [["-h", "show all output fields in human readable format"]],
    ["free -h"]),
  uname: M("uname", "print system information", "uname [OPTION]...",
    "Print machine and operating system information.",
    [["-a", "print all information"], ["-n", "print the network node hostname"], ["-r", "print the kernel release"]],
    ["uname -a", "uname -n"]),
  echo: M("echo", "display a line of text", "echo [OPTION]... [STRING]...",
    "Echo the STRING(s) to standard output.",
    [["-n", "do not output the trailing newline"], ["-e", "enable interpretation of backslash escapes"]],
    ["echo hello", "echo 'core temp stable' >> note.txt", "echo $CALLSIGN"]),
  wc: M("wc", "print newline, word, and byte counts", "wc [OPTION]... [FILE]...",
    "Print newline, word, and byte counts for each FILE.",
    [["-l", "print the newline counts"], ["-w", "print the word counts"], ["-c", "print the byte counts"]],
    ["wc -l /home/agent/intel/access.log", "cat words.txt | wc -l"]),
  diff: M("diff", "compare files line by line", "diff FILE1 FILE2",
    "Compare FILE1 to FILE2 line by line. Prints nothing when the files match; otherwise prints the differing hunks.",
    [], ["diff config.a config.b"]),
  file: M("file", "determine file type", "file FILE...",
    "Test each FILE and report its type: text, data, directory, archive, and more.",
    [], ["file /home/agent/intel/payload.bin", "file /home/agent/intel/*"]),
  history: M("history", "show command history", "history [N]",
    "Display the command history list with line numbers, oldest first. history N shows only the last N commands.",
    [], ["history", "history | grep mkdir"]),
  env: M("env", "print the environment", "env",
    "Print all exported environment variables, one per line.",
    [], ["env", "env | grep HOME"]),
  export: M("export", "set environment variables", "export NAME[=VALUE]...",
    "Mark NAME for export to child processes, optionally assigning VALUE. With no arguments, list all exported variables.",
    [], ["export CALLSIGN=nexus", "CALLSIGN=nexus", "export"]),
  whoami: M("whoami", "print effective user name", "whoami",
    "Print the username of the current effective user: agent normally, root under sudo.",
    [], ["whoami", "sudo whoami"]),
  date: M("date", "print the system date and time", "date [+FORMAT]",
    "Display the current time. FORMAT controls the output, e.g. +%Y-%m-%d.",
    [], ["date", "date +%Y"]),
};

function cmdMan(io: CmdIO): CmdResult {
  if (io.args.length === 0) return fail("What manual page do you want?\n", 1);
  const name = io.args[0];
  const page = MAN_PAGES[name];
  if (!page) return fail(`No manual entry for ${name}\n`, 16);
  return ok(page);
}
