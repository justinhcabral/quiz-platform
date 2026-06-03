import { ObjectId, type Document } from "mongodb";
import { getDb } from "./db";
import { quizPakSeedSchema } from "./quiz-schema";
import { QUIZ_COLLECTION } from "../models/Quiz";
import type { QuizPak, QuizPakSeed } from "../types/quiz";

export type QuizLoadErrorCode = "not_found" | "pak_corrupted" | "db_unavailable";

export interface QuizLoadError {
  ok: false;
  code: QuizLoadErrorCode;
  slug?: string;
  message: string;
}

export interface QuizLoadSuccess {
  ok: true;
  quiz: QuizPak;
}

export type QuizLoadResult = QuizLoadSuccess | QuizLoadError;

function objectIdToString(id: unknown): unknown {
  return id instanceof ObjectId ? id.toHexString() : id;
}

function toQuizPak(doc: Document, parsed: QuizPakSeed): QuizPak {
  return {
    ...parsed,
    _id: objectIdToString(doc._id),
    createdAt: doc.createdAt instanceof Date ? doc.createdAt : new Date(doc.createdAt),
    updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt : new Date(doc.updatedAt),
  };
}

export function validateQuizPakDocument(doc: Document): QuizLoadSuccess | QuizLoadError {
  const parsed = quizPakSeedSchema.safeParse(doc);

  if (!parsed.success) {
    console.error("[quiz-repository] invalid quiz pak", {
      slug: typeof doc.slug === "string" ? doc.slug : undefined,
      issues: parsed.error.issues,
    });

    return {
      ok: false,
      code: "pak_corrupted",
      slug: typeof doc.slug === "string" ? doc.slug : undefined,
      message: "Quiz pak failed validation.",
    };
  }

  return { ok: true, quiz: toQuizPak(doc, parsed.data) };
}

export async function ensureQuizIndexes() {
  const db = await getDb();
  const collection = db.collection(QUIZ_COLLECTION);
  await Promise.all([
    collection.createIndex({ slug: 1 }, { unique: true, name: "unique_slug" }),
    collection.createIndex({ isPublished: 1 }, { name: "by_isPublished" }),
  ]);
}

export async function listPublishedValidQuizPaks(): Promise<QuizPak[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection(QUIZ_COLLECTION)
      .find({ isPublished: true })
      .sort({ category: 1, title: 1 })
      .toArray();

    return docs.flatMap((doc) => {
      const result = validateQuizPakDocument(doc);
      return result.ok ? [result.quiz] : [];
    });
  } catch (err) {
    console.error("[quiz-repository] failed to list quiz paks", err);
    return [];
  }
}

export async function getQuizPakBySlug(slug: string): Promise<QuizLoadResult> {
  try {
    const db = await getDb();
    const doc = await db.collection(QUIZ_COLLECTION).findOne({ slug, isPublished: true });

    if (!doc) {
      return {
        ok: false,
        code: "not_found",
        slug,
        message: "Quiz pak was not found.",
      };
    }

    return validateQuizPakDocument(doc);
  } catch (err) {
    console.error("[quiz-repository] failed to load quiz pak", { slug, err });
    return {
      ok: false,
      code: "db_unavailable",
      slug,
      message: "Quiz pak database is unavailable.",
    };
  }
}
