/**
 * HeyGen REST proxy (server).
 *
 * The browser never sees a HeyGen API key. Instead:
 *   1. Client calls `/api/heygen/<path>` with its ibl.ai DM token in
 *      `Authorization: Token <dm_token>` and the active tenant in
 *      `X-Platform: <tenant>`.
 *   2. This handler uses the DM token to fetch the tenant's HeyGen
 *      credential from ibl.ai's ai-account service:
 *        GET {dmUrl}/api/ai-account/orgs/{platform}/integration-credential/?name=heygen
 *   3. The resolved API key is sent to HeyGen as `X-Api-Key`, and the
 *      upstream response is streamed back to the client.
 *
 * Credentials are cached in-memory per `{platform, dm_token}` for a
 * short TTL so every UI call doesn't trigger a credential lookup.
 */
import { NextRequest, NextResponse } from "next/server";
import config from "@/lib/iblai/config";

export const runtime = "nodejs";

const HEYGEN_API_BASE = "https://api.heygen.com";
/** HeyGen's asset-upload host is NOT api.heygen.com — it's upload.heygen.com. */
const HEYGEN_UPLOAD_BASE = "https://upload.heygen.com";
const CREDENTIAL_TTL_MS = 60_000;

function upstreamBaseFor(path: string[]): string {
  return path[0] === "v1" && path[1] === "asset"
    ? HEYGEN_UPLOAD_BASE
    : HEYGEN_API_BASE;
}

interface CachedCredential {
  apiKey: string;
  expiresAt: number;
}

const credentialCache = new Map<string, CachedCredential>();

async function resolveHeygenKey(
  platform: string,
  dmToken: string,
): Promise<string> {
  const cacheKey = `${platform}:${dmToken}`;
  const hit = credentialCache.get(cacheKey);
  if (hit && hit.expiresAt > Date.now()) return hit.apiKey;

  const url =
    `${config.dmUrl()}/api/ai-account/orgs/${encodeURIComponent(platform)}` +
    `/integration-credential/?name=heygen`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${dmToken}`,
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `integration-credential ${res.status}: ${body.slice(0, 300)}`,
    );
  }
  const json = await res.json();
  const apiKey = extractApiKey(json);
  if (!apiKey) {
    throw new Error("integration-credential: no heygen api_key in response");
  }
  credentialCache.set(cacheKey, {
    apiKey,
    expiresAt: Date.now() + CREDENTIAL_TTL_MS,
  });
  return apiKey;
}

/**
 * The endpoint may wrap the credential in any of several envelopes
 * (e.g. `[{name, value: {key: "..."}}]`). Recurse everywhere and
 * return the first string value found under a plausible key name.
 */
function extractApiKey(payload: unknown): string | null {
  const targets = new Set(["api_key", "apiKey", "key", "secret", "token"]);
  const walk = (v: unknown, depth: number): string | null => {
    if (depth > 6 || v == null) return null;
    if (Array.isArray(v)) {
      for (const item of v) {
        const r = walk(item, depth + 1);
        if (r) return r;
      }
      return null;
    }
    if (typeof v !== "object") return null;
    const rec = v as Record<string, unknown>;
    for (const [k, val] of Object.entries(rec)) {
      if (targets.has(k) && typeof val === "string" && val) return val;
    }
    for (const val of Object.values(rec)) {
      const r = walk(val, depth + 1);
      if (r) return r;
    }
    return null;
  };
  return walk(payload, 0);
}

async function proxy(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
): Promise<Response> {
  const { path } = await ctx.params;

  const auth = req.headers.get("authorization") ?? "";
  const dmToken = auth.replace(/^Token\s+/i, "").trim();
  if (!dmToken) {
    return NextResponse.json(
      { error: "missing Authorization: Token <dm_token>" },
      { status: 401 },
    );
  }
  const platform =
    req.headers.get("x-platform") || config.mainTenantKey() || "";
  if (!platform) {
    return NextResponse.json(
      { error: "missing X-Platform header" },
      { status: 400 },
    );
  }

  let apiKey: string;
  try {
    apiKey = await resolveHeygenKey(platform, dmToken);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }

  const incoming = new URL(req.url);
  const target = new URL(`${upstreamBaseFor(path)}/${path.join("/")}`);
  incoming.searchParams.forEach((v, k) => target.searchParams.set(k, v));

  const headers = new Headers();
  headers.set("X-Api-Key", apiKey);
  headers.set("Accept", "application/json");
  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);

  const hasBody = req.method !== "GET" && req.method !== "HEAD";
  let body: ArrayBuffer | undefined;
  if (hasBody) {
    const buf = await req.arrayBuffer();
    if (buf.byteLength > 0) body = buf;
  }

  const upstream = await fetch(target.toString(), {
    method: req.method,
    headers,
    body,
  });

  const respHeaders = new Headers();
  for (const h of ["content-type", "content-length"]) {
    const v = upstream.headers.get(h);
    if (v) respHeaders.set(h, v);
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: respHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
};
