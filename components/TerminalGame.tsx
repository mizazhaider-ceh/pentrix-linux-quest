"use client";

/**
 * NEXUS: Linux Quest - game shell (UI worker).
 *
 * CONTRACT ASSUMPTIONS (locked with the engine + systems workers):
 *
 * 1. `import { Terminal } from '@/components/Terminal'`, props `{ shell: Shell }`.
 *    Terminal calls `shell.execute(input)` for each submitted line.
 * 2. `import { useGame } from '@/lib/game/useGame'` returns
 *    `{ shell, state, runCommand, useHint, startBoss, tickBoss,
 *       submitCtfFlag, resetAll, afterCommand, onEvent }`.
 * 3. Double-execution guard: TerminalGame passes Terminal a WRAPPED shell:
 *       execute: (input) => actions.runCommand(input)
 *    so challenge verification/XP runs exactly once per command, inside
 *    `store.runCommand()` (which also tracks mastery, man usage, and
 *    attempts), never in both the Terminal and the hook.
 * 4. `onEvent(cb)` subscribes to game events. Two shapes are accepted and
 *    normalized here:
 *      - contract shape: { kind, title, sub?, level?, levelName? } with kind in
 *        xp | levelup | achievement | challenge | hint | boss-start | boss-end | info
 *      - store shape (lib/game/store.ts): { type, ... } with type in
 *        xp | levelup | achievement | challenge-complete | zone-unlock |
 *        boss-start | boss-timeout | ctf-flag | graduated
 *    Level-up always opens the modal (needs level + levelName).
 * 5. UI-worker extension: `selectZone(z)` on the hook (unlocked zones only).
 *    TerminalGame falls back to local view state if the real hook omits it.
 * 6. `state.boss` is `{ zone, deadline } | null`; `tickBoss()` returns
 *    seconds left. Active challenge = first incomplete challenge in the
 *    current zone's order (boss challenge id ends with "-boss").
 *
 * Server components may NOT render this directly: app/page.tsx imports it
 * with `ssr: false` because xterm.js needs the browser DOM.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "xterm/css/xterm.css";
import { AnimatePresence, MotionConfig, motion, useAnimation } from "framer-motion";
import { Terminal } from "@/components/Terminal";
import {
  useGame,
  type GameActions,
  type GameEvent as StubGameEvent,
  type Shell,
} from "@/lib/game/useGame";
import { LEVELS } from "@/lib/game/store";
import { ZONES } from "@/data/zones";
import { CHALLENGES, type Challenge } from "@/data/challenges";
import { ACHIEVEMENTS } from "@/data/achievements";
import ZoneMap, { type ZoneProgress } from "@/components/ui/ZoneMap";
import Hud from "@/components/ui/Hud";
import BriefingPanel from "@/components/ui/BriefingPanel";
import Toasts, { type Toast } from "@/components/ui/Toasts";
import BossTimer from "@/components/ui/BossTimer";
import LevelUpModal from "@/components/ui/LevelUpModal";

function xpForNextLevel(xp: number): number {
  for (const m of LEVELS) {
    if (xp < m.xp) return m.xp - xp;
  }
  return 0;
}

interface UiEvent {
  kind: string;
  title: string;
  sub?: string;
  level?: number;
  levelName?: string;
}

/** Accept the stub contract shape and the real store shape. */
function normalizeEvent(e: StubGameEvent | Record<string, unknown>): UiEvent {
  if (typeof (e as StubGameEvent).kind === "string") {
    const s = e as StubGameEvent;
    return { kind: s.kind, title: s.title, sub: s.sub, level: s.level, levelName: s.levelName };
  }
  const t = e as Record<string, unknown>;
  switch (t.type) {
    case "xp":
      return { kind: "xp", title: `+${t.amount as number} XP`, sub: "Clean work." };
    case "levelup":
      return {
        kind: "levelup",
        title: `Level ${t.level as number}: ${t.levelName as string}`,
        level: t.level as number,
        levelName: t.levelName as string,
      };
    case "achievement": {
      const a = ACHIEVEMENTS.find((x) => x.id === (t.id as string));
      return {
        kind: "achievement",
        title: a ? a.name : (t.id as string),
        sub: a?.description ?? "The station noticed.",
      };
    }
    case "challenge-complete":
      return { kind: "challenge", title: "Challenge cleared", sub: `+${t.xp as number} XP` };
    case "zone-unlock": {
      const z = ZONES.find((x) => x.id === (t.zone as number));
      return {
        kind: "info",
        title: `Sector ${t.zone as number} unlocked`,
        sub: z ? z.name : undefined,
      };
    }
    case "boss-start":
      return {
        kind: "boss-start",
        title: "Lockdown drill started",
        sub: `${t.seconds as number}s on the clock. Breathe, then type.`,
      };
    case "boss-timeout":
      return { kind: "boss-end", title: "Time expired", sub: "The drill resets. No penalty, just pride." };
    case "ctf-flag":
      return { kind: "challenge", title: `Flag captured: ${t.flag as string}`, sub: "One step closer to the wall." };
    case "graduated":
      return { kind: "achievement", title: "Nexus Graduate", sub: "Your callsign is on the station wall." };
    default:
      return { kind: "info", title: "AXIOM" };
  }
}

interface TerminalGameProps {
  /** Optional: return to the chapter map (v2 flow). */
  onOpenMap?: () => void;
  /** Optional: re-read this chapter's lessons (v2 flow). */
  onOpenLessons?: () => void;
}

export default function TerminalGame({ onOpenMap, onOpenLessons }: TerminalGameProps) {
  const actions: GameActions = useGame();
  const { state, onEvent } = actions;

  // Zone selection: prefer the hook's selectZone; fall back to local view.
  const hookSelectZone = (actions as Partial<Pick<GameActions, "selectZone">>).selectZone;
  const [viewZone, setViewZone] = useState<number | null>(null);
  const effectiveZone = hookSelectZone ? state.zone : viewZone ?? state.zone;
  const handleSelectZone = useCallback(
    (z: number) => {
      if (hookSelectZone) hookSelectZone(z);
      else setViewZone(z);
    },
    [hookSelectZone]
  );

  // Wrapped shell: exactly one execute + afterCommand per command line.
  const wrappedShell: Shell = useMemo(
    () => ({
      ...actions.shell,
      execute: (input: string) => actions.runCommand(input),
    }),
    [actions]
  );

  // Toasts + level-up modal, fed by game events.
  const toastId = useRef(0);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [levelUp, setLevelUp] = useState<{ level: number; levelName: string } | null>(null);

  const pushToast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastId.current;
    setToasts((prev) => [...prev.slice(-4), { ...t, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 4500);
  }, []);
  const pushToastRef = useRef(pushToast);
  pushToastRef.current = pushToast;

  // Green border flash on the terminal when a challenge is cleared.
  // Driven imperatively so the Terminal (and its xterm instance) never remounts.
  const flashControls = useAnimation();
  const flashOnClear = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    void flashControls.start({
      boxShadow: [
        "0 0 0px rgba(74,222,128,0)",
        "0 0 26px rgba(74,222,128,0.45)",
        "0 0 0px rgba(74,222,128,0)",
      ],
      transition: { duration: 0.8, ease: "easeOut" },
    });
  }, [flashControls]);

  useEffect(() => {
    return onEvent((raw: StubGameEvent) => {
      const e = normalizeEvent(raw);
      if (e.kind === "levelup" && e.level && e.levelName) {
        setLevelUp({ level: e.level, levelName: e.levelName });
      }
      if (e.kind === "challenge") {
        flashOnClear();
      }
      pushToastRef.current({ kind: e.kind, title: e.title, sub: e.sub });
    });
  }, [onEvent, flashOnClear]);

  // Boss clock ticks through the contract's tickBoss(), with a deadline
  // fallback if the hook exposes boss state but no tickBoss.
  const bossState = (state as GameActions["state"]).boss ?? null;
  const [secondsLeft, setSecondsLeft] = useState(0);
  useEffect(() => {
    const tick = (): number => {
      if (typeof actions.tickBoss === "function") {
        try {
          return actions.tickBoss();
        } catch {
          // fall through to the deadline check
        }
      }
      const b = (actions.state as GameActions["state"]).boss;
      if (b && typeof b.deadline === "number") {
        return Math.max(0, Math.ceil((b.deadline - Date.now()) / 1000));
      }
      return 0;
    };
    setSecondsLeft(tick());
    const t = window.setInterval(() => setSecondsLeft(tick()), 1000);
    return () => window.clearInterval(t);
  }, [actions]);
  const bossActive = bossState !== null || secondsLeft > 0;

  // Challenge + progress math from real challenge data.
  const zoneChallenges = useMemo(
    () => CHALLENGES.filter((c) => c.zone === effectiveZone),
    [effectiveZone]
  );
  const standardChallenges = useMemo(
    () => zoneChallenges.filter((c) => !c.id.endsWith("-boss")),
    [zoneChallenges]
  );
  const bossChallenge: Challenge | null = useMemo(
    () => zoneChallenges.find((c) => c.id.endsWith("-boss")) ?? null,
    [zoneChallenges]
  );
  const activeChallenge: Challenge | null = useMemo(
    () => standardChallenges.find((c) => !state.completed[c.id]) ?? bossChallenge,
    [standardChallenges, bossChallenge, state.completed]
  );
  const activeCompleted = activeChallenge ? !!state.completed[activeChallenge.id] : true;

  const progress: Record<number, ZoneProgress> = useMemo(() => {
    const p: Record<number, ZoneProgress> = {};
    for (const z of ZONES) {
      const cs = CHALLENGES.filter((c) => c.zone === z.id);
      p[z.id] = {
        done: cs.filter((c) => state.completed[c.id]).length,
        total: cs.length,
      };
    }
    return p;
  }, [state.completed]);

  const bossUnlocked =
    !bossActive &&
    bossChallenge !== null &&
    standardChallenges.length > 0 &&
    standardChallenges.every((c) => state.completed[c.id]) &&
    !state.completed[bossChallenge.id];
  const bossCleared = bossChallenge !== null && !!state.completed[bossChallenge.id];

  const zoneName = ZONES.find((z) => z.id === effectiveZone)?.name ?? "Unknown";

  // Escalating hint text revealed for the current challenge.
  const [revealedHint, setRevealedHint] = useState<{ id: string; text: string } | null>(null);
  const handleRevealHint = useCallback(() => {
    const ch = activeChallenge;
    if (!ch) return;
    const text = actions.useHint(ch.id);
    if (text) setRevealedHint({ id: ch.id, text });
  }, [actions, activeChallenge]);

  // Clear the revealed hint when the active challenge changes.
  useEffect(() => {
    setRevealedHint(null);
  }, [activeChallenge?.id]);

  const handleReset = () => {
    if (
      window.confirm(
        "Wipe this run and start over? AXIOM will forget everything, including your XP."
      )
    ) {
      actions.resetAll();
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex min-h-screen flex-col bg-[#0b0e14] text-[#e6e9f0] lg:h-screen">
      {/* Header: mark + HUD, zone map below */}
      <header className="shrink-0 border-b border-[#232a3a] bg-[#12161f]">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 pt-3">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-[0.25em] text-[#4ade80]">
              NEXUS
            </span>
            <span className="text-xs tracking-widest text-[#8b93a7]">LINUX QUEST</span>
            <a
              href="/about"
              className="text-[11px] tracking-widest text-[#8b93a7] underline-offset-4 hover:text-[#4ade80] hover:underline"
            >
              HOW TO PLAY
            </a>
            {onOpenMap && (
              <button
                onClick={onOpenMap}
                className="text-[11px] tracking-widest text-[#8b93a7] underline-offset-4 hover:text-[#4ade80] hover:underline"
              >
                CHAPTER MAP
              </button>
            )}
            {onOpenLessons && (
              <button
                onClick={onOpenLessons}
                className="text-[11px] tracking-widest text-[#4ade80] underline-offset-4 hover:underline"
              >
                LESSONS
              </button>
            )}
          </div>
          <Hud
            xp={state.xp}
            xpForNext={xpForNextLevel(state.xp)}
            level={state.level}
            levelName={state.levelName}
            achUnlocked={state.achievements.length}
            achTotal={ACHIEVEMENTS.length}
            zoneName={zoneName}
          />
        </div>
        <div className="px-4 pb-3 pt-3">
          <ZoneMap
            zones={ZONES}
            unlockedZones={state.unlockedZones}
            progress={progress}
            current={effectiveZone}
            onSelect={handleSelectZone}
          />
        </div>
      </header>

      {/* Main split: terminal + side panel (stacks on mobile) */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="terminal-shell flex min-w-0 flex-1 flex-col p-4">
          <motion.div
            animate={flashControls}
            className="min-h-[65vh] flex-1 rounded border border-[#232a3a] lg:min-h-0"
          >
            <Terminal shell={wrappedShell} />
          </motion.div>
        </main>

        <aside className="flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-t border-[#232a3a] bg-[#12161f] p-4 lg:w-80 lg:border-l lg:border-t-0">
          <section aria-label="Briefing">
            <h2 className="mb-2 text-xs font-bold tracking-widest text-[#8b93a7]">
              BRIEFING
            </h2>
            <BriefingPanel
              challenge={activeChallenge}
              hintRevealed={activeChallenge ? revealedHint?.id === activeChallenge.id : false}
              hintText={activeChallenge && revealedHint?.id === activeChallenge.id ? revealedHint.text : null}
              onRevealHint={handleRevealHint}
              completed={activeCompleted}
            />
          </section>

          <section aria-label="Lockdown drill">
            <h2 className="mb-2 text-xs font-bold tracking-widest text-[#8b93a7]">
              LOCKDOWN DRILL
            </h2>
            {bossActive ? (
              <BossTimer secondsLeft={secondsLeft} total={bossState?.seconds ?? 0} />
            ) : bossCleared ? (
              <p className="rounded border border-[#4ade80] p-3 text-sm text-[#4ade80]">
                <span aria-hidden="true">&#10003;</span> Drill cleared. The sector holds.
              </p>
            ) : bossUnlocked ? (
              <div className="rounded border border-[#232a3a] p-3">
                <p className="text-sm text-[#e6e9f0]">
                  All 13 challenges done. The drill is ready when you are.
                </p>
                <button
                  type="button"
                  onClick={() => actions.startBoss()}
                  className="mt-3 w-full rounded border border-[#fbbf24] px-4 py-2 text-sm font-bold tracking-widest text-[#fbbf24] transition-all hover:bg-[#fbbf24] hover:text-[#0b0e14] active:scale-[0.98]"
                >
                  START LOCKDOWN DRILL
                </button>
                <p className="mt-2 text-[11px] leading-relaxed text-[#8b93a7]">
                  Timed. Hints escalate: free nudge, then 5 / 10 / 20 XP. The clock does not pause for them.
                </p>
              </div>
            ) : (
              <p className="rounded border border-[#232a3a] p-3 text-sm text-[#8b93a7]">
                Unlocks when every challenge in this sector is cleared.
              </p>
            )}
          </section>

          <section aria-label="Achievements">
            <h2 className="mb-2 text-xs font-bold tracking-widest text-[#8b93a7]">
              ACHIEVEMENTS
            </h2>
            <ul className="flex flex-col gap-1.5">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = state.achievements.includes(a.id);
                return (
                  <li
                    key={a.id}
                    title={a.description}
                    className={`flex items-center gap-2 rounded border px-2.5 py-1.5 text-xs ${
                      unlocked
                        ? "border-[#232a3a] text-[#e6e9f0]"
                        : "border-[#232a3a] text-[#8b93a7] opacity-50"
                    }`}
                  >
                    <span
                      className={unlocked ? "text-[#4ade80]" : "text-[#8b93a7]"}
                      aria-hidden="true"
                    >
                      {unlocked ? "▣" : "▢"}
                    </span>
                    <span className="font-bold tracking-wide">{a.name}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-label="Run controls" className="mt-auto">
            <button
              type="button"
              onClick={handleReset}
              className="w-full rounded border border-[#232a3a] px-4 py-2 text-xs tracking-widest text-[#8b93a7] transition-all hover:border-[#f87171] hover:text-[#f87171] active:scale-[0.98]"
            >
              RESET RUN
            </button>
            <p className="mt-3 text-center text-[10px] tracking-widest text-[#8b93a7]">
              PENTRIX // NEXUS-9 NIGHT SHIFT
            </p>
          </section>
        </aside>
      </div>

      {/* Overlays */}
      <Toasts toasts={toasts} />
      <AnimatePresence>
        {levelUp && (
          <LevelUpModal
            level={levelUp.level}
            levelName={levelUp.levelName}
            onClose={() => setLevelUp(null)}
          />
        )}
      </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
