"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Play, Mic, ChevronDown } from "lucide-react"

interface Voice {
  id: string
  name: string
  country: string
  flag: string
  description: string
  tags: string[]
}

const publicVoices: Voice[] = [
  {
    id: "cerise",
    name: "Cerise - Cheerful",
    country: "UK",
    flag: "🇬🇧",
    description: "AI, E-learning, Middle-Aged, Google",
    tags: ["cheerful", "middle-aged"],
  },
  {
    id: "allison",
    name: "Allison",
    country: "US",
    flag: "🇺🇸",
    description: "Middle-Aged, Energetic, Advertisement, Elevenlabs, Marketing",
    tags: ["energetic", "advertisement"],
  },
  {
    id: "ivy",
    name: "Ivy",
    country: "US",
    flag: "🇺🇸",
    description: "Young, Confident, Social Media, Elevenlabs, Marketing",
    tags: ["young", "confident"],
  },
  {
    id: "hope",
    name: "Hope",
    country: "US",
    flag: "🇺🇸",
    description: "Young, Energetic, Social Media, Elevenlabs, Marketing",
    tags: ["young", "energetic"],
  },
  {
    id: "brittney",
    name: "Brittney",
    country: "US",
    flag: "🇺🇸",
    description: "Young, Upbeat, Social Media, Elevenlabs, Marketing",
    tags: ["young", "upbeat"],
  },
  {
    id: "monika",
    name: "Monika Sogani",
    country: "IN",
    flag: "🇮🇳",
    description: "Middle-Aged, Enticing, Advertisement, Elevenlabs, Marketing",
    tags: ["middle-aged", "enticing"],
  },
  {
    id: "juniper",
    name: "Juniper",
    country: "US",
    flag: "🇺🇸",
    description: "Middle-Aged, Friendly, Podcast, Elevenlabs, Marketing",
    tags: ["middle-aged", "friendly"],
  },
  {
    id: "cassidy",
    name: "Cassidy",
    country: "US",
    flag: "🇺🇸",
    description: "Middle-Aged, Crisp, Podcasts, Elevenlabs, Marketing",
    tags: ["middle-aged", "crisp"],
  },
  {
    id: "jessica",
    name: "Jessica Anne Bogart",
    country: "US",
    flag: "🇺🇸",
    description: "Middle-Aged, Confident, Corporate Training, Elevenlabs, Marketing",
    tags: ["middle-aged", "confident"],
  },
]

interface ChooseVoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectVoice: (voice: Voice) => void
}

export function ChooseVoiceModal({ open, onOpenChange, onSelectVoice }: ChooseVoiceModalProps) {
  const [activeTab, setActiveTab] = useState<"public" | "my">("my")
  const [searchQuery, setSearchQuery] = useState("")
  const [languageFilter, setLanguageFilter] = useState("English")
  const [accentFilter, setAccentFilter] = useState("English (Original accent)")
  const [playingVoice, setPlayingVoice] = useState<string | null>(null)

  const handlePlayVoice = (voiceId: string) => {
    if (playingVoice === voiceId) {
      setPlayingVoice(null)
      // Stop audio
    } else {
      setPlayingVoice(voiceId)
      // Play sample audio
      setTimeout(() => setPlayingVoice(null), 3000) // Auto stop after 3 seconds
    }
  }

  const filteredVoices = publicVoices.filter(
    (voice) =>
      voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voice.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        {/* Custom Header */}
        <div className="p-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-600">Choose Voice</h2>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
                <Mic className="w-4 h-4" />
                Create New Voice
              </Button>
            </div>
          </div>

          {/* Tabs and Search */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex">
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "my"
                    ? "text-blue-500 border-blue-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("my")}
              >
                My Voices
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "public"
                    ? "text-blue-500 border-blue-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
                onClick={() => setActiveTab("public")}
              >
                Public Voices
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search voices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
                <SelectItem value="French">French</SelectItem>
              </SelectContent>
            </Select>

            <Select value={accentFilter} onValueChange={setAccentFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English (Original accent)">English (Original accent)</SelectItem>
                <SelectItem value="English (US)">English (US)</SelectItem>
                <SelectItem value="English (UK)">English (UK)</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" className="flex items-center gap-2 bg-transparent">
              Filters
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Voice Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-3 gap-4">
            {filteredVoices.map((voice) => (
              <div
                key={voice.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-colors"
                onClick={() => onSelectVoice(voice)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{voice.flag}</span>
                    <span className="font-medium text-gray-600">{voice.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlayVoice(voice.id)
                    }}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600">{voice.description}</p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
