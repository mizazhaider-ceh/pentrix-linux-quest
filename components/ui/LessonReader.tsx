"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export interface LessonExample {
  cmd: string;
  output: string;
  note?: string;
}

export interface LessonMistake {
  wrong: string;
  why: string;
  fix: string;
}

export interface Lesson {
  command: string;
  title: string;
  what: string;
  syntax: string;
  examples: LessonExample[];
  whyMatters: string;
  mistakes: LessonMistake[];
  proTip: string;
}

interface Props {
  lesson: Lesson;
  onComplete: () => void;
  index: number;
  total: number;
}

export default function LessonReader({ lesson, onComplete, index, total }: Props) {
  const [copied, setCopied] = useState(false);

  const copySyntax = async () => {
    try {
      await navigator.clipboard.writeText(lesson.syntax);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="mx-auto w-full max-w-3xl">
      {/* Progress header */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold tracking-widest text-[#8b93a7]">
          LESSON {index + 1} OF {total}
        </p>
        <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#232a3a]" aria-hidden="true">
          <motion.div
            className="h-full bg-[#4ade80]"
            initial={{ width: 0 }}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Title */}
      <motion.div
        key={lesson.command}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6"
      >
        <p className="font-mono text-sm font-bold text-[#4ade80]">{lesson.command}</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#e6e9f0]">
          {lesson.title}
        </h2>

        {/* What */}
        <p className="mt-4 text-[11px] font-bold tracking-widest text-[#8b93a7]">WHAT IT DOES</p>
        <p className="mt-1 text-sm leading-relaxed text-[#e6e9f0]">{lesson.what}</p>

        {/* Syntax */}
        <p className="mt-6 text-[11px] font-bold tracking-widest text-[#8b93a7]">SYNTAX</p>
        <div className="relative mt-2">
          <pre className="overflow-x-auto rounded border border-[#232a3a] bg-[#0b0e14] p-3 font-mono text-sm text-[#e6e9f0]">
            {lesson.syntax}
          </pre>
          <button
            type="button"
            onClick={copySyntax}
            aria-label="Copy syntax to clipboard"
            className="absolute right-2 top-2 rounded border border-[#232a3a] bg-[#12161f] px-2.5 py-1 text-[11px] tracking-widest text-[#8b93a7] transition-colors hover:border-[#4ade80] hover:text-[#4ade80]"
          >
            {copied ? "COPIED" : "COPY"}
          </button>
        </div>

        {/* Examples */}
        <p className="mt-6 text-[11px] font-bold tracking-widest text-[#8b93a7]">EXAMPLES</p>
        <div className="mt-2 space-y-3">
          {lesson.examples.map((ex, i) => (
            <div
              key={i}
              className="overflow-hidden rounded border border-[#232a3a] bg-[#0b0e14]"
            >
              <div className="border-b border-[#232a3a] px-3 py-2 font-mono text-sm">
                <span className="text-[#4ade80]">$ </span>
                <span className="text-[#4ade80]">{ex.cmd}</span>
              </div>
              <pre className="whitespace-pre-wrap px-3 py-2 font-mono text-sm text-[#8b93a7]">
                {ex.output}
              </pre>
              {ex.note && (
                <p className="border-t border-[#232a3a] px-3 py-2 text-xs text-[#8b93a7]">
                  <span className="font-bold tracking-widest text-[#fbbf24]">NOTE </span>
                  {ex.note}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Why it matters */}
        <div className="mt-6 border-l-2 border-[#fbbf24] pl-3">
          <p className="text-[11px] font-bold tracking-widest text-[#fbbf24]">
            WHY IT MATTERS
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#e6e9f0]">
            {lesson.whyMatters}
          </p>
        </div>

        {/* Mistakes */}
        {lesson.mistakes.length > 0 && (
          <>
            <p className="mt-6 text-[11px] font-bold tracking-widest text-[#8b93a7]">
              COMMON MISTAKES
            </p>
            <div className="mt-2 space-y-2">
              {lesson.mistakes.map((m, i) => (
                <div
                  key={i}
                  className="rounded border border-[#232a3a] bg-[#12161f] p-3"
                >
                  <p className="font-mono text-sm text-[#f87171]">
                    <span className="line-through opacity-80">{m.wrong}</span>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-[#8b93a7]">{m.why}</p>
                  <p className="mt-2 font-mono text-sm">
                    <span className="text-[#8b93a7]">&gt;&gt; </span>
                    <span className="text-[#4ade80]">{m.fix}</span>
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pro tip */}
        <div className="mt-6 rounded border border-[#4ade80] bg-[#0b0e14] p-3">
          <p className="text-[11px] font-bold tracking-widest text-[#4ade80]">
            PRO TIP
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[#e6e9f0]">{lesson.proTip}</p>
        </div>

        {/* Complete button */}
        <motion.button
          type="button"
          onClick={onComplete}
          whileTap={{ scale: 0.97 }}
          className="mt-8 w-full rounded border border-[#4ade80] bg-[#4ade80] px-4 py-3 text-sm font-bold tracking-widest text-[#0b0e14] transition-colors hover:bg-[#e6e9f0] hover:border-[#e6e9f0]"
        >
          MARK LESSON COMPLETE
        </motion.button>
      </motion.div>
    </article>
  );
}
