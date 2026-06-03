"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Gamepad2, Power, UserRound } from "lucide-react";

const NEXT_HREF = "/quizzes";

function getNextHref() {
  const selectedPak = new URLSearchParams(window.location.search).get("pak");
  return selectedPak
    ? `/quizzes/${encodeURIComponent(selectedPak)}`
    : NEXT_HREF;
}

export default function PlayPage() {
  const router = useRouter();

  useEffect(() => {
    router.prefetch(getNextHref());

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
      router.push(getNextHref());
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#1b1340] px-6 py-12 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,#ffcf5a55,transparent_35%),linear-gradient(to_top,#2a1d5e,transparent_55%)]" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 opacity-45 [background-image:linear-gradient(45deg,rgba(255,255,255,.08)_25%,transparent_25%),linear-gradient(-45deg,rgba(255,255,255,.08)_25%,transparent_25%),linear-gradient(45deg,transparent_75%,rgba(255,255,255,.08)_75%),linear-gradient(-45deg,transparent_75%,rgba(255,255,255,.08)_75%)] [background-size:42px_42px] [background-position:0_0,0_21px,21px_-21px,-21px_0px]"
        style={{
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
          maskImage:
            "linear-gradient(to top, black 0%, black 72%, transparent 100%)",
        }}
      />

      <section className="relative w-full max-w-2xl rounded-[2rem] border-2 border-white/15 bg-white/10 p-6 shadow-[0_16px_0_rgba(0,0,0,.35)] backdrop-blur md:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-yellow-300 to-pink-500 text-black shadow-[3px_3px_0_rgba(0,0,0,.45)]">
              <UserRound size={22} strokeWidth={3} />
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">
                player slot
              </p>
              <h1 className="text-3xl font-black tracking-tight">
                Guest Player
              </h1>
            </div>
          </div>
          <span className="rounded-md bg-emerald-400/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-200 ring-1 ring-emerald-300/30">
            online
          </span>
        </div>

        <div className="rounded-2xl border border-white/15 bg-black/25 p-5">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-yellow-200">
            <Gamepad2 size={14} /> save file not required
          </div>
          <p className="text-sm leading-6 text-white/70">
            YouQuizz MVP runs in guest mode. Continue to load your selected pak,
            clear the run, and review your answers. Scores stay on this device
            for the current browser session only.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/45">
            player accounts coming soon
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push(getNextHref())}
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-yellow-300 to-amber-500 px-7 py-4 font-black tracking-wide text-black shadow-[inset_0_2px_0_rgba(255,255,255,.6),0_6px_0_rgba(0,0,0,.45)] transition active:translate-y-[3px] active:shadow-[inset_0_2px_0_rgba(255,255,255,.6),0_3px_0_rgba(0,0,0,.45)]"
        >
          <Power size={18} strokeWidth={3} />
          CONTINUE AS GUEST
          <kbd className="flex items-center gap-1 rounded-md border-2 border-black/30 bg-white/40 px-2 py-1 font-mono text-[10px]">
            <CornerDownLeft size={10} /> ENTER
          </kbd>
        </button>
      </section>
    </main>
  );
}
