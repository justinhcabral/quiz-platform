/**
 * Native MongoDB driver singleton.
 *
 * - In local development, DNS SRV lookup can retry several resolver sets.
 *   Production uses the platform/driver default DNS resolution.
 * - In dev, the client promise is cached on `globalThis` so Next.js HMR
 *   doesn't open a fresh pool on every reload.
 * - The DB name is taken from the URI path (e.g. `.../youquizz`) unless
 *   `MONGODB_DB` is set to override.
 *
 * This is the canonical accessor for slice 3's repository and the seed
 * script. Prefer this over mongoose.ts unless you specifically need
 * mongoose features (schemas, hooks).
 */

import {
  isSrvLookupFailure,
  mongoDnsResolverCandidates,
  restoreOriginalDns,
  setMongoDnsServers,
} from "./dns";
import { MongoClient, type Db } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var __mongoClientPromise__: Promise<MongoClient> | undefined;
}

function connectClient(uri: string): Promise<MongoClient> {
  return new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10_000,
  }).connect();
}

async function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  }

  if (process.env.NODE_ENV === "production") {
    return connectClient(uri);
  }

  let lastSrvError: unknown;

  for (const servers of mongoDnsResolverCandidates()) {
    try {
      setMongoDnsServers(servers);
      return await connectClient(uri);
    } catch (err) {
      if (!isSrvLookupFailure(err)) throw err;
      lastSrvError = err;
    }
  }

  restoreOriginalDns();
  throw lastSrvError;
}

function clientPromise(): Promise<MongoClient> {
  if (!globalThis.__mongoClientPromise__) {
    globalThis.__mongoClientPromise__ = createClientPromise().catch((err) => {
      globalThis.__mongoClientPromise__ = undefined;
      throw err;
    });
  }
  return globalThis.__mongoClientPromise__;
}

export async function getMongoClient(): Promise<MongoClient> {
  return clientPromise();
}

function resolveDbName(): string | undefined {
  if (process.env.MONGODB_DB) return process.env.MONGODB_DB;

  const uri = process.env.MONGODB_URI;
  if (!uri) return undefined;

  try {
    const parsed = new URL(uri);
    const pathDb = parsed.pathname.replace(/^\//, "");
    if (pathDb) return decodeURIComponent(pathDb);
  } catch {
    // Some Mongo connection strings are not fully WHATWG-compatible. In that
    // case let the driver resolve the URI path via client.db(undefined).
    return undefined;
  }

  console.warn('[mongo] database name missing; defaulting to "youquizz"');
  return "youquizz";
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  return client.db(resolveDbName());
}

export default { getMongoClient, getDb };
