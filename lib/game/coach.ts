/**
 * NEXUS: Linux Quest - coach systems (v2 progression).
 *
 * Hint pricing, solve streaks, per-command mastery, miss coaching, and
 * dashboard stats. Pure functions only; the store wires these in.
 *
 * AXIOM voice: dry, second person, present tense. No em dashes.
 */

export interface HintLevel {
  level: number;
  cost: number;
  label: string;
}

/** Escalating hint costs: level 0 is a free nudge, then 5, 10, 20 XP. */
export const HINT_LEVELS: HintLevel[] = [
  { level: 0, cost: 0, label: "Nudge" },
  { level: 1, cost: 5, label: "Point" },
  { level: 2, cost: 10, label: "Push" },
  { level: 3, cost: 20, label: "Shove" },
];

/** XP cost for a hint level, clamped to levels 0..3. Never below 0. */
export function hintCostFor(level: number): number {
  const clamped = Math.max(0, Math.min(3, Math.floor(level)));
  const entry = HINT_LEVELS.find((h) => h.level === clamped);
  return entry ? entry.cost : 0;
}

// ---------- streaks ----------

/** Streak state derived from events. */
export interface StreakState {
  current: number;
  best: number;
}

/** Fold one solve/miss event into the streak state. */
export function nextStreak(prev: StreakState, solved: boolean): StreakState {
  if (solved) {
    const current = prev.current + 1;
    return { current, best: Math.max(prev.best, current) };
  }
  return { current: 0, best: prev.best };
}

/**
 * Streak XP bonus: +2 XP per streak level beyond 2, capped at +10.
 * A streak of 3 earns +2, 4 earns +4, 7 or more earns +10.
 */
export function streakBonus(streak: number): number {
  if (streak <= 2) return 0;
  return Math.min(10, (streak - 2) * 2);
}

// ---------- command mastery ----------

export type MasteryLevel = "unseen" | "seen" | "practiced" | "mastered";

export interface CommandMastery {
  attempts: number;
  solves: number;
}

/** mastered at >=3 solves, practiced at >=1 solve or >=3 attempts, seen at >=1 attempt. */
export function masteryLevel(m: CommandMastery): MasteryLevel {
  if (m.solves >= 3) return "mastered";
  if (m.solves >= 1 || m.attempts >= 3) return "practiced";
  if (m.attempts >= 1) return "seen";
  return "unseen";
}

/**
 * Record one attempt for a command. Pure: returns a new map,
 * never mutates the input.
 */
export function recordAttempt(
  map: Record<string, CommandMastery>,
  cmd: string,
  solved: boolean
): Record<string, CommandMastery> {
  const prev: CommandMastery = map[cmd] ?? { attempts: 0, solves: 0 };
  return {
    ...map,
    [cmd]: {
      attempts: prev.attempts + 1,
      solves: prev.solves + (solved ? 1 : 0),
    },
  };
}

// ---------- miss coaching ----------

/** Commands the coach recognizes when diagnosing a miss. */
const KNOWN_COMMANDS: readonly string[] = [
  "ls", "cd", "pwd", "mkdir", "touch", "cp", "mv", "rm", "rmdir",
  "cat", "less", "more", "head", "tail", "grep", "find", "locate",
  "chmod", "chown", "chgrp", "tar", "zip", "unzip", "echo", "printf",
  "sort", "uniq", "tr", "wc", "cut", "sed", "awk", "xargs",
  "ps", "kill", "killall", "jobs", "bg", "fg",
  "df", "du", "free", "mount", "file", "stat", "which", "whereis",
  "man", "info", "history", "alias", "ln", "diff", "cmp",
  "ssh", "scp", "curl", "wget", "ping",
  "sudo", "su", "whoami", "id", "groups", "passwd",
  "crontab", "systemctl", "service", "env", "export", "source",
];

/** Commands that need at least one argument to do anything useful. */
const ARG_COMMANDS: ReadonlySet<string> = new Set([
  "cd", "mkdir", "touch", "cp", "mv", "rm", "rmdir", "cat", "less",
  "head", "tail", "grep", "find", "chmod", "chown", "chgrp", "tar",
  "file", "stat", "man", "du", "ln", "diff", "scp",
]);

/** Task-text keywords that imply a flag, and the flags that satisfy them. */
const FLAG_SIGNALS: ReadonlyArray<{
  words: string[];
  flags: string[];
  fix: string;
}> = [
  {
    words: ["recursi"],
    flags: ["-r", "-R", "--recursive"],
    fix: "This job goes through directories, so the command needs -r or -R. Add the flag and run it again.",
  },
  {
    words: ["parent", "single command"],
    flags: ["-p"],
    fix: "You are building nested directories, so mkdir needs -p. Add the flag and run it again.",
  },
  {
    words: ["hidden"],
    flags: ["-a", "-A"],
    fix: "Hidden files are in play, so ls needs -a. Add the flag and look again.",
  },
  {
    words: ["human-readable", "human readable"],
    flags: ["-h"],
    fix: "The task wants human-readable output, so add -h and run it again.",
  },
  {
    words: ["force", "without asking", "without prompting"],
    flags: ["-f"],
    fix: "Nothing may ask for confirmation here, so add -f and run it again.",
  },
  {
    words: ["long format", "detailed list", "details"],
    flags: ["-l"],
    fix: "The task wants the detailed listing, so ls needs -l. Add the flag and run it again.",
  },
];

function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  const dp: number[][] = [];
  for (let i = 0; i < rows; i++) {
    const row: number[] = [];
    for (let j = 0; j < cols; j++) row.push(0);
    dp.push(row);
  }
  for (let i = 0; i < rows; i++) dp[i]![0] = i;
  for (let j = 0; j < cols; j++) dp[0]![j] = j;
  for (let i = 1; i < rows; i++) {
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const deletion = dp[i - 1]![j]! + 1;
      const insertion = dp[i]![j - 1]! + 1;
      const substitution = dp[i - 1]![j - 1]! + cost;
      dp[i]![j] = Math.min(deletion, insertion, substitution);
    }
  }
  return dp[rows - 1]![cols - 1]!;
}

function nearestCommand(word: string): string | null {
  let best: string | null = null;
  let bestDist = 3;
  for (const cmd of KNOWN_COMMANDS) {
    const d = editDistance(word, cmd);
    if (d < bestDist) {
      bestDist = d;
      best = cmd;
    }
  }
  return best;
}

function hasUnbalancedQuotes(input: string): boolean {
  const singles = (input.match(/'/g) ?? []).length;
  const doubles = (input.match(/"/g) ?? []).length;
  return singles % 2 === 1 || doubles % 2 === 1;
}

function normalizePath(token: string): string {
  return token.length > 1 ? token.replace(/\/+$/, "") : token;
}

function missingFlagSentence(task: string, input: string): string | null {
  const loweredTask = task.toLowerCase();
  const tokens = input.split(/\s+/);
  for (const signal of FLAG_SIGNALS) {
    const applies = signal.words.some((w) => loweredTask.includes(w));
    if (!applies) continue;
    const present = signal.flags.some((f) => tokens.includes(f));
    if (!present) return signal.fix;
  }
  return null;
}

/**
 * Teaching feedback for a failed attempt. Given the challenge task text and
 * the raw input the player typed, returns 2-4 sentences in AXIOM voice (dry,
 * helpful, second person, present tense) explaining the likely mistake and
 * what to try. Covers wrong commands, wrong args, typos, wrong paths,
 * missing flags, and quoting issues.
 */
export function coachMiss(task: string, input: string): string {
  const trimmed = input.trim();
  if (trimmed === "") {
    return "That was an empty line. The terminal does not grade optimism. Type the command and press enter.";
  }

  const tokens = trimmed.split(/\s+/);
  const first = (tokens[0] ?? "").toLowerCase();

  if (!KNOWN_COMMANDS.includes(first)) {
    const near = nearestCommand(first);
    if (near) {
      return `You typed \`${tokens[0]}\`. You meant \`${near}\`. Try it again, one letter at a time.`;
    }
    return `The shell does not know \`${tokens[0]}\`. Read the task again and pick the tool it actually asks for.`;
  }

  // Known command: check whether the task names a different command outright
  // (backticked, "X command", or "use X"), which signals a wrong-tool miss.
  const taskCmd = KNOWN_COMMANDS.find(
    (c) =>
      c !== first &&
      new RegExp(`\`${c}\`|\\b${c}\\s+command\\b|\\buse\\s+${c}\\b`, "i").test(task)
  );
  if (taskCmd) {
    return `You typed \`${first}\`, but this task is a \`${taskCmd}\` job. Switch tools and read the task again before you run it.`;
  }

  if (hasUnbalancedQuotes(trimmed)) {
    return "Your quotes do not balance. One of them is missing a partner. Close every quote you open and run it again.";
  }

  const flagFix = missingFlagSentence(task, trimmed);
  if (flagFix) {
    return `The command is right, but it is missing a flag. ${flagFix}`;
  }

  const pathTokens = tokens.filter((t) => t.includes("/"));
  for (const p of pathTokens) {
    if (!task.includes(normalizePath(p))) {
      return "The path in your command does not match the task. Copy the path from the task exactly, then run it again.";
    }
  }

  if (ARG_COMMANDS.has(first) && tokens.length < 2) {
    return `\`${first}\` needs something to work on. Give it a target and run it again.`;
  }

  return "The command is right, so the details are wrong. Compare your input with the task word by word and try again.";
}

// ---------- dashboard ----------

export interface DashboardStats {
  chaptersDone: number;
  lessonsViewed: number;
  lessonsTotal: number;
  challengesDone: number;
  challengesTotal: number;
  accuracy: number;
  bestStreak: number;
  xp: number;
  levelName: string;
}

/** Dashboard stats computed from persisted progress. Accuracy is a 0-100 percentage. */
export function computeStats(p: {
  xp: number;
  levelName: string;
  completed: Record<string, boolean>;
  lessonsViewed: Record<string, boolean>;
  lessonsTotal: number;
  challengesTotal: number;
  attempts: number;
  solves: number;
  bestStreak: number;
  chaptersDone: number;
}): DashboardStats {
  const challengesDone = Object.values(p.completed).filter(Boolean).length;
  const lessonsViewed = Object.values(p.lessonsViewed).filter(Boolean).length;
  const accuracy =
    p.attempts > 0 ? Math.round((p.solves / p.attempts) * 1000) / 10 : 0;
  return {
    chaptersDone: p.chaptersDone,
    lessonsViewed,
    lessonsTotal: p.lessonsTotal,
    challengesDone,
    challengesTotal: p.challengesTotal,
    accuracy,
    bestStreak: p.bestStreak,
    xp: p.xp,
    levelName: p.levelName,
  };
}
