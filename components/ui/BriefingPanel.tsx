"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { Challenge } from "@/data/challenges";

interface Props {
  challenge: Challenge | null;
  hintRevealed: boolean;
  onRevealHint: () => void;
  completed: boolean;
}

export default function BriefingPanel({ challenge, hintRevealed, onRevealHint, completed }: Props) {
  // Re-key when a challenge is cleared so the card swaps instead of just
  // flipping its border color.
  const cardKey = challenge ? `${challenge.id}-${completed ? "done" : "open"}` : "clear";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={cardKey}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className={`rounded border bg-[#12161f] p-4 ${
          completed || !challenge ? "border-[#4ade80]" : "border-[#232a3a]"
        }`}
        aria-live="polite"
      >
        {!challenge ? (
          <>
            <p className="text-xs font-bold tracking-widest text-[#4ade80]">SECTOR CLEAR</p>
            <p className="mt-2 text-sm text-[#e6e9f0]">
              Nothing left here. AXIOM is already writing you up.
            </p>
          </>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold uppercase tracking-wide text-[#e6e9f0]">
                {challenge.title}
              </h3>
              <span className="shrink-0 rounded bg-[#232a3a] px-2 py-0.5 text-[11px] font-bold tracking-widest text-[#fbbf24]">
                +{challenge.xp} XP
              </span>
            </div>

            {completed && (
              <p className="mt-2 text-xs font-bold tracking-widest text-[#4ade80]">
                <span aria-hidden="true">&#10003;</span> CLEARED
              </p>
            )}

            <p className="mt-2 text-sm leading-relaxed text-[#8b93a7]">{challenge.briefing}</p>

            {!completed && (
              <div className="mt-3 border-l-2 border-[#fbbf24] pl-3">
                <p className="text-[11px] font-bold tracking-widest text-[#fbbf24]">OBJECTIVE</p>
                <p className="mt-1 text-sm text-[#e6e9f0]">{challenge.task}</p>
              </div>
            )}

            {!completed && (
              <div className="mt-3">
                <AnimatePresence mode="wait" initial={false}>
                  {hintRevealed ? (
                    <motion.div
                      key="hint"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-[11px] font-bold tracking-widest text-[#8b93a7]">
                        AXIOM HINT
                      </p>
                      <p className="mt-1 rounded border border-[#232a3a] bg-[#0b0e14] p-2 font-mono text-xs leading-relaxed text-[#e6e9f0]">
                        {challenge.hint}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="reveal"
                      type="button"
                      onClick={onRevealHint}
                      exit={{ opacity: 0 }}
                      whileTap={{ scale: 0.97 }}
                      className="rounded border border-[#232a3a] px-3 py-1.5 text-xs tracking-widest text-[#8b93a7] transition-colors hover:border-[#fbbf24] hover:text-[#fbbf24] active:scale-[0.97]"
                    >
                      Reveal hint (-5 XP)
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
