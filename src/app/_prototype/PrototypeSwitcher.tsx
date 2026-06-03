"use client";

// PROTOTYPE — delete once a landing variant is chosen.
import { useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, FlaskConical } from "lucide-react";

type Variant = { key: string; name: string };

export function PrototypeSwitcher({ variants }: { variants: Variant[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get("variant") ?? variants[0].key).toUpperCase();
  const idx = Math.max(
    0,
    variants.findIndex((v) => v.key === current),
  );
  const active = variants[idx] ?? variants[0];

  const goto = (delta: number) => {
    const next = variants[(idx + delta + variants.length) % variants.length];
    const sp = new URLSearchParams(params.toString());
    sp.set("variant", next.key);
    router.replace(`${pathname}?${sp.toString()}`);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      if (e.key === "ArrowLeft") goto(-1);
      if (e.key === "ArrowRight") goto(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (process.env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/85 px-2 py-1.5 text-white shadow-2xl backdrop-blur">
        <FlaskConical size={14} className="ml-2 mr-1 opacity-60" />
        <button
          onClick={() => goto(-1)}
          className="rounded-full p-1.5 hover:bg-white/15"
          aria-label="Previous variant"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="min-w-[180px] px-2 text-center text-xs font-medium tracking-wide tabular-nums">
          {active.key} — {active.name}
        </div>
        <button
          onClick={() => goto(1)}
          className="rounded-full p-1.5 hover:bg-white/15"
          aria-label="Next variant"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
