"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Image from "next/image"
import { CreateAvatarVideoModal } from "@/components/modals/create-avatar-video-modal"
import CharacterSelectionModal from "@/components/modals/character-selection-modal"

const staticAvatars = [
  {
    id: "vincent-de-paul",
    name: "Vincent de Paul",
    image: "/images/characters/vincent-de-paul.jpg",
    badge: "New",
  },
  {
    id: "marcus-aurelius",
    name: "Marcus Aurelius",
    image: "/images/characters/interactive-marcus.png", // Updated thumbnail to use interactive image
    badge: null,
  },
  {
    id: "william-shakespeare",
    name: "William Shakespeare",
    image: "/images/characters/william-shakespeare.png",
    badge: null,
  },
  {
    id: "thomas-aquinas",
    name: "Thomas Aquinas",
    image: "/images/characters/thomas-aquinas.png",
    badge: null,
  },
  {
    id: "mikel-casual",
    name: "Mikel (Casual)",
    image: "/images/my/mikel-casual.webp",
    badge: null,
  },
  {
    id: "mikel-professional",
    name: "Mikel (Professional)",
    image: "/images/my/mikel-professional.webp",
    badge: null,
  },
  {
    id: "mikel-relaxed",
    name: "Mikel (Relaxed)",
    image: "/images/my/mikel-relaxed.webp",
    badge: null,
  },
  {
    id: "nikola-tesla",
    name: "Nikola Tesla",
    image: "/images/characters/nikola-tesla.webp",
    badge: null,
  },
  {
    id: "amelia-earhart",
    name: "Amelia Earhart",
    image: "/images/characters/amelia-earhart.webp",
    badge: null,
  },
  {
    id: "harry-houdini",
    name: "Harry Houdini",
    image: "/images/characters/harry-houdini.webp",
    badge: null,
  },
  {
    id: "marie-curie",
    name: "Marie Curie",
    image: "/images/characters/marie-curie.webp",
    badge: null,
  },
  {
    id: "sally-ride",
    name: "Sally Ride",
    image: "/images/characters/sally-ride.webp",
    badge: null,
  },
]

export default function MyAvatarsPage() {
  const router = useRouter()
  const [selectedAvatar, setSelectedAvatar] = useState<any>(null)
  const [characterSelectionOpen, setCharacterSelectionOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)
  const [allAvatars, setAllAvatars] = useState(staticAvatars)

  useEffect(() => {
    const newCharacters = JSON.parse(localStorage.getItem("newCharacters") || "[]")
    setAllAvatars([...newCharacters, ...staticAvatars])
  }, [])

  const handleCreateNewAvatar = () => {
    window.location.href = "/ai-avatar/generate" // Updated path from /characters/generate to /ai-avatar/generate
  }

  const handleAvatarClick = (avatar: any) => {
    setSelectedAvatar(avatar)
    setCharacterSelectionOpen(true)
  }

  const handleCreateVideo = () => {
    setCharacterSelectionOpen(false)
    setVideoModalOpen(true)
  }

  const handleInteractiveChat = () => {
    setCharacterSelectionOpen(false)
    if (selectedAvatar) {
      router.push(`/ai-avatar/interactive/${selectedAvatar.id}`)
    }
  }

  const handleNameUpdate = (newName: string) => {
    if (!selectedAvatar) return

    const updatedAvatars = allAvatars.map((avatar) =>
      avatar.id === selectedAvatar.id ? { ...avatar, name: newName } : avatar,
    )
    setAllAvatars(updatedAvatars)
    setSelectedAvatar({ ...selectedAvatar, name: newName })

    // Update localStorage for new characters
    const newCharacters = JSON.parse(localStorage.getItem("newCharacters") || "[]")
    const updatedNewCharacters = newCharacters.map((char: any) =>
      char.id === selectedAvatar.id ? { ...char, name: newName } : char,
    )
    localStorage.setItem("newCharacters", JSON.stringify(updatedNewCharacters))
  }

  return (
    <div className="p-6 bg-white min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#4E5460] mb-2">My AI Avatars</h1>
        <p className="text-lg text-[#4E5460] font-medium">
          Choose a AI avatar, add a script, and get a studio quality AI avatar video in minutes.
        </p>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {/* All Avatars (newly created + existing) */}
        {allAvatars.map((avatar) => (
          <Card
            key={avatar.id}
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border border-[#D0E0FF] bg-[#F5F8FF] group"
            onClick={() => handleAvatarClick(avatar)}
          >
            <CardContent className="p-0">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image src={avatar.image || "/placeholder.svg"} alt={avatar.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">Click to Select</span>
                </div>
                {avatar.badge && (
                  <div
                    className={`absolute bottom-2 left-2 text-white text-xs px-2 py-1 rounded ${
                      avatar.badge === "New" ? "bg-[#0376C1]" : "bg-[#0376C1]"
                    }`}
                  >
                    {avatar.badge}
                  </div>
                )}
              </div>
              <div className="p-3 text-left">
                <h3 className="font-medium text-[#4E5460] text-sm">{avatar.name}</h3>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Create New Avatar Card */}
        <Card
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200 border-2 border-solid border-[#D0E0FF] bg-[#F5F8FF]"
          onClick={handleCreateNewAvatar}
        >
          <CardContent className="p-0">
            <div className="aspect-square flex flex-col items-center justify-center rounded-lg">
              <div className="w-12 h-12 rounded-full border-2 border-gray-400 flex items-center justify-center mb-3">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
              <span className="text-sm font-medium text-gray-600">Generate AI Avatar</span>{" "}
              {/* Updated text from Create Character to Generate Character */}
            </div>
          </CardContent>
        </Card>
      </div>

      <CharacterSelectionModal
        isOpen={characterSelectionOpen}
        onClose={() => setCharacterSelectionOpen(false)}
        character={selectedAvatar}
        isMyCharacter={true}
        onCreateVideo={handleCreateVideo}
        onInteractiveChat={handleInteractiveChat}
        onNameUpdate={handleNameUpdate}
      />

      <CreateAvatarVideoModal open={videoModalOpen} onOpenChange={setVideoModalOpen} avatar={selectedAvatar} />
    </div>
  )
}
