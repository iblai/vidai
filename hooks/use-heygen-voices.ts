"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listHeygenVoicesPage,
  type HeygenVoice,
  type ListHeygenVoicesOptions,
} from "@/lib/heygen/rest";

export interface UseHeygenVoicesOptions {
  /** `public` = shared HeyGen library; `private` = user's cloned voices. */
  type: "public" | "private";
  /** Page size per upstream request, 1-100. Defaults to 50. */
  pageSize?: number;
  /** Optional extra filters forwarded to the upstream list-voices endpoint. */
  filter?: Pick<ListHeygenVoicesOptions, "engine" | "language" | "gender">;
}

/**
 * Paginated HeyGen voice loader. Fetches the first page on mount and
 * whenever `type` changes. Call `loadMore()` to append the next page
 * using the upstream `next_token` cursor. Talks to HeyGen REST directly
 * using the user's OAuth token.
 */
export function useHeygenVoices(options: UseHeygenVoicesOptions) {
  const { type, pageSize = 50, filter } = options;

  const [voices, setVoices] = useState<HeygenVoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  // Stringify filter for stable dep comparison (filter is usually an
  // inline object literal, so identity would flicker every render).
  const filterKey = JSON.stringify(filter ?? {});

  useEffect(() => {
    let cancelled = false;
    setVoices([]);
    setToken(undefined);
    setHasMore(true);
    setError(null);
    setLoading(true);

    (async () => {
      try {
        const page = await listHeygenVoicesPage({
          type,
          limit: pageSize,
          ...(filter ?? {}),
        });
        if (cancelled) return;
        setVoices(page.data);
        setToken(page.next_token ?? undefined);
        setHasMore(!!(page.has_more && page.next_token));
      } catch (err: unknown) {
        if (cancelled) return;
        console.error("[use-heygen-voices] initial load failed:", err);
        setError((err as Error)?.message ?? "Failed to load voices");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [type, pageSize, filterKey, filter]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await listHeygenVoicesPage({
        type,
        limit: pageSize,
        token,
        ...(filter ?? {}),
      });
      if (page.data.length > 0) {
        setVoices((prev) => [...prev, ...page.data]);
      }
      setToken(page.next_token ?? undefined);
      setHasMore(!!(page.has_more && page.next_token));
    } catch (err: unknown) {
      console.error("[use-heygen-voices] loadMore failed:", err);
      setError((err as Error)?.message ?? "Failed to load voices");
    } finally {
      setLoadingMore(false);
    }
  }, [filter, hasMore, loadingMore, pageSize, token, type]);

  return { voices, loading, loadingMore, error, loadMore, hasMore };
}
