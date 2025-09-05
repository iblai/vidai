"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, ChevronDown } from "lucide-react"
import Image from "next/image"
import { CreateAvatarVideoModal } from "@/components/modals/create-avatar-video-modal"
import CharacterSelectionModal from "@/components/modals/character-selection-modal"

const filterTabs = [
  { id: "all", label: "All", active: true },
  { id: "business", label: "Business", active: false },
  { id: "computer-science", label: "Computer Science", active: false },
  { id: "humanities", label: "Humanities", active: false },
  { id: "math", label: "Math", active: false },
  { id: "nursing", label: "Nursing", active: false },
  { id: "science", label: "Science", active: false },
  { id: "social-sciences", label: "Social Sciences", active: false },
]

const publicAvatars = [
  { id: "porter", name: "Porter", image: "/images/avatars/public/porter.png", badge: "Business", category: "business" },
  {
    id: "amelia-earhart",
    name: "Amelia Earhart",
    image: "/images/characters/amelia-earhart.webp",
    badge: "Aviator",
    category: "computer-science",
  },
  {
    id: "harry-houdini",
    name: "Harry Houdini",
    image: "/images/characters/harry-houdini.webp",
    badge: "Magician",
    category: "humanities",
  },
  {
    id: "thomas-aquinas",
    name: "Thomas Aquinas",
    image: "/images/characters/thomas-aquinas.png",
    badge: "Philosopher",
    category: "humanities",
  },
  { id: "amelia", name: "Amelia", image: "/images/avatars/public/amelia.png", badge: "Math", category: "math" },
  {
    id: "marie-curie",
    name: "Marie Curie",
    image: "/images/characters/marie-curie.webp",
    badge: "Scientist",
    category: "nursing",
  },
  {
    id: "nikola-tesla",
    name: "Nikola Tesla",
    image: "/images/characters/nikola-tesla.webp",
    badge: "Inventor",
    category: "science",
  },
  {
    id: "sally-ride",
    name: "Sally Ride",
    image: "/images/characters/sally-ride.webp",
    badge: "Astronaut",
    category: "social-sciences",
  },
  { id: "marcus", name: "Marcus", image: "/images/avatars/public/marcus.png", badge: "Business", category: "business" },
  {
    id: "loegen",
    name: "Løgen",
    image: "/images/avatars/public/loegen.png",
    badge: "Computer Science",
    category: "computer-science",
  },
  {
    id: "vince",
    name: "Vince",
    image: "/images/avatars/public/vince.png",
    badge: "Humanities",
    category: "humanities",
  },
  { id: "jose", name: "Jose", image: "/images/avatars/public/jose.png", badge: "Math", category: "math" },
  {
    id: "scarlett",
    name: "Scarlett",
    image: "/images/avatars/public/scarlett.png",
    badge: "Nursing",
    category: "nursing",
  },
  { id: "pia", name: "Pia", image: "/images/avatars/public/pia.png", badge: "Science", category: "science" },
  {
    id: "ling",
    name: "Ling",
    image: "/images/avatars/public/ling.png",
    badge: "Social Sciences",
    category: "social-sciences",
  },
  { id: "talon", name: "Talon", image: "/images/avatars/public/talon.png", badge: "Business", category: "business" },
  {
    id: "chloe",
    name: "Chloe",
    image: "/images/avatars/public/chloe.png",
    badge: "Computer Science",
    category: "computer-science",
  },
  {
    id: "violet",
    name: "Violet",
    image: "/images/avatars/public/violet.png",
    badge: "Humanities",
    category: "humanities",
  },
  { id: "masha", name: "Masha", image: "/images/avatars/public/masha.png", badge: "Math", category: "math" },
  { id: "tito", name: "Tito", image: "/images/avatars/public/tito.png", badge: "Nursing", category: "nursing" },
  { id: "august", name: "August", image: "/images/avatars/public/august.png", badge: "Science", category: "science" },
]

export default function PublicAvatarsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState<(typeof publicAvatars)[0] | null>(null)
  const [characterSelectionOpen, setCharacterSelectionOpen] = useState(false)
  const [videoModalOpen, setVideoModalOpen] = useState(false)

  const handleAvatarClick = (avatar: (typeof publicAvatars)[0]) => {
    setSelectedAvatar(avatar)
    setCharacterSelectionOpen(true)
  }

  const handleCreateVideo = () => {
    setCharacterSelectionOpen(false)
    setVideoModalOpen(true)
  }

  const handleInteractiveChat = () => {
    setCharacterSelectionOpen(false)
    // TODO: Implement interactive chat functionality
    console.log("Interactive chat with", selectedAvatar?.name)
  }

  const filteredAvatars = publicAvatars.filter((avatar) => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeTab === "all" || avatar.category === activeTab
    return matchesSearch && matchesCategory
  })

  return (
    <div className="p-6 bg-white min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#4E5460] mb-6">Public Characters</h1>

        {/* Search and Filters */}
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
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Filter className="w-4 h-4" />
            Filters
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {filterTabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={`px-4 py-2 rounded-none border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#0376C1] text-[#0376C1] bg-blue-50"
                  : "border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {filteredAvatars.map((avatar) => (
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
                  <div className="absolute bottom-2 left-2 bg-[#0376C1] text-white text-xs px-2 py-1 rounded">
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
      </div>

      <CharacterSelectionModal
        isOpen={characterSelectionOpen}
        onClose={() => setCharacterSelectionOpen(false)}
        character={selectedAvatar}
        isMyCharacter={false}
        onCreateVideo={handleCreateVideo}
        onInteractiveChat={handleInteractiveChat}
      />

      <CreateAvatarVideoModal open={videoModalOpen} onOpenChange={setVideoModalOpen} avatar={selectedAvatar} />
    </div>
  )
}
