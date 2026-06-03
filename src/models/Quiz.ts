/**
 * Mongoose model for a Quiz Pak.
 *
 * - Collection name is locked here: `quizzes`.
 * - Schema mirrors the Zod validator in `src/lib/quiz-schema.ts`. The Zod
 *   validator remains the source of truth for incoming data (it runs in
 *   the seed script and the API). This schema is a second line of defense
 *   at the database boundary.
 * - `strict: true` rejects unknown fields silently dropping them on save.
 * - `_id: false` on subdocs keeps embedded questions/choices from getting
 *   their own ObjectIds — they already have stable string ids (`q1`, `c1`).
 */

import { Schema, model, models, type Model, type InferSchemaType } from "mongoose";

export const QUIZ_COLLECTION = "quizzes" as const;

const choiceSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true, maxlength: 200 },
  },
  { _id: false },
);

const questionSchema = new Schema(
  {
    id: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["multiple-choice"],
    },
    prompt: { type: String, required: true, trim: true, maxlength: 500 },
    choices: {
      type: [choiceSchema],
      required: true,
      validate: {
        validator: (arr: unknown[]) => Array.isArray(arr) && arr.length >= 2 && arr.length <= 6,
        message: "questions[].choices must contain 2–6 items",
      },
    },
    correctChoiceId: { type: String, required: true, trim: true },
    explanation: { type: String, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const quizSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    title: { type: String, required: true, trim: true, maxlength: 80 },
    description: { type: String, required: true, trim: true, maxlength: 280 },
    category: { type: String, required: true, trim: true, maxlength: 40 },
    tags: {
      type: [String],
      required: true,
      default: [],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    passingScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 70,
      validate: {
        validator: Number.isInteger,
        message: "passingScore must be an integer",
      },
    },
    isPublished: { type: Boolean, required: true },
    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (arr: unknown[]) => Array.isArray(arr) && arr.length === 20,
        message: "questions must contain exactly 20 items",
      },
    },
  },
  {
    collection: QUIZ_COLLECTION,
    timestamps: true, // createdAt / updatedAt managed by mongoose
    strict: true,
    minimize: false,
    versionKey: false,
  },
);

quizSchema.index({ isPublished: 1 }, { name: "by_isPublished" });

export type QuizDocument = InferSchemaType<typeof quizSchema>;

// Reuse model across HMR reloads / repeated imports.
export const Quiz: Model<QuizDocument> =
  (models[QUIZ_COLLECTION] as Model<QuizDocument> | undefined) ??
  model<QuizDocument>(QUIZ_COLLECTION, quizSchema, QUIZ_COLLECTION);
