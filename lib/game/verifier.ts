import type { Challenge, VerifyRule } from "../../data/challenges";
import type { Shell } from "./engine-contract";

/**
 * Normalize a permission mode to a canonical 3-digit octal string.
 * Accepts "755", "0755", and symbolic forms like "-rwxr-xr-x".
 */
function normalizeMode(mode: string): string {
  const m = mode.trim();
  const symbolic = /^[-dl][rwx-]{9}$/.exec(m);
  if (symbolic) {
    const bits = m.slice(1);
    let out = "";
    for (let i = 0; i < 9; i += 3) {
      const triple = bits.slice(i, i + 3);
      out += String(
        (triple[0] === "r" ? 4 : 0) +
          (triple[1] === "w" ? 2 : 0) +
          (triple[2] === "x" ? 1 : 0)
      );
    }
    return out;
  }
  const digits = m.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length > 3) return digits.slice(-3);
  return digits.padStart(3, "0");
}

/**
 * Evaluate a single verification rule against the current shell state.
 * Never throws: any error returns false.
 */
export function evaluateRule(rule: VerifyRule, shell: Shell): boolean {
  try {
    switch (rule.type) {
      case "fileExists":
        return shell.fileExists(rule.path);
      case "fileAbsent":
        return !shell.fileExists(rule.path);
      case "fileContains": {
        const content = shell.readFile(rule.path);
        return content !== null && content.includes(rule.text);
      }
      case "perm": {
        const mode = shell.getMode(rule.path);
        return mode !== null && normalizeMode(mode) === normalizeMode(rule.mode);
      }
      case "historyMatches": {
        const re = new RegExp(rule.regex, "m");
        return re.test(shell.getHistory().join("\n"));
      }
      case "outputContains":
        return shell.getLastOutput().includes(rule.text);
      default:
        return false;
    }
  } catch {
    return false;
  }
}

/**
 * A challenge is complete when every rule in its verify array passes.
 * A single (non-array) rule is also accepted. Never throws.
 */
export function checkChallenge(ch: Challenge, shell: Shell): boolean {
  try {
    const rules: VerifyRule[] = Array.isArray(ch.verify) ? ch.verify : [ch.verify];
    return rules.every((rule) => evaluateRule(rule, shell));
  } catch {
    return false;
  }
}
