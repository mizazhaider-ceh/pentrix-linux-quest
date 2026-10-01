"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  name: string;
  lines: string[];
  objectives: string[];
  onBegin: () => void;
}

export default function ChapterIntro({ name, lines, objectives, onBegin }: Props) {
  // Type out each line in sequence, then reveal the objectives checklist.
  const [lineCount, setLineCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [objectivesShown, setObjectivesShown] = useState(false);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) {
      setLineCount(lines.length);
      setCharCount(lines[lines.length - 1]?.length ?? 0);
      setObjectivesShown(true);
      return;
    }
    if (lineCount >= lines.length) {
      const t = window.setTimeout(() => setObjectivesShown(true), 400);
      return () => window.clearTimeout(t);
    }
    const line = lines[lineCount];
    if (charCount < line.length) {
      const t = window.setTimeout(() => setCharCount((c) => c + 1), 18);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setLineCount((l) => l + 1);
      setCharCount(0);
    }, 350);
    return () => window.clearTimeout(t);
  }, [lineCount, charCount, lines, reduced]);

  const skip = () => {
    setLineCount(lines.length);
    setCharCount(lines[lines.length - 1]?.length ?? 0);
    setObjectivesShown(true);
  };

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col justify-center">
      <p className="text-xs font-bold tracking-widest text-[#8b93a7]">
        NEXUS BRIEFING
      </p>
      <h2 className="mt-1 text-2xl font-bold uppercase tracking-wide text-[#e6e9f0]">
        {name}
      </h2>

      <div className="mt-6 min-h-[8rem] space-y-3" aria-live="polite">
        {lines.slice(0, lineCount).map((line, i) => (
          <p key={i} className="font-mono text-sm leading-relaxed text-[#8b93a7]">
            {line}
          </p>
        ))}
        {lineCount < lines.length && (
          <p className="font-mono text-sm leading-relaxed text-[#e6e9f0]">
            {lines[lineCount].slice(0, charCount)}
            <span className="nexus-cursor" aria-hidden="true">_</span>
          </p>
        )}
      </div>

      <AnimatePresence initial={false}>
        {objectivesShown && (
          <motion.div
            key="objectives"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-6"
          >
            <div className="rounded border border-[#232a3a] bg-[#12161f] p-4">
              <p className="text-[11px] font-bold tracking-widest text-[#4ade80]">
                IN THIS CHAPTER YOU WILL LEARN
              </p>
              <ul className="mt-3 space-y-2">
                {objectives.map((o, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.12 }}
                    className="flex items-start gap-2 text-sm text-[#e6e9f0]"
                  >
                    <span
                      className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-[#4ade80] text-[10px] text-[#4ade80]"
                      aria-hidden="true"
                    >
                      &#10003;
                    </span>
                    {o}
                  </motion.li>
                ))}
              </ul>
            </div>

            <motion.button
              type="button"
              onClick={onBegin}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: objectives.length * 0.12 + 0.2 }}
              className="mt-6 w-full rounded border border-[#4ade80] bg-[#4ade80] px-4 py-3 text-sm font-bold tracking-widest text-[#0b0e14] transition-colors hover:bg-[#e6e9f0] hover:border-[#e6e9f0]"
            >
              BEGIN LESSONS
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {!objectivesShown && (
        <button
          type="button"
          onClick={skip}
          className="mt-6 self-start text-xs tracking-widest text-[#8b93a7] transition-colors hover:text-[#e6e9f0]"
        >
          SKIP INTRO &gt;&gt;
        </button>
      )}
    </div>
  );
}
