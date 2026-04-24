"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  getHeygenAvatarGroup,
  type HeygenAvatar,
} from "@/lib/heygen/rest";
import {
  listHeygenPrivateAvatarResources,
  type HeygenPrivateAvatarResource,
} from "@/lib/iblai/catalog";
import { resolveAppTenant } from "@/lib/iblai/tenant";

export interface UseHeygenAvatarsOptions {
  /** Tenant override; defaults to resolveAppTenant() at fetch time. */
  platform?: string;
}

export interface UseHeygenAvatarsResult {
  avatars: HeygenAvatar[];
  loading: boolean;
  error: string | null;
  /** Re-fetch a specific group (used by status polling). */
  refetchGroup: (groupId: string) => Promise<void>;
}

/**
 * Loads the current user's private HeyGen avatars.
 *
 * Pipeline:
 *   1. List tenant-wide catalog resources (resource_type=heygen_private_avatar)
 *      to learn which HeyGen avatar groups belong to this platform.
 *   2. Fetch each group via /v3/avatars/{group_id}. One group == one
 *      user-facing "avatar", so there's no flatten step.
 */
export function useHeygenAvatars(
  options: UseHeygenAvatarsOptions = {},
): UseHeygenAvatarsResult {
  const { platform: platformOverride } = options;

  const [avatars, setAvatars] = useState<HeygenAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** group_id → catalog-stored thumbnail URL (the thumbnail we captured
   *  client-side at creation time, because HeyGen's preview_image_url
   *  is unsigned/403 for digital twins). */
  const catalogThumbsRef = useRef<Map<string, string>>(new Map());

  const resolvePlatform = useCallback(
    () => platformOverride ?? resolveAppTenant(),
    [platformOverride],
  );

  const mergeThumb = useCallback((group: HeygenAvatar): HeygenAvatar => {
    const thumb = catalogThumbsRef.current.get(group.id);
    if (thumb) return { ...group, preview_image_url: thumb };
    return group;
  }, []);

  const refetchGroup = useCallback(
    async (groupId: string) => {
      try {
        const updated = await getHeygenAvatarGroup(groupId);
        const merged = mergeThumb(updated);
        setAvatars((prev) =>
          prev.map((a) => (a.id === groupId ? merged : a)),
        );
      } catch (err) {
        console.warn("[use-heygen-avatars] refetch failed:", groupId, err);
      }
    },
    [mergeThumb],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const platform = resolvePlatform();
        if (!platform) {
          if (!cancelled) setAvatars([]);
          return;
        }

        const resources: HeygenPrivateAvatarResource[] =
          await listHeygenPrivateAvatarResources(platform);

        // Remember each catalog-stored thumbnail by group_id so we can
        // merge it into the HeyGen group response (HeyGen's own
        // preview_image_url 403s for digital twins).
        const thumbs = new Map<string, string>();
        for (const r of resources) {
          if (r.data?.id && r.data.image_url) {
            thumbs.set(r.data.id, r.data.image_url);
          }
        }
        catalogThumbsRef.current = thumbs;

        const groupIds = resources
          .map((r) => r.data?.id)
          .filter((id): id is string => !!id);

        const groups = await Promise.all(
          groupIds.map(async (gid) => {
            try {
              return await getHeygenAvatarGroup(gid);
            } catch (err) {
              console.warn(
                "[use-heygen-avatars] group fetch failed:",
                gid,
                err,
              );
              return null;
            }
          }),
        );
        if (cancelled) return;
        setAvatars(
          groups
            .filter((g): g is HeygenAvatar => !!g)
            .map(mergeThumb),
        );
      } catch (err: unknown) {
        console.error("[use-heygen-avatars] load failed:", err);
        if (!cancelled) {
          setError((err as Error)?.message ?? "Failed to load avatars");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvePlatform]);

  return { avatars, loading, error, refetchGroup };
}
