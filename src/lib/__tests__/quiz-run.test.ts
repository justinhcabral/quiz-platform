import { describe, expect, it } from "vitest";
import { getQuizRunSeconds, initializeQuizRun } from "../quiz-run";
import type { QuizQuestion } from "../../types/quiz";

const questions: QuizQuestion[] = Array.from({ length: 20 }, (_, i) => ({
  id: `q${i + 1}`,
  type: "multiple-choice",
  prompt: `Question ${i + 1}?`,
  choices: [
    { id: "c1", label: "A" },
    { id: "c2", label: "B" },
    { id: "c3", label: "C" },
  ],
  correctChoiceId: "c1",
}));

describe("quiz run initialization", () => {
  it("calculates difficulty-scaled timers", () => {
    expect(getQuizRunSeconds("easy", 20)).toBe(1200);
    expect(getQuizRunSeconds("medium", 20)).toBe(600);
    expect(getQuizRunSeconds("hard", 20)).toBe(300);
  });

  it("creates complete shuffled order without mutating questions", () => {
    const before = structuredClone(questions);
    const run = initializeQuizRun({
      quizSlug: "sample-pak",
      questions,
      difficulty: "medium",
      now: new Date("2026-01-01T00:00:00.000Z"),
      random: () => 0.42,
    });

    expect(run.shuffledQuestions).toHaveLength(20);
    expect(new Set(run.shuffledQuestions.map((q) => q.questionId)).size).toBe(20);
    expect(run.shuffledQuestions.every((q) => q.choiceIds.length === 3)).toBe(true);
    expect(questions).toEqual(before);
    expect(run.timerEndsAt).toBe("2026-01-01T00:10:00.000Z");
  });
});
