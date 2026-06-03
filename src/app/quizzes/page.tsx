import Link from "next/link";
import { Gamepad2, LibraryBig, PlugZap } from "lucide-react";
import { listPublishedValidQuizPaks } from "../../lib/quiz-repository";
import type { Difficulty } from "../../types/quiz";

export const dynamic = "force-dynamic";

const DIFFICULTY_BADGE: Record<Difficulty, string> = {
  easy: "bg-emerald-300 text-emerald-950",
  medium: "bg-amber-300 text-amber-950",
  hard: "bg-rose-300 text-rose-950",
};

export default async function QuizzesPage() {
  const quizzes = await listPublishedValidQuizPaks();

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1b1340] px-6 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#ffcf5a44,transparent_32%),linear-gradient(to_top,#2a1d5e,transparent_65%)]" />

      <section className="relative mx-auto max-w-6xl">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.24em] text-white/70">
              <LibraryBig size={13} /> quiz pak library
            </div>
            <h1 className="text-4xl font-black tracking-tight md:text-6xl">
              choose your cartridge
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">
              Published quiz paks are loaded from MongoDB. Pick one, lock in
              your answers, and clear the run.
            </p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-center font-mono text-xs uppercase tracking-[0.18em] text-white/70 transition hover:bg-white/15"
          >
            back to shelf
          </Link>
        </div>

        {quizzes.length === 0 ? (
          <div className="rounded-[2rem] border-2 border-dashed border-white/20 bg-black/25 p-10 text-center shadow-[0_10px_0_rgba(0,0,0,.35)]">
            <PlugZap className="mx-auto mb-4 text-yellow-200" size={36} />
            <h2 className="text-2xl font-black">NO PAKS LOADED</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
              Seed MongoDB with valid published quiz paks, then reload this
              shelf. Corrupted or unpublished paks stay hidden.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {quizzes.map((quiz, index) => (
              <Link
                key={quiz.slug}
                href={`/quizzes/${quiz.slug}`}
                className="group block focus:outline-none"
                style={{ transform: `rotate(${(index % 3) - 1}deg)` }}
              >
                <article className="relative h-full rounded-[1.25rem] bg-gradient-to-b from-sky-400 to-indigo-700 p-3 text-slate-950 shadow-[inset_0_2px_0_rgba(255,255,255,.45),inset_0_-7px_0_rgba(0,0,0,.22),0_10px_0_rgba(0,0,0,.38)] ring-2 ring-black/35 transition group-hover:-translate-y-2 group-focus-visible:-translate-y-2">
                  <div className="mx-auto h-2 w-16 rounded-b-md bg-black/20" />
                  <div className="mt-4 rounded-xl border border-black/20 bg-white/85 p-4 shadow-inner">
                    <div className="mb-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-slate-600">
                      <span>pak #{String(index + 1).padStart(2, "0")}</span>
                      <span>{quiz.category}</span>
                    </div>
                    <h2 className="min-h-16 text-2xl font-black leading-none tracking-tight">
                      {quiz.title}
                    </h2>
                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-700">
                      {quiz.description}
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                      <span className={`rounded-md px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${DIFFICULTY_BADGE[quiz.difficulty]}`}>
                        {quiz.difficulty}
                      </span>
                      <span className="rounded-md bg-slate-950 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-white">
                        {quiz.questions.length}Q
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-black/25 py-2 font-black text-white">
                    <Gamepad2 size={16} /> LOAD PAK
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
