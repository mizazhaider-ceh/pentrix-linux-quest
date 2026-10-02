/**
 * v2 full playthrough: drives the real GameStore through every lesson,
 * all 112 standard challenges, 8 boss drills, and 5 CTF flags with real
 * commands, then exercises the v2 systems (gating, escalating hints,
 * streaks, mastery, man hook, did-you-mean, quiz, migration).
 *
 * Run: npx esbuild scripts/playthrough.ts --bundle --platform=node \
 *         --format=cjs --outfile=/tmp/playthrough.cjs && node /tmp/playthrough.cjs
 */
import { GameStore } from "../lib/game/store";
import { createShell } from "../lib/engine";
import { CHALLENGES } from "../data/challenges";
import { LESSONS, lessonsForChapter } from "../data/lessons";
import { CHAPTERS } from "../data/chapters";
import { CTF_CHALLENGES } from "../lib/game/ctf";
import { SOLUTIONS } from "../data/solutions";

const TOTAL = CHALLENGES.length + CTF_CHALLENGES.length;

let failures = 0;
let solved = 0;

function ok(cond: boolean, label: string): void {
  if (cond) {
    console.log(`  ok   ${label}`);
  } else {
    failures++;
    console.log(`  FAIL ${label}`);
  }
}

/** Turn a challenge hint into runnable command lines. */
// Explicit per-challenge solutions live in data/solutions.ts.

function solutionFor(id: string, hint: string): string[] {
  if (id in SOLUTIONS) return SOLUTIONS[id];
  if (id === "proc-09" || hint.includes("sleep 1100 & then")) {
    return ["sleep 1100 &", "__JOBS_KILL:kill"];
  }
  if (id === "proc-10" || hint.includes("sleep 1200 & then")) {
    return ["sleep 1200 &", "__JOBS_KILL:kill -9"];
  }
  if (hint.includes("CALLSIGN=nexus then")) {
    return ["CALLSIGN=nexus", "echo $CALLSIGN"];
  }
  if (hint.includes("ls /nope then echo")) {
    return ["ls /nope", "echo $?"];
  }
  if (id === "read-boss") {
    const cat = hint.split(": ").slice(-1)[0];
    return ["file /home/agent/intel/vault/*", cat];
  }
  if (id === "proc-boss") {
    return [
      "sleep 1500 &",
      "sleep 1500 &",
      "sleep 1500 &",
      "jobs",
      "pkill -f 'sleep 1500'",
    ];
  }
  // leading "sleep N & then ...": the sleep must run before the rest
  const leadSleep = hint.match(/^(sleep \d+ &)\s+then\s/i);
  if (leadSleep) {
    const rest = hint.includes(": ") ? hint.split(": ").slice(-1)[0] : hint;
    return [leadSleep[1], rest.replace(/,\s*then\s+.*/i, "").trim()];
  }
  let s = hint.includes(": ") ? hint.split(": ").slice(-1)[0] : hint;
  // split prose-joined commands like "sleep 60 & then jobs"
  if (/\s+then\s+/i.test(s) && !/,\s*then/i.test(s)) {
    const parts = s.split(/\s+then\s+/i);
    return parts.map((p) => p.trim()).filter(Boolean);
  }
  // strip trailing prose like ", then check with ls -l"
  s = s.replace(/,\s*then\s+.*/i, "").trim();
  // strip trailing chaining operators left by line continuations
  s = s.replace(/\s*(&&|;|\|)\s*$/, "").trim();
  return [s];
}

function runSolution(store: GameStore, cmds: string[]): void {
  for (const c of cmds) {
    if (c === "__PGREP_KILL_TERM") {
      const out = store.runCommand('pgrep -f "sleep 900"');
      const pid = out.trim().split("\n").map((l) => l.trim()).filter(Boolean).pop();
      if (!pid || !/^\d+$/.test(pid)) throw new Error(`could not find sleep 900 PID in: ${out.slice(0, 120)}`);
      store.runCommand(`kill -TERM ${pid}`);
    } else if (c === "__JOBS_KILL:kill" || c === "__JOBS_KILL:kill -9") {
      const sig = c.endsWith("kill -9") ? "kill -9" : "kill";
      const jobsOut = store.runCommand("jobs -l");
      const line = jobsOut.split("\n").find((l) => l.includes("sleep 11") || l.includes("sleep 12"));
      const m = line?.match(/\]\S*\s+(\d+)/);
      if (!m) throw new Error(`could not find sleep PID in: ${jobsOut.slice(0, 120)}`);
      store.runCommand(`${sig} ${m[1]}`);
    } else {
      store.runCommand(c);
    }
  }
}

console.log("== v2 playthrough: gating ==");
{
  const s = new GameStore(() => createShell());
  ok(!s.canPlay(1), "chapter 1 locked before lessons");
  ok(!s.lessonsDone(1), "lessons not done initially");
  for (const l of lessonsForChapter(1)) s.viewLesson(l.id);
  ok(s.lessonsDone(1), "chapter 1 lessons done after viewing");
  ok(s.canPlay(1), "chapter 1 playable after lessons");
  ok(!s.canPlay(2), "chapter 2 still locked (zone not unlocked)");
  const st = s.getDashboardStats();
  ok(st.lessonsViewed === lessonsForChapter(1).length, "dashboard counts viewed lessons");
}

console.log("== v2 playthrough: terminal upgrades ==");
{
  const s = new GameStore(() => createShell());
  const manOut = s.runCommand("man ls");
  ok(manOut.includes("LESSON"), "man ls shows lesson content");
  ok(s.getSnapshot().manUsed, "man usage tracked");
  const dym = s.runCommand("sl");
  ok(dym.includes("did you mean"), "did-you-mean suggestion for 'sl'");
  const fb = s.getCoachFeedback("lss");
  ok(typeof fb === "string" && fb.length > 0, "coach feedback returns text");
}

console.log("== v2 playthrough: escalating hints ==");
{
  const s = new GameStore(() => createShell());
  const h0 = s.useHint();
  const h1 = s.useHint();
  const h2 = s.useHint();
  const h3 = s.useHint();
  ok(h0.includes("nudge") && !h0.includes("-5 XP"), "level 0 hint is a free nudge");
  ok(h1.includes("-5 XP"), "level 1 hint costs 5 XP");
  ok(h2.includes("-10 XP"), "level 2 hint costs 10 XP");
  ok(h3.includes("-20 XP"), "level 3 hint costs 20 XP");
  ok(s.getSnapshot().streakCurrent === 0, "hint use resets streak");
}

console.log("== v2 playthrough: full game ==");
const store = new GameStore(() => createShell());
for (let ch = 1; ch <= 8; ch++) {
  for (const l of lessonsForChapter(ch)) store.viewLesson(l.id);
  ok(store.canPlay(ch), `chapter ${ch} playable after lessons`);

  const std = CHALLENGES.filter((c) => c.zone === ch && !c.id.endsWith("-boss"));
  const boss = CHALLENGES.find((c) => c.id.endsWith("-boss") && c.zone === ch)!;

  for (const c of std) {
    const active = store.getActive();
    if (!active || active.challenge.id !== c.id) {
      ok(false, `${c.id}: expected active, got ${active?.challenge.id}`);
      continue;
    }
    // New-batch challenges (xx-20+) were validated in isolated shells.
    // Reset volatile state so persistent-shell playthrough matches.
    // Use shell.execute directly (not store.runCommand) so cleanup does not
    // accidentally complete the active challenge.
    const cnum = parseInt(c.id.split("-")[1], 10);
    if (cnum >= 20) {
      const sh = (store as unknown as { shell: { execute: (c: string) => string; nextJobId: number; history: string[] } }).shell;
      sh.execute("umask 022");
      sh.execute("pkill -9 -f sleep");
      sh.execute("cd /home/agent");
      // Reset job ID counter so %1 refers to the next background job.
      sh.nextJobId = 1;
      // Clear command history: historyMatches rules must only see this challenge's commands.
      sh.history = [];
    }
    try {
      runSolution(store, solutionFor(c.id, c.hint));
    } catch (e) {
      ok(false, `${c.id}: solver threw ${(e as Error).message}`);
      continue;
    }
    const done = !!store.getSnapshot().completed[c.id];
    if (done) solved++;
    else {
      failures++;
      console.log(`  FAIL ${c.id}: not completed (hint: ${c.hint.slice(0, 80)})`);
    }
  }

  // boss drill
  const before = store.getActive();
  ok(before?.kind === "boss" && before.challenge.id === boss.id, `chapter ${ch} boss is active`);
  const secs = store.startBoss();
  ok(secs > 0, `chapter ${ch} boss timer started (${secs}s)`);
  runSolution(store, solutionFor(boss.id, boss.hint));
  const bossDone = !!store.getSnapshot().completed[boss.id];
  if (bossDone) solved++;
  else {
    failures++;
    console.log(`  FAIL ${boss.id}: boss not cleared`);
  }
  const beatClock = !!store.getSnapshot().bossBeatClock[boss.id];
  ok(beatClock, `chapter ${ch} boss beat the clock`);
  ok(
    store.getSnapshot().unlockedZones.includes(ch + 1 <= 8 ? ch + 1 : 9),
    `chapter ${ch} boss unlocked next zone`
  );
  const phase = store.chapterPhase(ch);
  ok(phase.learn && phase.play && phase.prove, `chapter ${ch} phase all done`);
  console.log(`  -- chapter ${ch} (${CHAPTERS[ch - 1].name}) cleared`);
}

console.log("== v2 playthrough: CTF ==");
for (const c of CTF_CHALLENGES) {
  const r = store.submitCtfFlag(c.flag);
  ok(r, `flag ${c.flag} captured`);
  solved++;
}

const snap = store.getSnapshot();
console.log("== v2 playthrough: final assertions ==");
ok(solved === TOTAL, `all ${TOTAL} challenges solved (got ${solved})`);
ok(
  Object.keys(snap.completed).length === TOTAL,
  `all ${TOTAL} completed in snapshot (got ${Object.keys(snap.completed).length})`
);
ok(snap.achievements.includes("nexus-graduate"), "nexus-graduate unlocked");
ok(snap.achievements.includes("valedictorian"), "valedictorian unlocked");
ok(snap.achievements.includes("chapter-scholar"), "chapter-scholar unlocked");
ok(snap.achievements.includes("orientation"), "orientation unlocked");
ok(snap.achievements.includes("flawless-drill"), "flawless-drill unlocked (no hints)");
ok(snap.streakBest >= 8, `streak best >= 8 (got ${snap.streakBest})`);
ok(snap.bossNoHints.length === 8, `8 flawless bosses (got ${snap.bossNoHints.length})`);
ok(snap.quizAces === 0, "no quiz aces yet");
const ace = store.submitQuiz(1, 4, 4);
ok(ace && store.getSnapshot().quizAces === 1, "quiz ace recorded");
const notAce = store.submitQuiz(2, 3, 4);
ok(!notAce && store.getSnapshot().quizAces === 1, "non-perfect quiz not an ace");
const stats = store.getDashboardStats();
ok(stats.lessonsViewed === LESSONS.length, `all ${LESSONS.length} lessons viewed`);
ok(stats.challengesDone === TOTAL, `dashboard: all ${TOTAL} challenges done`);
ok(stats.accuracy > 0, `dashboard accuracy ${stats.accuracy}%`);
ok(stats.bestStreak === snap.streakBest, "dashboard best streak matches");
ok(stats.chaptersDone === 8, "dashboard: 8 chapters done");
console.log(`  XP: ${snap.xp}  level: ${snap.level} (${snap.levelName})`);
console.log(`  achievements: ${snap.achievements.length} -> ${snap.achievements.join(", ")}`);

console.log("== v2 playthrough: save migration ==");
{
  // Simulate a v1 save (no v2 fields) and check load() migrates it.
  const mem: Record<string, string> = {};
  (globalThis as Record<string, unknown>).window = {
    localStorage: {
      getItem: (k: string) => mem[k] ?? null,
      setItem: (k: string, v: string) => {
        mem[k] = v;
      },
      removeItem: (k: string) => {
        delete mem[k];
      },
    },
  };
  mem["nexus-linux-quest-v1"] = JSON.stringify({
    xp: 100,
    zone: 2,
    completed: { "nav-01": true, "nav-02": true },
    hintsUsed: {},
    unlockedZones: [1, 2],
    achievements: ["first-steps"],
    ctfFlags: [],
    bossBeatClock: {},
  });
  const s = new GameStore(() => createShell());
  const migrated = s.getSnapshot();
  ok(
    lessonsForChapter(1).every((l) => migrated.lessonsViewed[l.id]),
    "v1 save: chapter 1 lessons auto-marked (had progress)"
  );
  ok(
    !lessonsForChapter(2).some((l) => migrated.lessonsViewed[l.id]),
    "v1 save: chapter 2 lessons not auto-marked (no progress)"
  );
  ok(s.canPlay(1), "v1 save: chapter 1 playable after migration");
  ok(!s.canPlay(2), "v1 save: chapter 2 needs lessons first");
  delete (globalThis as Record<string, unknown>).window;
}

console.log(failures === 0 ? "\nALL GREEN" : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
