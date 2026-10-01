"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  xp: number;
  xpForNext: number;
  level: number;
  levelName: string;
  achUnlocked: number;
  achTotal: number;
  zoneName: string;
}

/**
 * Ease the displayed XP toward its target so gains feel earned.
 * Jumps straight to the target under prefers-reduced-motion.
 */
function useCountUp(target: number, duration = 650): number {
  const [display, setDisplay] = useState(target);
  const fromRef = useRef(target);

  useEffect(() => {
    const from = fromRef.current;
    fromRef.current = target;
    if (from === target) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return display;
}

export default function Hud({
  xp,
  xpForNext,
  level,
  levelName,
  achUnlocked,
  achTotal,
  zoneName,
}: Props) {
  const maxed = xpForNext <= 0;
  const pct = maxed ? 100 : Math.min(100, Math.max(0, (xp / (xp + xpForNext)) * 100));
  const shownXp = useCountUp(xp);

  return (
    <div
      className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2"
      aria-label="Player status"
    >
      <div className="flex items-center gap-2">
        <span className="rounded border border-[#4ade80] px-2 py-0.5 text-xs font-bold tracking-widest text-[#4ade80]">
          LVL {level}
        </span>
        <span className="text-xs font-bold uppercase tracking-widest text-[#e6e9f0]">
          {levelName}
        </span>
      </div>

      <div className="flex min-w-[8rem] flex-1 items-center gap-2 sm:max-w-[14rem]">
        <div
          className="h-2 flex-1 overflow-hidden rounded-full bg-[#232a3a]"
          role="progressbar"
          aria-valuenow={xp}
          aria-valuemax={xp + xpForNext}
          aria-label="Experience progress"
        >
          <motion.div
            className="h-full rounded-full bg-[#4ade80]"
            initial={false}
            animate={{ width: `${pct}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <span className="whitespace-nowrap text-[11px] tabular-nums tracking-widest text-[#8b93a7]">
          {maxed ? `${shownXp} XP` : `${shownXp} / ${xp + xpForNext} XP`}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] tracking-widest text-[#8b93a7]">
        <span className="text-[#fbbf24]" aria-hidden="true">
          &#9733;
        </span>
        <motion.span
          key={achUnlocked}
          initial={{ scale: 1.3 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 18 }}
          className="inline-block"
        >
          {achUnlocked}/{achTotal} ACH
        </motion.span>
      </div>

      <div className="text-[11px] tracking-widest text-[#8b93a7]">
        ZONE <span className="font-bold text-[#fbbf24]">{zoneName.toUpperCase()}</span>
      </div>
    </div>
  );
}
