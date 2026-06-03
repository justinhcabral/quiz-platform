"use client";

// PROTOTYPE — Variant C: "Quest Map"
// Vertical level path. Gamifies progression itself: XP bar, streak, mascot,
// nodes that look like levels in a mobile game. Quizzes are stops on the path.

import {
  Flame,
  Star,
  Lock,
  Check,
  Crown,
  Sparkles,
  Heart,
  CornerDownLeft,
  Trophy,
  Zap,
} from "lucide-react";

type Node = {
  state: "done" | "current" | "locked";
  label: string;
  kind?: "boss" | "bonus" | "normal";
};

const path: Node[] = [
  { state: "done", label: "Warm-up" },
  { state: "done", label: "Basics I" },
  { state: "done", label: "Basics II", kind: "bonus" },
  { state: "current", label: "World Capitals" },
  { state: "locked", label: "Geography II" },
  { state: "locked", label: "Mid-Boss", kind: "boss" },
  { state: "locked", label: "History I" },
];

function NodeIcon({ n }: { n: Node }) {
  if (n.state === "done") return <Check size={26} strokeWidth={3} />;
  if (n.state === "locked") return <Lock size={22} strokeWidth={2.5} />;
  if (n.kind === "boss") return <Crown size={26} strokeWidth={2.5} />;
  return <Star size={26} strokeWidth={2.5} />;
}

function PathNode({ n, offset }: { n: Node; offset: number }) {
  const base =
    "relative grid h-20 w-20 place-items-center rounded-full border-[4px] transition-transform";
  const color =
    n.state === "done"
      ? "bg-emerald-400 border-emerald-600 text-white shadow-[0_6px_0_#047857]"
      : n.state === "current"
        ? "bg-amber-300 border-amber-500 text-amber-950 shadow-[0_6px_0_#b45309] animate-[wiggle_1.6s_ease-in-out_infinite]"
        : "bg-stone-200 border-stone-300 text-stone-400 shadow-[0_5px_0_#d6d3d1]";

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${offset}px)` }}
    >
      {n.state === "current" && (
        <div className="absolute -top-12 z-10 whitespace-nowrap rounded-xl border-2 border-amber-500 bg-white px-3 py-1.5 text-xs font-black text-amber-900 shadow-[0_3px_0_#b45309]">
          START
          <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-amber-500 bg-white" />
        </div>
      )}
      <button
        disabled={n.state === "locked"}
        className={`${base} ${color} ${n.state !== "locked" ? "hover:-translate-y-0.5" : "cursor-not-allowed"}`}
      >
        <NodeIcon n={n} />
      </button>
      <div
        className={`mt-2 text-xs font-bold ${n.state === "locked" ? "text-stone-400" : "text-stone-700"}`}
      >
        {n.label}
      </div>
    </div>
  );
}

export default function VariantC() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 via-sky-100 to-emerald-100 text-stone-900">
      <style>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }
      `}</style>

      {/* top HUD */}
      <header className="sticky top-0 z-20 border-b-2 border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          {/* logo */}
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-400 to-violet-500 text-white shadow-[0_3px_0_#6d28d9]">
              <Sparkles size={18} strokeWidth={2.5} />
            </div>
            <span className="font-black tracking-tight">Quizly</span>
          </div>

          {/* HUD pills */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-full border-2 border-orange-300 bg-orange-100 px-3 py-1 text-sm font-black text-orange-700 shadow-[0_2px_0_#fb923c]">
              <Flame size={14} className="fill-orange-500 text-orange-600" />
              <span className="tabular-nums">7</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border-2 border-rose-300 bg-rose-100 px-3 py-1 text-sm font-black text-rose-700 shadow-[0_2px_0_#fb7185]">
              <Heart size={14} className="fill-rose-500 text-rose-600" />
              <span className="tabular-nums">5</span>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-100 px-3 py-1 text-sm font-black text-amber-700 shadow-[0_2px_0_#fbbf24] sm:flex">
              <Zap size={14} className="fill-amber-500 text-amber-600" />
              <span className="tabular-nums">1,240 XP</span>
            </div>
          </div>
        </div>

        {/* XP progress */}
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-stone-600">
            <span>Level 12 · Trivia Apprentice</span>
            <span className="tabular-nums">240 / 500 XP</span>
          </div>
          <div className="mt-1 h-3 overflow-hidden rounded-full border-2 border-amber-300 bg-amber-50 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]"
              style={{ width: "48%" }}
            />
          </div>
        </div>
      </header>

      {/* hero blurb */}
      <section className="mx-auto max-w-3xl px-6 pt-10 text-center">
        <h1 className="text-4xl font-black leading-tight tracking-tight md:text-5xl">
          your quiz adventure,
          <br />
          one question at a time.
        </h1>
        <p className="mt-3 text-sm text-stone-600">
          Climb the path. Beat the bosses. Don&apos;t lose your streak.
        </p>
      </section>

      {/* the path */}
      <section className="relative mx-auto mt-10 max-w-md px-6 pb-40">
        <div className="flex flex-col items-center gap-12">
          {path.map((n, i) => {
            // zig-zag offset
            const offset = Math.sin(i * 0.9) * 70;
            return <PathNode key={i} n={n} offset={offset} />;
          })}
        </div>

        {/* mascot floating */}
        <div className="pointer-events-none absolute right-2 top-32 hidden md:block">
          <div className="relative">
            <div className="grid h-24 w-24 place-items-center rounded-[40%] border-[4px] border-stone-900 bg-gradient-to-b from-fuchsia-300 to-violet-400 shadow-[0_6px_0_#1c1917]">
              <Trophy size={40} className="text-amber-300" strokeWidth={2.5} />
            </div>
            <div className="absolute -left-32 top-2 rounded-2xl border-2 border-stone-900 bg-white px-3 py-2 text-xs font-bold shadow-[0_3px_0_#1c1917]">
              keep going!
              <div className="absolute -right-1 top-3 h-2 w-2 rotate-45 border-r-2 border-t-2 border-stone-900 bg-white" />
            </div>
          </div>
        </div>
      </section>

      {/* sticky CTA */}
      <div className="fixed inset-x-0 bottom-16 z-20 mx-auto max-w-md px-6">
        <div className="rounded-2xl border-2 border-stone-900 bg-white p-3 shadow-[0_5px_0_#1c1917]">
          <button className="group flex w-full items-center justify-between rounded-xl bg-gradient-to-b from-emerald-400 to-emerald-500 px-5 py-3 font-black uppercase tracking-wide text-white shadow-[inset_0_2px_0_rgba(255,255,255,.5),0_3px_0_#047857] transition active:translate-y-[2px] active:shadow-[inset_0_2px_0_rgba(255,255,255,.5),0_1px_0_#047857]">
            <span>start quest</span>
            <kbd className="flex items-center gap-1 rounded-md border-2 border-emerald-700/50 bg-white/30 px-2 py-1 font-mono text-[10px]">
              <CornerDownLeft size={10} /> ENTER
            </kbd>
          </button>
          <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-stone-600">
            <span>playing as guest</span>
            <span className="h-1 w-1 rounded-full bg-stone-400" />
            <button className="font-bold text-violet-600 hover:underline">
              log in
            </button>
            <button className="font-bold text-violet-600 hover:underline">
              sign up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
