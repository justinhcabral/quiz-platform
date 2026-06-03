/**
 * Mongoose connection singleton.
 *
 * - DNS SRV lookup retries several resolver sets before giving up (see ./dns).
 * - Cached on `globalThis` so Next.js HMR / Lambda warm starts reuse the
 *   same connection instead of leaking pools.
 * - The DB name is taken from the URI path unless `MONGODB_DB` overrides.
 *
 * Use this only if you opt into mongoose models. The seed script and the
 * slice-3 repository use the native driver via ./db.ts.
 */

import { isSrvLookupFailure, mongoDnsResolverCandidates, restoreOriginalDns, useMongoDnsServers } from "./dns";
import mongoose, { type Mongoose } from "mongoose";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var __mongooseCache__: MongooseCache | undefined;
}

const cache: MongooseCache =
  globalThis.__mongooseCache__ ?? (globalThis.__mongooseCache__ = { conn: null, promise: null });

function connect(uri: string) {
  return mongoose.connect(uri, {
    dbName: process.env.MONGODB_DB || undefined,
    bufferCommands: false,
    serverSelectionTimeoutMS: 10_000,
  });
}

export async function connectMongoose(): Promise<Mongoose> {
  if (cache.conn) return cache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Add it to .env.local.");
  }

  if (!cache.promise) {
    cache.promise = (async () => {
      let lastSrvError: unknown;

      for (const servers of mongoDnsResolverCandidates()) {
        try {
          useMongoDnsServers(servers);
          return await connect(uri);
        } catch (err) {
          if (!isSrvLookupFailure(err)) throw err;
          lastSrvError = err;
        }
      }

      restoreOriginalDns();
      throw lastSrvError;
    })().catch((err) => {
      cache.promise = null;
      throw err;
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export { mongoose };
export default connectMongoose;
