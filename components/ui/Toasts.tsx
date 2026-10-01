"use client";

import { motion, AnimatePresence } from "framer-motion";

export interface Toast {
  id: number;
  kind: string;
  title: string;
  sub?: string;
}

interface Props {
  toasts: Toast[];
}

const KIND_STYLES: Record<string, string> = {
  achievement: "border-[#4ade80]",
  levelup: "border-[#4ade80]",
  challenge: "border-[#4ade80]",
  xp: "border-[#fbbf24]",
  "boss-start": "border-[#f87171]",
  "boss-end": "border-[#f87171]",
  hint: "border-[#232a3a]",
  info: "border-[#232a3a]",
};

const KIND_LABELS: Record<string, string> = {
  achievement: "ACHIEVEMENT",
  levelup: "LEVEL UP",
  challenge: "CHALLENGE",
  xp: "XP",
  "boss-start": "LOCKDOWN",
  "boss-end": "LOCKDOWN",
  hint: "HINT",
  info: "AXIOM",
};

export default function Toasts({ toasts }: Props) {
  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-72 flex-col gap-2"
      aria-live="polite"
    >
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 32, transition: { duration: 0.18, ease: "easeIn" } }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`rounded border-l-4 border border-[#232a3a] bg-[#12161f] p-3 shadow-lg ${
              KIND_STYLES[t.kind] ?? "border-[#232a3a]"
            } ${t.kind === "achievement" ? "toast-achievement" : ""}`}
          >
            <p className="text-[10px] font-bold tracking-widest text-[#8b93a7]">
              {KIND_LABELS[t.kind] ?? "AXIOM"}
            </p>
            <p className="mt-0.5 text-sm font-bold text-[#e6e9f0]">{t.title}</p>
            {t.sub && <p className="mt-0.5 text-xs text-[#8b93a7]">{t.sub}</p>}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
