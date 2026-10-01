/**
 * NEXUS: Linux Quest - game systems (challenge/XP/achievement state).
 *
 * API OVERVIEW
 * ------------
 * Bootstrap (once, client-side, before useGame is used):
 *
 *   import { initGame } from "@/lib/game";
 *   import { createShell } from "@/lib/engine";
 *   initGame(() => createShell());
 *
 * React:
 *
 *   import { useGame } from "@/lib/game";
 *   const { shell, state, runCommand, useHint, startBoss, tickBoss,
 *           submitCtfFlag, setZone, selectZone, resetAll, afterCommand,
 *           onEvent } = useGame();
 *
 * Headless (tests, scripts):
 *
 *   import { initGame, resetGameInstance } from "@/lib/game";
 *   const store = initGame(() => mockShell);
 *   store.runCommand("pwd");
 *
 * PROGRESSION
 * -----------
 * - Zones 1-8 unlock in order. Zone n+1 unlocks at 10/13 standard challenges
 *   complete in zone n; a zone's boss drill unlocks at 13/13.
 * - After a boss falls, the next zone opens automatically. After the 8th
 *   boss, Operation Blackout (zone 9, the 5-flag graduation CTF) unlocks.
 * - Within a zone, challenges run in order and filesystem state persists
 *   between them. Each challenge's `setup` is applied when it becomes
 *   active.
 *
 * XP / LEVELS
 * -----------
 * Easy 10, Medium 20, Hard 30, Boss 50, CTF flag 60 (300 total for all 5).
 * Hints cost 5 XP, never below zero. Levels: Rookie 0, Operator 200,
 * Specialist 500, Veteran 900, Ghost 1400, Nexus Legend 2000.
 *
 * BOSS TIMER
 * ----------
 * Parsed from the boss task text via /(\d{2,3})\s*s/ (fallback 150).
 * Beating the timer is not required to pass; on timeout the drill setup
 * resets, a "boss-timeout" event fires, and the player retries with no
 * penalty. Finishing with at least half the timer left earns Beat the Clock.
 *
 * EVENTS (onEvent)
 * ----------------
 * xp, levelup, achievement, challenge-complete, zone-unlock, boss-start,
 * boss-timeout, ctf-flag, graduated. Every event carries kind/title/sub
 * for the UI toast layer.
 *
 * PERSISTENCE
 * -----------
 * Progress saves to localStorage key "nexus-linux-quest-v1". Loading
 * rebuilds the world by replaying the setups of completed challenges in
 * order, then the active challenge's setup.
 */

export { evaluateRule, checkChallenge } from "./verifier";
export {
  GameStore,
  initGame,
  getStore,
  resetGameInstance,
  levelFor,
  parseBossSeconds,
  LEVELS,
  SAVE_KEY,
  HINT_COST,
  CTF_ZONE,
  STANDARD_PER_ZONE,
  ZONE_UNLOCK_THRESHOLD,
  type GameEvent,
  type GameEventHandler,
  type Unsubscribe,
  type GameState,
  type PersistedState,
  type BossState,
  type BossRuntime,
  type ActiveKind,
  type ActiveChallenge,
  type LevelDef,
} from "./store";
export { ACHIEVEMENTS, ZONE_ACHIEVEMENT_ZONES, checkAchievements, type Achievement, type AchievementState } from "./achievements";
export { CTF_CHALLENGES, CTF_TOTAL_XP, type CtfChallenge } from "./ctf";
export { useGame, type GameActions } from "./useGame";
export {
  getShellFactory,
  setShellFactory,
  type EngineSetup,
  type Shell,
  type ShellFactory,
} from "./engine-contract";
