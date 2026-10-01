/**
 * NEXUS: Linux Quest - terminal engine public types.
 *
 * This is the contract other workers code against. The Shell interface below
 * is frozen: do not rename methods or change signatures.
 */

export interface EngineSetup {
  files?: Record<string, string>;
  dirs?: string[];
  perms?: Record<string, string>;
  /**
   * Engine extension (optional): explicit ownership for setup entries,
   * e.g. { "/home/agent/vault/rootnote.txt": "root" } or "root:root".
   * Entries without an owner default to "agent:agents".
   */
  owners?: Record<string, string>;
}

export interface Shell {
  execute(input: string): string;
  getHistory(): string[];
  getLastOutput(): string;
  getExitCode(): number;
  fileExists(path: string): boolean;
  readFile(path: string): string | null;
  getMode(path: string): string | null;
  getOwner(path: string): string | null;
  applySetup(setup: EngineSetup): void;
  reset(): void;
  completeTab(line: string): string[];
}

export declare function createShell(): Shell;
