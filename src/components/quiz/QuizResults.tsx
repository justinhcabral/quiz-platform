"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, CircleX, Trophy } from "lucide-react";
import { loadQuizResult } from "../../lib/quiz-storage";
import type { QuizResult } from "../../lib/quiz-scoring";

export function QuizResults({ slug }: { slug: string }) {
  const [result] = useState<QuizResult | null>(() => loadQuizResult(slug));

  if (!result) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#1b1340] px-6 text-white">
        <section className="max-w-xl rounded-[2rem] border-2 border-white/15 bg-white/10 p-8 text-center shadow-[0_10px_0_rgba(0,0,0,.35)]">
          <h1 className="text-3xl font-black">NO RESULT FOUND</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">
            Guest results live only in this browser session. Clear another quiz
            pak to generate a fresh result screen.
          </p>
          <Link href="/quizzes" className="mt-6 inline-block rounded-xl bg-yellow-300 px-5 py-3 font-black text-black">
            BACK TO LIBRARY
          </Link>
        </section>
      </main>
    );
  }

  const wasCancelledByNavigation = result.suspiciousActivityEvents.some(
    (event) => event.type === "navigation_back",
  );
  const ResultIcon = wasCancelledByNavigation ? AlertTriangle : Trophy;

  return (
    <main className="min-h-screen bg-[#1b1340] px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="rounded-[2rem] border-2 border-yellow-300/25 bg-black/30 p-6 text-center shadow-[0_12px_0_rgba(0,0,0,.38)] md:p-10">
          <ResultIcon className={`mx-auto mb-4 ${wasCancelledByNavigation ? "text-rose-200" : "text-yellow-300"}`} size={46} />
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
            {wasCancelledByNavigation ? "run cancelled" : "run complete"}
          </p>
          <h1 className="mt-2 text-5xl font-black">{result.status}</h1>
          <p className="mt-4 text-7xl font-black text-yellow-300">{result.scorePercent}%</p>
          <div className="mt-6 grid gap-3 font-mono text-xs uppercase tracking-[0.14em] text-white/70 sm:grid-cols-5">
            <div className="rounded-xl bg-white/10 p-4">pass {result.passingScore}%</div>
            <div className="rounded-xl bg-white/10 p-4">correct {result.correctCount}</div>
            <div className="rounded-xl bg-white/10 p-4">missed {result.incorrectCount}</div>
            <div className="rounded-xl bg-white/10 p-4">time {result.elapsedSeconds}s</div>
            <div className={`rounded-xl p-4 ${result.isScoreInvalidated ? "bg-rose-300 text-rose-950" : "bg-white/10"}`}>flags {result.suspiciousActivityCount}/5</div>
          </div>
          {result.isScoreInvalidated ? (
            <div className="mt-6 rounded-2xl bg-rose-300 p-4 font-black text-rose-950">
              {wasCancelledByNavigation
                ? "SCORE INVALIDATED — browser back navigation cancelled this run. Return to the landing page to start again."
                : "SCORE INVALIDATED — suspicious behavior exceeded the allowed limit."}
            </div>
          ) : null}
        </div>

        {result.suspiciousActivityEvents.length > 0 ? (
          <div className="mt-8 rounded-2xl border border-rose-300/25 bg-rose-950/25 p-5">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-rose-100">flag log</h2>
            <ul className="mt-4 space-y-2 text-sm text-white/70">
              {result.suspiciousActivityEvents.map((event) => (
                <li key={event.id} className="rounded-xl bg-black/20 p-3">
                  #{event.warningNumber} {event.type.replaceAll("_", " ")} · {new Date(event.occurredAt).toLocaleTimeString()}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-10 space-y-4">
          {result.review.map((item, index) => (
            <article key={item.questionId} className="rounded-2xl border border-white/10 bg-white/10 p-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/45">
                  question {index + 1}
                </span>
                <span className={`inline-flex items-center gap-2 rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${item.isCorrect ? "bg-emerald-300 text-emerald-950" : "bg-rose-300 text-rose-950"}`}>
                  {item.isCorrect ? <CheckCircle2 size={12} /> : <CircleX size={12} />}
                  {item.isCorrect ? "correct" : "miss"}
                </span>
              </div>
              <h2 className="text-xl font-black">{item.prompt}</h2>
              <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                <div className="rounded-xl bg-black/25 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">your answer</p>
                  <p className="mt-1 font-bold">{item.selectedAnswerLabel ?? "Unanswered"}</p>
                </div>
                <div className="rounded-xl bg-black/25 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/45">correct answer</p>
                  <p className="mt-1 font-bold">{item.correctAnswerLabel}</p>
                </div>
              </div>
              {item.explanation ? (
                <p className="mt-4 rounded-xl bg-yellow-300/10 p-4 text-sm leading-6 text-yellow-100">
                  {item.explanation}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/" className="inline-block rounded-xl bg-yellow-300 px-5 py-3 font-black text-black">
            BACK TO LANDING
          </Link>
        </div>
      </section>
    </main>
  );
}
