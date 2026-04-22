/**
 * HeyGen REST client (browser).
 *
 * Every request goes through `/api/heygen/<path>` — our same-origin
 * server proxy, which resolves the tenant's HeyGen API key via ibl.ai's
 * ai-account service and forwards the call to `api.heygen.com`. The
 * browser never sees a HeyGen API key; it only presents its ibl.ai DM
 * token so the server can look up the right credential.
 *
 * HeyGen response shapes are returned unmodified so callers see exactly
 * what the upstream produced.
 */
import { resolveAppTenant } from "@/lib/iblai/tenant"

const API_BASE = "/api/heygen"

function getDmToken(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("dm_token") ?? ""
}

function authHeaders(): Record<string, string> {
  const token = getDmToken()
  if (!token) throw new Error("heygen: missing DM token (user not authenticated)")
  const platform = resolveAppTenant()
  if (!platform) throw new Error("heygen: no tenant resolved")
  return {
    Authorization: `Token ${token}`,
    "X-Platform": platform,
  }
}

export interface HeygenRestInit extends Omit<RequestInit, "headers" | "body"> {
  query?: Record<string, string | number | boolean | undefined | null>
  headers?: Record<string, string>
  body?: unknown
}

async function request<T>(path: string, init: HeygenRestInit = {}): Promise<T> {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  if (init.query) {
    for (const [k, v] of Object.entries(init.query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v))
    }
  }
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...authHeaders(),
    ...(init.headers ?? {}),
  }

  let body: BodyInit | undefined
  if (init.body instanceof FormData || init.body instanceof Blob) {
    body = init.body
  } else if (init.body !== undefined) {
    body = JSON.stringify(init.body)
    headers["Content-Type"] = "application/json"
  }

  const res = await fetch(url.toString(), { ...init, headers, body })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`heygen ${path}: ${res.status} ${text.slice(0, 300)}`)
  }
  return (await res.json()) as T
}

/** HeyGen wraps every successful v3 payload in `{data: ...}`. Unwrap here. */
function unwrap<T>(res: { data?: T } & Partial<T>): T {
  return (res.data as T | undefined) ?? (res as T)
}

// ──────────────────────────────────────────────────────────────────────
// Voices

export interface HeygenVoice {
  voice_id: string
  name: string
  language?: string
  gender?: string
  preview_audio_url?: string | null
  support_pause?: boolean
  support_locale?: boolean
  type?: "public" | "private"
}

export interface HeygenVoicePage {
  data: HeygenVoice[]
  has_more?: boolean
  next_token?: string | null
}

export interface ListHeygenVoicesOptions {
  type?: "public" | "private"
  engine?: string
  language?: string
  gender?: "male" | "female"
  limit?: number
  token?: string
}

export async function listHeygenVoicesPage(
  opts: ListHeygenVoicesOptions = {},
): Promise<HeygenVoicePage> {
  const res = await request<HeygenVoicePage>("/v3/voices", {
    method: "GET",
    query: {
      type: opts.type,
      engine: opts.engine,
      language: opts.language,
      gender: opts.gender,
      limit: opts.limit,
      token: opts.token,
    },
  })
  return {
    data: res.data ?? [],
    has_more: res.has_more,
    next_token: res.next_token ?? null,
  }
}

// ──────────────────────────────────────────────────────────────────────
// Avatar groups / looks

export interface HeygenAvatar {
  id: string
  name: string
  preview_image_url?: string
  preview_video_url?: string
  created_at?: number
  looks_count?: number
  gender?: string
  premium?: boolean
  tags?: string[]
  default_voice_id?: string
}

export interface HeygenAvatarPage {
  data: HeygenAvatar[]
  has_more?: boolean
  next_token?: string | null
}

export async function getHeygenAvatarGroupPage(opts: {
  groupId: string
  limit?: number
  token?: string
}): Promise<HeygenAvatarPage> {
  const res = await request<HeygenAvatarPage>(
    `/v3/avatars/${encodeURIComponent(opts.groupId)}`,
    {
      method: "GET",
      query: { limit: opts.limit, token: opts.token },
    },
  )
  return {
    data: res.data ?? [],
    has_more: res.has_more,
    next_token: res.next_token ?? null,
  }
}

// ──────────────────────────────────────────────────────────────────────
// Photo avatar creation
//
// Multi-step HeyGen pipeline:
//   1. POST /v1/asset                      → { image_key }
//   2. POST /v2/photo_avatar/avatar_group/create  { name, image_key } → { group_id }
//   3. POST /v2/photo_avatar/train         { group_id }
//   4. GET  /v2/photo_avatar/train/status/{group_id}  → { status: "pending"|"ready" }
//
// Step 1 hits upload.heygen.com (not api.heygen.com) — the proxy routes
// `/v1/asset*` to the correct upstream.

export interface HeygenUploadedAsset {
  /** Internal asset id. */
  id: string
  /** What downstream photo-avatar endpoints consume. */
  image_key: string
  file_type: string
  url: string
}

export async function uploadHeygenAsset(
  file: File,
): Promise<HeygenUploadedAsset> {
  const res = await fetch(`${API_BASE}/v1/asset`, {
    method: "POST",
    headers: {
      ...authHeaders(),
      "Content-Type": file.type || "application/octet-stream",
      Accept: "application/json",
    },
    body: file,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`heygen /v1/asset: ${res.status} ${text.slice(0, 300)}`)
  }
  const json = (await res.json()) as {
    data?: HeygenUploadedAsset
  } & Partial<HeygenUploadedAsset>
  return unwrap(json)
}

export interface CreateHeygenPhotoAvatarGroupInput {
  name: string
  image_key: string
}

export interface HeygenPhotoAvatarGroup {
  /** Group id — used everywhere downstream (train, status, list). */
  group_id: string
  /** Id of the individual look within the group. */
  id?: string
  image_url?: string
}

export async function createHeygenPhotoAvatarGroup(
  input: CreateHeygenPhotoAvatarGroupInput,
): Promise<HeygenPhotoAvatarGroup> {
  const res = await request<
    { data?: HeygenPhotoAvatarGroup } & Partial<HeygenPhotoAvatarGroup>
  >("/v2/photo_avatar/avatar_group/create", { method: "POST", body: input })
  return unwrap(res)
}

export interface HeygenPhotoAvatarLookDetail {
  id: string
  group_id: string
  name: string
  status: "pending" | "completed" | "failed" | string
  image_url?: string
}

/**
 * Fetch the look (photo) belonging to a group. Immediately after
 * `createHeygenPhotoAvatarGroup` returns, the photo is still processing
 * server-side — poll this until `status === "completed"` before calling
 * `trainHeygenPhotoAvatarGroup`.
 */
export async function getHeygenPhotoAvatarLook(
  lookOrGroupId: string,
): Promise<HeygenPhotoAvatarLookDetail> {
  const res = await request<
    { data?: HeygenPhotoAvatarLookDetail } & Partial<HeygenPhotoAvatarLookDetail>
  >(`/v2/photo_avatar/${encodeURIComponent(lookOrGroupId)}`, { method: "GET" })
  return unwrap(res)
}

export interface TrainHeygenPhotoAvatarResponse {
  flow_id?: string
}

export async function trainHeygenPhotoAvatarGroup(
  groupId: string,
): Promise<TrainHeygenPhotoAvatarResponse> {
  // The train endpoint wraps its payload in a nested `{data: {data: {...}}}`
  // envelope (see docs). Peel both layers.
  const res = await request<{
    data?: { data?: TrainHeygenPhotoAvatarResponse }
  }>("/v2/photo_avatar/train", {
    method: "POST",
    body: { group_id: groupId },
  })
  return res.data?.data ?? {}
}

/**
 * Wait for HeyGen to finish processing the uploaded photo, then kick
 * off training. Polls the look detail every `intervalMs` up to
 * `timeoutMs` total. Rejects if the photo enters a `failed` state or
 * processing exceeds the timeout.
 */
export async function finalizeAndTrainPhotoAvatarGroup(
  groupId: string,
  { intervalMs = 2000, timeoutMs = 60000 }: {
    intervalMs?: number
    timeoutMs?: number
  } = {},
): Promise<TrainHeygenPhotoAvatarResponse> {
  const deadline = Date.now() + timeoutMs
  // Poll the look detail — `id` equals `group_id` when the group has one
  // look, which is the case for single-photo uploads.
  for (;;) {
    const look = await getHeygenPhotoAvatarLook(groupId)
    if (look.status === "completed") break
    if (look.status === "failed") {
      throw new Error(`HeyGen photo processing failed (${look.status})`)
    }
    if (Date.now() > deadline) {
      throw new Error(
        `HeyGen photo processing timed out (last status: ${look.status})`,
      )
    }
    await new Promise((r) => setTimeout(r, intervalMs))
  }
  return trainHeygenPhotoAvatarGroup(groupId)
}

export type HeygenPhotoAvatarTrainStatus = "pending" | "ready" | string

export interface HeygenPhotoAvatarTrainDetail {
  status: HeygenPhotoAvatarTrainStatus
  error_msg?: string | null
  created_at?: number
  updated_at?: number | null
}

export async function getHeygenPhotoAvatarTrainStatus(
  groupId: string,
): Promise<HeygenPhotoAvatarTrainDetail> {
  const res = await request<
    { data?: HeygenPhotoAvatarTrainDetail } & Partial<HeygenPhotoAvatarTrainDetail>
  >(`/v2/photo_avatar/train/status/${encodeURIComponent(groupId)}`, {
    method: "GET",
  })
  return unwrap(res)
}

// ──────────────────────────────────────────────────────────────────────
// Video generation + status

export type HeygenVideoAspectRatio = "16:9" | "9:16"
export type HeygenVideoResolution = "720p" | "1080p" | "4k"

export interface CreateHeygenVideoInput {
  avatar_id: string
  voice_id: string
  script: string
  aspect_ratio?: HeygenVideoAspectRatio
  title?: string
}

const DIMENSIONS: Record<
  HeygenVideoAspectRatio,
  { width: number; height: number }
> = {
  "16:9": { width: 1280, height: 720 },
  "9:16": { width: 720, height: 1280 },
}

export interface CreateHeygenVideoResponse {
  video_id: string
}

/**
 * Kick off a text-to-video generation against HeyGen's classic video
 * endpoint. Returns `{video_id}` — poll `getHeygenVideoStatus(video_id)`
 * until status transitions to "completed" or "failed".
 */
export async function createHeygenVideo(
  input: CreateHeygenVideoInput,
): Promise<CreateHeygenVideoResponse> {
  const dim = DIMENSIONS[input.aspect_ratio ?? "16:9"]
  const res = await request<
    { data?: CreateHeygenVideoResponse } & Partial<CreateHeygenVideoResponse>
  >("/v2/video/generate", {
    method: "POST",
    body: {
      video_inputs: [
        {
          character: {
            type: "avatar",
            avatar_id: input.avatar_id,
            avatar_style: "normal",
          },
          voice: {
            type: "text",
            voice_id: input.voice_id,
            input_text: input.script,
          },
        },
      ],
      dimension: dim,
      title: input.title,
    },
  })
  return unwrap(res)
}

export type HeygenVideoStatus =
  | "pending"
  | "waiting"
  | "processing"
  | "completed"
  | "failed"

export interface HeygenVideoDetail {
  id: string
  status: HeygenVideoStatus | string
  video_url?: string
  thumbnail_url?: string
  gif_url?: string
  captioned_video_url?: string
  subtitle_url?: string
  duration?: number
  created_at?: number
  completed_at?: number
  title?: string
  video_page_url?: string
  output_language?: string
  failure_code?: string
  failure_message?: string
}

export async function getHeygenVideoStatus(
  videoId: string,
): Promise<HeygenVideoDetail> {
  const res = await request<
    { data?: HeygenVideoDetail } & Partial<HeygenVideoDetail>
  >(`/v3/videos/${encodeURIComponent(videoId)}`, { method: "GET" })
  return unwrap(res)
}
