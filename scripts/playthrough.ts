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
// v3: explicit solutions for the 48 expansion challenges (xx-14..19).
const NEWC_SOLUTIONS: Record<string, string[]> = {
  "nav-14": ["ls -a /home/agent"],
  "nav-15": ["cd /home/agent/ops", "cd /home/agent/lab", "cd -"],
  "nav-16": ["ls -t /home/agent/logs"],
  "nav-17": ["cp /home/agent/evidence/evidence_a.txt /home/agent/evidence/evidence_b.txt /home/agent/evidence/evidence_c.txt /home/agent/vault"],
  "nav-18": ["rm -r /home/agent/decoy", "mkdir -p /home/agent/decoy/clean/swept", "touch /home/agent/decoy/clean/swept/swept.txt"],
  "nav-19": ["cd /home/agent/ops", "mv report.txt archive"],
  "net-14": ["ping -c 3 10.9.0.1"],
  "net-15": ["ip -brief addr"],
  "net-16": ["ss -s"],
  "net-17": ["curl -o /home/agent/starchart.txt http://relay.local/charts/latest"],
  "net-18": ["wget -O /home/agent/patch.tar.gz http://relay.local/patches/bundle.bin"],
  "net-19": ["curl -d \"zone=6&status=green\" http://relay.local/report"],
  "perm-14": ["chmod 644 /home/agent/docs/bulletin.txt"],
  "perm-15": ["chmod g+w /home/agent/crew/watch.log"],
  "perm-16": ["chown agent:crew /home/agent/vault/evidence.txt"],
  "perm-17": ["chmod --reference /home/agent/vault/master.key /home/agent/vault/spare.key"],
  "perm-18": ["umask 027", "touch /home/agent/vault/newkey.txt"],
  "perm-19": ["ls -l /home/agent/shared", "chmod o-w /home/agent/shared/notes.txt"],
  "proc-14": ["top -b -n 1"],
  "proc-15": ["sleep 120 &", "jobs -l"],
  "proc-16": ["sleep 400 &", "pgrep -f sleep"],
  "proc-17": ["sleep 200 &", "kill %1"],
  "proc-18": ["ps -o pid,cmd"],
  "proc-19": ["__PGREP_KILL_TERM"],
  "read-14": ["cat /home/agent/split/part1.txt /home/agent/split/part2.txt"],
  "read-15": ["wc -c /home/agent/comms/payload.bin"],
  "read-16": ["tail -n +5 /home/agent/logs/sys.log"],
  "read-17": ["cat -A /home/agent/conf/app.conf"],
  "read-18": ["diff -u /home/agent/fw/rules_old.txt /home/agent/fw/rules_new.txt"],
  "read-19": ["head -n -3 /home/agent/logs/telemetry.log"],
  "shell-14": ["ls /home/agent/logs/log?.txt"],
  "shell-15": ["ls /no/such/dir 2> /home/agent/errors.txt"],
  "shell-16": ["cat /home/agent/reactor.log | grep WARN | wc -l"],
  "shell-17": ["find /home/agent/data -size +1k"],
  "shell-18": ["while read h; do echo \"checking $h\"; done < /home/agent/hosts.txt"],
  "shell-19": ["echo ${BACKUP_DIR:-/backup}"],
  "sys-14": ["df -h"],
  "sys-15": ["uname -r"],
  "sys-16": ["du -sh /var/log"],
  "sys-17": ["free -h"],
  "sys-18": ["uptime -p"],
  "sys-19": ["date -u \"+%Y-%m-%d %H:%M\""],
  "text-14": ["grep -c breach /home/agent/logs/alerts.log"],
  "text-15": ["grep -n vex /home/agent/crew/manifest.txt"],
  "text-16": ["cut -c 1-8 /home/agent/logs/access.dat"],
  "text-17": ["tr -d 0-9 < /home/agent/comms/noisy.txt"],
  "text-18": ["sed -n '3,5p' /home/agent/logs/vault.log"],
  "text-19": ["awk -F, '$3 > 100 {print $1}' /home/agent/logs/power.csv"],
};

function solutionFor(id: string, hint: string): string[] {
  if (id in NEWC_SOLUTIONS) return NEWC_SOLUTIONS[id];
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
ok(solved === 165, `165 challenges solved (got ${solved})`);
ok(
  Object.keys(snap.completed).length === 165,
  `165 completed in snapshot (got ${Object.keys(snap.completed).length})`
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
ok(stats.challengesDone === 165, "dashboard: 165 challenges done");
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
