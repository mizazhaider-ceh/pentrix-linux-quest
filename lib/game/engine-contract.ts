/**
 * Engine contract for NEXUS: Linux Quest.
 *
 * The engine worker delivers the real implementation in "@/lib/engine".
 * The canonical Shell/EngineSetup types live in "@/lib/engine/types"
 * (frozen by the engine worker); this module re-exports them so game
 * systems code against the real contract, plus a factory registry used to
 * inject createShell at app startup (and to inject mocks in tests).
 *
 * App bootstrap must call `initGame(() => createShell())` once, importing
 * createShell from "@/lib/engine". See lib/game/index.ts.
 */

export type { EngineSetup, Shell } from "@/lib/engine/types";

/** Factory producing a fresh shell. Injected at startup, mocked in tests. */
import type { Shell } from "@/lib/engine/types";
export type ShellFactory = () => Shell;

let factory: ShellFactory | null = null;

export function setShellFactory(f: ShellFactory): void {
  factory = f;
}

export function getShellFactory(): ShellFactory {
  if (!factory) {
    throw new Error(
      "No shell factory registered. Call initGame(() => createShell()) once at " +
        "startup, importing createShell from @/lib/engine."
    );
  }
  return factory;
}
