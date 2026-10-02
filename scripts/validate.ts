/**
 * Full validation for every challenge: schema checks + solution playthrough.
 * Solutions with "__" magic tokens are skipped here (covered by playthrough.ts).
 *
 * Run: npx esbuild scripts/validate.ts --bundle --platform=node \
 *         --format=cjs --outfile=/tmp/validate.cjs && node /tmp/validate.cjs
 */
import { createShell } from "../lib/engine";
import { CHALLENGES } from "../data/challenges";
import { SOLUTIONS } from "../data/solutions";
import { checkChallenge } from "../lib/game/verifier";

const ZONE_PREFIX: Record<number, string> = {
  1: "nav",
  2: "read",
  3: "text",
  4: "perm",
  5: "proc",
  6: "net",
  7: "sys",
  8: "shell",
};
const VALID_XP = new Set([10, 20, 25, 30, 50]);
const RULE_TYPES = new Set([
  "fileExists",
  "fileAbsent",
  "fileContains",
  "perm",
  "historyMatches",
  "outputContains",
]);
const BANNED = /[—–]|delve|unleash|elevate|game-changer|dive in|embark|tapestry|cutting-edge|seamless|robust|leverage|furthermore|moreover|vibrant|bustling/i;

let failures = 0;
let checked = 0;
const fail = (msg: string): void => {
  failures++;
  console.log(`  FAIL ${msg}`);
};

// ---- schema: unique ids ----
{
  const seen = new Set<string>();
  for (const c of CHALLENGES) {
    if (seen.has(c.id)) fail(`duplicate id ${c.id}`);
    seen.add(c.id);
  }
}

// ---- schema: per-challenge fields ----
for (const c of CHALLENGES) {
  const prefix = ZONE_PREFIX[c.zone];
  if (!prefix) fail(`${c.id}: bad zone ${c.zone}`);
  const isBoss = c.id === `${prefix}-boss`;
  if (prefix && !isBoss && !new RegExp(`^${prefix}-\\d+$`).test(c.id)) {
    fail(`${c.id}: bad id format for zone ${c.zone}`);
  }
  if (!VALID_XP.has(c.xp)) fail(`${c.id}: bad xp ${c.xp}`);
  if (!c.title || !c.briefing || !c.task || !c.hint) {
    fail(`${c.id}: missing text field`);
  }
  if (BANNED.test(`${c.briefing} ${c.task} ${c.hint} ${c.title}`)) {
    fail(`${c.id}: banned word or em dash in copy`);
  }
  const rules = Array.isArray(c.verify) ? c.verify : [c.verify];
  if (rules.length === 0) fail(`${c.id}: no verify rules`);
  for (const r of rules) {
    if (!RULE_TYPES.has((r as { type: string }).type)) {
      fail(`${c.id}: bad rule type ${(r as { type: string }).type}`);
    }
  }
  if (!isBoss && !(c.id in SOLUTIONS)) {
    // Base challenges (<20) use hint-parsing in playthrough.ts; only new batches need explicit solutions.
    const num = parseInt(c.id.split("-")[1], 10);
    if (num >= 20) fail(`${c.id}: missing solution`);
  }
}

// ---- solution playthrough (isolated shell per challenge) ----
// Base challenges (<20) depend on persistent shell state across challenges;
// they are covered by scripts/playthrough.ts via the real GameStore.
for (const c of CHALLENGES) {
  if (c.id.endsWith("-boss")) continue;
  const num = parseInt(c.id.split("-")[1], 10);
  if (num < 20) continue;
  const sol = SOLUTIONS[c.id];
  if (!sol) continue;
  if (sol.some((cmd) => cmd.includes("__"))) continue; // magic tokens: playthrough covers
  checked++;
  const shell = createShell();
  try {
    shell.applySetup(c.setup ?? {});
    for (const cmd of sol) shell.execute(cmd);
    if (!checkChallenge(c, shell)) {
      fail(`${c.id}: solution does not satisfy verify rules`);
    }
  } catch (e) {
    fail(`${c.id}: solution threw ${(e as Error).message}`);
  }
}

console.log(
  failures === 0
    ? `\nVALIDATE GREEN: ${CHALLENGES.length} challenges, ${checked} solutions played`
    : `\n${failures} FAILURES`
);
process.exit(failures === 0 ? 0 : 1);
