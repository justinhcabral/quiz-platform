"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CornerDownLeft, Power } from "lucide-react";
import type { Difficulty } from "../../types/quiz";

export interface LandingQuizPak {
  slug: string;
  title: string;
  category: string;
  difficulty: Difficulty;
  questionCount: number;
}

const START_HREF = "/play";

const CARTRIDGE_COLORS = [
  {
    shell: "from-rose-400 to-rose-600",
    label: "bg-rose-100 text-rose-900",
  },
  {
    shell: "from-amber-400 to-orange-500",
    label: "bg-amber-100 text-amber-900",
  },
  {
    shell: "from-emerald-400 to-teal-600",
    label: "bg-emerald-100 text-emerald-900",
  },
  {
    shell: "from-sky-400 to-indigo-600",
    label: "bg-sky-100 text-sky-900",
  },
  {
    shell: "from-violet-400 to-fuchsia-600",
    label: "bg-violet-100 text-violet-900",
  },
] as const;

function Cartridge({
  pak,
  n,
  rotate,
}: {
  pak: LandingQuizPak;
  n: string;
  rotate: number;
}) {
  const color = CARTRIDGE_COLORS[(Number(n) - 1) % CARTRIDGE_COLORS.length];

  return (
    <Link
      href={`/play?pak=${encodeURIComponent(pak.slug)}`}
      className="group relative w-[170px] shrink-0 transition-transform duration-300 hover:-translate-y-3 hover:rotate-0 focus:outline-none focus-visible:-translate-y-3 focus-visible:rotate-0"
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <article
        className={`relative h-[230px] rounded-[14px] bg-gradient-to-b ${color.shell} p-3 shadow-[inset_0_2px_0_rgba(255,255,255,.5),inset_0_-6px_0_rgba(0,0,0,.18),0_8px_0_rgba(0,0,0,.25)] ring-2 ring-black/30`}
      >
        <div className="mx-auto h-2 w-16 rounded-b-md bg-black/20" />
        <div
          className={`mt-3 rounded-md ${color.label} border border-black/20 px-2.5 py-3 shadow-inner`}
        >
          <div className="font-mono text-[9px] tracking-[0.18em] opacity-70">
            QUIZ-PAK
          </div>
          <div className="mt-1 line-clamp-3 font-black leading-tight tracking-tight">
            {pak.title}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 font-mono text-[10px] opacity-70">
            <span>№ {n}</span>
            <span className="truncate text-right">{pak.category}</span>
          </div>
          <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] opacity-70">
            {pak.difficulty} · {pak.questionCount}Q
          </div>
        </div>
        <div className="absolute inset-x-3 bottom-3 flex h-6 items-end justify-between gap-[3px] rounded-sm bg-black/30 p-1">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-full w-full rounded-sm bg-black/40" />
          ))}
        </div>
      </article>
      <div className="pointer-events-none mt-3 flex items-center justify-center gap-1 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
        LOAD <ChevronRight size={12} />
      </div>
    </Link>
  );
}

export function LandingPage({ paks }: { paks: LandingQuizPak[] }) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(START_HREF);
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Enter") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      router.push(START_HREF);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1b1340] text-white">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            "linear-gradient(to top, #2a1d5e 0%, transparent 100%), repeating-linear-gradient(45deg, rgba(255,255,255,0.05) 0 30px, transparent 30px 60px)",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
          maskImage:
            "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-pink-400 via-orange-400 to-yellow-300 opacity-60 blur-2xl" />

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2 font-black tracking-tight">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-yellow-300 to-pink-500 text-black shadow-[2px_2px_0_rgba(0,0,0,.5)]">
            <Power size={16} strokeWidth={3} />
          </div>
          <span className="text-lg">YouQuizz</span>
          <span className="ml-2 rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] tracking-widest text-white/70">
            v0.1
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/50">
          player accounts coming soon
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-6 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-white/80 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          guest mode online
        </div>
        <h1 className="text-5xl font-black leading-[0.9] tracking-tight md:text-7xl">
          pick a{" "}
          <span className="bg-gradient-to-r from-yellow-300 via-pink-400 to-fuchsia-400 bg-clip-text text-transparent">
            cartridge.
          </span>
          <br />
          press start.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-white/60">
          Each pak is a self-contained quiz cartridge loaded from MongoDB. Pick
          one from the shelf to boot through guest mode, or press start to browse.
        </p>
      </section>

      <section className="relative z-10 mt-14">
        {paks.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-[2rem] border-2 border-dashed border-white/20 bg-black/25 p-8 text-center shadow-[0_10px_0_rgba(0,0,0,.35)]">
            <h2 className="text-2xl font-black">NO PAKS LOADED</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/60">
              Seed MongoDB with valid published quiz paks, then reload this
              shelf.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-center gap-3 overflow-hidden px-8 pt-10 pb-2 md:gap-5">
            {paks.map((pak, i) => (
              <Cartridge
                key={pak.slug}
                pak={pak}
                n={String(i + 1).padStart(2, "0")}
                rotate={(i - (paks.length - 1) / 2) * 4}
              />
            ))}
          </div>
        )}
        <div className="mx-auto mt-2 h-3 max-w-6xl rounded-full bg-gradient-to-b from-amber-700 to-amber-900 shadow-[0_4px_0_rgba(0,0,0,.4),inset_0_2px_0_rgba(255,255,255,.2)]" />
        <div className="mx-auto mt-1 h-2 max-w-5xl rounded-full bg-black/40 blur-sm" />
      </section>

      <section className="relative z-10 mt-14 flex flex-col items-center pb-16 text-center">
        <button
          type="button"
          onClick={() => router.push(START_HREF)}
          className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-b from-yellow-300 to-amber-500 px-7 py-4 font-black tracking-wide text-black shadow-[inset_0_2px_0_rgba(255,255,255,.6),0_6px_0_rgba(0,0,0,.45)] transition active:translate-y-[3px] active:shadow-[inset_0_2px_0_rgba(255,255,255,.6),0_3px_0_rgba(0,0,0,.45)]"
        >
          <Power size={18} strokeWidth={3} />
          PRESS START
          <kbd className="flex items-center gap-1 rounded-md border-2 border-black/30 bg-white/40 px-2 py-1 font-mono text-[10px]">
            <CornerDownLeft size={10} /> ENTER
          </kbd>
        </button>
        <div className="mt-4 text-xs text-white/60">
          start as guest · scores are not saved yet
        </div>
      </section>
    </main>
  );
}
