"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, LockKeyhole, TimerReset } from "lucide-react";
import { getChoiceById, getQuestionById, initializeQuizRun } from "../../lib/quiz-run";
import type { QuizPak } from "../../types/quiz";

interface LockedAnswer {
  questionId: string;
  selectedChoiceId: string;
}

export function QuizRunner({ quiz }: { quiz: QuizPak }) {
  const [run] = useState(() =>
    initializeQuizRun({
      quizSlug: quiz.slug,
      questions: quiz.questions,
      difficulty: quiz.difficulty,
    }),
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [lockedAnswers, setLockedAnswers] = useState<LockedAnswer[]>([]);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.ceil((Date.parse(run.timerEndsAt) - Date.now()) / 1000)),
  );
  const [isAutoSubmitted, setIsAutoSubmitted] = useState(false);

  const currentSlot = run.shuffledQuestions[currentIndex];
  const currentQuestion = useMemo(
    () => getQuestionById(quiz.questions, currentSlot.questionId),
    [currentSlot.questionId, quiz.questions],
  );

  const choices = currentQuestion
    ? currentSlot.choiceIds
        .map((id) => getChoiceById(currentQuestion, id))
        .filter((choice): choice is NonNullable<typeof choice> => Boolean(choice))
    : [];
  const isLastQuestion = currentIndex === run.shuffledQuestions.length - 1;
  const answeredCount = lockedAnswers.length + (selectedChoiceId ? 1 : 0);
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  useEffect(() => {
    if (isAutoSubmitted) return;

    const tick = () => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((Date.parse(run.timerEndsAt) - Date.now()) / 1000),
      );
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) setIsAutoSubmitted(true);
    };

    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [isAutoSubmitted, run.timerEndsAt]);

  if (!currentQuestion) {
    return <div className="text-rose-200">PAK CORRUPTED: missing question.</div>;
  }

  function lockAndAdvance() {
    if (!selectedChoiceId || !currentQuestion) return;

    const questionId = currentQuestion.id;
    setLockedAnswers((answers) => [
      ...answers,
      { questionId, selectedChoiceId },
    ]);
    setSelectedChoiceId(null);

    if (!isLastQuestion) {
      setCurrentIndex((index) => index + 1);
    }
  }

  return (
    <section className="relative mx-auto max-w-4xl px-6 py-10 text-white">
      <div className="mb-6 rounded-[1.5rem] border border-white/15 bg-white/10 p-5 shadow-[0_8px_0_rgba(0,0,0,.3)]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-yellow-200">
              now playing
            </p>
            <h1 className="mt-1 text-3xl font-black tracking-tight">{quiz.title}</h1>
            <p className="mt-2 text-sm text-white/55">
              {quiz.category} · {quiz.difficulty.toUpperCase()} · pass at {quiz.passingScore}%
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl bg-black/25 px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] text-white/75">
              <TimerReset size={15} /> Q{currentIndex + 1}/{run.shuffledQuestions.length}
            </div>
            <div className={`rounded-xl px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] ${remainingSeconds <= 30 ? "bg-rose-400 text-rose-950" : "bg-yellow-300 text-black"}`}>
              {minutes}:{String(seconds).padStart(2, "0")}
            </div>
          </div>
        </div>
        <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-pink-400"
            style={{ width: `${(answeredCount / run.shuffledQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      {isAutoSubmitted ? (
        <article className="rounded-[2rem] border-2 border-rose-300/40 bg-rose-950/45 p-8 text-center shadow-[0_12px_0_rgba(0,0,0,.4)]">
          <h2 className="text-3xl font-black">TIME UP</h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/65">
            The quiz run auto-submitted when the timer hit zero. Scoring and
            results are wired in the next slice.
          </p>
        </article>
      ) : (
      <article className="rounded-[2rem] border-2 border-black/30 bg-gradient-to-b from-amber-100 to-orange-200 p-5 text-slate-950 shadow-[inset_0_2px_0_rgba(255,255,255,.7),0_12px_0_rgba(0,0,0,.4)] md:p-8">
        <div className="mb-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-slate-600">
          <span>question card</span>
          <span>{currentQuestion.type}</span>
        </div>
        <h2 className="text-2xl font-black leading-tight md:text-4xl">
          {currentQuestion.prompt}
        </h2>

        <div className="mt-8 grid gap-3">
          {choices.map((choice, index) => (
            <button
              key={choice.id}
              type="button"
              onClick={() => setSelectedChoiceId(choice.id)}
              className={`rounded-2xl border-2 px-4 py-4 text-left font-bold transition ${
                selectedChoiceId === choice.id
                  ? "border-slate-950 bg-yellow-300 shadow-[0_5px_0_rgba(0,0,0,.35)]"
                  : "border-slate-950/20 bg-white/70 hover:bg-white"
              }`}
            >
              <span className="mr-3 font-mono text-xs opacity-60">
                {String.fromCharCode(65 + index)}
              </span>
              {choice.label}
            </button>
          ))}
        </div>
      </article>
      )}

      {!isAutoSubmitted && (
      <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="flex items-center gap-2 text-sm text-white/55">
          <LockKeyhole size={15} /> Answers lock when you press next. No backtracking.
        </p>
        <button
          type="button"
          disabled={!selectedChoiceId || isLastQuestion}
          onClick={lockAndAdvance}
          className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-b from-yellow-300 to-amber-500 px-7 py-4 font-black tracking-wide text-black shadow-[inset_0_2px_0_rgba(255,255,255,.6),0_6px_0_rgba(0,0,0,.45)] transition disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-[3px]"
        >
          {isLastQuestion ? "SUBMIT UNLOCKS NEXT" : "LOCK ANSWER"}
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>
      )}
    </section>
  );
}
