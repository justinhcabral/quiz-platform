"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ChevronRight, LockKeyhole, TimerReset, Trophy } from "lucide-react";
import { createSuspiciousActivityEvent, isScoreInvalidatedBySuspiciousActivity, type SuspiciousActivityEvent, type SuspiciousActivityType } from "../../lib/anti-cheat";
import { lockAnswer, scoreQuizRun, type LockedAnswerWithCorrectness, type QuizResult } from "../../lib/quiz-scoring";
import { getChoiceById, getQuestionById, initializeQuizRun } from "../../lib/quiz-run";
import { clearActiveQuizRun, loadActiveQuizRun, saveActiveQuizRun, saveQuizResult } from "../../lib/quiz-storage";
import type { QuizPak } from "../../types/quiz";

export function QuizRunner({ quiz }: { quiz: QuizPak }) {
  const router = useRouter();
  const [initialStored] = useState(() => loadActiveQuizRun(quiz.slug));
  const [run] = useState(() =>
    initialStored?.run ??
    initializeQuizRun({
      quizSlug: quiz.slug,
      questions: quiz.questions,
      difficulty: quiz.difficulty,
    }),
  );
  const [currentIndex, setCurrentIndex] = useState(initialStored?.currentIndex ?? 0);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [lockedAnswers, setLockedAnswers] = useState<LockedAnswerWithCorrectness[]>(
    initialStored?.lockedAnswers ?? [],
  );
  const [suspiciousActivityEvents, setSuspiciousActivityEvents] = useState<SuspiciousActivityEvent[]>(
    initialStored?.suspiciousActivityEvents ?? [],
  );
  const [activeSuspiciousEvent, setActiveSuspiciousEvent] = useState<SuspiciousActivityEvent | null>(null);
  const currentIndexRef = useRef(currentIndex);
  const lockedAnswersRef = useRef(lockedAnswers);
  const suspiciousActivityEventsRef = useRef(suspiciousActivityEvents);
  const lastSuspiciousSignalRef = useRef<{ type: SuspiciousActivityType; at: number } | null>(null);
  const [lastAnswerAt, setLastAnswerAt] = useState(() => Date.parse(run.startedAt));
  const [result, setResult] = useState<QuizResult | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    Math.max(0, Math.ceil((Date.parse(run.timerEndsAt) - Date.now()) / 1000)),
  );

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
  const isScoreInvalidated = isScoreInvalidatedBySuspiciousActivity(suspiciousActivityEvents);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    lockedAnswersRef.current = lockedAnswers;
    suspiciousActivityEventsRef.current = suspiciousActivityEvents;
  }, [currentIndex, lockedAnswers, suspiciousActivityEvents]);

  const recordSuspiciousActivity = useCallback((type: SuspiciousActivityType) => {
    if (result) return suspiciousActivityEventsRef.current;
    if (type === "window_blur" && document.hidden) return suspiciousActivityEventsRef.current;

    const now = Date.now();
    const lastSignal = lastSuspiciousSignalRef.current;
    if (lastSignal && now - lastSignal.at < 500) {
      const isSameSignal = lastSignal.type === type;
      const isTabBlurPair =
        (lastSignal.type === "tab_switch" && type === "window_blur") ||
        (lastSignal.type === "window_blur" && type === "tab_switch");
      if (isSameSignal || isTabBlurPair) return suspiciousActivityEventsRef.current;
    }
    lastSuspiciousSignalRef.current = { type, at: now };

    const event = createSuspiciousActivityEvent({
      type,
      existingCount: suspiciousActivityEventsRef.current.length,
    });
    const nextEvents = [...suspiciousActivityEventsRef.current, event];
    suspiciousActivityEventsRef.current = nextEvents;
    saveActiveQuizRun({
      quizSlug: quiz.slug,
      run,
      currentIndex: currentIndexRef.current,
      lockedAnswers: lockedAnswersRef.current,
      suspiciousActivityEvents: nextEvents,
    });
    setSuspiciousActivityEvents(nextEvents);
    setActiveSuspiciousEvent(event);
    return nextEvents;
  }, [quiz.slug, result, run]);

  function submitRun(
    nextLockedAnswers: LockedAnswerWithCorrectness[],
    nextSuspiciousEvents = suspiciousActivityEvents,
  ) {
    setResult(
      scoreQuizRun({
        quiz,
        startedAt: run.startedAt,
        shuffledQuestions: run.shuffledQuestions,
        lockedAnswers: nextLockedAnswers,
        suspiciousActivityEvents: nextSuspiciousEvents,
      }),
    );
  }

  useEffect(() => {
    if (result) return;

    saveActiveQuizRun({
      quizSlug: quiz.slug,
      run,
      currentIndex,
      lockedAnswers,
      suspiciousActivityEvents,
    });
  }, [currentIndex, lockedAnswers, quiz.slug, result, run, suspiciousActivityEvents]);

  useEffect(() => {
    if (!result) return;
    saveQuizResult(result);
    clearActiveQuizRun(quiz.slug);
    router.push(`/quizzes/${quiz.slug}/results`);
  }, [quiz.slug, result, router]);

  useEffect(() => {
    if (result) return;

    const onVisibilityChange = () => {
      if (document.hidden) recordSuspiciousActivity("tab_switch");
    };
    const onBlur = () => recordSuspiciousActivity("window_blur");
    const onCopy = () => recordSuspiciousActivity("copy");
    const onPaste = () => recordSuspiciousActivity("paste");
    const onPopState = () => recordSuspiciousActivity("navigation_back");

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("blur", onBlur);
    window.addEventListener("copy", onCopy);
    window.addEventListener("paste", onPaste);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("copy", onCopy);
      window.removeEventListener("paste", onPaste);
      window.removeEventListener("popstate", onPopState);
    };
  }, [result, recordSuspiciousActivity]);

  useEffect(() => {
    if (result) return;

    const tick = () => {
      const nextRemaining = Math.max(
        0,
        Math.ceil((Date.parse(run.timerEndsAt) - Date.now()) / 1000),
      );
      setRemainingSeconds(nextRemaining);
      if (nextRemaining <= 0) submitRun(lockedAnswers);
    };

    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [lockedAnswers, result, run.shuffledQuestions, run.startedAt, run.timerEndsAt, quiz, suspiciousActivityEvents]);

  if (!currentQuestion) {
    return <div className="text-rose-200">PAK CORRUPTED: missing question.</div>;
  }

  function lockAndAdvance() {
    if (!selectedChoiceId || !currentQuestion) return;

    let nextSuspiciousEvents = suspiciousActivityEvents;
    const now = Date.now();
    if (now - lastAnswerAt < 300) {
      nextSuspiciousEvents = recordSuspiciousActivity("impossible_speed");
    }
    setLastAnswerAt(now);

    const locked = lockAnswer({
      quiz,
      questionId: currentQuestion.id,
      selectedChoiceId,
    });
    const nextLockedAnswers = [...lockedAnswers, locked];
    setLockedAnswers(nextLockedAnswers);
    setSelectedChoiceId(null);

    if (isLastQuestion) {
      submitRun(nextLockedAnswers, nextSuspiciousEvents);
    } else {
      setCurrentIndex((index) => index + 1);
    }
  }

  return (
    <section className="relative mx-auto max-w-4xl px-6 py-10 text-white">
      {activeSuspiciousEvent ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-6">
          <section className="max-w-md rounded-[2rem] border-2 border-rose-300/40 bg-[#2a1d5e] p-6 text-center shadow-[0_12px_0_rgba(0,0,0,.45)]">
            <AlertTriangle className="mx-auto mb-3 text-rose-200" size={42} />
            <h2 className="text-3xl font-black">FLAGGED</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">{activeSuspiciousEvent.message}</p>
            <p className="mt-4 font-mono text-xs uppercase tracking-[0.18em] text-yellow-200">
              warning {activeSuspiciousEvent.warningNumber}/{activeSuspiciousEvent.limit}
            </p>
            {activeSuspiciousEvent.invalidatesScore ? (
              <p className="mt-3 rounded-xl bg-rose-300 px-3 py-2 text-sm font-black text-rose-950">
                Score invalidated. You may finish the run, but this score will not count.
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setActiveSuspiciousEvent(null)}
              className="mt-5 rounded-xl bg-yellow-300 px-5 py-3 font-black text-black"
            >
              CONTINUE RUN
            </button>
          </section>
        </div>
      ) : null}

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
            <div className={`rounded-xl px-4 py-3 font-mono text-xs uppercase tracking-[0.16em] ${isScoreInvalidated ? "bg-rose-300 text-rose-950" : "bg-white/10 text-white/70"}`}>
              flags {suspiciousActivityEvents.length}/5
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

      {result ? (
        <article className="rounded-[2rem] border-2 border-yellow-300/35 bg-black/30 p-8 text-center shadow-[0_12px_0_rgba(0,0,0,.4)]">
          <Trophy className="mx-auto mb-4 text-yellow-300" size={42} />
          <h2 className="text-4xl font-black">{result.status}</h2>
          <p className="mt-3 text-6xl font-black text-yellow-300">{result.scorePercent}%</p>
          <p className="mt-3 text-sm text-white/60">
            {result.correctCount}/{result.totalQuestions} correct · opening results screen
          </p>
        </article>
      ) : (
        <>
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

          <div className="mt-8 flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="flex items-center gap-2 text-sm text-white/55">
              <LockKeyhole size={15} /> Answers lock when you press next. No backtracking.
            </p>
            <button
              type="button"
              disabled={!selectedChoiceId}
              onClick={lockAndAdvance}
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-b from-yellow-300 to-amber-500 px-7 py-4 font-black tracking-wide text-black shadow-[inset_0_2px_0_rgba(255,255,255,.6),0_6px_0_rgba(0,0,0,.45)] transition disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-[3px]"
            >
              {isLastQuestion ? "SUBMIT RUN" : "LOCK ANSWER"}
              <ChevronRight size={18} strokeWidth={3} />
            </button>
          </div>
        </>
      )}
    </section>
  );
}
