"use client";

import { useEffect, useRef } from "react";
import { motion, type Variants } from "framer-motion";

interface Props {
  level: number;
  levelName: string;
  onClose: () => void;
}

const panel: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.12 } },
};

const line: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 28 },
  },
};

const numeral: Variants = {
  hidden: { opacity: 0, scale: 0.55 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 16 },
  },
};

export default function LevelUpModal({ level, levelName, onClose }: Props) {
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeBtn.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={`Level up: ${levelName}`}
    >
      <motion.div
        variants={panel}
        initial="hidden"
        animate="show"
        exit={{ opacity: 0, scale: 0.96, y: 8, transition: { duration: 0.18 } }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded border border-[#4ade80] bg-[#12161f] p-6 text-center"
      >
        <motion.p
          variants={line}
          className="text-xs font-bold tracking-[0.3em] text-[#4ade80]"
        >
          LEVEL UP
        </motion.p>
        <motion.p
          variants={numeral}
          className="mt-3 font-mono text-5xl font-bold tabular-nums text-[#e6e9f0]"
        >
          {level}
        </motion.p>
        <motion.p
          variants={line}
          className="mt-2 text-lg font-bold uppercase tracking-widest text-[#e6e9f0]"
        >
          {levelName}
        </motion.p>
        <motion.p variants={line} className="mt-3 text-sm text-[#8b93a7]">
          AXIOM has updated your file. The station is starting to notice.
        </motion.p>
        <motion.button
          variants={line}
          type="button"
          ref={closeBtn}
          onClick={onClose}
          whileTap={{ scale: 0.97 }}
          className="mt-5 rounded border border-[#4ade80] px-6 py-2 text-sm font-bold tracking-widest text-[#4ade80] transition-colors hover:bg-[#4ade80] hover:text-[#0b0e14] active:scale-[0.97]"
        >
          BACK TO WORK
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
