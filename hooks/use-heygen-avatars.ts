"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getHeygenAvatarGroupPage,
  type HeygenAvatar,
} from "@/lib/heygen/rest";
import { listHeygenPrivateAvatarResources } from "@/lib/iblai/catalog";
import { resolveAppTenant } from "@/lib/iblai/tenant";

export interface UseHeygenAvatarsOptions {
  /** Page size for the per-group avatars request, 1-50. Defaults to 50. */
  pageSize?: number;
  /** Tenant override; defaults to resolveAppTenant() at fetch time. */
  platform?: string;
}

/**
 * Loads the current user's private HeyGen avatars.
 *
 * Pipeline:
 *   1. List tenant-wide catalog resources (resource_type=heygen_private_avatar)
 *      to learn which HeyGen avatar groups belong to this platform.
 *   2. Expand each group via HeyGen REST /v3/avatars/{group_id} using
 *      the user's OAuth token — calls go direct, not through the proxy.
 *   3. Flatten all looks into a single `avatars` array.
 */
export function useHeygenAvatars(options: UseHeygenAvatarsOptions = {}) {
  const { pageSize = 50, platform: platformOverride } = options;

  const [avatars, setAvatars] = useState<HeygenAvatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const resolvePlatform = useCallback(
    () => platformOverride ?? resolveAppTenant(),
    [platformOverride],
  );

  const fetchPrivateAll = useCallback(async (): Promise<HeygenAvatar[]> => {
    const platform = resolvePlatform();
    if (!platform) return [];

    const resources = await listHeygenPrivateAvatarResources(platform);
    const groupIds = resources
      .map((r) => r.data?.id)
      .filter((id): id is string => !!id);
    if (groupIds.length === 0) return [];

    const pages = await Promise.all(
      groupIds.map((gid) =>
        getHeygenAvatarGroupPage({ groupId: gid, limit: pageSize }).catch(
          (err) => {
            console.warn(
              "[use-heygen-avatars] group fetch failed:",
              gid,
              err,
            );
            return { data: [] as HeygenAvatar[] };
          },
        ),
      ),
    );
    return pages.flatMap((p) => p.data);
  }, [pageSize, resolvePlatform]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchPrivateAll()
      .then((data) => {
        if (cancelled) return;
        setAvatars(data);
      })
      .catch((err: unknown) => {
        console.error("[use-heygen-avatars] load failed:", err);
        if (!cancelled) {
          setError((err as Error)?.message ?? "Failed to load avatars");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchPrivateAll]);

  return { avatars, loading, error };
}
