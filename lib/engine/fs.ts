/**
 * NEXUS: Linux Quest - virtual filesystem.
 *
 * A small in-memory POSIX-style filesystem backing the terminal engine.
 * Everything is synchronous and throws FsError (never raw exceptions) on
 * failed operations so commands can render bash-like error messages.
 */

import type { EngineSetup } from "./types";

export type NodeType = "dir" | "file";

export interface FsNode {
  type: NodeType;
  content: string; // files only
  mode: number; // e.g. 0o755, 0o1777
  owner: string;
  group: string;
  mtime: Date;
  children: Map<string, FsNode>; // dirs only
}

export interface UserCtx {
  name: string;
  uid: number;
  groups: string[];
}

export class FsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FsError";
  }
}

export interface MkdirOptions {
  mode?: number;
  owner?: string;
  group?: string;
  umask?: number;
}

export interface WriteOptions {
  mode?: number;
  owner?: string;
  group?: string;
  umask?: number;
}

const DEFAULT_UMASK = 0o022;

function splitOwner(spec: string | undefined, fallback: { name: string; group: string }) {
  if (!spec) return fallback;
  const [name, group] = spec.split(":");
  return { name: name || fallback.name, group: group || name || fallback.group };
}

export class VirtualFS {
  root: FsNode;

  constructor() {
    this.root = this.newNode("dir", 0o755, "root", "root");
    // Base layout every shell starts with.
    this.mkdirp("/home/agent", { owner: "agent", group: "agents", umask: DEFAULT_UMASK });
    this.mkdirp("/tmp", { mode: 0o1777, owner: "root", group: "root", umask: 0 });
    // /dev/null: writes are discarded, reads are empty (special-cased below).
    this.mkdirp("/dev", { owner: "root", group: "root", umask: 0 });
    const devNull = this.newNode("file", 0o666, "root", "root");
    devNull.content = "";
    this.getNode("/dev")!.children.set("null", devNull);
  }

  private newNode(type: NodeType, mode: number, owner: string, group: string): FsNode {
    return { type, content: "", mode, owner, group, mtime: new Date(), children: new Map() };
  }

  /** Resolve a user-supplied path to an absolute, normalized path. */
  resolvePath(p: string, cwd: string, home = "/home/agent"): string {
    let path = p;
    if (path === "~" || path.startsWith("~/")) {
      path = home + path.slice(1);
    }
    if (!path.startsWith("/")) {
      path = (cwd.endsWith("/") ? cwd : cwd + "/") + path;
    }
    const out: string[] = [];
    for (const part of path.split("/")) {
      if (part === "" || part === ".") continue;
      if (part === "..") {
        if (out.length > 0) out.pop();
        continue;
      }
      out.push(part);
    }
    return "/" + out.join("/");
  }

  dirname(abs: string): string {
    if (abs === "/") return "/";
    const i = abs.lastIndexOf("/");
    return i === 0 ? "/" : abs.slice(0, i);
  }

  basename(abs: string): string {
    if (abs === "/") return "/";
    return abs.slice(abs.lastIndexOf("/") + 1);
  }

  getNode(abs: string): FsNode | null {
    if (abs === "/") return this.root;
    let node: FsNode = this.root;
    for (const part of abs.split("/").filter(Boolean)) {
      const next = node.children.get(part);
      if (!next) return null;
      node = next;
    }
    return node;
  }

  exists(abs: string): boolean {
    return this.getNode(abs) !== null;
  }

  isDir(abs: string): boolean {
    return this.getNode(abs)?.type === "dir";
  }

  isFile(abs: string): boolean {
    return this.getNode(abs)?.type === "file";
  }

  readdir(abs: string): string[] {
    const node = this.getNode(abs);
    if (!node || node.type !== "dir") throw new FsError("Not a directory");
    return Array.from(node.children.keys()).sort();
  }

  // ---------- permission checks ----------

  private bitAllowed(node: FsNode, user: UserCtx, ownerBit: number, groupBit: number, otherBit: number): boolean {
    if (user.uid === 0) return true; // root bypasses discretionary checks
    const m = node.mode;
    if (node.owner === user.name) return (m & ownerBit) !== 0;
    if (user.groups.includes(node.group)) return (m & groupBit) !== 0;
    return (m & otherBit) !== 0;
  }

  canRead(node: FsNode, user: UserCtx): boolean {
    return this.bitAllowed(node, user, 0o400, 0o040, 0o004);
  }

  canWrite(node: FsNode, user: UserCtx): boolean {
    return this.bitAllowed(node, user, 0o200, 0o020, 0o002);
  }

  canExec(node: FsNode, user: UserCtx): boolean {
    return this.bitAllowed(node, user, 0o100, 0o010, 0o001);
  }

  /** Every directory on the way to abs (excluding abs itself) needs +x. */
  canTraverse(abs: string, user: UserCtx): boolean {
    if (user.uid === 0) return true;
    const parts = abs.split("/").filter(Boolean);
    let node = this.root;
    for (let i = 0; i < parts.length - 1; i++) {
      const next = node.children.get(parts[i]);
      if (!next || next.type !== "dir") return false;
      if (!this.canExec(next, user)) return false;
      node = next;
    }
    return true;
  }

  // ---------- mutation ops ----------

  mkdirp(abs: string, opts: MkdirOptions = {}): void {
    const umask = opts.umask ?? DEFAULT_UMASK;
    const parts = abs.split("/").filter(Boolean);
    let node = this.root;
    let cur = "";
    for (let i = 0; i < parts.length; i++) {
      cur += "/" + parts[i];
      let next = node.children.get(parts[i]);
      if (!next) {
        const last = i === parts.length - 1;
        const mode = last && opts.mode !== undefined ? opts.mode : 0o777 & ~umask;
        next = this.newNode("dir", mode, opts.owner ?? "agent", opts.group ?? "agents");
        node.children.set(parts[i], next);
      } else if (next.type !== "dir") {
        throw new FsError(`cannot create directory '${cur}': File exists`);
      }
      node = next;
    }
  }

  writeFile(abs: string, content: string, opts: WriteOptions = {}): void {
    if (abs === "/dev/null") return; // the void: writes vanish, always succeed
    const parent = this.getNode(this.dirname(abs));
    if (!parent || parent.type !== "dir") throw new FsError("No such file or directory");
    const name = this.basename(abs);
    const existing = parent.children.get(name);
    if (existing) {
      if (existing.type !== "file") throw new FsError("Is a directory");
      existing.content = content;
      existing.mtime = new Date();
      return;
    }
    const umask = opts.umask ?? DEFAULT_UMASK;
    const node = this.newNode("file", opts.mode ?? (0o666 & ~umask), opts.owner ?? "agent", opts.group ?? "agents");
    node.content = content;
    parent.children.set(name, node);
  }

  readFile(abs: string, user: UserCtx): string {
    if (abs === "/dev/null") return "";
    if (!this.canTraverse(abs, user)) throw new FsError("Permission denied");
    const node = this.getNode(abs);
    if (!node) throw new FsError("No such file or directory");
    if (node.type !== "file") throw new FsError("Is a directory");
    if (!this.canRead(node, user)) throw new FsError("Permission denied");
    return node.content;
  }

  remove(abs: string, recursive: boolean, user: UserCtx): void {
    if (abs === "/") throw new FsError("cannot remove '/': Permission denied");
    const node = this.getNode(abs);
    if (!node) throw new FsError("No such file or directory");
    const parent = this.getNode(this.dirname(abs));
    if (!parent || !this.canWrite(parent, user) || !this.canExec(parent, user)) {
      throw new FsError("Permission denied");
    }
    if (node.type === "dir" && !recursive) throw new FsError("Is a directory");
    parent.children.delete(this.basename(abs));
  }

  copy(srcAbs: string, dstAbs: string, recursive: boolean, user: UserCtx, umask: number): void {
    const src = this.getNode(srcAbs);
    if (!src) throw new FsError(`cannot stat '${srcAbs}': No such file or directory`);
    if (src.type === "dir" && !recursive) {
      throw new FsError(`-r not specified; omitting directory '${srcAbs}'`);
    }
    if (!this.canTraverse(srcAbs, user)) throw new FsError("Permission denied");
    let target = dstAbs;
    const dstNode = this.getNode(dstAbs);
    if (dstNode && dstNode.type === "dir") {
      target = dstAbs.replace(/\/$/, "") + "/" + this.basename(srcAbs);
    }
    const targetParent = this.getNode(this.dirname(target));
    if (!targetParent || targetParent.type !== "dir") throw new FsError("No such file or directory");
    if (!this.canWrite(targetParent, user) || !this.canExec(targetParent, user)) {
      throw new FsError("Permission denied");
    }
    const clone = (n: FsNode): FsNode => {
      const c = this.newNode(n.type, n.type === "file" ? n.mode & ~umask : n.mode, user.name, user.groups[0] ?? n.group);
      c.content = n.content;
      c.mtime = new Date(n.mtime);
      for (const [k, v] of n.children) c.children.set(k, clone(v));
      return c;
    };
    targetParent.children.set(this.basename(target), clone(src));
  }

  move(srcAbs: string, dstAbs: string, user: UserCtx): void {
    const src = this.getNode(srcAbs);
    if (!src) throw new FsError(`cannot stat '${srcAbs}': No such file or directory`);
    let target = dstAbs;
    const dstNode = this.getNode(dstAbs);
    if (dstNode && dstNode.type === "dir") {
      target = dstAbs.replace(/\/$/, "") + "/" + this.basename(srcAbs);
    }
    const srcParent = this.getNode(this.dirname(srcAbs));
    const dstParent = this.getNode(this.dirname(target));
    if (!srcParent || !dstParent || dstParent.type !== "dir") throw new FsError("No such file or directory");
    if (!this.canWrite(srcParent, user) || !this.canExec(srcParent, user)) throw new FsError("Permission denied");
    if (!this.canWrite(dstParent, user) || !this.canExec(dstParent, user)) throw new FsError("Permission denied");
    // Moving a directory into itself (or its own subtree) is an error.
    if (src.type === "dir" && (target === srcAbs || target.startsWith(srcAbs + "/"))) {
      throw new FsError(`cannot move '${srcAbs}' to a subdirectory of itself, '${target}'`);
    }
    dstParent.children.set(this.basename(target), src);
    srcParent.children.delete(this.basename(srcAbs));
  }

  chmod(abs: string, mode: number, recursive: boolean): void {
    const node = this.getNode(abs);
    if (!node) throw new FsError(`cannot access '${abs}': No such file or directory`);
    const apply = (n: FsNode) => {
      n.mode = mode;
      if (recursive && n.type === "dir") for (const c of n.children.values()) apply(c);
    };
    apply(node);
  }

  chown(abs: string, owner: string | null, group: string | null, recursive: boolean): void {
    const node = this.getNode(abs);
    if (!node) throw new FsError(`cannot access '${abs}': No such file or directory`);
    const apply = (n: FsNode) => {
      if (owner) n.owner = owner;
      if (group) n.group = group;
      if (recursive && n.type === "dir") for (const c of n.children.values()) apply(c);
    };
    apply(node);
  }

  /** All paths under abs (depth-first), including abs itself. */
  walk(abs: string): string[] {
    const out: string[] = [];
    const node = this.getNode(abs);
    if (!node) return out;
    const visit = (n: FsNode, p: string) => {
      out.push(p);
      if (n.type === "dir") {
        for (const [k, v] of [...n.children.entries()].sort()) visit(v, p === "/" ? `/${k}` : `${p}/${k}`);
      }
    };
    visit(node, abs);
    return out;
  }

  byteSize(content: string): number {
    return new TextEncoder().encode(content).length;
  }

  // ---------- challenge setup ----------

  applySetup(setup: EngineSetup): void {
    const fallback = { name: "agent", group: "agents" };
    for (const d of setup.dirs ?? []) {
      const abs = this.resolvePath(d, "/", "/home/agent");
      const o = splitOwner(setup.owners?.[d], fallback);
      this.mkdirp(abs, { owner: o.name, group: o.group, umask: DEFAULT_UMASK });
    }
    for (const [p, content] of Object.entries(setup.files ?? {})) {
      const abs = this.resolvePath(p, "/", "/home/agent");
      const o = splitOwner(setup.owners?.[p], fallback);
      this.mkdirp(this.dirname(abs), { owner: o.name, group: o.group, umask: DEFAULT_UMASK });
      this.writeFile(abs, content, { owner: o.name, group: o.group, umask: 0 });
    }
    for (const [p, modeStr] of Object.entries(setup.perms ?? {})) {
      const abs = this.resolvePath(p, "/", "/home/agent");
      const node = this.getNode(abs);
      if (node) node.mode = parseInt(modeStr, 8);
    }
  }

  // ---------- glob ----------

  private globToRegExp(pattern: string): RegExp {
    let re = "^";
    for (let i = 0; i < pattern.length; i++) {
      const c = pattern[i];
      if (c === "*") re += ".*";
      else if (c === "?") re += ".";
      else if (c === "[") {
        const j = pattern.indexOf("]", i + 1);
        if (j === -1) re += "\\[";
        else {
          re += pattern.slice(i, j + 1);
          i = j;
        }
      } else if ("\\.+^${}()|".includes(c)) re += "\\" + c;
      else re += c;
    }
    return new RegExp(re + "$");
  }

  /**
   * Expand a glob pattern to matching absolute paths. Returns [pattern]
   * unchanged when nothing matches (bash default, nullglob off).
   */
  glob(pattern: string, cwd: string, home = "/home/agent"): string[] {
    if (!/[*?[]/.test(pattern)) return [pattern];
    const abs = this.resolvePath(pattern, cwd, home);
    const slash = abs.lastIndexOf("/");
    const dirPart = slash <= 0 ? "/" : abs.slice(0, slash);
    const base = abs.slice(slash + 1);
    const dirNode = this.getNode(dirPart);
    if (!dirNode || dirNode.type !== "dir") return [pattern];
    const rx = this.globToRegExp(base);
    // bash prints matches the way the pattern was typed: relative patterns
    // stay relative, absolute patterns stay absolute.
    const relative = !pattern.startsWith("/") && !pattern.startsWith("~");
    const pslash = pattern.lastIndexOf("/");
    const typedDir = pslash === -1 ? "" : pattern.slice(0, pslash + 1);
    const matches: string[] = [];
    for (const name of dirNode.children.keys()) {
      if (name.startsWith(".") && !base.startsWith(".")) continue;
      if (rx.test(name)) matches.push(relative ? typedDir + name : dirPart === "/" ? `/${name}` : `${dirPart}/${name}`);
    }
    matches.sort();
    return matches.length > 0 ? matches : [pattern];
  }
}
