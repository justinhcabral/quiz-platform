"use client";

// PROTOTYPE — Variant D: "Gameshow Stage"
// Spotlit stage. Hero is a Jeopardy/Family-Feud-style category grid.
// CTA is "take the stage". Stats styled as audience/host counters.

import {
  Mic,
  CornerDownLeft,
  Users,
  Tv,
  Star,
  LogIn,
  UserPlus,
} from "lucide-react";

const board = [
  { cat: "GEOGRAPHY", color: "from-blue-500 to-blue-700", values: [100, 200, 300, 400] },
  { cat: "SCIENCE", color: "from-emerald-500 to-emerald-700", values: [100, 200, 300, 400] },
  { cat: "HISTORY", color: "from-rose-500 to-rose-700", values: [100, 200, 300, 400] },
  { cat: "MUSIC", color: "from-violet-500 to-violet-700", values: [100, 200, 300, 400] },
  { cat: "MOVIES", color: "from-amber-500 to-amber-700", values: [100, 200, 300, 400] },
];

export default function VariantD() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#150826] text-white">
      {/* spotlights */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute left-1/4 top-0 h-[80vh] w-[40vw] -translate-x-1/2 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(255,215,120,0.5), transparent 60%)",
          }}
        />
        <div
          className="absolute right-1/4 top-0 h-[80vh] w-[40vw] translate-x-1/2 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse at top, rgba(236,72,153,0.45), transparent 60%)",
          }}
        />
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
      </div>

      {/* curtain edges */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40"
        style={{
          background:
            "repeating-linear-gradient(to right, #4c0519 0 18px, #7f1d1d 18px 36px)",
          maskImage:
            "linear-gradient(to right, black 0%, black 60%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40"
        style={{
          background:
            "repeating-linear-gradient(to right, #7f1d1d 0 18px, #4c0519 18px 36px)",
          maskImage:
            "linear-gradient(to left, black 0%, black 60%, transparent 100%)",
        }}
      />

      {/* nav */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2 font-black tracking-[0.2em]">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-stone-900 shadow-[0_0_20px_rgba(251,191,36,0.6)]">
            <Mic size={16} strokeWidth={2.8} />
          </div>
          <span className="bg-gradient-to-b from-amber-200 to-amber-400 bg-clip-text text-lg text-transparent">
            QUIZ NIGHT
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/30 bg-amber-300/5 px-3 py-1.5 text-amber-100 hover:bg-amber-300/10">
            <LogIn size={13} /> log in
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-3 py-1.5 font-bold text-stone-900 shadow-[0_3px_0_rgba(0,0,0,0.4)] hover:from-amber-200">
            <UserPlus size={13} /> sign up
          </button>
        </div>
      </header>

      {/* hero copy */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pt-4 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-200">
          <Tv size={11} /> live · ep. 27
        </div>
        <h1 className="font-black leading-[0.9] tracking-tight">
          <span className="block bg-gradient-to-b from-white to-amber-100 bg-clip-text text-5xl text-transparent md:text-7xl">
            ladies & gentlemen,
          </span>
          <span className="mt-2 block bg-gradient-to-b from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-6xl text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.4)] md:text-8xl">
            pick a category.
          </span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-amber-100/70">
          Choose a category and a value. Higher value, harder question. The
          stage is yours.
        </p>
      </section>

      {/* board */}
      <section className="relative z-10 mx-auto mt-10 max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border-2 border-amber-300/30 bg-blue-950/60 p-2 shadow-[0_0_60px_rgba(251,191,36,0.15),inset_0_2px_0_rgba(255,255,255,0.1)] md:grid-cols-5 md:gap-3 md:p-3">
          {board.map((col) => (
            <div key={col.cat} className="flex flex-col gap-2 md:gap-3">
              <div
                className={`grid place-items-center rounded-lg bg-gradient-to-b ${col.color} px-2 py-3 text-center font-black tracking-wide text-white shadow-[inset_0_2px_0_rgba(255,255,255,0.25),0_3px_0_rgba(0,0,0,0.4)]`}
              >
                <span className="text-xs md:text-sm">{col.cat}</span>
              </div>
              {col.values.map((v) => (
                <button
                  key={v}
                  className="group grid h-14 place-items-center rounded-lg border border-blue-400/20 bg-gradient-to-b from-blue-700 to-blue-900 font-black tracking-tight text-amber-300 shadow-[inset_0_2px_0_rgba(255,255,255,0.15),0_2px_0_rgba(0,0,0,0.4)] transition hover:from-blue-600 hover:to-blue-800 hover:text-amber-200 md:h-16"
                >
                  <span className="text-xl drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] md:text-2xl">
                    ${v}
                  </span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* host counters */}
        <div className="mx-auto mt-6 grid max-w-2xl grid-cols-3 gap-3 text-center">
          <div className="rounded-xl border border-amber-300/20 bg-black/40 px-3 py-2 backdrop-blur">
            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-amber-200/70">
              <Users size={11} /> audience
            </div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums text-amber-200">
              1,243
            </div>
          </div>
          <div className="rounded-xl border border-amber-300/20 bg-black/40 px-3 py-2 backdrop-blur">
            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-amber-200/70">
              <Star size={11} /> top score
            </div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums text-amber-200">
              $4,800
            </div>
          </div>
          <div className="rounded-xl border border-amber-300/20 bg-black/40 px-3 py-2 backdrop-blur">
            <div className="flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-amber-200/70">
              <Tv size={11} /> categories
            </div>
            <div className="mt-1 font-mono text-xl font-bold tabular-nums text-amber-200">
              5
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 mx-auto mt-10 flex max-w-5xl flex-col items-center px-6 pb-16 text-center">
        <button className="group inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-amber-300 to-amber-500 px-7 py-3.5 font-black uppercase tracking-[0.15em] text-stone-900 shadow-[inset_0_2px_0_rgba(255,255,255,0.5),0_5px_0_rgba(0,0,0,0.5),0_0_40px_rgba(251,191,36,0.4)] transition active:translate-y-[3px] active:shadow-[inset_0_2px_0_rgba(255,255,255,0.5),0_2px_0_rgba(0,0,0,0.5)]">
          <Mic size={16} strokeWidth={2.8} />
          take the stage
          <kbd className="flex items-center gap-1 rounded-md border-2 border-stone-900/40 bg-white/30 px-2 py-1 font-mono text-[10px]">
            <CornerDownLeft size={10} /> ENTER
          </kbd>
        </button>
        <div className="mt-3 text-xs text-amber-100/60">
          play as guest · scores not saved until you{" "}
          <button className="text-amber-200 underline underline-offset-4 hover:text-amber-100">
            sign up
          </button>
        </div>
      </section>
    </main>
  );
}
