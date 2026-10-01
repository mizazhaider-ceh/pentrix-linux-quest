"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface QuizQuestion {
  q: string;
  options: string[];
  answer: number;
  explain: string;
}

interface Props {
  name: string;
  recap: string[];
  commandsLearned: string[];
  xpEarned: number;
  quiz: QuizQuestion[];
  onQuizDone: (score: number) => void;
  onNext: () => void;
}

type Stage = "recap" | "quiz" | "results";

export default function ChapterRecap({
  name,
  recap,
  commandsLearned,
  xpEarned,
  quiz,
  onQuizDone,
  onNext,
}: Props) {
  const [stage, setStage] = useState<Stage>("recap");
  const [currentQ, setCurrentQ] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const q = quiz[currentQ];
  const correct = picked === q.answer;

  const startQuiz = () => setStage("quiz");

  const submitAnswer = () => {
    if (picked === null) return;
    if (correct) setScore((s) => s + 1);
    setSubmitted(true);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= quiz.length) {
      setStage("results");
      onQuizDone(score + (correct ? 1 : 0));
    } else {
      setCurrentQ((c) => c + 1);
      setPicked(null);
      setSubmitted(false);
    }
  };

  const finalScore = score;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <AnimatePresence mode="wait" initial={false}>
        {stage === "recap" && (
          <motion.div
            key="recap"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-xs font-bold tracking-widest text-[#8b93a7]">
              CHAPTER CLEARED
            </p>
            <h2 className="mt-1 text-2xl font-bold uppercase tracking-wide text-[#e6e9f0]">
              {name} debrief
            </h2>

            {/* Recap lines */}
            <div className="mt-6 space-y-3">
              {recap.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.1 }}
                  className="border-l-2 border-[#232a3a] pl-3 text-sm leading-relaxed text-[#e6e9f0]"
                >
                  {line}
                </motion.p>
              ))}
            </div>

            {/* Commands mastered */}
            <div className="mt-6 rounded border border-[#232a3a] bg-[#12161f] p-4">
              <p className="text-[11px] font-bold tracking-widest text-[#4ade80]">
                COMMANDS MASTERED
              </p>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {commandsLearned.map((cmd) => (
                  <li
                    key={cmd}
                    className="flex items-center gap-2 rounded border border-[#232a3a] bg-[#0b0e14] px-3 py-2 font-mono text-sm text-[#e6e9f0]"
                  >
                    <span className="text-[#4ade80]" aria-hidden="true">
                      &#10003;
                    </span>
                    {cmd}
                  </li>
                ))}
              </ul>
            </div>

            {/* XP earned */}
            <div className="mt-6 flex items-center justify-between rounded border border-[#fbbf24] bg-[#0b0e14] p-4">
              <p className="text-xs font-bold tracking-widest text-[#fbbf24]">XP EARNED</p>
              <p className="font-mono text-2xl font-bold text-[#fbbf24]">+{xpEarned}</p>
            </div>

            <motion.button
              type="button"
              onClick={startQuiz}
              whileTap={{ scale: 0.97 }}
              className="mt-6 w-full rounded border border-[#4ade80] px-4 py-3 text-sm font-bold tracking-widest text-[#4ade80] transition-colors hover:bg-[#4ade80] hover:text-[#0b0e14]"
            >
              TAKE THE DEBRIEF QUIZ ({quiz.length} QUESTIONS)
            </motion.button>
          </motion.div>
        )}

        {stage === "quiz" && (
          <motion.div
            key={`quiz-${currentQ}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold tracking-widest text-[#8b93a7]">
                QUESTION {currentQ + 1} OF {quiz.length}
              </p>
              <p className="font-mono text-xs text-[#4ade80]">
                SCORE {finalScore}
              </p>
            </div>
            <div
              className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#232a3a]"
              aria-hidden="true"
            >
              <div
                className="h-full bg-[#4ade80]"
                style={{ width: `${((currentQ + 1) / quiz.length) * 100}%` }}
              />
            </div>

            <h3 className="mt-4 text-lg font-bold text-[#e6e9f0]">{q.q}</h3>

            <div className="mt-4 space-y-2" role="radiogroup" aria-label={q.q}>
              {q.options.map((opt, i) => {
                const isPicked = picked === i;
                const isAnswer = i === q.answer;
                let cls =
                  "border-[#232a3a] bg-[#12161f] text-[#e6e9f0] hover:border-[#8b93a7]";
                if (submitted) {
                  if (isAnswer) cls = "border-[#4ade80] bg-[#0b0e14] text-[#4ade80]";
                  else if (isPicked)
                    cls = "border-[#f87171] bg-[#0b0e14] text-[#f87171]";
                  else cls = "border-[#232a3a] bg-[#12161f] text-[#8b93a7] opacity-60";
                } else if (isPicked) {
                  cls = "border-[#fbbf24] bg-[#0b0e14] text-[#fbbf24]";
                }
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={isPicked}
                    disabled={submitted}
                    onClick={() => setPicked(i)}
                    className={`w-full rounded border px-3 py-2.5 text-left font-mono text-sm transition-colors ${cls}`}
                  >
                    <span className="mr-2 text-[#8b93a7]">
                      {String.fromCharCode(65 + i)}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            <AnimatePresence initial={false}>
              {submitted && (
                <motion.div
                  key="explain"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`mt-3 overflow-hidden rounded border p-3 ${
                    correct ? "border-[#4ade80]" : "border-[#f87171]"
                  }`}
                >
                  <p
                    className={`text-[11px] font-bold tracking-widest ${
                      correct ? "text-[#4ade80]" : "text-[#f87171]"
                    }`}
                  >
                    {correct ? "CORRECT" : "WRONG"}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#e6e9f0]">
                    {q.explain}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-4">
              {!submitted ? (
                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={picked === null}
                  className={`w-full rounded border px-4 py-3 text-sm font-bold tracking-widest transition-colors ${
                    picked === null
                      ? "cursor-not-allowed border-[#232a3a] text-[#8b93a7]"
                      : "border-[#4ade80] text-[#4ade80] hover:bg-[#4ade80] hover:text-[#0b0e14]"
                  }`}
                >
                  SUBMIT ANSWER
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextQuestion}
                  className="w-full rounded border border-[#4ade80] bg-[#4ade80] px-4 py-3 text-sm font-bold tracking-widest text-[#0b0e14] transition-colors hover:bg-[#e6e9f0] hover:border-[#e6e9f0]"
                >
                  {currentQ + 1 >= quiz.length ? "FINISH QUIZ" : "NEXT QUESTION"}
                </button>
              )}
            </div>
          </motion.div>
        )}

        {stage === "results" && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-center"
          >
            <p className="text-xs font-bold tracking-widest text-[#8b93a7]">
              QUIZ COMPLETE
            </p>
            <p className="mt-4 font-mono text-6xl font-bold text-[#4ade80]">
              {finalScore}
              <span className="text-2xl text-[#8b93a7]">/{quiz.length}</span>
            </p>
            <p className="mt-2 text-sm text-[#e6e9f0]">
              {finalScore === quiz.length
                ? "Flawless. AXIOM has no notes."
                : finalScore >= Math.ceil(quiz.length / 2)
                  ? "Solid work. The sector holds."
                  : "Rough landing. Replay the lessons and run it back."}
            </p>
            <button
              type="button"
              onClick={onNext}
              className="mt-8 w-full rounded border border-[#4ade80] bg-[#4ade80] px-4 py-3 text-sm font-bold tracking-widest text-[#0b0e14] transition-colors hover:bg-[#e6e9f0] hover:border-[#e6e9f0]"
            >
              NEXT CHAPTER
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
