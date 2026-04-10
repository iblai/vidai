"use client"

import { useState, useEffect, use } from "react"
import { Button } from "@/components/ui/button"
import { Download, Share2, ArrowLeft, Copy, Check } from "lucide-react"
import { useRouter } from "next/navigation"

export default function VideoWatchPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [video, setVideo] = useState<{
    id: string
    title: string
    videoUrl: string
    thumbnail: string
    duration: string
    createdAt: string
  } | null>(null)

  useEffect(() => {
    // In a real app, fetch video details from API using params.id
    // For now, use a placeholder
    setVideo({
      id: params.id,
      title: "Shared Video",
      videoUrl: "",
      thumbnail: "",
      duration: "",
      createdAt: new Date().toLocaleDateString(),
    })
  }, [params.id])

  const handleDownload = () => {
    if (!video?.videoUrl) return
    const link = document.createElement("a")
    link.href = video.videoUrl
    link.download = `${video.title}.mp4`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!video) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-white text-lg font-semibold">{video.title}</h1>
              {video.createdAt && (
                <p className="text-gray-400 text-sm">{video.createdAt}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                } catch {
                  // Fallback: do nothing
                }
              }}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
            >
              {copied ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDownload}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              disabled={!video.videoUrl}
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl">
          {video.videoUrl ? (
            <div className="relative aspect-video w-full bg-black rounded-lg overflow-hidden">
              <video
                src={video.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
                poster={video.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="relative aspect-video w-full bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-400 text-lg mb-2">Video not available</p>
                <p className="text-gray-500 text-sm">This video may have been removed or is still processing.</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
