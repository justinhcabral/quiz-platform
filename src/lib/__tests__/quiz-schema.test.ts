import { describe, expect, it } from "vitest";
import { quizPakSeedSchema } from "../quiz-schema";
import type { QuizPakSeed } from "../../types/quiz";

function validPak(overrides: Partial<QuizPakSeed> = {}): QuizPakSeed {
  return {
    slug: "sample-pak",
    title: "Sample Pak",
    description: "A valid sample quiz pak.",
    category: "General",
    tags: ["general"],
    difficulty: "easy",
    passingScore: 70,
    isPublished: true,
    questions: Array.from({ length: 20 }, (_, i) => ({
      id: `q${i + 1}`,
      type: "multiple-choice",
      prompt: `Question ${i + 1}?`,
      choices: [
        { id: "c1", label: "Correct" },
        { id: "c2", label: "Wrong" },
      ],
      correctChoiceId: "c1",
    })),
    ...overrides,
  };
}

describe("quizPakSeedSchema", () => {
  it("accepts a valid pak and defaults passingScore", () => {
    const pak = validPak();
    delete (pak as Partial<QuizPakSeed>).passingScore;
    const parsed = quizPakSeedSchema.parse(pak);
    expect(parsed.passingScore).toBe(70);
  });

  it("rejects invalid difficulty, passing score, and question count", () => {
    expect(quizPakSeedSchema.safeParse(validPak({ difficulty: "boss" as never })).success).toBe(false);
    expect(quizPakSeedSchema.safeParse(validPak({ passingScore: 101 })).success).toBe(false);
    expect(quizPakSeedSchema.safeParse(validPak({ questions: validPak().questions.slice(0, 19) })).success).toBe(false);
  });

  it("rejects duplicate ids and unresolved correctChoiceId", () => {
    const duplicateQuestions = validPak();
    duplicateQuestions.questions[1] = { ...duplicateQuestions.questions[1], id: "q1" };
    expect(quizPakSeedSchema.safeParse(duplicateQuestions).success).toBe(false);

    const badChoice = validPak();
    badChoice.questions[0] = {
      ...badChoice.questions[0],
      choices: [
        { id: "c1", label: "A" },
        { id: "c1", label: "B" },
      ],
      correctChoiceId: "missing",
    };
    expect(quizPakSeedSchema.safeParse(badChoice).success).toBe(false);
  });

  it("rejects malformed tags", () => {
    expect(quizPakSeedSchema.safeParse(validPak({ tags: ["Bad Tag"] })).success).toBe(false);
  });
});
