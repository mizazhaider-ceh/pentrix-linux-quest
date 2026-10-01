"use client";

import { motion } from "framer-motion";

interface Props {
  secondsLeft: number;
  /** Full drill length in seconds, for the remaining-time bar. */
  total: number;
}

export default function BossTimer({ secondsLeft, total }: Props) {
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const critical = secondsLeft <= 10 && secondsLeft > 0;
  const danger = secondsLeft <= 30 && secondsLeft > 0;
  const frac = total > 0 ? Math.max(0, Math.min(1, secondsLeft / total)) : 0;

  return (
    <motion.div
      initial={false}
      animate={critical || danger ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
      transition={
        critical
          ? { repeat: Infinity, duration: 0.45 }
          : danger
            ? { repeat: Infinity, duration: 0.9 }
            : { duration: 0.2 }
      }
      className={`rounded border p-3 text-center ${
        danger ? "border-[#f87171]" : "border-[#232a3a]"
      }`}
      role="timer"
      aria-label={`Lockdown drill time remaining: ${mm} minutes ${ss} seconds`}
    >
      <p className="text-[10px] font-bold tracking-widest text-[#8b93a7]">
        LOCKDOWN DRILL
      </p>
      <p
        className={`mt-1 font-mono text-3xl font-bold tabular-nums ${
          danger ? "text-[#f87171]" : "text-[#fbbf24]"
        }`}
      >
        <motion.span
          key={secondsLeft}
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="inline-block"
        >
          {mm}:{ss}
        </motion.span>
      </p>
      <div
        className="mx-auto mt-2 h-1 max-w-[12rem] overflow-hidden rounded-full bg-[#232a3a]"
        aria-hidden="true"
      >
        <motion.div
          className={`h-full ${danger ? "bg-[#f87171]" : "bg-[#fbbf24]"}`}
          initial={false}
          animate={{ width: `${frac * 100}%` }}
          transition={{ duration: 0.5, ease: "linear" }}
        />
      </div>
      <p className="mt-2 text-[11px] text-[#8b93a7]">
        {critical
          ? "Ten seconds. Make them count."
          : danger
            ? "Thirty seconds. Finish it."
            : "The clock keeps running while you read hints."}
      </p>
    </motion.div>
  );
}
