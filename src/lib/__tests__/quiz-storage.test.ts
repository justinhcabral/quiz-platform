// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";
import { createSuspiciousActivityEvent } from "../anti-cheat";
import { loadActiveQuizRun, loadQuizResult, saveActiveQuizRun, saveQuizResult } from "../quiz-storage";
import type { QuizResult } from "../quiz-scoring";
import type { InitializedQuizRun } from "../quiz-run";

const run: InitializedQuizRun = {
  runId: "run-1",
  quizSlug: "sample-pak",
  startedAt: "2026-01-01T00:00:00.000Z",
  timerEndsAt: "2026-01-01T00:20:00.000Z",
  shuffledQuestions: [{ questionId: "q1", choiceIds: ["c1", "c2"] }],
};

const result: QuizResult = {
  quizSlug: "sample-pak",
  quizTitle: "Sample Pak",
  category: "General",
  difficulty: "easy",
  passingScore: 70,
  submittedAt: "2026-01-01T00:01:00.000Z",
  startedAt: "2026-01-01T00:00:00.000Z",
  elapsedSeconds: 60,
  totalQuestions: 1,
  correctCount: 1,
  incorrectCount: 0,
  scorePercent: 100,
  status: "RUN CLEARED",
  answers: [{ questionId: "q1", selectedChoiceId: "c1", correctChoiceId: "c1", isCorrect: true }],
  review: [{ questionId: "q1", prompt: "Q?", selectedChoiceId: "c1", selectedAnswerLabel: "A", correctChoiceId: "c1", correctAnswerLabel: "A", isCorrect: true }],
  suspiciousActivityEvents: [],
  suspiciousActivityCount: 0,
  isScoreInvalidated: false,
};

describe("quiz storage", () => {
  beforeEach(() => window.sessionStorage.clear());

  it("round-trips active run state with suspicious events", () => {
    const event = createSuspiciousActivityEvent({ type: "paste", existingCount: 0 });
    saveActiveQuizRun({ quizSlug: "sample-pak", run, currentIndex: 0, lockedAnswers: [], suspiciousActivityEvents: [event] });

    const loaded = loadActiveQuizRun("sample-pak");
    expect(loaded?.run.runId).toBe("run-1");
    expect(loaded?.suspiciousActivityEvents).toHaveLength(1);
  });

  it("round-trips result state and isolates keys by slug", () => {
    saveQuizResult(result);
    expect(loadQuizResult("sample-pak")?.scorePercent).toBe(100);
    expect(loadQuizResult("other-pak")).toBeNull();
  });

  it("discards corrupt stored state", () => {
    window.sessionStorage.setItem("youquizz:active-run:sample-pak", "not-json");
    expect(loadActiveQuizRun("sample-pak")).toBeNull();
  });
});
