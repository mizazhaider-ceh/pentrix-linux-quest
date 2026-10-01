"use client";

import { motion } from "framer-motion";

interface Props {
  lines: string[];
  onDone: () => void;
}

const PHASES = [
  {
    name: "LEARN",
    accent: "green",
    desc: "Read the lesson. Know the command, the flags, and why it matters before you touch a keyboard.",
  },
  {
    name: "PLAY",
    accent: "amber",
    desc: "Run the challenges in the live terminal. Break things safely, read the output, and find the flag.",
  },
  {
    name: "PROVE",
    accent: "dim",
    desc: "Pass the debrief quiz. Prove the knowledge stuck, bank the XP, and unlock the next chapter.",
  },
] as const;

export default function Onboarding({ lines, onDone }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0e14]"
      role="dialog"
      aria-modal="true"
      aria-label="How NEXUS works"
    >
      <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col justify-center px-4 py-10">
        <p className="text-xs font-bold tracking-widest text-[#8b93a7]">
          WELCOME, OPERATOR
        </p>
        <h2 className="mt-1 text-2xl font-bold uppercase tracking-wide text-[#e6e9f0]">
          How NEXUS works
        </h2>

        <div className="mt-6 space-y-2">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.2 + i * 0.15 }}
              className="text-sm leading-relaxed text-[#8b93a7]"
            >
              <span className="mr-2 font-mono text-[#4ade80]" aria-hidden="true">
                &gt;
              </span>
              {line}
            </motion.p>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {PHASES.map((p, i) => {
            const accentCls =
              p.accent === "green"
                ? "border-[#4ade80] text-[#4ade80]"
                : p.accent === "amber"
                  ? "border-[#fbbf24] text-[#fbbf24]"
                  : "border-[#8b93a7] text-[#8b93a7]";
            return (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.4 + i * 0.15 }}
                className="flex flex-col rounded border border-[#232a3a] bg-[#12161f] p-4"
              >
                <span
                  className={`self-start rounded border px-2.5 py-1 text-[11px] font-bold tracking-widest ${accentCls}`}
                >
                  {String(i + 1).padStart(2, "0")} {p.name}
                </span>
                <p className="mt-3 text-sm leading-relaxed text-[#e6e9f0]">
                  {p.desc}
                </p>
              </motion.div>
            );
          })}
        </div>

        <motion.button
          type="button"
          onClick={onDone}
          whileTap={{ scale: 0.97 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 w-full rounded border border-[#4ade80] bg-[#4ade80] px-4 py-3 text-sm font-bold tracking-widest text-[#0b0e14] transition-colors hover:bg-[#e6e9f0] hover:border-[#e6e9f0]"
        >
          START CHAPTER 1
        </motion.button>
      </div>
    </motion.div>
  );
}
