import { CHALLENGES } from "../../data/challenges";
import { ACHIEVEMENTS, type Achievement } from "../../data/achievements";
import { CTF_CHALLENGES } from "./ctf";

/**
 * The 12 achievement definitions live in data/achievements.ts (flavor
 * worker owns the copy); this module re-exports them and adds the
 * unlock-condition evaluation used by the game store.
 */
export { ACHIEVEMENTS, type Achievement };

/** Zone number for each zone-clear achievement id. */
export const ZONE_ACHIEVEMENT_ZONES: Record<string, number> = {
  cartographer: 1,
  archivist: 2,
  "word-surgeon": 3,
  gatekeeper: 4,
  exterminator: 5,
  "signal-runner": 6,
  "all-seeing": 7,
  "reactor-chief": 8,
};

/** Minimal store state needed to evaluate achievement conditions. */
export interface AchievementState {
  completed: Record<string, boolean>;
  hintsUsed: Record<string, boolean>;
  achievements: string[];
  /** Boss challenge id -> true when beaten with at least half the timer left. */
  bossBeatClock: Record<string, boolean>;
}

function zoneChallengeIds(zone: number): string[] {
  return CHALLENGES.filter((c) => c.zone === zone).map((c) => c.id);
}

function zoneAchievementId(zone: number): string | undefined {
  for (const [id, z] of Object.entries(ZONE_ACHIEVEMENT_ZONES)) {
    if (z === zone) return id;
  }
  return undefined;
}

/**
 * Evaluate all achievement conditions against the given state.
 * Returns the ids of newly unlocked achievements (not already granted).
 * Pure: it never mutates the state.
 */
export function checkAchievements(state: AchievementState): string[] {
  const newly: string[] = [];
  const has = (id: string): boolean =>
    state.achievements.includes(id) || newly.includes(id);
  const grant = (id: string): void => {
    if (!has(id)) newly.push(id);
  };

  if (Object.keys(state.completed).length > 0) grant("first-boot");

  for (let zone = 1; zone <= 8; zone++) {
    const ids = zoneChallengeIds(zone);
    if (ids.length === 0) continue;
    const cleared = ids.every((id) => state.completed[id]);
    if (cleared) {
      const zoneId = zoneAchievementId(zone);
      if (zoneId) grant(zoneId);
      const noHints = ids.every((id) => !state.hintsUsed[id]);
      if (noHints) grant("clean-sweep");
    }
  }

  if (Object.values(state.bossBeatClock).some((v) => v)) grant("beat-the-clock");

  if (CTF_CHALLENGES.every((c) => state.completed[c.id])) grant("nexus-graduate");

  return newly;
}
