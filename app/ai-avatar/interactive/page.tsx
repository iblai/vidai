"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, Filter, ChevronDown } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

const filterTabs = [
  { id: "all", label: "All" },
  { id: "business", label: "Business" },
  { id: "computer-science", label: "Computer Science" },
  { id: "humanities", label: "Humanities" },
  { id: "math", label: "Math" },
  { id: "science", label: "Science" },
]

const staticAvatars = [
  { id: "vincent-de-paul", name: "Vincent de Paul", image: "/images/characters/vincent-de-paul.jpg", category: "humanities", badge: "Interactive" },
  { id: "marcus-aurelius", name: "Marcus Aurelius", image: "/images/characters/interactive-marcus.png", category: "humanities", badge: "Interactive" },
  { id: "william-shakespeare", name: "William Shakespeare", image: "/images/characters/william-shakespeare.png", category: "humanities", badge: "Interactive" },
  { id: "thomas-aquinas", name: "Thomas Aquinas", image: "/images/characters/thomas-aquinas.png", category: "humanities", badge: "Interactive" },
  { id: "nikola-tesla", name: "Nikola Tesla", image: "/images/characters/nikola-tesla.webp", category: "science", badge: "Interactive" },
  { id: "marie-curie", name: "Marie Curie", image: "/images/characters/marie-curie.webp", category: "science", badge: "Interactive" },
  { id: "amelia-earhart", name: "Amelia Earhart", image: "/images/characters/amelia-earhart.webp", category: "science", badge: "Interactive" },
  { id: "sally-ride", name: "Sally Ride", image: "/images/characters/sally-ride.webp", category: "science", badge: "Interactive" },
  { id: "harry-houdini", name: "Harry Houdini", image: "/images/characters/harry-houdini.webp", category: "humanities", badge: "Interactive" },
  { id: "mikel-casual", name: "Mikel (Casual)", image: "/images/my/mikel-casual.webp", category: "business", badge: "Custom" },
  { id: "mikel-professional", name: "Mikel (Professional)", image: "/images/my/mikel-professional.webp", category: "business", badge: "Custom" },
  { id: "mikel-relaxed", name: "Mikel (Relaxed)", image: "/images/my/mikel-relaxed.webp", category: "business", badge: "Custom" },
]

export default function InteractiveAvatarsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [allAvatars, setAllAvatars] = useState(staticAvatars)

  useEffect(() => {
    const saved = localStorage.getItem("newCharacters")
    if (saved) {
      const custom = JSON.parse(saved).map((char: any) => ({
        ...char,
        category: "business",
        badge: "Custom",
      }))
      setAllAvatars([...custom, ...staticAvatars])
    }
  }, [])

  const filteredAvatars = allAvatars.filter((avatar) => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeTab === "all" || avatar.category === activeTab
    return matchesSearch && matchesCategory
  })

  const handleAvatarClick = (avatar: (typeof staticAvatars)[0]) => {
    router.push(`/ai-avatar/interactive/${avatar.id}`)
  }

  return (
    <div className="p-6 bg-white min-h-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#4E5460] mb-2">Interactive Avatars</h1>
        <p className="text-gray-600 text-sm mb-6">
          Configure and talk with your AI avatars in real-time conversations.
        </p>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search avatars..."
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
                  <span className="text-white text-sm font-medium">Configure</span>
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

      {filteredAvatars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No avatars found matching your search.</p>
        </div>
      )}
    </div>
  )
}
