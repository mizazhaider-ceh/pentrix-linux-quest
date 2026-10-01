"use client";

import { motion } from "framer-motion";

export interface DashboardStats {
  chaptersDone: number;
  lessonsViewed: number;
  lessonsTotal: number;
  challengesDone: number;
  challengesTotal: number;
  accuracy: number;
  bestStreak: number;
  xp: number;
  levelName: string;
}

export interface MasteredCommand {
  command: string;
  level: string;
}

interface Props {
  stats: DashboardStats;
  mastery: MasteredCommand[];
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#232a3a] bg-[#12161f] p-4">
      <p className="text-[11px] font-bold tracking-widest text-[#8b93a7]">{label}</p>
      <p className="mt-1 font-mono text-2xl font-bold text-[#e6e9f0]">{value}</p>
    </div>
  );
}

export default function Dashboard({ stats, mastery }: Props) {
  const lessonPct =
    stats.lessonsTotal > 0 ? (stats.lessonsViewed / stats.lessonsTotal) * 100 : 0;
  const challengePct =
    stats.challengesTotal > 0
      ? (stats.challengesDone / stats.challengesTotal) * 100
      : 0;

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-widest text-[#8b93a7]">
            OPERATOR DOSSIER
          </p>
          <h2 className="mt-1 text-2xl font-bold uppercase tracking-wide text-[#e6e9f0]">
            Progress
          </h2>
        </div>
        <div className="rounded border border-[#4ade80] bg-[#0b0e14] px-4 py-2 text-right">
          <p className="text-[10px] font-bold tracking-widest text-[#4ade80]">LEVEL</p>
          <p className="font-mono text-lg font-bold text-[#4ade80]">
            {stats.levelName}
          </p>
          <p className="font-mono text-xs text-[#8b93a7]">{stats.xp} XP</p>
        </div>
      </div>

      {/* Stat tiles */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
        className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
      >
        {[
          { label: "CHAPTERS DONE", value: String(stats.chaptersDone) },
          {
            label: "LESSONS",
            value: `${stats.lessonsViewed}/${stats.lessonsTotal}`,
          },
          {
            label: "CHALLENGES",
            value: `${stats.challengesDone}/${stats.challengesTotal}`,
          },
          { label: "ACCURACY", value: `${stats.accuracy}%` },
          { label: "BEST STREAK", value: String(stats.bestStreak) },
        ].map((t) => (
          <motion.div
            key={t.label}
            variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
          >
            <Tile label={t.label} value={t.value} />
          </motion.div>
        ))}
      </motion.div>

      {/* Chapter progress bar */}
      <div className="mt-6 rounded border border-[#232a3a] bg-[#12161f] p-4">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-widest text-[#8b93a7]">
            LESSON PROGRESS
          </p>
          <p className="font-mono text-xs text-[#8b93a7]">
            {stats.lessonsViewed}/{stats.lessonsTotal}
          </p>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#0b0e14]"
          role="progressbar"
          aria-valuenow={Math.round(lessonPct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Lesson progress"
        >
          <motion.div
            className="h-full bg-[#4ade80]"
            initial={{ width: 0 }}
            animate={{ width: `${lessonPct}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-[11px] font-bold tracking-widest text-[#8b93a7]">
            CHALLENGE PROGRESS
          </p>
          <p className="font-mono text-xs text-[#8b93a7]">
            {stats.challengesDone}/{stats.challengesTotal}
          </p>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#0b0e14]"
          role="progressbar"
          aria-valuenow={Math.round(challengePct)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Challenge progress"
        >
          <motion.div
            className="h-full bg-[#fbbf24]"
            initial={{ width: 0 }}
            animate={{ width: `${challengePct}%` }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
          />
        </div>
      </div>

      {/* Top mastered commands */}
      <div className="mt-6 rounded border border-[#232a3a] bg-[#12161f] p-4">
        <p className="text-[11px] font-bold tracking-widest text-[#8b93a7]">
          TOP MASTERED COMMANDS
        </p>
        {mastery.length === 0 ? (
          <p className="mt-2 text-sm text-[#8b93a7]">
            No commands mastered yet. Clear lessons to start the list.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {mastery.map((m, i) => (
              <motion.li
                key={m.command}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: i * 0.05 }}
                className="flex items-center justify-between gap-2 rounded border border-[#232a3a] bg-[#0b0e14] px-3 py-2"
              >
                <span className="font-mono text-sm text-[#e6e9f0]">
                  <span className="mr-2 text-[#8b93a7]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {m.command}
                </span>
                <span className="rounded border border-[#4ade80] px-2 py-0.5 text-[11px] font-bold tracking-widest text-[#4ade80]">
                  {m.level}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
