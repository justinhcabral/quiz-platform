import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";
import { validateQuizPakDocument } from "../../../../lib/quiz-repository";
import { QUIZ_COLLECTION } from "../../../../models/Quiz";

export const dynamic = "force-dynamic";

function envSummary() {
  const uri = process.env.MONGODB_URI;
  let uriDb: string | null = null;
  let host: string | null = null;

  if (uri) {
    try {
      const parsed = new URL(uri);
      uriDb = parsed.pathname.replace(/^\//, "") || null;
      host = parsed.host;
    } catch {
      host = "unparseable";
    }
  }

  return {
    hasMongoUri: Boolean(uri),
    mongoHost: host,
    uriDb,
    mongoDbOverride: process.env.MONGODB_DB || null,
    nodeEnv: process.env.NODE_ENV,
    nextPhase: process.env.NEXT_PHASE || null,
    vercelEnv: process.env.VERCEL_ENV || null,
  };
}

export async function GET() {
  const startedAt = Date.now();

  try {
    const db = await getDb();
    const collection = db.collection(QUIZ_COLLECTION);
    const docs = await collection.find({}).limit(20).toArray();
    const publishedDocs = docs.filter((doc) => doc.isPublished === true);
    const validPublishedDocs = publishedDocs.filter((doc) => validateQuizPakDocument(doc).ok);

    return NextResponse.json({
      ok: true,
      env: envSummary(),
      dbName: db.databaseName,
      collection: QUIZ_COLLECTION,
      sampledCount: docs.length,
      rawCount: await collection.countDocuments({}),
      publishedCount: await collection.countDocuments({ isPublished: true }),
      validPublishedSampleCount: validPublishedDocs.length,
      sampledSlugs: docs.map((doc) => ({
        slug: typeof doc.slug === "string" ? doc.slug : null,
        title: typeof doc.title === "string" ? doc.title : null,
        isPublished: doc.isPublished === true,
      })),
      elapsedMs: Date.now() - startedAt,
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        env: envSummary(),
        errorName: err instanceof Error ? err.name : null,
        errorMessage: err instanceof Error ? err.message : String(err),
        elapsedMs: Date.now() - startedAt,
      },
      { status: 500 },
    );
  }
}
