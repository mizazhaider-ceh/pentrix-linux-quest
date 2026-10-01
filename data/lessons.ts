import type { Lesson } from "./lessons_a";
import { LESSONS_A } from "./lessons_a";
import { LESSONS_B } from "./lessons_b";
import { setLessonProvider } from "../lib/engine/commands";

export type { Lesson, LessonExample, LessonMistake } from "./lessons_a";

/** All 61 lessons, chapters 1-8 in order. */
export const LESSONS: Lesson[] = [...LESSONS_A, ...LESSONS_B];

export function lessonsForChapter(chapter: number): Lesson[] {
  return LESSONS.filter((l) => l.chapter === chapter);
}

export function lessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

/** Map of lesson id -> chapter id, for achievement checks. */
export const LESSON_CHAPTERS: Record<string, number> = Object.fromEntries(
  LESSONS.map((l) => [l.id, l.chapter])
);

/** Format a lesson as man-style text for the terminal `man` command. */
function formatLessonForMan(lesson: Lesson): string {
  const lines: string[] = [];
  lines.push(`LESSON: ${lesson.title}`);
  lines.push(`       ${lesson.what}`);
  lines.push(`       Syntax: ${lesson.syntax}`);
  for (const ex of lesson.examples.slice(0, 2)) {
    lines.push(`       $ ${ex.cmd}`);
  }
  lines.push(`       Why it matters: ${lesson.whyMatters}`);
  lines.push(`       Pro tip: ${lesson.proTip}`);
  return lines.join("\n") + "\n";
}

/** Wire lesson content into `man <command>` in the terminal. */
setLessonProvider((cmd: string) => {
  const lesson = LESSONS.find(
    (l) => l.command === cmd || l.id === `lsn-${cmd}`
  );
  return lesson ? formatLessonForMan(lesson) : null;
});
