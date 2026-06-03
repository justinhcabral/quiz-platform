/**
 * Forces Node's DNS resolver to use Cloudflare (1.1.1.1, 1.0.0.1) before
 * any MongoDB connection is opened.
 *
 * Why: `mongodb+srv://` URIs require an SRV lookup. On Windows boxes and
 * corporate networks the OS-default resolver frequently fails or stalls
 * with `querySrv ETIMEOUT` / `ENOTFOUND`. Pinning to a public resolver
 * sidesteps that whole class of issue.
 *
 * This file is import-for-side-effect. Import it FIRST in any module that
 * opens a Mongo connection (db.ts and mongoose.ts already do).
 */

import { setServers } from "node:dns";

const DNS_SERVERS = ["1.1.1.1", "1.0.0.1"];

declare global {
  // eslint-disable-next-line no-var
  var __dnsPinned__: boolean | undefined;
}

if (!globalThis.__dnsPinned__) {
  try {
    setServers(DNS_SERVERS);
    globalThis.__dnsPinned__ = true;
  } catch (err) {
    // Non-fatal: if the platform refuses, fall back to OS resolver.
    console.warn("[dns] failed to pin servers, using OS default", err);
  }
}

export {};
