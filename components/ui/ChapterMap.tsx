"use client";

import { motion } from "framer-motion";

export interface ChapterInfo {
  id: number;
  name: string;
  tagline: string;
}

export interface ChapterState {
  locked: boolean;
  learnDone: boolean;
  playDone: boolean;
  proveDone: boolean;
}

interface Props {
  chapters: ChapterInfo[];
  state: Record<number, ChapterState>;
  onSelect: (id: number) => void;
  current: number;
}

type PillState = "done" | "active" | "locked" | "idle";

const PILL_STYLES: Record<PillState, string> = {
  done: "border-[#4ade80] text-[#4ade80]",
  active: "border-[#fbbf24] text-[#fbbf24]",
  locked: "border-[#232a3a] text-[#8b93a7] opacity-40",
  idle: "border-[#232a3a] text-[#8b93a7]",
};

function pillState(done: boolean, chapterLocked: boolean, isCurrent: boolean): PillState {
  if (done) return "done";
  if (chapterLocked) return "locked";
  return isCurrent ? "active" : "idle";
}

export default function ChapterMap({ chapters, state, onSelect, current }: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <p className="text-xs font-bold tracking-widest text-[#8b93a7]">
        MISSION PATH
      </p>
      <h2 className="mt-1 text-xl font-bold uppercase tracking-wide text-[#e6e9f0]">
        Choose your chapter
      </h2>
      <p className="mt-1 text-sm text-[#8b93a7]">
        Clear each chapter to unlock the next. Every chapter runs LEARN, then
        PLAY, then PROVE.
      </p>

      <ol className="relative mt-8 space-y-0">
        {chapters.map((c, i) => {
          const s: ChapterState = state[c.id] ?? {
            locked: true,
            learnDone: false,
            playDone: false,
            proveDone: false,
          };
          const isCurrent = c.id === current;
          const isLast = i === chapters.length - 1;
          const num = String(c.id).padStart(2, "0");
          const done = s.learnDone && s.playDone && s.proveDone;

          return (
            <li key={c.id} className="relative flex gap-4 pb-8 last:pb-0">
              {/* Journey rail */}
              <div className="flex flex-col items-center" aria-hidden="true">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold ${
                    s.locked
                      ? "border-[#232a3a] text-[#8b93a7] opacity-40"
                      : done
                        ? "border-[#4ade80] bg-[#4ade80] text-[#0b0e14]"
                        : isCurrent
                          ? "border-[#fbbf24] text-[#fbbf24]"
                          : "border-[#232a3a] text-[#e6e9f0]"
                  }`}
                >
                  {done ? "\u2713" : num}
                </span>
                {!isLast && (
                  <span
                    className={`mt-1 w-px flex-1 ${
                      done ? "bg-[#4ade80]/50" : "bg-[#232a3a]"
                    }`}
                  />
                )}
              </div>

              {/* Chapter card */}
              <motion.div
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className={`flex-1 rounded border bg-[#12161f] p-4 ${
                  s.locked ? "opacity-45" : ""
                } ${
                  isCurrent && !s.locked
                    ? "border-[#fbbf24]"
                    : "border-[#232a3a]"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold tracking-widest text-[#8b93a7]">
                      CHAPTER {num}
                      {isCurrent && !s.locked && (
                        <span className="ml-2 text-[#fbbf24]">CURRENT</span>
                      )}
                      {done && <span className="ml-2 text-[#4ade80]">CLEARED</span>}
                    </p>
                    <h3 className="mt-0.5 text-base font-bold uppercase tracking-wide text-[#e6e9f0]">
                      {c.name}
                    </h3>
                    <p className="mt-1 text-sm text-[#8b93a7]">{c.tagline}</p>
                  </div>
                  {s.locked && (
                    <span className="shrink-0 text-[10px] tracking-widest text-[#8b93a7]">
                      LOCK
                    </span>
                  )}
                </div>

                {/* Phase pills */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {(
                    [
                      ["LEARN", s.learnDone],
                      ["PLAY", s.playDone],
                      ["PROVE", s.proveDone],
                    ] as const
                  ).map(([label, phaseDone]) => {
                    const ps = pillState(phaseDone, s.locked, isCurrent);
                    return (
                      <span
                        key={label}
                        className={`rounded border px-2.5 py-1 text-[11px] font-bold tracking-widest ${PILL_STYLES[ps]}`}
                      >
                        {phaseDone ? "\u2713 " : ""}
                        {label}
                      </span>
                    );
                  })}
                </div>

                <button
                  type="button"
                  disabled={s.locked}
                  onClick={() => onSelect(c.id)}
                  className={`mt-4 rounded border px-4 py-2 text-xs font-bold tracking-widest transition-colors ${
                    s.locked
                      ? "cursor-not-allowed border-[#232a3a] text-[#8b93a7]"
                      : isCurrent
                        ? "border-[#fbbf24] text-[#fbbf24] hover:bg-[#fbbf24]/10"
                        : done
                          ? "border-[#232a3a] text-[#8b93a7] hover:border-[#4ade80] hover:text-[#4ade80]"
                          : "border-[#232a3a] text-[#e6e9f0] hover:border-[#4ade80] hover:text-[#4ade80]"
                  }`}
                >
                  {s.locked ? "LOCKED" : done ? "REPLAY" : isCurrent ? "CONTINUE" : "OPEN"}
                </button>
              </motion.div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
