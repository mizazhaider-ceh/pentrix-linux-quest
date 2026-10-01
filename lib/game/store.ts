import { CHALLENGES, type Challenge } from "../../data/challenges";
import { LESSONS, LESSON_CHAPTERS, lessonsForChapter } from "../../data/lessons";
import { checkChallenge } from "./verifier";
import { ACHIEVEMENTS, checkAchievements } from "./achievements";
import { CTF_CHALLENGES, type CtfChallenge } from "./ctf";
import {
  HINT_LEVELS,
  hintCostFor,
  nextStreak,
  streakBonus,
  recordAttempt,
  coachMiss,
  computeStats,
  type CommandMastery,
  type DashboardStats,
} from "./coach";
import {
  getShellFactory,
  type Shell,
  type ShellFactory,
} from "./engine-contract";

export const SAVE_KEY = "nexus-linux-quest-v1";
export const HINT_COST = 5;
export const LESSON_XP = 5;
export const CTF_ZONE = 9;
export const STANDARD_PER_ZONE = 13;
export const ZONE_UNLOCK_THRESHOLD = 10;

export interface LevelDef {
  xp: number;
  name: string;
}

/** Level thresholds and titles, from GAME-DESIGN.md. */
export const LEVELS: LevelDef[] = [
  { xp: 0, name: "Rookie" },
  { xp: 200, name: "Operator" },
  { xp: 500, name: "Specialist" },
  { xp: 900, name: "Veteran" },
  { xp: 1400, name: "Ghost" },
  { xp: 2000, name: "Nexus Legend" },
];

/**
 * Game events. Each member carries the `type` discriminant from the systems
 * contract plus `kind`/`title`/`sub` fields consumed by the UI shell
 * (toasts, level-up modal, boss timer). `level`/`levelName` are present
 * on levelup events and optional elsewhere for UI convenience.
 */
interface EventBase {
  title: string;
  sub?: string;
  level?: number;
  levelName?: string;
}

export type GameEvent =
  | (EventBase & { type: "xp"; kind: "xp"; amount: number })
  | (EventBase & {
      type: "levelup";
      kind: "levelup";
      level: number;
      levelName: string;
    })
  | (EventBase & { type: "achievement"; kind: "achievement"; id: string })
  | (EventBase & {
      type: "challenge-complete";
      kind: "challenge";
      id: string;
      xp: number;
    })
  | (EventBase & { type: "zone-unlock"; kind: "info"; zone: number })
  | (EventBase & {
      type: "boss-start";
      kind: "boss-start";
      zone: number;
      seconds: number;
    })
  | (EventBase & { type: "boss-timeout"; kind: "boss-end" })
  | (EventBase & { type: "ctf-flag"; kind: "challenge"; flag: string })
  | (EventBase & { type: "graduated"; kind: "info" })
  | (EventBase & { type: "lesson"; kind: "info"; id: string })
  | (EventBase & { type: "quiz-complete"; kind: "info"; score: number; total: number });

export type GameEventHandler = (event: GameEvent) => void;
export type Unsubscribe = () => void;

export interface PersistedState {
  xp: number;
  zone: number;
  completed: Record<string, boolean>;
  hintsUsed: Record<string, boolean>;
  unlockedZones: number[];
  achievements: string[];
  ctfFlags: string[];
  bossBeatClock: Record<string, boolean>;
  /** v2: lesson progress for the Learn phase. */
  lessonsViewed: Record<string, boolean>;
  /** v2: challengeId -> highest hint level claimed (0-3). */
  hintLevels: Record<string, number>;
  /** v2: hintless-solve streaks. */
  streakCurrent: number;
  streakBest: number;
  /** v2: per-command practice tracking. */
  mastery: Record<string, CommandMastery>;
  /** v2: player has run `man <cmd>` at least once. */
  manUsed: boolean;
  /** v2: perfect chapter quizzes. */
  quizAces: number;
  /** v2: total commands run (accuracy denominator). */
  attempts: number;
  /** v2: onboarding overlay dismissed. */
  onboarded: boolean;
  /** v2: boss ids cleared with zero hints used anywhere in their zone. */
  bossNoHints: string[];
}

export interface BossState {
  zone: number;
  /** Epoch ms when the timer expires. */
  deadline: number;
  /** Timer length in seconds. */
  seconds: number;
}

export interface GameState extends PersistedState {
  level: number;
  levelName: string;
  /** Index of the active challenge in the current zone's order, -1 when cleared. */
  challengeIndex: number;
  /** Active boss timer, or null when no drill is running. */
  boss: BossState | null;
}

export interface BossRuntime extends BossState {
  challengeId: string;
}

export type ActiveKind = "standard" | "boss" | "ctf";

export interface ActiveChallenge {
  kind: ActiveKind;
  challenge: Challenge;
}

export function levelFor(xp: number): { level: number; levelName: string } {
  let level = 1;
  let levelName = LEVELS[0].name;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].xp) {
      level = i + 1;
      levelName = LEVELS[i].name;
    }
  }
  return { level, levelName };
}

/**
 * Parse the boss timer from the task text, e.g. "You have 120 seconds."
 * Falls back to 150 when no match is found.
 */
export function parseBossSeconds(task: string): number {
  const m = /(\d{2,3})\s*s/.exec(task);
  if (m) {
    const n = parseInt(m[1], 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 150;
}

function zoneChallenges(zone: number): Challenge[] {
  return CHALLENGES.filter((c) => c.zone === zone);
}

/**
 * Pull the solution command out of a hint for the level-3 "shove".
 * Most hints end with "Just type: <command>" or ": <command>".
 */
function revealSolution(hint: string): string | null {
  const m = hint.match(/just type:\s*`?([^`\n]+?)`?\s*$/i);
  if (m) return m[1].trim();
  const m2 = hint.match(/:\s*([a-z][\w-]*(?:\s+[^\n]*)?)$/);
  if (m2) return m2[1].trim();
  return null;
}

function isBossId(id: string): boolean {
  return id.endsWith("-boss");
}

function achievementName(id: string): string {
  const a = ACHIEVEMENTS.find((entry) => entry.id === id);
  return a ? a.name : id;
}

function freshPersisted(): PersistedState {
  return {
    xp: 0,
    zone: 1,
    completed: {},
    hintsUsed: {},
    unlockedZones: [1],
    achievements: [],
    ctfFlags: [],
    bossBeatClock: {},
    lessonsViewed: {},
    hintLevels: {},
    streakCurrent: 0,
    streakBest: 0,
    mastery: {},
    manUsed: false,
    quizAces: 0,
    attempts: 0,
    onboarded: false,
    bossNoHints: [],
  };
}

function storageAvailable(): boolean {
  try {
    return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  } catch {
    return false;
  }
}

export class GameStore {
  readonly shell: Shell;
  private persisted: PersistedState;
  private state: GameState;
  private boss: BossRuntime | null = null;
  private handlers = new Set<GameEventHandler>();
  private subscribers = new Set<() => void>();

  constructor(factory?: ShellFactory) {
    const f = factory ?? getShellFactory();
    this.shell = f();
    this.persisted = freshPersisted();
    this.state = this.derive();
    if (!this.load()) {
      const active = this.getActive();
      if (active && active.challenge.setup) {
        this.shell.applySetup(active.challenge.setup);
      }
    }
  }

  // ---------- reactive snapshot (for the React hook) ----------

  /** Stable snapshot getter for useSyncExternalStore. */
  getSnapshot = (): GameState => this.state;

  /** Subscribe to state changes. Returns an unsubscribe function. */
  subscribe = (cb: () => void): Unsubscribe => {
    this.subscribers.add(cb);
    return () => {
      this.subscribers.delete(cb);
    };
  };

  /** Subscribe to game events. Returns an unsubscribe function. */
  onEvent(cb: GameEventHandler): Unsubscribe {
    this.handlers.add(cb);
    return () => {
      this.handlers.delete(cb);
    };
  }

  private emit(event: GameEvent): void {
    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch {
        /* a listener must never break the game */
      }
    }
  }

  private derive(): GameState {
    const { level, levelName } = levelFor(this.persisted.xp);
    const zone = this.persisted.zone;
    let challengeIndex = -1;
    if (zone >= 1 && zone <= 8) {
      challengeIndex = zoneChallenges(zone).findIndex(
        (c) => !this.persisted.completed[c.id]
      );
    } else {
      challengeIndex = CTF_CHALLENGES.findIndex((c) => !this.persisted.completed[c.id]);
    }
    return {
      ...this.persisted,
      level,
      levelName,
      challengeIndex,
      boss: this.boss
        ? { zone: this.boss.zone, deadline: this.boss.deadline, seconds: this.boss.seconds }
        : null,
    };
  }

  /** Refresh the derived snapshot and notify subscribers. */
  private touch(): void {
    this.state = this.derive();
    for (const cb of this.subscribers) {
      try {
        cb();
      } catch {
        /* ignore */
      }
    }
  }

  // ---------- progression ----------

  /**
   * The challenge the player should be working on right now, or null when the
   * current zone is fully cleared. Boss drills only appear after all 13
   * standard challenges of the zone are complete.
   */
  getActive(): ActiveChallenge | null {
    const zone = this.persisted.zone;
    if (zone >= 1 && zone <= 8) {
      const list = zoneChallenges(zone);
      const first = list
        .filter((c) => !isBossId(c.id))
        .find((c) => !this.persisted.completed[c.id]);
      if (first) return { kind: "standard", challenge: first };
      const boss = list.find((c) => isBossId(c.id));
      if (boss && !this.persisted.completed[boss.id]) {
        return { kind: "boss", challenge: boss };
      }
      return null;
    }
    const next = CTF_CHALLENGES.find((c) => !this.persisted.completed[c.id]);
    return next ? { kind: "ctf", challenge: next } : null;
  }

  /** Convenience for UI: just the challenge, no kind wrapper. */
  getActiveChallenge(): Challenge | null {
    const active = this.getActive();
    return active ? active.challenge : null;
  }

  getActiveKind(): ActiveKind | null {
    const active = this.getActive();
    return active ? active.kind : null;
  }

  /** How many standard challenges are complete in a zone. */
  zoneProgress(zone: number): number {
    return zoneChallenges(zone).filter(
      (c) => !isBossId(c.id) && this.persisted.completed[c.id]
    ).length;
  }

  /** Travel to an unlocked zone. Applies that zone's active challenge setup. */
  setZone(zone: number): boolean {
    if (!this.persisted.unlockedZones.includes(zone)) return false;
    if (zone === this.persisted.zone) return false;
    this.persisted.zone = zone;
    this.boss = null;
    this.touch();
    const active = this.getActive();
    if (active && active.challenge.setup) {
      this.shell.applySetup(active.challenge.setup);
    }
    this.save();
    return true;
  }

  // ---------- core loop ----------

  /**
   * Run a command in the shell, then check the active challenge.
   * Also tracks command mastery, man usage, and attempt counts.
   * Returns the shell output.
   */
  runCommand(input: string): string {
    const first = input.trim().split(/\s+/)[0] ?? "";
    const cmd = first.split("/").pop() ?? "";
    if (cmd === "man") this.persisted.manUsed = true;
    const beforeId = this.getActive()?.challenge.id;
    const output = this.shell.execute(input);
    this.persisted.attempts += 1;
    this.afterCommand();
    const solved =
      beforeId !== undefined && !!this.persisted.completed[beforeId];
    if (cmd) {
      this.persisted.mastery = recordAttempt(
        this.persisted.mastery,
        cmd,
        solved
      );
    }
    if (solved) this.grantAchievements();
    this.touch();
    this.save();
    return output;
  }

  /**
   * Check the active challenge against the current shell state and award it
   * when the verifier passes. Called after every command; the UI shell also
   * calls it directly after driving `shell.execute` itself.
   */
  afterCommand(): void {
    const active = this.getActive();
    if (!active) return;
    if (active.kind === "boss" && !this.boss) this.startBoss();
    let passed = false;
    try {
      passed = checkChallenge(active.challenge, this.shell);
    } catch {
      passed = false;
    }
    if (passed) this.awardFor(active.challenge, active.kind);
  }

  /** Run achievement checks with the full v2 progress snapshot. */
  private grantAchievements(): void {
    const p = this.persisted;
    const masteredCount = Object.values(p.mastery).filter(
      (m) => m.solves >= 3
    ).length;
    const newly = checkAchievements({
      completed: p.completed,
      hintsUsed: p.hintsUsed,
      achievements: p.achievements,
      bossBeatClock: p.bossBeatClock,
      lessonsViewed: p.lessonsViewed,
      lessonChapters: LESSON_CHAPTERS,
      streakBest: p.streakBest,
      masteredCount,
      manUsed: p.manUsed,
      quizAces: p.quizAces,
      bossNoHints: p.bossNoHints,
      xp: p.xp,
    });
    for (const id of newly) {
      p.achievements.push(id);
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      this.emit({
        type: "achievement",
        kind: "achievement",
        title: `Achievement: ${achievementName(id)}`,
        sub: def ? def.description : undefined,
        id,
      });
    }
  }

  private awardFor(challenge: Challenge, kind: ActiveKind): void {
    const p = this.persisted;
    p.completed[challenge.id] = true;

    // v2: hintless-solve streak. Using a hint on a challenge breaks it.
    const brokeStreak = !!p.hintsUsed[challenge.id];
    const next = nextStreak(
      { current: p.streakCurrent, best: p.streakBest },
      !brokeStreak
    );
    p.streakCurrent = next.current;
    p.streakBest = next.best;
    const bonus = streakBonus(next.current);

    const before = levelFor(p.xp);
    p.xp += challenge.xp + bonus;
    const after = levelFor(p.xp);
    this.touch();
    this.emit({
      type: "challenge-complete",
      kind: "challenge",
      title: "Challenge cleared",
      sub: `${challenge.title} (+${challenge.xp} XP${bonus > 0 ? `, streak +${bonus}` : ""})`,
      id: challenge.id,
      xp: challenge.xp,
    });
    this.emit({ type: "xp", kind: "xp", title: `+${challenge.xp + bonus} XP`, amount: challenge.xp + bonus });
    if (after.level > before.level) {
      this.emit({
        type: "levelup",
        kind: "levelup",
        title: `Level up: ${after.levelName}`,
        sub: `You are now level ${after.level}.`,
        level: after.level,
        levelName: after.levelName,
      });
    }

    if (kind === "boss") {
      if (this.boss && this.boss.challengeId === challenge.id) {
        const remainingMs = this.boss.deadline - Date.now();
        if (remainingMs >= (this.boss.seconds * 1000) / 2) {
          p.bossBeatClock[challenge.id] = true;
        }
      }
      // v2: flawless drill = boss cleared with zero hints used anywhere in its zone.
      const zoneStd = zoneChallenges(p.zone).filter((c) => !isBossId(c.id));
      const clean = zoneStd.every(
        (c) => !p.hintsUsed[c.id] && (p.hintLevels[c.id] ?? 0) === 0
      );
      if (clean && !p.bossNoHints.includes(challenge.id)) {
        p.bossNoHints.push(challenge.id);
      }
      this.boss = null;
      if (p.zone < 8) {
        // v2: the next chapter unlocks when the boss (chapter exam) is cleared.
        if (!p.unlockedZones.includes(p.zone + 1)) p.unlockedZones.push(p.zone + 1);
        p.zone = p.zone + 1;
      } else {
        if (!p.unlockedZones.includes(CTF_ZONE)) p.unlockedZones.push(CTF_ZONE);
        p.zone = CTF_ZONE;
      }
    }

    if (kind === "ctf") {
      const flag = (challenge as CtfChallenge).flag;
      if (!p.ctfFlags.includes(flag)) p.ctfFlags.push(flag);
      this.emit({
        type: "ctf-flag",
        kind: "challenge",
        title: `Flag captured: ${flag}`,
        sub: "+60 XP",
        flag,
      });
    }

    this.grantAchievements();

    if (kind === "ctf" && CTF_CHALLENGES.every((c) => p.completed[c.id])) {
      this.emit({
        type: "graduated",
        kind: "info",
        title: "NEXUS Graduate",
        sub: "All 5 flags captured. The station is yours.",
      });
    }

    this.touch();
    const nextCh = this.getActive();
    if (nextCh && nextCh.challenge.setup) {
      this.shell.applySetup(nextCh.challenge.setup);
    }
    this.save();
  }

  // ---------- hints ----------

  /**
   * Escalating hints for the active challenge. Level 0 is a free nudge,
   * then 5 / 10 / 20 XP for a point, a push, and a near-answer shove.
   * Returns the hint text for the claimed level, or "" when there is no
   * active challenge (or the given challenge id is not the active one).
   */
  useHint(challengeId?: string): string {
    const active = this.getActive();
    if (!active) return "";
    if (challengeId && challengeId !== active.challenge.id) return "";
    const p = this.persisted;
    const prev = p.hintLevels[active.challenge.id] ?? -1;
    const level = Math.min(prev + 1, HINT_LEVELS.length - 1);
    const cost = hintCostFor(level);
    p.hintLevels[active.challenge.id] = level;
    p.hintsUsed[active.challenge.id] = true;
    p.xp = Math.max(0, p.xp - cost);
    p.streakCurrent = 0;
    const label = HINT_LEVELS[level];
    let text: string;
    if (level === 0) {
      text = `AXIOM nudge (${label.label}): re-read the task, then try the command that matches it. The obvious answer is usually the right one.`;
    } else if (level === 3) {
      const reveal = revealSolution(active.challenge.hint);
      text =
        reveal != null
          ? `AXIOM shove (${label.label}, -${cost} XP): the command starts like this:\n  ${reveal}`
          : `AXIOM shove (${label.label}, -${cost} XP): ${active.challenge.hint}`;
    } else {
      text = `AXIOM hint (${label.label}, -${cost} XP): ${active.challenge.hint}`;
    }
    this.touch();
    this.save();
    return text;
  }

  // ---------- learn phase ----------

  /** Mark a lesson viewed (+LESSON_XP). Returns true on first view. */
  viewLesson(id: string): boolean {
    const p = this.persisted;
    if (p.lessonsViewed[id]) return false;
    p.lessonsViewed[id] = true;
    const before = levelFor(p.xp);
    p.xp += LESSON_XP;
    const after = levelFor(p.xp);
    this.emit({
      type: "lesson",
      kind: "info",
      title: `Lesson studied (+${LESSON_XP} XP)`,
      id,
    });
    if (after.level > before.level) {
      this.emit({
        type: "levelup",
        kind: "levelup",
        title: `Level up: ${after.levelName}`,
        sub: `You are now level ${after.level}.`,
        level: after.level,
        levelName: after.levelName,
      });
    }
    this.grantAchievements();
    this.touch();
    this.save();
    return true;
  }

  /** True when every lesson of a chapter has been viewed. */
  lessonsDone(chapter: number): boolean {
    return lessonsForChapter(chapter).every(
      (l) => this.persisted.lessonsViewed[l.id]
    );
  }

  /** The PLAY phase of a chapter opens only after its lessons are done. */
  canPlay(chapter: number): boolean {
    return (
      this.persisted.unlockedZones.includes(chapter) && this.lessonsDone(chapter)
    );
  }

  /** Learn / Play / Prove progress for a chapter map card. */
  chapterPhase(chapter: number): { learn: boolean; play: boolean; prove: boolean } {
    const p = this.persisted;
    const std = zoneChallenges(chapter).filter((c) => !isBossId(c.id));
    const boss = zoneChallenges(chapter).find((c) => isBossId(c.id));
    return {
      learn: this.lessonsDone(chapter),
      play: std.every((c) => p.completed[c.id]),
      prove: boss ? !!p.completed[boss.id] : true,
    };
  }

  /** Record a chapter quiz result. A perfect score is a quiz ace. */
  submitQuiz(chapter: number, score: number, total: number): boolean {
    const ace = total > 0 && score >= total;
    if (ace) this.persisted.quizAces += 1;
    this.emit({
      type: "quiz-complete",
      kind: "info",
      title: ace ? "Quiz aced" : "Quiz complete",
      sub: `Chapter ${chapter}: ${score}/${total}`,
      score,
      total,
    });
    this.grantAchievements();
    this.touch();
    this.save();
    return ace;
  }

  /** Dashboard numbers for the command-center view. */
  getDashboardStats(): DashboardStats {
    const p = this.persisted;
    const chaptersDone = [1, 2, 3, 4, 5, 6, 7, 8].filter(
      (ch) => this.chapterPhase(ch).prove
    ).length;
    return computeStats({
      xp: p.xp,
      levelName: levelFor(p.xp).levelName,
      completed: p.completed,
      lessonsViewed: p.lessonsViewed,
      lessonsTotal: LESSONS.length,
      challengesTotal: CHALLENGES.length + CTF_CHALLENGES.length,
      attempts: p.attempts,
      solves: Object.keys(p.completed).length,
      bestStreak: p.streakBest,
      chaptersDone,
    });
  }

  /** AXIOM's read on a command that did not solve the active challenge. */
  getCoachFeedback(input: string): string {
    const active = this.getActive();
    if (!active || active.kind !== "standard") return "";
    const name = input.trim().split(/\s+/)[0]?.split("/").pop() ?? "";
    return coachMiss(active.challenge.task, name || input.trim());
  }

  /** Dismiss the onboarding overlay permanently. */
  setOnboarded(): void {
    this.persisted.onboarded = true;
    this.touch();
    this.save();
  }

  // ---------- boss timer ----------

  /**
   * Start (or restart) the timer for the active boss drill.
   * Returns the timer length in seconds, or 0 when no boss is active.
   */
  startBoss(): number {
    const active = this.getActive();
    if (!active || active.kind !== "boss") return 0;
    const seconds = parseBossSeconds(active.challenge.task);
    this.boss = {
      zone: this.persisted.zone,
      challengeId: active.challenge.id,
      seconds,
      deadline: Date.now() + seconds * 1000,
    };
    this.touch();
    this.emit({
      type: "boss-start",
      kind: "boss-start",
      title: "Lockdown drill started",
      sub: `You have ${seconds} seconds. The clock is running.`,
      zone: this.persisted.zone,
      seconds,
    });
    return seconds;
  }

  /**
   * Seconds left on the boss timer, or 0 when no drill is running.
   * On expiry: resets the drill setup, emits boss-timeout, and returns 0.
   * The challenge stays active, so the player can retry with no penalty.
   */
  tickBoss(): number {
    if (!this.boss) return 0;
    const remaining = Math.ceil((this.boss.deadline - Date.now()) / 1000);
    if (remaining > 0) return remaining;
    const active = this.getActive();
    this.boss = null;
    if (active && active.kind === "boss" && active.challenge.setup) {
      this.shell.applySetup(active.challenge.setup);
    }
    this.touch();
    this.emit({
      type: "boss-timeout",
      kind: "boss-end",
      title: "Time expired",
      sub: "The drill resets. Same challenge, fresh clock. Go again.",
    });
    return 0;
  }

  /** Current boss runtime state, or null when no timer is running. */
  getBoss(): BossRuntime | null {
    return this.boss;
  }

  // ---------- graduation CTF ----------

  /**
   * Submit a flag for the active CTF challenge. Returns true on capture.
   * Each flag is worth 60 XP; all five emit "graduated".
   */
  submitCtfFlag(flag: string): boolean {
    if (!this.persisted.unlockedZones.includes(CTF_ZONE)) return false;
    const active = this.getActive();
    if (!active || active.kind !== "ctf") return false;
    const ctf = active.challenge as CtfChallenge;
    if (flag.trim() !== ctf.flag) return false;
    this.awardFor(ctf, "ctf");
    return true;
  }

  // ---------- persistence ----------

  save(): void {
    if (!storageAvailable()) return;
    try {
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(this.persisted));
    } catch {
      /* storage failures must not break the game */
    }
  }

  /**
   * Load saved progress. Rebuilds the world by replaying the setups of
   * completed challenges in order, then the active challenge's setup.
   * Returns true when a save was found and loaded.
   */
  load(): boolean {
    if (!storageAvailable()) return false;
    try {
      const raw = window.localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const data = JSON.parse(raw) as Partial<PersistedState>;
      if (typeof data.xp !== "number" || typeof data.zone !== "number") return false;
      const fresh = freshPersisted();
      this.persisted = {
        ...fresh,
        ...data,
        completed: data.completed ?? {},
        hintsUsed: data.hintsUsed ?? {},
        unlockedZones:
          Array.isArray(data.unlockedZones) && data.unlockedZones.length > 0
            ? data.unlockedZones
            : [1],
        achievements: data.achievements ?? [],
        ctfFlags: data.ctfFlags ?? [],
        bossBeatClock: data.bossBeatClock ?? {},
        lessonsViewed: data.lessonsViewed ?? {},
        hintLevels: data.hintLevels ?? {},
        mastery: data.mastery ?? {},
        bossNoHints: data.bossNoHints ?? [],
      };
      // v2 migration: returning agents keep their progress but still need the
      // Learn phase. Mark lessons viewed for any chapter they already played.
      if (
        Object.keys(this.persisted.lessonsViewed).length === 0 &&
        Object.keys(this.persisted.completed).length > 0
      ) {
        for (let ch = 1; ch <= 8; ch++) {
          const played = zoneChallenges(ch).some(
            (c) => this.persisted.completed[c.id]
          );
          if (played) {
            for (const l of lessonsForChapter(ch)) {
              this.persisted.lessonsViewed[l.id] = true;
            }
          }
        }
      }
      this.boss = null;
      this.shell.reset();
      for (const ch of CHALLENGES) {
        if (this.persisted.completed[ch.id] && ch.setup) {
          this.shell.applySetup(ch.setup);
        }
      }
      for (const ch of CTF_CHALLENGES) {
        if (this.persisted.completed[ch.id] && ch.setup) {
          this.shell.applySetup(ch.setup);
        }
      }
      const active = this.getActive();
      if (active && active.challenge.setup) {
        this.shell.applySetup(active.challenge.setup);
      }
      this.touch();
      return true;
    } catch {
      return false;
    }
  }

  /** Wipe progress and start over. */
  resetAll(): void {
    try {
      if (storageAvailable()) window.localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    this.shell.reset();
    this.persisted = freshPersisted();
    this.boss = null;
    this.touch();
    const active = this.getActive();
    if (active && active.challenge.setup) {
      this.shell.applySetup(active.challenge.setup);
    }
  }
}

// ---------- module-level singleton (for the React hook) ----------

let instance: GameStore | null = null;

/** Create (or recreate) the singleton store, optionally with a shell factory. */
export function initGame(factory?: ShellFactory): GameStore {
  instance = new GameStore(factory);
  return instance;
}

/** Get the singleton store. Throws when initGame has not been called yet. */
export function getStore(): GameStore {
  if (!instance) {
    throw new Error("GameStore is not initialized. Call initGame() once at app startup.");
  }
  return instance;
}

/** Drop the singleton. Useful for tests. */
export function resetGameInstance(): void {
  instance = null;
}
