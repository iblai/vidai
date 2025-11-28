"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Play } from "lucide-react"
import Image from "next/image"
import VideoPlayerModal from "@/components/modals/video-player-modal"

const categories = [
  { id: "all", label: "All" },
  { id: "business", label: "Business" },
  { id: "computer-science", label: "Computer Science" },
  { id: "humanities", label: "Humanities" },
  { id: "math", label: "Math" },
  { id: "nursing", label: "Nursing" },
  { id: "science", label: "Science" },
  { id: "social-sciences", label: "Social Sciences" },
]

const characterVideos = [
  {
    id: "business-presentation-amelia",
    name: "Aviation History with Amelia Earhart",
    thumbnail: "/images/characters/amelia-earhart.webp",
    duration: "8:30",
    badge: "Business",
    type: "character-video",
    character: "Amelia Earhart",
    model: "Heygen",
    modelIcon: "/images/models/heygen.png",
    createdAt: "2024-01-15",
  },
  {
    id: "programming-tutorial-tesla",
    name: "Invention Workshop with Nikola Tesla",
    thumbnail: "/images/characters/nikola-tesla.webp",
    duration: "12:45",
    badge: "Computer Science",
    type: "character-video",
    character: "Nikola Tesla",
    model: "D-ID",
    modelIcon: "/images/models/d-id.svg",
    createdAt: "2024-01-14",
  },
  {
    id: "magic-training-houdini",
    name: "Magic Performance Training with Harry Houdini",
    thumbnail: "/images/characters/harry-houdini.webp",
    duration: "15:20",
    badge: "Nursing",
    type: "character-video",
    character: "Harry Houdini",
    model: "Synthesia",
    modelIcon: "/images/models/synthesia.svg",
    createdAt: "2024-01-13",
  },
  {
    id: "science-lesson-curie",
    name: "Radioactivity Fundamentals with Marie Curie",
    thumbnail: "/images/characters/marie-curie.webp",
    duration: "18:15",
    badge: "Math",
    type: "character-video",
    character: "Marie Curie",
    model: "Heygen",
    modelIcon: "/images/models/heygen.png",
    createdAt: "2024-01-12",
  },
  {
    id: "space-exploration-ride",
    name: "Space Exploration with Sally Ride",
    thumbnail: "/images/characters/sally-ride.webp",
    duration: "20:30",
    badge: "Science",
    type: "character-video",
    character: "Sally Ride",
    model: "Synthesia",
    modelIcon: "/images/models/synthesia.svg",
    createdAt: "2024-01-11",
  },
]

const videoClips = [
  {
    id: "business-ethics-case-study",
    name: "Business Ethics Case Study Analysis",
    thumbnail: "/images/video-thumbnails/business-ethics-case-study.png",
    duration: "12:30",
    badge: "Business",
    type: "video-clip",
    model: "Veo 3",
    modelIcon: "/images/models/veo3.png",
    createdAt: "2024-01-11",
  },
  {
    id: "programming-fundamentals",
    name: "Programming Fundamentals in Python",
    thumbnail: "/images/video-thumbnails/programming-fundamentals.png",
    duration: "18:45",
    badge: "Computer Science",
    type: "video-clip",
    model: "KlingAI",
    modelIcon: "/images/models/kling.png",
    createdAt: "2024-01-10",
  },
  {
    id: "patient-care-protocols",
    name: "Patient Care Protocols",
    thumbnail: "/images/video-thumbnails/patient-care-protocols.png",
    duration: "14:30",
    badge: "Nursing",
    type: "video-clip",
    model: "Sora",
    modelIcon: "/images/models/sora.png",
    createdAt: "2024-01-09",
  },
  {
    id: "calculus-derivatives",
    name: "Understanding Calculus Derivatives",
    thumbnail: "/images/video-thumbnails/calculus-derivatives.png",
    duration: "22:15",
    badge: "Math",
    type: "video-clip",
    model: "Runway",
    modelIcon: "/images/models/runway.png",
    createdAt: "2024-01-08",
  },
]

const allContent = [...characterVideos, ...videoClips]

export default function LibraryPage() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeContentType, setActiveContentType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedContent, setSelectedContent] = useState<(typeof allContent)[0] | null>(null)
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false)

  const filteredContent = allContent.filter((content) => {
    const matchesCategory =
      activeCategory === "all" || content.badge.toLowerCase().replace(/\s+/g, "-") === activeCategory
    const matchesContentType = activeContentType === null || content.type === activeContentType
    const matchesSearch = content.name.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCategory && matchesContentType && matchesSearch
  })

  const handleContentClick = (content: (typeof allContent)[0]) => {
    setSelectedContent(content)
    setVideoPlayerOpen(true)
  }

  const handleChipClick = (contentType: string) => {
    if (activeContentType === contentType) {
      setActiveContentType(null) // Deselect if already selected
    } else {
      setActiveContentType(contentType) // Select new chip
    }
  }

  return (
    <div className="p-6 bg-white min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#4E5460] mb-6">Community</h1>

        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 border-b border-gray-200 mb-4">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant="ghost"
              className={`px-4 py-2 rounded-none border-b-2 transition-colors ${
                activeCategory === category.id
                  ? "border-[#0376C1] text-[#0376C1] bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="sm"
            className={`rounded-md px-4 py-1 text-sm transition-colors ${
              activeContentType === "character-video"
                ? "bg-[#0376C1] text-white border-[#0376C1] hover:bg-[#0376C1] hover:text-white"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => handleChipClick("character-video")}
          >
            AI Avatar Video
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={`rounded-md px-4 py-1 text-sm transition-colors ${
              activeContentType === "video-clip"
                ? "bg-[#0376C1] text-white border-[#0376C1] hover:bg-[#0376C1] hover:text-white"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
            onClick={() => handleChipClick("video-clip")}
          >
            Video Clips
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredContent.map((content) => (
          <Card
            key={content.id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-[#D0E0FF] bg-[#F5F8FF] group"
            onClick={() => handleContentClick(content)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <Image src={content.thumbnail || "/placeholder.svg"} alt={content.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <Play className="text-white w-12 h-12" />
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                  {content.duration}
                </div>
                <div className="absolute bottom-2 left-2 bg-[#0376C1] text-white text-xs px-2 py-1 rounded">
                  {content.type === "character-video" ? "AI Avatar Video" : "Video Clip"}
                </div>
              </div>
              <div className="p-3 text-left">
                <h3 className="font-medium text-[#4E5460] text-sm">{content.name}</h3>
               
                <p className="text-xs text-gray-500 mt-1">{content.createdAt}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <VideoPlayerModal
        isOpen={videoPlayerOpen}
        onClose={() => setVideoPlayerOpen(false)}
        video={
          selectedContent
            ? {
                id: selectedContent.id,
                title: selectedContent.name,
                thumbnail: selectedContent.thumbnail,
                videoUrl: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/luma-jCiFM7KKk5QHN1NOGuzcjBcWynmi7n.mp4", // Using sample video
                duration: selectedContent.duration,
                createdAt: selectedContent.createdAt,
              }
            : null
        }
      />
    </div>
  )
}
