/**
 * ibl.ai AI-Proxy client.
 *
 * The ai-proxy service exposes third-party AI provider APIs (HeyGen,
 * ElevenLabs, etc.) through the platform's DM origin, handling auth and
 * tenant routing. Clients first call the discovery endpoint to learn the
 * available endpoints for a service, then invoke them by action slug via
 * a uniform POST request.
 *
 *   Discovery: GET  {dmUrl}/api/ai-proxy/orgs/{org}/services/{service}/
 *   Invoke:    POST {dmUrl}/api/ai-proxy/orgs/{org}/services/{service}/{action}/
 *     body: { body?, query?, headers?, path_params?, files? }
 *
 * Auth uses the DM token stored in localStorage.
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

export interface HeygenAvatar {
  id: string;
  name: string;
  preview_image_url?: string;
  preview_video_url?: string;
  created_at?: number;
  looks_count?: number;
  gender?: string;
  premium?: boolean;
  tags?: string[];
  default_voice_id?: string;
}

export interface HeygenAvatarPage {
  data: HeygenAvatar[];
  has_more?: boolean;
  next_token?: string | null;
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

/**
 * Fetch the service manifest and list of proxied endpoints. Cached per
 * tenant+service for the page lifetime.
 */
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

/**
 * Find an endpoint on a discovered service by path template and HTTP method.
 */
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
  /** JSON body forwarded to the upstream API. */
  body?: unknown;
  /** Query parameters forwarded to the upstream API. */
  query?: Record<string, string | number | boolean>;
  /** Additional headers forwarded to the upstream API. */
  headers?: Record<string, string>;
  /** Path template parameters (e.g. for /v1/text-to-speech/{voice_id}). */
  path_params?: Record<string, string | number>;
  /** Multipart file fields. */
  files?: Record<string, unknown>;
  /** Tenant override; defaults to resolveAppTenant(). */
  tenant?: string;
}

/**
 * Call a discovered endpoint by its action slug.
 *
 * All invocations go through POST /api/ai-proxy/orgs/{org}/services/{service}/{action}/.
 * The request is JSON by default, but switches to `multipart/form-data`
 * automatically when `init.files` contains a `Blob`/`File` — non-file
 * fields (`body`, `query`, `headers`, `path_params`) are sent as
 * JSON-stringified form parts, and each file is sent under its own key.
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
    // Do NOT set Content-Type — the browser adds the multipart boundary.
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

export interface HeygenAvatarGroupPageOptions {
  /** HeyGen avatar group id (maps to /v3/avatars/{group_id}). */
  groupId: string;
  /** Page size, 1-50 (default 20). */
  limit?: number;
  /** Opaque pagination cursor from a previous page. */
  token?: string;
  /** Tenant override; defaults to resolveAppTenant(). */
  tenant?: string;
}

/**
 * Fetch a single page of looks for a HeyGen avatar group via ai-proxy.
 *
 * The upstream API is `GET /v3/avatars/{group_id}`, but the proxy is
 * always invoked as a POST carrying `path_params` + `query` in the body.
 */
export async function getHeygenAvatarGroupPage(
  options: HeygenAvatarGroupPageOptions,
): Promise<HeygenAvatarPage> {
  const { tenant, groupId, limit, token } = options;
  const svc = await discoverService("heygen", tenant);
  const endpoint = findEndpoint(svc, "/v3/avatars/{group_id}", "GET");
  if (!endpoint) {
    throw new Error(
      "heygen: GET /v3/avatars/{group_id} endpoint not exposed by proxy",
    );
  }

  const query: Record<string, string | number> = {};
  if (limit !== undefined) query.limit = limit;
  if (token) query.token = token;

  const res = await callEndpoint<HeygenAvatarPage>("heygen", endpoint, {
    tenant,
    query,
    path_params: { group_id: groupId },
  });

  return {
    data: res.data ?? [],
    has_more: res.has_more,
    next_token: res.next_token ?? null,
  };
}

/**
 * File source accepted by HeyGen avatar-creation endpoints — one of a
 * hosted URL, a previously-uploaded asset id, or an inline base64 blob.
 */
export type HeygenFileSource =
  | { type: "url"; url: string }
  | { type: "asset_id"; asset_id: string }
  | { type: "base64"; media_type: string; data: string };

export interface HeygenAsset {
  asset_id: string;
  url: string;
  mime_type: string;
  size_bytes: number;
}

/**
 * Upload a file (image / video / audio / pdf) to HeyGen via ai-proxy.
 *
 * Upstream: `POST /v3/assets` (multipart/form-data, field `file`). The
 * returned `asset_id` can be passed to avatar-creation endpoints as
 * `{ type: "asset_id", asset_id }`.
 */
export async function uploadHeygenAsset(
  file: File,
  opts: { tenant?: string } = {},
): Promise<HeygenAsset> {
  const svc = await discoverService("heygen", opts.tenant);
  const endpoint = findEndpoint(svc, "/v3/assets", "POST");
  if (!endpoint) {
    throw new Error("heygen: POST /v3/assets endpoint not exposed by proxy");
  }
  const res = await callEndpoint<{ data?: HeygenAsset } & Partial<HeygenAsset>>(
    "heygen",
    endpoint,
    { tenant: opts.tenant, files: { file } },
  );
  return (res.data as HeygenAsset | undefined) ?? (res as HeygenAsset);
}

export interface CreateHeygenPhotoAvatarInput {
  type: "photo";
  name: string;
  file: HeygenFileSource;
  /** Attach to an existing identity; omit to create a new group. */
  avatar_group_id?: string | null;
}

export interface CreateHeygenDigitalTwinInput {
  type: "digital_twin";
  name: string;
  file: HeygenFileSource;
  avatar_group_id?: string | null;
}

export type CreateHeygenAvatarInput =
  | CreateHeygenPhotoAvatarInput
  | CreateHeygenDigitalTwinInput;

export type HeygenAvatarItemStatus =
  | "processing"
  | "pending_consent"
  | "completed"
  | "failed";

export interface HeygenAvatarItem {
  id: string;
  name: string;
  avatar_type: "studio_avatar" | "digital_twin" | "photo_avatar";
  group_id: string;
  status: HeygenAvatarItemStatus;
  created_at?: number;
  error?: { code: string; message: string };
}

export interface HeygenAvatarGroupSummary {
  id: string;
  name: string;
  created_at?: number;
  looks_count?: number;
  status: HeygenAvatarItemStatus;
  error?: { code: string; message: string };
}

export interface CreateHeygenAvatarResponse {
  avatar_item: HeygenAvatarItem;
  avatar_group: HeygenAvatarGroupSummary;
}

/**
 * Create a new HeyGen avatar (photo or digital twin) via ai-proxy.
 *
 * Upstream: `POST /v3/avatars`. Training is asynchronous — the response
 * carries `status: "processing"` (or `"pending_consent"` for digital
 * twins) and a `group_id` that becomes addressable via
 * `/v3/avatars/{group_id}` once training finishes.
 */
export async function createHeygenAvatar(
  input: CreateHeygenAvatarInput,
  opts: { tenant?: string } = {},
): Promise<CreateHeygenAvatarResponse> {
  const svc = await discoverService("heygen", opts.tenant);
  const endpoint = findEndpoint(svc, "/v3/avatars", "POST");
  if (!endpoint) {
    throw new Error("heygen: POST /v3/avatars endpoint not exposed by proxy");
  }

  const res = await callEndpoint<{ data: CreateHeygenAvatarResponse }>(
    "heygen",
    endpoint,
    { tenant: opts.tenant, body: input },
  );

  // The proxy may pass the upstream response through either wrapped in
  // `{data: ...}` (HeyGen convention) or unwrapped — accept both.
  const data = (res as { data?: CreateHeygenAvatarResponse }).data ?? (res as unknown as CreateHeygenAvatarResponse);
  return data;
}

export type HeygenVideoResolution = "4k" | "1080p" | "720p";
export type HeygenVideoAspectRatio = "16:9" | "9:16";
export type HeygenVideoOutputFormat = "mp4" | "webm";

export interface HeygenVoiceSettings {
  /** Playback speed 0.5-1.5. Default 1. */
  speed?: number;
  /** Pitch shift in semitones, -50 to 50. Default 0. */
  pitch?: number;
  /** Volume 0-1. Default 1. */
  volume?: number;
  /** Accent hint for multilingual voices (e.g. "en-US"). */
  locale?: string | null;
}

export interface HeygenBackgroundSetting {
  type: "color" | "image";
  /** Hex color when `type === "color"`. */
  value?: string | null;
  /** Image URL (mutually exclusive with asset_id) when `type === "image"`. */
  url?: string | null;
  /** Uploaded-asset id (mutually exclusive with url). */
  asset_id?: string | null;
}

export interface CreateHeygenAvatarVideoInput {
  type: "avatar";
  avatar_id: string;
  title?: string | null;
  script?: string | null;
  voice_id?: string | null;
  audio_url?: string | null;
  audio_asset_id?: string | null;
  voice_settings?: HeygenVoiceSettings | null;
  resolution?: HeygenVideoResolution | null;
  aspect_ratio?: HeygenVideoAspectRatio | null;
  output_format?: HeygenVideoOutputFormat;
  background?: HeygenBackgroundSetting | null;
  remove_background?: boolean | null;
  motion_prompt?: string | null;
  expressiveness?: "high" | "medium" | "low" | null;
  callback_url?: string | null;
  callback_id?: string | null;
}

export interface CreateHeygenImageVideoInput {
  type: "image";
  image: HeygenFileSource;
  title?: string | null;
  script?: string | null;
  voice_id?: string | null;
  audio_url?: string | null;
  audio_asset_id?: string | null;
  voice_settings?: HeygenVoiceSettings | null;
  resolution?: HeygenVideoResolution | null;
  aspect_ratio?: HeygenVideoAspectRatio | null;
  output_format?: HeygenVideoOutputFormat;
  background?: HeygenBackgroundSetting | null;
  remove_background?: boolean | null;
  motion_prompt?: string | null;
  callback_url?: string | null;
  callback_id?: string | null;
}

export type CreateHeygenVideoInput =
  | CreateHeygenAvatarVideoInput
  | CreateHeygenImageVideoInput;

export interface CreateHeygenVideoResponse {
  video_id: string;
  status: string;
  output_format: HeygenVideoOutputFormat;
}

/**
 * Create a video with a HeyGen avatar (or source image) via ai-proxy.
 *
 * Upstream: `POST /v3/videos`. Returns a `video_id` + initial `status`
 * (e.g. `"waiting"`); the final MP4/WebM URL is retrieved later via the
 * video-status endpoints (not yet wired here).
 */
export async function createHeygenVideo(
  input: CreateHeygenVideoInput,
  opts: { tenant?: string } = {},
): Promise<CreateHeygenVideoResponse> {
  const svc = await discoverService("heygen", opts.tenant);
  const endpoint = findEndpoint(svc, "/v3/videos", "POST");
  if (!endpoint) {
    throw new Error("heygen: POST /v3/videos endpoint not exposed by proxy");
  }
  const res = await callEndpoint<{ data?: CreateHeygenVideoResponse } & Partial<CreateHeygenVideoResponse>>(
    "heygen",
    endpoint,
    { tenant: opts.tenant, body: input },
  );
  return (res.data as CreateHeygenVideoResponse | undefined) ?? (res as CreateHeygenVideoResponse);
}

export type HeygenVideoStatus =
  | "pending"
  | "waiting"
  | "processing"
  | "completed"
  | "failed";

export interface HeygenVideoDetail {
  id: string;
  status: HeygenVideoStatus | string;
  video_url?: string;
  thumbnail_url?: string;
  gif_url?: string;
  captioned_video_url?: string;
  subtitle_url?: string;
  duration?: number;
  created_at?: number;
  completed_at?: number;
  title?: string;
  video_page_url?: string;
  output_language?: string;
  failure_code?: string;
  failure_message?: string;
}

export interface HeygenVoice {
  voice_id: string;
  name: string;
  language?: string;
  gender?: string;
  preview_audio_url?: string | null;
  support_pause?: boolean;
  support_locale?: boolean;
  type?: "public" | "private";
}

export interface HeygenVoicePage {
  data: HeygenVoice[];
  has_more?: boolean;
  next_token?: string | null;
}

export interface ListHeygenVoicesOptions {
  /** `public` = shared library; `private` = cloned voices. Default `public`. */
  type?: "public" | "private";
  /** Engine slug filter (e.g. "starfish"). */
  engine?: string;
  /** Language display name (e.g. "English"). */
  language?: string;
  /** Gender filter. */
  gender?: "male" | "female";
  /** Page size, 1-100 (default 20). */
  limit?: number;
  /** Opaque pagination cursor from a previous page. */
  token?: string;
  /** Tenant override; defaults to resolveAppTenant(). */
  tenant?: string;
}

/**
 * Fetch a single page of HeyGen voices via ai-proxy. Use `next_token`
 * from the response with the `token` option to fetch subsequent pages.
 */
export async function listHeygenVoicesPage(
  options: ListHeygenVoicesOptions = {},
): Promise<HeygenVoicePage> {
  const { tenant, type, engine, language, gender, limit, token } = options;
  const svc = await discoverService("heygen", tenant);
  const endpoint = findEndpoint(svc, "/v3/voices", "GET");
  if (!endpoint) {
    throw new Error("heygen: GET /v3/voices endpoint not exposed by proxy");
  }

  const query: Record<string, string | number> = {};
  if (type) query.type = type;
  if (engine) query.engine = engine;
  if (language) query.language = language;
  if (gender) query.gender = gender;
  if (limit !== undefined) query.limit = limit;
  if (token) query.token = token;

  const res = await callEndpoint<HeygenVoicePage>("heygen", endpoint, {
    tenant,
    query,
  });
  return {
    data: res.data ?? [],
    has_more: res.has_more,
    next_token: res.next_token ?? null,
  };
}

/**
 * Fetch the current status (and final URL once ready) of a HeyGen video
 * job via ai-proxy.
 *
 * Upstream: `GET /v3/videos/{video_id}`. Upstream is GET; the proxy is
 * invoked as POST with `path_params: { video_id }` as usual.
 */
export async function getHeygenVideoStatus(
  videoId: string,
  opts: { tenant?: string } = {},
): Promise<HeygenVideoDetail> {
  const svc = await discoverService("heygen", opts.tenant);
  const endpoint = findEndpoint(svc, "/v3/videos/{video_id}", "GET");
  if (!endpoint) {
    throw new Error(
      "heygen: GET /v3/videos/{video_id} endpoint not exposed by proxy",
    );
  }
  const res = await callEndpoint<{ data?: HeygenVideoDetail } & Partial<HeygenVideoDetail>>(
    "heygen",
    endpoint,
    { tenant: opts.tenant, path_params: { video_id: videoId } },
  );
  return (res.data as HeygenVideoDetail | undefined) ?? (res as HeygenVideoDetail);
}
