"use client";

// PROTOTYPE — Variant A: "Arcade" (TETR.io-style)
// Dark, full-bleed, huge wordmark, Press-Enter prompt is the primary affordance.

import { useEffect, useState } from "react";
import { CornerDownLeft, User, LogIn, Trophy, Zap } from "lucide-react";

export default function VariantA() {
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        setPressed(true);
        setTimeout(() => setPressed(false), 400);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070d] text-white">
      {/* animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 h-[36rem] w-[36rem] rounded-full bg-fuchsia-600/30 blur-[120px]" />
        <div className="absolute -right-40 bottom-0 h-[40rem] w-[40rem] rounded-full bg-cyan-500/25 blur-[140px]" />
        <div className="absolute left-1/2 top-1/3 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[120px]" />
      </div>
      {/* grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2 font-mono text-sm tracking-[0.3em] text-white/70">
          <Zap size={16} className="text-fuchsia-400" />
          QUIZ//ARCADE
        </div>
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="hidden sm:inline">v0.1 · prototype</span>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
        </div>
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-96px)] max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-white/70 backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
          ready player
        </div>

        <h1 className="select-none bg-gradient-to-b from-white via-white to-white/40 bg-clip-text text-[clamp(4rem,14vw,11rem)] font-black leading-[0.85] tracking-tight text-transparent">
          QUIZ
          <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-cyan-300 bg-clip-text text-transparent">
            .
          </span>
          ARENA
        </h1>

        <p className="mt-6 max-w-md text-base text-white/60">
          A fast, single-question-at-a-time quiz arena. Answer, learn, climb the
          board.
        </p>

        {/* press enter prompt */}
        <button
          className={`group mt-12 flex items-center gap-3 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-medium backdrop-blur transition-all hover:border-white/40 hover:bg-white/10 ${
            pressed ? "scale-95 border-fuchsia-400 bg-fuchsia-500/20" : ""
          }`}
        >
          <kbd className="flex items-center gap-1.5 rounded-md border border-white/20 bg-black/40 px-2 py-1 font-mono text-xs">
            <CornerDownLeft size={12} />
            ENTER
          </kbd>
          <span className="text-white/80 group-hover:text-white">
            play as guest
          </span>
        </button>

        <div className="mt-4 flex items-center gap-1 text-xs text-white/40">
          <span>or</span>
          <button className="ml-1 inline-flex items-center gap-1 text-white/70 underline-offset-4 hover:text-white hover:underline">
            <LogIn size={12} /> log in
          </button>
          <span className="mx-1">·</span>
          <button className="inline-flex items-center gap-1 text-white/70 underline-offset-4 hover:text-white hover:underline">
            <User size={12} /> sign up
          </button>
          <span className="ml-1">to save scores</span>
        </div>

        {/* tiny stat strip */}
        <div className="mt-20 grid w-full max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left backdrop-blur">
          {[
            { icon: Zap, label: "quizzes", value: "24" },
            { icon: User, label: "players online", value: "1.2k" },
            { icon: Trophy, label: "today's top", value: "98%" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-black/30 px-5 py-4">
              <Icon size={14} className="mb-2 text-fuchsia-300" />
              <div className="font-mono text-2xl font-bold tabular-nums">
                {value}
              </div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/50">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
