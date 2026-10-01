"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  getStore,
  initGame,
  type GameEvent,
  type GameEventHandler,
  type GameState,
  type Unsubscribe,
} from "./store";
import type { Shell } from "./engine-contract";
import { createShell } from "@/lib/engine";

let bootstrapped = false;
/** Bootstrap the singleton store exactly once with the real engine shell. */
function ensureInit(): void {
  if (!bootstrapped) {
    bootstrapped = true;
    initGame(() => createShell());
  }
}

export type { GameEvent, GameEventHandler, GameState, Shell, Unsubscribe };

/**
 * Public actions surface for the NEXUS: Linux Quest UI.
 *
 * This is the real implementation replacing the UI-shell stub. It keeps the
 * stub's shape (selectZone, afterCommand, useHint accepting a challenge id)
 * so the existing UI keeps working, and adds the full systems API:
 * runCommand, useHint, startBoss, tickBoss, submitCtfFlag, setZone,
 * resetAll, onEvent, backed by a module-level singleton GameStore.
 *
 * App bootstrap must call `initGame(() => createShell())` once before this
 * hook is used, importing createShell from "@/lib/engine".
 */
export interface GameActions {
  shell: Shell;
  state: GameState;
  /** Execute a command and run the challenge verifier. Returns shell output. */
  runCommand(input: string): string;
  /** Reveal the active challenge's hint (-5 XP, never below zero). Returns the hint text. */
  useHint(challengeId?: string): string;
  /** Start the active boss drill timer. Returns the timer length in seconds. */
  startBoss(): number;
  /** Seconds left on the boss timer, 0 when no drill is running. */
  tickBoss(): number;
  /** Submit a CTF flag. Returns true on capture. */
  submitCtfFlag(flag: string): boolean;
  /** Travel to an unlocked zone. Returns false when locked. */
  setZone(zone: number): boolean;
  /** Wipe all progress and start over. */
  resetAll(): void;
  /** Run the challenge verifier against current shell state (no execute). */
  afterCommand(): void;
  onEvent(cb: GameEventHandler): Unsubscribe;
  /** UI-shell extension: switch the working zone (unlocked zones only). */
  selectZone(zone: number): void;
}

export function useGame(): GameActions {
  ensureInit();
  const store = getStore();
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);

  const runCommand = useCallback((input: string) => store.runCommand(input), [store]);
  const useHint = useCallback(
    (_challengeId?: string) => store.useHint(_challengeId),
    [store]
  );
  const startBoss = useCallback(() => store.startBoss(), [store]);
  const tickBoss = useCallback(() => store.tickBoss(), [store]);
  const submitCtfFlag = useCallback((flag: string) => store.submitCtfFlag(flag), [store]);
  const setZone = useCallback((zone: number) => store.setZone(zone), [store]);
  const resetAll = useCallback(() => store.resetAll(), [store]);
  const afterCommand = useCallback(() => store.afterCommand(), [store]);
  const onEvent = useCallback((cb: GameEventHandler) => store.onEvent(cb), [store]);
  const selectZone = useCallback((zone: number) => {
    store.setZone(zone);
  }, [store]);

  return {
    shell: store.shell,
    state,
    runCommand,
    useHint,
    startBoss,
    tickBoss,
    submitCtfFlag,
    setZone,
    resetAll,
    afterCommand,
    onEvent,
    selectZone,
  };
}
