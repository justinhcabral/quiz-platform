import { z } from "zod";
import type { QuizPakSeed } from "../types/quiz";

/**
 * Single source of truth for Quiz Pak validation.
 * Used by the seed script and (in slice 3) the MongoDB repository.
 *
 * Failure modes mirror the handoff doc:
 *   - missing/empty required fields
 *   - slug not kebab-case
 *   - difficulty not in enum
 *   - passingScore out of [0,100] or non-integer
 *   - questions.length !== 20
 *   - duplicate question ids within a quiz
 *   - duplicate choice ids within a question
 *   - choices.length not in [2,6]
 *   - correctChoiceId not matching any choice.id
 *   - tags not lowercased kebab-case
 */

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const tagRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const tagSchema = z
  .string()
  .trim()
  .min(1)
  .max(24)
  .regex(tagRegex, "tags must be lowercase kebab-case");

const choiceSchema = z.object({
  id: z.string().trim().min(1),
  label: z.string().trim().min(1).max(200),
});

const questionSchema = z
  .object({
    id: z.string().trim().min(1),
    type: z.literal("multiple-choice"),
    prompt: z.string().trim().min(1).max(500),
    choices: z.array(choiceSchema).min(2).max(6),
    correctChoiceId: z.string().trim().min(1),
    explanation: z.string().trim().max(500).optional(),
  })
  .superRefine((q, ctx) => {
    const ids = new Set<string>();
    for (const c of q.choices) {
      if (ids.has(c.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["choices"],
          message: `duplicate choice id "${c.id}"`,
        });
      }
      ids.add(c.id);
    }
    if (!ids.has(q.correctChoiceId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["correctChoiceId"],
        message: `correctChoiceId "${q.correctChoiceId}" does not match any choice.id`,
      });
    }
  });

export const quizPakSeedSchema = z
  .object({
    slug: z.string().trim().regex(slugRegex, "slug must be kebab-case"),
    title: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(280),
    category: z.string().trim().min(1).max(40),
    tags: z.array(tagSchema).transform((arr) => Array.from(new Set(arr))),
    difficulty: z.enum(["easy", "medium", "hard"]),
    passingScore: z
      .number()
      .int()
      .min(0)
      .max(100)
      .optional()
      .transform((v) => (v === undefined ? 70 : v)),
    isPublished: z.boolean(),
    questions: z.array(questionSchema).length(20),
  })
  .superRefine((pak, ctx) => {
    const ids = new Set<string>();
    for (const q of pak.questions) {
      if (ids.has(q.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["questions"],
          message: `duplicate question id "${q.id}"`,
        });
      }
      ids.add(q.id);
    }
  });

export type ValidatedQuizPakSeed = QuizPakSeed;
