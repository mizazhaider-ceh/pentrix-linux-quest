"use client";

import { useEffect, useMemo, useState } from "react";
import { useGame } from "@/lib/game/useGame";
import TerminalGame from "./TerminalGame";import ChapterMap, { type ChapterState } from "./ui/ChapterMap";
import ChapterIntro from "./ui/ChapterIntro";
import LessonReader from "./ui/LessonReader";
import ChapterRecap from "./ui/ChapterRecap";
import Onboarding from "./ui/Onboarding";
import Dashboard from "./ui/Dashboard";
import { CHAPTERS, ONBOARDING } from "@/data/chapters";
import { lessonsForChapter } from "@/data/lessons";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { masteryLevel } from "@/lib/game/coach";

type View =
  | { name: "map" }
  | { name: "dashboard" }
  | { name: "intro"; chapter: number }
  | { name: "lessons"; chapter: number; index: number }
  | { name: "play"; chapter: number }
  | { name: "recap"; chapter: number };

const CHAPTER_IDS = [1, 2, 3, 4, 5, 6, 7, 8];

/**
 * GameFlow: the v2 Learn -> Play -> Prove loop.
 *
 * map: chapter select hub (replaces the old zone-first landing)
 * intro -> lessons -> play -> recap: the per-chapter journey
 * dashboard: command-center stats
 */
export default function GameFlow() {
  const actions = useGame();
  const { state } = actions;
  const [view, setView] = useState<View>({ name: "map" });
  const [xpAtPlayStart, setXpAtPlayStart] = useState(0);

  const chapterState = useMemo(() => {
    const out: Record<number, ChapterState> = {};
    for (const ch of CHAPTER_IDS) {
      const phase = actions.chapterPhase(ch);
      out[ch] = {
        locked: !state.unlockedZones.includes(ch),
        learnDone: phase.learn,
        playDone: phase.play,
        proveDone: phase.prove,
      };
    }
    return out;
  }, [actions, state.unlockedZones]);

  const chapters = useMemo(
    () =>
      CHAPTERS.map((c) => ({
        id: c.chapter,
        name: c.name,
        tagline: c.objectives[0] ?? "",
      })),
    []
  );

  // Keep the store zone glued to the chapter being played. When the boss of
  // the chapter is cleared, the flow moves to the recap view.
  useEffect(() => {
    if (view.name !== "play") return;
    const phase = actions.chapterPhase(view.chapter);
    if (phase.prove) {
      setView({ name: "recap", chapter: view.chapter });
      return;
    }
    if (state.zone !== view.chapter) {
      actions.selectZone(view.chapter);
    }
  }, [view, state.zone, state.completed, actions]);

  const enterPlay = (chapter: number) => {
    setXpAtPlayStart(state.xp);
    actions.selectZone(chapter);
    setView({ name: "play", chapter });
  };

  const handleSelectChapter = (id: number) => {
    const st = chapterState[id];
    if (!st || st.locked) return;
    if (!st.learnDone) {
      setView({ name: "intro", chapter: id });
    } else {
      enterPlay(id);
    }
  };

  const handleLessonComplete = (chapter: number, index: number) => {
    const lessons = lessonsForChapter(chapter);
    const lesson = lessons[index];
    if (lesson) actions.viewLesson(lesson.id);
    if (index + 1 >= lessons.length) {
      enterPlay(chapter);
    } else {
      setView({ name: "lessons", chapter, index: index + 1 });
    }
  };

  const stats = actions.getDashboardStats();
  const mastery = useMemo(
    () =>
      Object.entries(state.mastery)
        .filter(([, m]) => m.solves >= 3)
        .map(([command, m]) => ({
          command,
          level: masteryLevel(m),
        })),
    [state.mastery]
  );

  return (
    <div className="min-h-screen bg-[#0b0e14] text-[#e6e9f0]">
      {!state.onboarded && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0b0e14]/95">
          <Onboarding lines={ONBOARDING} onDone={() => actions.setOnboarded()} />
        </div>
      )}

      {view.name === "map" && (
        <div className="mx-auto max-w-5xl px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-base font-bold tracking-[0.25em] text-[#4ade80]">
                NEXUS
              </p>
              <p className="text-xs tracking-widest text-[#8b93a7]">LINUX QUEST</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-[#8b93a7]">
                Lv {state.level} {state.levelName}
              </span>
              <span className="font-mono font-bold text-[#fbbf24]">{state.xp} XP</span>
              <button
                onClick={() => setView({ name: "dashboard" })}
                className="rounded border border-[#232a3a] px-3 py-1.5 tracking-widest text-[#8b93a7] transition-colors hover:border-[#4ade80] hover:text-[#4ade80]"
              >
                DASHBOARD
              </button>
            </div>
          </div>
          <ChapterMap
            chapters={chapters}
            state={chapterState}
            onSelect={handleSelectChapter}
            current={state.zone <= 8 ? state.zone : 8}
          />
          <p className="mt-6 text-center text-xs text-[#8b93a7]">
            {state.achievements.length}/{ACHIEVEMENTS.length} achievements unlocked
          </p>
        </div>
      )}

      {view.name === "dashboard" && (
        <div className="mx-auto max-w-5xl px-4 py-8">
          <button
            onClick={() => setView({ name: "map" })}
            className="mb-6 text-[11px] tracking-widest text-[#8b93a7] underline-offset-4 hover:text-[#4ade80] hover:underline"
          >
            &larr; CHAPTER MAP
          </button>
          <Dashboard stats={stats} mastery={mastery} />
        </div>
      )}

      {view.name === "intro" &&
        (() => {
          const meta = CHAPTERS.find((c) => c.chapter === view.chapter);
          if (!meta) return null;
          return (
            <div className="mx-auto max-w-3xl px-4 py-8">
              <ChapterIntro
                name={meta.name}
                lines={meta.introLines}
                objectives={meta.objectives}
                onBegin={() => setView({ name: "lessons", chapter: view.chapter, index: 0 })}
              />
            </div>
          );
        })()}

      {view.name === "lessons" &&
        (() => {
          const lessons = lessonsForChapter(view.chapter);
          const lesson = lessons[view.index];
          if (!lesson) return null;
          return (
            <div className="mx-auto max-w-3xl px-4 py-8">
              <LessonReader
                lesson={lesson}
                index={view.index}
                total={lessons.length}
                onComplete={() => handleLessonComplete(view.chapter, view.index)}
              />
            </div>
          );
        })()}

      {view.name === "play" && (
        <TerminalGame
          onOpenMap={() => setView({ name: "map" })}
          onOpenLessons={() =>
            setView({ name: "lessons", chapter: view.chapter, index: 0 })
          }
        />
      )}

      {view.name === "recap" &&
        (() => {
          const meta = CHAPTERS.find((c) => c.chapter === view.chapter);
          if (!meta) return null;
          const commandsLearned = lessonsForChapter(view.chapter).map((l) => l.command);
          return (
            <div className="mx-auto max-w-3xl px-4 py-8">
              <ChapterRecap
                name={meta.name}
                recap={meta.recap}
                commandsLearned={commandsLearned}
                xpEarned={Math.max(0, state.xp - xpAtPlayStart)}
                quiz={meta.quiz}
                onQuizDone={(score) => actions.submitQuiz(view.chapter, score, meta.quiz.length)}
                onNext={() => setView({ name: "map" })}
              />
            </div>
          );
        })()}
    </div>
  );
}
