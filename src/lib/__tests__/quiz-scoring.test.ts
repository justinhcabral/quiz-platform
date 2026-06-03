import { describe, expect, it } from "vitest";
import { createSuspiciousActivityEvent } from "../anti-cheat";
import { initializeQuizRun } from "../quiz-run";
import { lockAnswer, scoreQuizRun } from "../quiz-scoring";
import type { QuizPak } from "../../types/quiz";

function quiz(): QuizPak {
  return {
    _id: "1",
    slug: "sample-pak",
    title: "Sample Pak",
    description: "Sample.",
    category: "General",
    tags: [],
    difficulty: "easy",
    passingScore: 70,
    isPublished: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    questions: Array.from({ length: 20 }, (_, i) => ({
      id: `q${i + 1}`,
      type: "multiple-choice",
      prompt: `Question ${i + 1}?`,
      choices: [
        { id: "c1", label: "Correct" },
        { id: "c2", label: "Wrong" },
      ],
      correctChoiceId: "c1",
      explanation: "Because.",
    })),
  };
}

describe("quiz scoring", () => {
  it("scores all-correct and returns review", () => {
    const pak = quiz();
    const run = initializeQuizRun({ quizSlug: pak.slug, questions: pak.questions, difficulty: pak.difficulty, random: () => 0 });
    const locked = run.shuffledQuestions.map((slot) =>
      lockAnswer({ quiz: pak, questionId: slot.questionId, selectedChoiceId: "c1" }),
    );
    const result = scoreQuizRun({ quiz: pak, startedAt: run.startedAt, shuffledQuestions: run.shuffledQuestions, lockedAnswers: locked });

    expect(result.scorePercent).toBe(100);
    expect(result.status).toBe("RUN CLEARED");
    expect(result.review).toHaveLength(20);
  });

  it("scores unanswered timeout questions as incorrect", () => {
    const pak = quiz();
    const run = initializeQuizRun({ quizSlug: pak.slug, questions: pak.questions, difficulty: pak.difficulty, random: () => 0 });
    const result = scoreQuizRun({ quiz: pak, startedAt: run.startedAt, shuffledQuestions: run.shuffledQuestions, lockedAnswers: [] });

    expect(result.scorePercent).toBe(0);
    expect(result.incorrectCount).toBe(20);
    expect(result.review[0].selectedAnswerLabel).toBeNull();
  });

  it("invalidates score after exceeding suspicious behavior limit", () => {
    const pak = quiz();
    const run = initializeQuizRun({ quizSlug: pak.slug, questions: pak.questions, difficulty: pak.difficulty, random: () => 0 });
    const events = Array.from({ length: 6 }, (_, i) =>
      createSuspiciousActivityEvent({ type: "copy", existingCount: i }),
    );
    const result = scoreQuizRun({ quiz: pak, startedAt: run.startedAt, shuffledQuestions: run.shuffledQuestions, lockedAnswers: [], suspiciousActivityEvents: events });

    expect(result.suspiciousActivityCount).toBe(6);
    expect(result.isScoreInvalidated).toBe(true);
  });
});
