"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Play, Loader2 } from "lucide-react"
import Image from "next/image"
import VideoPlayerModal from "@/components/modals/video-player-modal"
import { listHeygenVideosPage, type HeygenVideoDetail } from "@/lib/heygen/rest"
import { resolveAppTenant } from "@/lib/iblai/tenant"

/**
 * Community lists videos from the platform's shared "main" tenant, not
 * the viewer's own tenant — every user sees the same curated library.
 */
const MAIN_TENANT = "main"

const PAGE_SIZE = 24

interface CommunityVideo {
  id: string
  name: string
  thumbnail: string
  duration: string
  videoUrl: string
  createdAt: string
  status: string
}

function formatDuration(seconds?: number): string {
  if (!seconds || Number.isNaN(seconds)) return ""
  const s = Math.round(seconds)
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, "0")}`
}

function toCommunityVideo(v: HeygenVideoDetail): CommunityVideo {
  return {
    id: v.id,
    name: v.title || "Untitled",
    thumbnail: v.thumbnail_url || "/placeholder.svg",
    duration: formatDuration(v.duration),
    videoUrl: v.video_url ?? "",
    createdAt: v.created_at
      ? new Date(v.created_at * 1000).toLocaleDateString()
      : "",
    status: (v.status ?? "").toLowerCase(),
  }
}

export default function CommunityPage() {
  const [videos, setVideos] = useState<CommunityVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [token, setToken] = useState<string | undefined>(undefined)
  const [hasMore, setHasMore] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [selected, setSelected] = useState<CommunityVideo | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [viewerTenant, setViewerTenant] = useState<string>("")
  const requestIdRef = useRef(0)

  useEffect(() => {
    setViewerTenant(resolveAppTenant())
  }, [])

  const viewerOnMainTenant = viewerTenant === MAIN_TENANT

  // Debounce the search input so we only hit HeyGen once per typing burst.
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 400)
    return () => clearTimeout(handle)
  }, [searchQuery])

  const loadFirstPage = useCallback(async (title: string) => {
    const requestId = ++requestIdRef.current
    setLoading(true)
    try {
      const page = await listHeygenVideosPage({
        limit: PAGE_SIZE,
        title: title || undefined,
        platform: MAIN_TENANT,
      })
      if (requestId !== requestIdRef.current) return
      setVideos(page.data.map(toCommunityVideo).filter((v) => v.status !== "failed"))
      setToken(page.next_token ?? undefined)
      setHasMore(!!(page.has_more && page.next_token))
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      console.error("[community] load failed:", err)
      setVideos([])
      setHasMore(false)
    } finally {
      if (requestId === requestIdRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFirstPage(debouncedQuery)
  }, [debouncedQuery, loadFirstPage])

  const loadMore = async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)
    try {
      const page = await listHeygenVideosPage({
        limit: PAGE_SIZE,
        token,
        title: debouncedQuery || undefined,
        platform: MAIN_TENANT,
      })
      setVideos((prev) => [
        ...prev,
        ...page.data.map(toCommunityVideo).filter((v) => v.status !== "failed"),
      ])
      setToken(page.next_token ?? undefined)
      setHasMore(!!(page.has_more && page.next_token))
    } catch (err) {
      console.error("[community] loadMore failed:", err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleContentClick = (video: CommunityVideo) => {
    setSelected(video)
    setPlayerOpen(true)
  }

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#4E5460] mb-6">Community</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading videos…
        </div>
      ) : videos.length === 0 ? (
        <div className="py-16 text-center text-gray-500">
          {debouncedQuery
            ? `No videos found matching "${debouncedQuery}".`
            : viewerOnMainTenant
              ? "No videos yet. Generate one on the Videos page to see it here."
              : "No community videos available yet."}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {videos.map((video) => (
              <Card
                key={video.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-[#D0E0FF] bg-[#F5F8FF] group"
                onClick={() => handleContentClick(video)}
              >
                <CardContent className="p-0">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    {video.thumbnail && (
                      <Image
                        src={video.thumbnail}
                        alt={video.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <Play className="text-white w-12 h-12" />
                    </div>
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    )}
                    {video.status && video.status !== "completed" && (
                      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded capitalize">
                        {video.status}
                      </div>
                    )}
                  </div>
                  <div className="p-3 text-left">
                    <h3 className="font-medium text-[#4E5460] text-sm line-clamp-2">
                      {video.name}
                    </h3>
                    {video.createdAt && (
                      <p className="text-xs text-gray-500 mt-1">{video.createdAt}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading more…
                  </>
                ) : (
                  "Load more"
                )}
              </Button>
            </div>
          )}
        </>
      )}

      <VideoPlayerModal
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        video={
          selected
            ? {
                id: selected.id,
                title: selected.name,
                thumbnail: selected.thumbnail,
                videoUrl: selected.videoUrl,
                duration: selected.duration,
                createdAt: selected.createdAt,
              }
            : null
        }
      />
    </div>
  )
}
