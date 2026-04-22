/**
 * ibl.ai AI-Proxy client.
 *
 * The ai-proxy service exposes third-party AI provider APIs through the
 * platform's DM origin, handling auth and tenant routing. Clients first
 * call the discovery endpoint to learn the available endpoints for a
 * service, then invoke them by action slug via a uniform POST.
 *
 *   Discovery: GET  {dmUrl}/api/ai-proxy/orgs/{org}/services/{service}/
 *   Invoke:    POST {dmUrl}/api/ai-proxy/orgs/{org}/services/{service}/{action}/
 *     body: { body?, query?, headers?, path_params?, files? }
 *
 * Auth uses the DM token stored in localStorage.
 *
 * HeyGen is intentionally NOT exposed here — HeyGen goes through
 * `/api/heygen/*` (see lib/heygen/rest.ts and app/api/heygen), which
 * resolves the tenant's HeyGen API key server-side via ai-account's
 * integration-credential endpoint. This module is retained for other
 * providers that go through the generic ai-proxy service.
 */

import config from "./config";
import { resolveAppTenant } from "./tenant";

export interface ProxyEndpoint {
  slug: string;
  path_template: string;
  http_method: string;
  request_mode?: string;
  response_mode?: string;
  supports_streaming?: boolean;
  callback_mode?: string;
  is_enabled?: boolean;
}

export interface ProxyService {
  slug: string;
  display_name: string;
  base_url: string;
  service_type: string;
  auth_mode: string;
  is_enabled: boolean;
  supports_async_jobs: boolean;
  supports_streaming: boolean;
  default_timeout_seconds: number;
  credential_name: string;
  endpoints: ProxyEndpoint[];
}

function getDmToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("dm_token") ?? "";
}

function proxyBase(service: string, tenant?: string): string {
  const platform = tenant ?? resolveAppTenant();
  if (!platform) {
    throw new Error("ai-proxy: no tenant/platform resolved");
  }
  return `${config.dmUrl()}/api/ai-proxy/orgs/${platform}/services/${service}`;
}

function authHeaders(): Record<string, string> {
  const token = getDmToken();
  if (!token) {
    throw new Error("ai-proxy: missing DM token (user not authenticated)");
  }
  return { Authorization: `Token ${token}` };
}

/**
 * In-flight + resolved discovery promises, keyed by `${tenant}:${service}`.
 * Cached for the lifetime of the page so repeated endpoint lookups don't
 * re-hit the discovery endpoint on every call.
 */
const discoveryCache = new Map<string, Promise<ProxyService>>();

export async function discoverService(
  service: string,
  tenant?: string,
): Promise<ProxyService> {
  const platform = tenant ?? resolveAppTenant();
  const key = `${platform}:${service}`;
  const cached = discoveryCache.get(key);
  if (cached) return cached;

  const promise = (async () => {
    const res = await fetch(`${proxyBase(service, tenant)}/`, {
      method: "GET",
      headers: { ...authHeaders(), Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(
        `ai-proxy discovery failed for ${service}: ${res.status} ${res.statusText}`,
      );
    }
    return res.json();
  })();

  discoveryCache.set(key, promise);
  try {
    return await promise;
  } catch (err) {
    discoveryCache.delete(key);
    throw err;
  }
}

export function findEndpoint(
  svc: ProxyService,
  pathTemplate: string,
  method: string,
): ProxyEndpoint | undefined {
  const m = method.toUpperCase();
  return svc.endpoints.find(
    (e) =>
      e.is_enabled !== false &&
      e.path_template === pathTemplate &&
      e.http_method.toUpperCase() === m,
  );
}

export interface CallEndpointInit {
  body?: unknown;
  query?: Record<string, string | number | boolean>;
  headers?: Record<string, string>;
  path_params?: Record<string, string | number>;
  files?: Record<string, unknown>;
  tenant?: string;
}

/**
 * Call a discovered endpoint by its action slug. Switches to
 * multipart/form-data automatically when `init.files` contains a
 * `Blob`/`File`.
 */
export async function callEndpoint<T = unknown>(
  service: string,
  endpoint: ProxyEndpoint,
  init?: CallEndpointInit,
): Promise<T> {
  const url = `${proxyBase(service, init?.tenant)}/${endpoint.slug}/`;

  const fileEntries = Object.entries(init?.files ?? {});
  const hasBinary = fileEntries.some(([, v]) => v instanceof Blob);

  let body: BodyInit;
  const headers: Record<string, string> = {
    ...authHeaders(),
    Accept: "application/json",
  };

  if (hasBinary) {
    const form = new FormData();
    if (init?.body !== undefined) form.append("body", JSON.stringify(init.body));
    if (init?.query) form.append("query", JSON.stringify(init.query));
    if (init?.headers) form.append("headers", JSON.stringify(init.headers));
    if (init?.path_params) form.append("path_params", JSON.stringify(init.path_params));
    for (const [key, value] of fileEntries) {
      if (value instanceof File) form.append(key, value, value.name);
      else if (value instanceof Blob) form.append(key, value);
      else form.append(key, String(value));
    }
    body = form;
  } else {
    const payload: Record<string, unknown> = {};
    if (init?.body !== undefined) payload.body = init.body;
    if (init?.query) payload.query = init.query;
    if (init?.headers) payload.headers = init.headers;
    if (init?.path_params) payload.path_params = init.path_params;
    if (init?.files) payload.files = init.files;
    body = JSON.stringify(payload);
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { method: "POST", headers, body });
  if (!res.ok) {
    throw new Error(
      `ai-proxy call ${service}/${endpoint.slug} failed: ${res.status} ${res.statusText}`,
    );
  }
  return res.json() as Promise<T>;
}
