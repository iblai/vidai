"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Image from "next/image"
import VideoPlayerModal from "@/components/modals/video-player-modal"

interface VideoClip {
  id: string
  title: string
  thumbnail: string
  videoUrl: string
  duration: string
  createdAt: string
  isGenerating?: boolean
  progress?: number
}

export default function MyVideoClipsPage() {
  const [selectedVideo, setSelectedVideo] = useState<VideoClip | null>(null)
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false)
  const [videoClips, setVideoClips] = useState<VideoClip[]>([])

  useEffect(() => {
    const savedVideos = JSON.parse(localStorage.getItem("myVideoClips") || "[]")

    // If no saved videos, add some default scene video clips
    if (savedVideos.length === 0) {
      const defaultSceneVideos: VideoClip[] = [
        {
          id: "scene-1",
          title: "Modern Classroom Environment",
          thumbnail: "/images/video-thumbnails/modern-classroom.png", // Updated thumbnail path to actual image
          videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luma-jCiFM7KKk5QHN1NOGuzcjBcWynmi7n.mp4",
          duration: "0:45",
          createdAt: "2 days ago",
        },
        {
          id: "scene-2",
          title: "University Library Study Area",
          thumbnail: "/images/video-thumbnails/library-study-area.png", // Updated thumbnail path to actual image
          videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luma-jCiFM7KKk5QHN1NOGuzcjBcWynmi7n.mp4",
          duration: "1:12",
          createdAt: "3 days ago",
        },
        {
          id: "scene-3",
          title: "Science Laboratory Setup",
          thumbnail: "/images/video-thumbnails/science-laboratory.png", // Updated thumbnail path to actual image
          videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luma-jCiFM7KKk5QHN1NOGuzcjBcWynmi7n.mp4",
          duration: "0:38",
          createdAt: "5 days ago",
        },
        {
          id: "scene-4",
          title: "Campus Outdoor Courtyard",
          thumbnail: "/images/video-thumbnails/campus-courtyard.png", // Updated thumbnail path to actual image
          videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luma-jCiFM7KKk5QHN1NOGuzcjBcWynmi7n.mp4",
          duration: "1:05",
          createdAt: "1 week ago",
        },
        {
          id: "scene-5",
          title: "Conference Room Meeting Space",
          thumbnail: "/images/video-thumbnails/conference-room.png", // Updated thumbnail path to actual image
          videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luma-jCiFM7KKk5QHN1NOGuzcjBcWynmi7n.mp4",
          duration: "0:52",
          createdAt: "1 week ago",
        },
        {
          id: "scene-6",
          title: "Student Dormitory Common Area",
          thumbnail: "/images/video-thumbnails/dormitory-common-area.png", // Updated thumbnail path to actual image
          videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luma-jCiFM7KKk5QHN1NOGuzcjBcWynmi7n.mp4",
          duration: "0:41",
          createdAt: "2 weeks ago",
        },
      ]

      localStorage.setItem("myVideoClips", JSON.stringify(defaultSceneVideos))
      setVideoClips(defaultSceneVideos)
    } else {
      setVideoClips(savedVideos)
    }

    const generatingVideos = savedVideos.filter((v: VideoClip) => v.isGenerating)
    const intervals: NodeJS.Timeout[] = []

    generatingVideos.forEach((video: VideoClip) => {
      const progressInterval = setInterval(() => {
        const currentVideos = JSON.parse(localStorage.getItem("myVideoClips") || "[]")
        const currentVideo = currentVideos.find((v: VideoClip) => v.id === video.id)

        if (!currentVideo || !currentVideo.isGenerating) {
          clearInterval(progressInterval)
          return
        }

        let newProgress = (currentVideo.progress || 0) + Math.random() * 10 + 5

        if (newProgress >= 100) {
          newProgress = 100
          const updatedVideos = currentVideos.map((v: VideoClip) =>
            v.id === video.id ? { ...v, isGenerating: false, progress: 100 } : v,
          )
          localStorage.setItem("myVideoClips", JSON.stringify(updatedVideos))
          setVideoClips(updatedVideos)
          clearInterval(progressInterval)
        } else {
          const updatedVideos = currentVideos.map((v: VideoClip) =>
            v.id === video.id ? { ...v, progress: Math.round(newProgress) } : v,
          )
          localStorage.setItem("myVideoClips", JSON.stringify(updatedVideos))
          setVideoClips(updatedVideos)
        }
      }, 1000)

      intervals.push(progressInterval)
    })

    return () => {
      intervals.forEach((interval) => clearInterval(interval))
    }
  }, [])

  const handleCreateNewVideo = () => {
    window.location.href = "/videos/generate" // Updated path from /videos/create to /videos/generate
  }

  const handleVideoClick = (video: VideoClip) => {
    if (video.isGenerating) return // Don't open if still generating
    setSelectedVideo(video)
    setVideoPlayerOpen(true)
  }

  return (
    <div className="p-6 bg-white min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4E5460] mb-2">My Video Clips</h1>
        <p className="text-lg text-[#4E5460] font-medium">
          Create stunning videos with your characters using AI-powered generation.
        </p>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* Video Clips */}
        {videoClips.map((video) => (
          <Card
            key={video.id}
            className={`cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-[#D0E0FF] bg-[#F5F8FF] group ${
              video.isGenerating ? "opacity-75" : ""
            }`}
            onClick={() => handleVideoClick(video)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    console.log("[v0] Failed to load thumbnail:", video.thumbnail)
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                  onLoad={() => {
                    console.log("[v0] Successfully loaded thumbnail:", video.thumbnail)
                  }}
                />

                {/* Progress overlay for generating videos */}
                {video.isGenerating && (
                  <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center">
                    <span className="text-white text-sm font-medium mb-3">Generating Video...</span>
                    <div className="w-3/4 bg-gray-700 rounded-full h-2 mb-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${video.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-blue-400 text-xs font-semibold">{video.progress || 0}%</span>
                  </div>
                )}

                {/* Hover overlay for completed videos */}
                {!video.isGenerating && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="text-white text-sm font-medium">Click to Play</span>
                    </div>
                  </div>
                )}

                {/* Duration badge */}
                {!video.isGenerating && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                )}
              </div>
              <div className="p-3 text-left">
                <h3 className="font-medium text-[#4E5460] text-sm truncate">
                  {video.title.replace(/\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}.*$/, "")}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{video.createdAt}</p>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Video Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-solid border-[#D0E0FF] bg-[#F5F8FF]"
          onClick={handleCreateNewVideo}
        >
          <CardContent className="p-0">
            <div className="aspect-square flex flex-col items-center justify-center rounded-lg">
              <div className="w-12 h-12 rounded-full border-2 border-gray-400 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-600">Generate Video Clip</span>{" "}
              {/* Updated text from Create Video Clip to Generate Video Clip */}
            </div>
          </CardContent>
        </Card>
      </div>

      <VideoPlayerModal isOpen={videoPlayerOpen} onClose={() => setVideoPlayerOpen(false)} video={selectedVideo} />
    </div>
  )
}
