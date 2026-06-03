/**
 * DNS helpers for MongoDB SRV lookups.
 *
 * Atlas `mongodb+srv://` URIs require DNS SRV resolution. On Windows and
 * corporate networks, the OS resolver or public resolvers may fail differently
 * (`querySrv ETIMEOUT` / `ECONNREFUSED`). Mongo connection code uses these
 * helpers to retry with multiple resolver sets before giving up.
 */

import { getServers, setServers } from "node:dns";

const CLOUDFLARE_DNS = ["1.1.1.1", "1.0.0.1"];
const GOOGLE_DNS = ["8.8.8.8", "8.8.4.4"];
const QUAD9_DNS = ["9.9.9.9", "149.112.112.112"];

interface DnsPinState {
  originalServers: string[];
}

declare global {
  // eslint-disable-next-line no-var
  var __youquizzDnsPinState__: DnsPinState | undefined;
}

const state: DnsPinState =
  globalThis.__youquizzDnsPinState__ ??
  (globalThis.__youquizzDnsPinState__ = {
    originalServers: getServers(),
  });

function uniqueResolverSets(sets: string[][]) {
  const seen = new Set<string>();
  return sets.filter((servers) => {
    const key = servers.join(",");
    if (seen.has(key)) return false;
    seen.add(key);
    return servers.length > 0;
  });
}

export function mongoDnsResolverCandidates() {
  return uniqueResolverSets([
    state.originalServers,
    CLOUDFLARE_DNS,
    GOOGLE_DNS,
    QUAD9_DNS,
  ]);
}

export function setMongoDnsServers(servers: string[]) {
  setServers(servers);
}

export function restoreOriginalDns() {
  try {
    setServers(state.originalServers);
  } catch (err) {
    console.warn("[dns] failed to restore OS DNS resolver", err);
  }
}

export function isSrvLookupFailure(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return message.includes("querySrv") || message.includes("ETIMEOUT") || message.includes("ECONNREFUSED");
}
