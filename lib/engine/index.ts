/**
 * NEXUS: Linux Quest - terminal engine.
 *
 * API for the other workers (game hook, UI):
 *
 *   import { createShell, type Shell } from "@/lib/engine";
 *
 *   const shell = createShell();          // fresh virtual machine
 *   shell.execute("ls -l /home/agent");  // run a command line, returns output text
 *   shell.getHistory();                  // every submitted line, oldest first
 *   shell.getLastOutput();               // output of the last execute()
 *   shell.getExitCode();                 // exit code of the last execute()
 *   shell.fileExists("/home/agent/x");   // path checks, resolved against cwd
 *   shell.readFile("/home/agent/x");     // file content or null
 *   shell.getMode("/home/agent/x");      // "755" (or "1777" with special bits) or null
 *   shell.getOwner("/home/agent/x");     // owner name or null
 *   shell.applySetup({ files, dirs, perms, owners });
 *                                        // seed the FS for a challenge. Files/dirs
 *                                        // default to agent:agents; pass owners like
 *                                        // { "/home/agent/vault/rootnote.txt": "root" }
 *                                        // for root-owned story files.
 *   shell.reset();                       // wipe back to a fresh boot
 *   shell.completeTab("ls /home/ag");    // completion candidates for the line
 *
 * Notes:
 * - The Shell object is spread-safe: TerminalGame wraps it with
 *   `{ ...shell, execute }` and every method keeps working.
 * - `clear` returns an ANSI clear-screen sequence; the xterm component
 *   writes output raw so the terminal interprets it.
 * - Network commands (ping/curl/wget/ssh/scp) are simulated against the
 *   station peers 10.0.0.1 (gateway) and relay@10.0.0.2. No real I/O.
 * - Foreground `sleep` returns instantly; `sleep N &` creates a real
 *   background job visible in jobs/ps and killable via kill/pkill.
 */

export type { EngineSetup, Shell } from "./types";
export { createShell } from "./shell";
export { VirtualFS, FsError } from "./fs";
export type { FsNode, NodeType, UserCtx } from "./fs";
export type { Job } from "./shell";
export type { CmdIO, CmdResult, CommandFn } from "./commands";
export { COMMANDS, COMMAND_COUNT, MAN_PAGES, modeToString, formatMode } from "./commands";
