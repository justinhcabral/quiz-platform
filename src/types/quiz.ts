/**
 * Canonical Quiz Pak shape. Locked by PRD + slice 3 acceptance criteria.
 * Source of truth for both the seed script and the app validator.
 */

export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "multiple-choice";

export interface QuizChoice {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  choices: QuizChoice[];
  correctChoiceId: string;
  explanation?: string;
}

/** Shape stored in MongoDB. _id added by driver; createdAt/updatedAt set on write. */
export interface QuizPak {
  _id?: unknown;
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: Difficulty;
  passingScore: number; // 0–100, default 70 at validation time
  isPublished: boolean;
  questions: QuizQuestion[]; // length === 20
  createdAt: Date;
  updatedAt: Date;
}

/** Authoring shape for seed JSON files (no _id, no timestamps). */
export type QuizPakSeed = Omit<QuizPak, "_id" | "createdAt" | "updatedAt">;
