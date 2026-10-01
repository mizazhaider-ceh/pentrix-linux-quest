import { CHALLENGES } from "../../data/challenges";
import { ACHIEVEMENTS, type Achievement } from "../../data/achievements";
import { CTF_CHALLENGES } from "./ctf";

/**
 * The 27 achievement definitions live in data/achievements.ts (flavor
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

/** Total lessons in the game, for the valedictorian achievement. */
export const TOTAL_LESSONS = 61;

/**
 * XP for the first rank promotion (Operator). Mirrors the second entry of
 * LEVELS in store.ts; kept here as a literal to avoid a module cycle.
 */
export const FIRST_PROMOTION_XP = 200;

/** Minimal store state needed to evaluate achievement conditions. */
export interface AchievementState {
  completed: Record<string, boolean>;
  hintsUsed: Record<string, boolean>;
  achievements: string[];
  /** Boss challenge id -> true when beaten with at least half the timer left. */
  bossBeatClock: Record<string, boolean>;
  // ---- v2 progression inputs (all optional, all backwards compatible) ----
  /** Lesson id -> true when the lesson has been viewed. */
  lessonsViewed?: Record<string, boolean>;
  /**
   * Lesson id -> chapter id. Needed to evaluate chapter-scholar
   * (all lessons viewed in a chapter). Omit it and the achievement
   * simply stays locked.
   */
  lessonChapters?: Record<string, number>;
  /** Best solve streak reached, for on-fire / unstoppable / relentless. */
  streakBest?: number;
  /** Number of commands at mastered level, for second-nature / muscle-memory / autopilot. */
  masteredCount?: number;
  /** True once the player has run the man command. */
  manUsed?: boolean;
  /** Number of quizzes aced with a perfect 4/4. */
  quizAces?: number;
  /** Boss challenge ids cleared with zero hints used in their zone. */
  bossNoHints?: string[];
  /** Current XP, for the promoted achievement. */
  xp?: number;
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

  // ---- v1 checks (unchanged) ----

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

  // ---- v2 progression checks ----

  const lessonsViewed = state.lessonsViewed ?? {};
  const viewedCount = Object.values(lessonsViewed).filter(Boolean).length;
  if (viewedCount >= 1) grant("orientation");
  if (viewedCount >= TOTAL_LESSONS) grant("valedictorian");

  const lessonChapters = state.lessonChapters ?? {};
  const chapterLessons: Record<string, string[]> = {};
  for (const entry of Object.entries(lessonChapters)) {
    const lessonId = entry[0];
    const chapterId = entry[1];
    const list = chapterLessons[chapterId];
    if (list) {
      list.push(lessonId);
    } else {
      chapterLessons[chapterId] = [lessonId];
    }
  }
  for (const ids of Object.values(chapterLessons)) {
    if (ids.length > 0 && ids.every((id) => lessonsViewed[id])) {
      grant("chapter-scholar");
      break;
    }
  }

  const streakBest = state.streakBest ?? 0;
  if (streakBest >= 3) grant("on-fire");
  if (streakBest >= 5) grant("unstoppable");
  if (streakBest >= 8) grant("relentless");

  const masteredCount = state.masteredCount ?? 0;
  if (masteredCount >= 1) grant("second-nature");
  if (masteredCount >= 10) grant("muscle-memory");
  if (masteredCount >= 25) grant("autopilot");

  if ((state.bossNoHints ?? []).length > 0) grant("flawless-drill");

  if (state.manUsed) grant("rtfm");

  const quizAces = state.quizAces ?? 0;
  if (quizAces >= 1) grant("top-of-the-class");
  if (quizAces >= 3) grant("deans-list");

  if ((state.xp ?? 0) >= FIRST_PROMOTION_XP) grant("promoted");

  if (Object.keys(state.hintsUsed).length >= 20) grant("persistent");

  // ---- v3 expansion achievements ----

  const completedCount = Object.keys(state.completed).length;
  if (completedCount >= 50) grant("marathon");
  if (completedCount >= 100) grant("centurion");
  if (CHALLENGES.length > 0 && CHALLENGES.every((c) => state.completed[c.id])) {
    grant("completionist");
  }

  let cleanZones = 0;
  for (let zone = 1; zone <= 8; zone++) {
    const ids = zoneChallengeIds(zone);
    if (ids.length === 0) continue;
    if (ids.every((id) => state.completed[id] && !state.hintsUsed[id])) cleanZones++;
  }
  if (cleanZones >= 3) grant("triple-clean");

  const beatClockCount = Object.values(state.bossBeatClock).filter(Boolean).length;
  if (beatClockCount >= 4) grant("drill-sergeant");
  if (beatClockCount >= 8) grant("drill-master");

  if (streakBest >= 15) grant("juggernaut");
  if (streakBest >= 25) grant("untouchable");

  if (quizAces >= 5) grant("quiz-master");

  if ((state.bossNoHints ?? []).length >= 8) grant("flawless-commander");

  const xp = state.xp ?? 0;
  if (xp >= 1400) grant("ghost-protocol");
  if (xp >= 2000) grant("living-legend");
  if (xp >= 2800) grant("mythic");

  return newly;
}
