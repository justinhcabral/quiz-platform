import type { SuspiciousActivityEvent } from "./anti-cheat";
import type { QuizResult, LockedAnswerWithCorrectness } from "./quiz-scoring";
import type { InitializedQuizRun } from "./quiz-run";

const STORAGE_VERSION = 1;

export interface StoredActiveQuizRun {
  version: typeof STORAGE_VERSION;
  quizSlug: string;
  run: InitializedQuizRun;
  currentIndex: number;
  lockedAnswers: LockedAnswerWithCorrectness[];
  suspiciousActivityEvents: SuspiciousActivityEvent[];
  savedAt: string;
}

function activeRunKey(slug: string) {
  return `youquizz:active-run:${slug}`;
}

function resultKey(slug: string) {
  return `youquizz:result:${slug}`;
}

function startIntentKey(slug: string) {
  return `youquizz:start-intent:${slug}`;
}

function hasSessionStorage() {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function loadActiveQuizRun(slug: string): StoredActiveQuizRun | null {
  if (!hasSessionStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(activeRunKey(slug));
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredActiveQuizRun>;
    if (
      parsed.version !== STORAGE_VERSION ||
      parsed.quizSlug !== slug ||
      !parsed.run ||
      !Array.isArray(parsed.run.shuffledQuestions) ||
      typeof parsed.currentIndex !== "number" ||
      !Array.isArray(parsed.lockedAnswers)
    ) {
      window.sessionStorage.removeItem(activeRunKey(slug));
      return null;
    }

    return {
      ...parsed,
      suspiciousActivityEvents: Array.isArray(parsed.suspiciousActivityEvents)
        ? parsed.suspiciousActivityEvents
        : [],
    } as StoredActiveQuizRun;
  } catch {
    window.sessionStorage.removeItem(activeRunKey(slug));
    return null;
  }
}

export function saveActiveQuizRun(state: Omit<StoredActiveQuizRun, "version" | "savedAt">) {
  if (!hasSessionStorage()) return;

  window.sessionStorage.setItem(
    activeRunKey(state.quizSlug),
    JSON.stringify({
      ...state,
      version: STORAGE_VERSION,
      savedAt: new Date().toISOString(),
    } satisfies StoredActiveQuizRun),
  );
}

export function clearActiveQuizRun(slug: string) {
  if (!hasSessionStorage()) return;
  window.sessionStorage.removeItem(activeRunKey(slug));
}

export function saveQuizResult(result: QuizResult) {
  if (!hasSessionStorage()) return;
  window.sessionStorage.setItem(resultKey(result.quizSlug), JSON.stringify(result));
}

export function clearQuizResult(slug: string) {
  if (!hasSessionStorage()) return;
  window.sessionStorage.removeItem(resultKey(slug));
}

export function markQuizStartIntent(slug: string) {
  if (!hasSessionStorage()) return;
  window.sessionStorage.setItem(startIntentKey(slug), Date.now().toString());
}

export function consumeQuizStartIntent(slug: string) {
  if (!hasSessionStorage()) return false;

  const key = startIntentKey(slug);
  const raw = window.sessionStorage.getItem(key);
  window.sessionStorage.removeItem(key);
  if (!raw) return false;

  const createdAt = Number(raw);
  return Number.isFinite(createdAt) && Date.now() - createdAt < 30_000;
}

export function loadQuizResult(slug: string): QuizResult | null {
  if (!hasSessionStorage()) return null;

  try {
    const raw = window.sessionStorage.getItem(resultKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizResult;
    if (parsed.quizSlug !== slug || typeof parsed.scorePercent !== "number") {
      window.sessionStorage.removeItem(resultKey(slug));
      return null;
    }
    return parsed;
  } catch {
    window.sessionStorage.removeItem(resultKey(slug));
    return null;
  }
}
