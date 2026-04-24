"use client"

import { ArrowLeft, Pencil, Share2, Square, MessageCircle, HelpCircle, Play, Pause, Copy } from "lucide-react"
import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ChooseVoiceModal } from "@/components/modals/choose-voice-modal"
import { ShareModal } from "@/components/modals/share-modal"
import { getHeygenAvatarGroup } from "@/lib/heygen/rest"
import { listHeygenPrivateAvatarResources } from "@/lib/iblai/catalog"
import { resolveAppTenant } from "@/lib/iblai/tenant"

export default function InteractiveAvatarPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState("English (en)")
  const [firstMessage, setFirstMessage] = useState(
    "Hello! I'm here to help you schedule appointments and answer any questions you may have. How can I brighten your day?",
  )
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a professional and approachable virtual receptionist designed to manage appointments and customer inquiries efficiently. Your tone is courteous, friendly, and highly organized. Your tasks include scheduling appointments accurately, handling customer inquiries promptly, and reducing wait times to ensure a smooth and positive experience for all users.",
  )
  const [voiceProvider, setVoiceProvider] = useState("Cartesia (+ 0.022$/min)")
  const [selectedVoice, setSelectedVoice] = useState("Calm Lady")
  const [llmProvider, setLlmProvider] = useState("gpt-4o-mini (+ 0.01$/min)")
  const [isTalking, setIsTalking] = useState(false)
  const [isPlayingVoice, setIsPlayingVoice] = useState(false)
  const [character, setCharacter] = useState<any>(null)
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("AI Avatar")
  const [widgetPosition, setWidgetPosition] = useState("Right")
  const [customText, setCustomText] = useState("Call assistant")
  const [customImageUrl, setCustomImageUrl] = useState("")
  const [allowedHosts, setAllowedHosts] = useState<string[]>([])
  const [newHost, setNewHost] = useState("")
  const [maxIdleTime, setMaxIdleTime] = useState("300")
  const [maxSessionDuration, setMaxSessionDuration] = useState("3600")

  useEffect(() => {
    let cancelled = false

    const savedCharacters = localStorage.getItem("myCharacters")
    if (savedCharacters) {
      const characters = JSON.parse(savedCharacters)
      const foundCharacter = characters.find((char: any) => char.id === params.id)
      if (foundCharacter) {
        setCharacter(foundCharacter)
        return
      }
    }

    const staticCharacters = [
      { id: "vincent-de-paul", name: "Vincent de Paul", image: "/images/characters/vincent-de-paul.jpg" },
      { id: "marcus-aurelius", name: "Marcus Aurelius", image: "/images/characters/interactive-marcus.png" },
      { id: "william-shakespeare", name: "William Shakespeare", image: "/images/characters/william-shakespeare.png" },
      { id: "thomas-aquinas", name: "Thomas Aquinas", image: "/images/characters/thomas-aquinas.png" },
      { id: "mikel-casual", name: "Mikel (Casual)", image: "/images/my/mikel-casual.webp" },
      { id: "mikel-professional", name: "Mikel (Professional)", image: "/images/my/mikel-professional.webp" },
      { id: "mikel-relaxed", name: "Mikel (Relaxed)", image: "/images/my/mikel-relaxed.webp" },
      { id: "nikola-tesla", name: "Nikola Tesla", image: "/images/characters/nikola-tesla.webp" },
      { id: "amelia-earhart", name: "Amelia Earhart", image: "/images/characters/amelia-earhart.webp" },
      { id: "harry-houdini", name: "Harry Houdini", image: "/images/characters/harry-houdini.webp" },
      { id: "amelia", name: "Amelia", image: "/images/avatars/my/amelia-real.png" },
      { id: "marie-curie", name: "Marie Curie", image: "/images/characters/marie-curie.webp" },
      { id: "sally-ride", name: "Sally Ride", image: "/images/characters/sally-ride.webp" },
    ]

    const foundCharacter = staticCharacters.find((char) => char.id === params.id)
    if (foundCharacter) {
      setCharacter({
        ...foundCharacter,
        agentId: "b9a8ace6-0763-455c-b79d-8b83b6ca8bed",
        faceId: "0c2b8b04-5274-41f1-a21c-d5c98322efa9",
      })
      return
    }

    // Not a known static character — treat as a HeyGen avatar group id.
    // Fetch group metadata + the catalog's stored thumbnail so the page
    // renders for user-created avatars too.
    ;(async () => {
      try {
        const platform = resolveAppTenant()
        const [group, resources] = await Promise.all([
          getHeygenAvatarGroup(params.id).catch(() => null),
          platform
            ? listHeygenPrivateAvatarResources(platform).catch(() => [])
            : Promise.resolve([]),
        ])
        if (cancelled) return
        const catalogHit = resources.find((r) => r.data?.id === params.id)
        if (group || catalogHit) {
          setCharacter({
            id: params.id,
            name: group?.name || catalogHit?.name || "AI Avatar",
            image:
              catalogHit?.data?.image_url ||
              group?.preview_image_url ||
              "/placeholder.svg",
            agentId: params.id,
            faceId: params.id,
          })
        } else {
          // Unknown id — render something rather than spin forever.
          setCharacter({
            id: params.id,
            name: "AI Avatar",
            image: "/placeholder.svg",
            agentId: params.id,
            faceId: params.id,
          })
        }
      } catch (err) {
        console.warn("[interactive/[id]] fallback load failed", err)
        if (!cancelled) {
          setCharacter({
            id: params.id,
            name: "AI Avatar",
            image: "/placeholder.svg",
            agentId: params.id,
            faceId: params.id,
          })
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [params.id])

  const languages = ["English (en)", "Spanish (es)", "French (fr)", "German (de)", "Italian (it)"]

  const voiceProviders = ["Cartesia (+ 0.022$/min)", "ElevenLabs (+ 0.030$/min)", "Azure (+ 0.015$/min)"]

  const llmProviders = ["gpt-4o-mini (+ 0.01$/min)", "gpt-4 (+ 0.03$/min)", "claude-3-haiku (+ 0.008$/min)"]

  const getPricingBreakdown = () => {
    const voiceCost = voiceProvider.includes("0.022") ? 0.022 : voiceProvider.includes("0.030") ? 0.03 : 0.015
    const llmCost = llmProvider.includes("0.01") ? 0.01 : llmProvider.includes("0.03") ? 0.03 : 0.008
    const iblCost = 0.05
    const total = iblCost + voiceCost + llmCost

    return {
      ibl: iblCost,
      voice: voiceCost,
      llm: llmCost,
      total: total,
    }
  }

  const pricing = getPricingBreakdown()

  const handleSave = () => {
    console.log("Configuration saved")
  }

  const handleTalkToAvatar = () => {
    // Generate a unique session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Navigate to the session page
    router.push(`/session/${params.id}/${sessionId}`)
  }

  const handleShare = () => {
    setIsShareModalOpen(true)
  }

  const handleCopyAgentId = () => {
    if (character?.agentId) {
      navigator.clipboard.writeText(character.agentId)
    }
  }

  const handlePlayVoice = () => {
    setIsPlayingVoice(!isPlayingVoice)
    if (!isPlayingVoice) {
      setTimeout(() => setIsPlayingVoice(false), 3000)
    }
  }

  const handleVoiceSelect = (voice: any) => {
    setSelectedVoice(voice.name)
    setIsVoiceModalOpen(false)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  const addHost = () => {
    if (newHost.trim() && !allowedHosts.includes(newHost.trim())) {
      setAllowedHosts([...allowedHosts, newHost.trim()])
      setNewHost("")
    }
  }

  const removeHost = (host: string) => {
    setAllowedHosts(allowedHosts.filter((h) => h !== host))
  }

  const embedCode = `<ibl-widget token="********" agentid="${character?.agentId || "b9a8ace6-0763-455c-b79d-8b83b6ca8bed"}" position="${widgetPosition.toLowerCase()}" customimage="" customtext="${customText}"></ibl-widget>
<script src="https://app.ibl.ai/ibl-widget/index.js" async type="text/javascript"></script>`

  const sampleCode = `const response = await fetch("https://api.ibl.ai/session/${character?.agentId || "b9a8ace6-0763-455c-b79d-8b83b6ca8bed"}/********", {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
})

const data = await response.json();
const roomUrl = data.roomUrl;`

  if (!character) {
    return <div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-semibold text-gray-600 truncate">{character.name}</h1>
                <Pencil className="h-4 w-4 text-gray-400 flex-shrink-0" />
              </div>
              <div className="flex items-center gap-2">
                <p className="text-xs sm:text-sm text-gray-500 truncate">Agent ID: {character.agentId}</p>
                <Button variant="ghost" size="sm" onClick={handleCopyAgentId} className="h-6 w-6 p-0 flex-shrink-0">
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" onClick={handleShare} className="w-full sm:w-auto bg-transparent">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={handleTalkToAvatar}
              className={`w-full sm:w-auto ${isTalking ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
            >
              {isTalking ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Talking
                </>
              ) : (
                <>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Talk to AI Avatar
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
            {["AI Avatar", "Widget", "Limits", "Sample code"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 sm:p-6">
        {activeTab === "AI Avatar" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Left Panel - Configuration */}
            <div className="space-y-4 sm:space-y-6">
              {/* Language */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-600 mb-2">Language</label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🇺🇸</span>
                          {lang}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* First Message */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-600 mb-2">First message</label>
                <Textarea
                  value={firstMessage}
                  onChange={(e) => setFirstMessage(e.target.value)}
                  className="min-h-[80px] resize-none"
                  placeholder="Enter the first message your AI avatar will say..."
                />
              </div>

              {/* System Prompt */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-600 mb-2">System Prompt</label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="min-h-[300px] resize-none"
                  placeholder="Define your AI avatar's personality and behavior..."
                />
              </div>

              {/* Voice Provider */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-600">Voice Provider</label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <Select value={voiceProvider} onValueChange={setVoiceProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Voice Selection */}
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={handlePlayVoice} className="h-10 w-10 p-0">
                      {isPlayingVoice ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsVoiceModalOpen(true)}
                      className="flex-1 justify-start"
                    >
                      {selectedVoice}
                    </Button>
                  </div>
                </div>
              </div>

              {/* LLM Provider */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-gray-600">LLM Provider</label>
                  <HelpCircle className="h-4 w-4 text-gray-400" />
                </div>
                <Select value={llmProvider} onValueChange={setLlmProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {llmProviders.map((provider) => (
                      <SelectItem key={provider} value={provider}>
                        {provider}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Save Button */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <Button onClick={handleSave} className="w-full">
                  Save
                </Button>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h3 className="font-medium text-gray-600 mb-3">Pricing Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">IBL</span>
                    <span className="text-gray-600">{pricing.ibl.toFixed(3)}$/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{voiceProvider.split(" ")[0]} (TTS)</span>
                    <span className="text-gray-600">{pricing.voice.toFixed(3)}$/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">LLM - {llmProvider.split(" ")[0]}</span>
                    <span className="text-gray-600">{pricing.llm.toFixed(3)}$/min</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-600">Total</span>
                      <span className="text-gray-600">{pricing.total.toFixed(3)}$/min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Avatar */}
            <div className="flex flex-col items-center order-first lg:order-last">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={character.image || "/placeholder.svg?height=400&width=400"}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = "/placeholder.svg?height=400&width=400"
                    }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Face ID: {character.faceId}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(character.faceId)}
                    className="h-6 w-6 p-0 flex-shrink-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Widget" && (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Embed Code Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-600">Embed code</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyCode(embedCode)}
                  className="w-full sm:w-auto"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy code
                </Button>
              </div>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Add the following snippet to the pages where you want the IBL widget to be.
              </p>
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 overflow-x-auto">
                <pre className="text-gray-800 font-mono text-xs sm:text-sm">
                  <code>
                    <span className="text-blue-600">&lt;ibl-widget</span> <span className="text-green-600">token</span>=
                    <span className="text-orange-500">"********"</span> <span className="text-green-600">agentid</span>=
                    <span className="text-orange-500">
                      "{character?.agentId || "b9a8ace6-0763-455c-b79d-8b83b6ca8bed"}"
                    </span>{" "}
                    <span className="text-green-600">position</span>=
                    <span className="text-orange-500">"{widgetPosition.toLowerCase()}"</span>{" "}
                    <span className="text-green-600">customimage</span>=<span className="text-orange-500">""</span>{" "}
                    <span className="text-green-600">customtext</span>=
                    <span className="text-orange-500">"{customText}"</span>
                    <span className="text-blue-600">&gt;&lt;/ibl-widget&gt;</span>
                    {"\n"}
                    <span className="text-blue-600">&lt;script</span> <span className="text-green-600">src</span>=
                    <span className="text-orange-500">"https://app.ibl.ai/ibl-widget/index.js"</span>{" "}
                    <span className="text-green-600">async</span> <span className="text-green-600">type</span>=
                    <span className="text-orange-500">"text/javascript"</span>
                    <span className="text-blue-600">&gt;&lt;/script&gt;</span>
                  </code>
                </pre>
              </div>
            </div>

            {/* Widget Appearance Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-600 mb-2">Widget Appearance</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Customize how the widget appears on your website
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Position</label>
                  <Select value={widgetPosition} onValueChange={setWidgetPosition}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Right">Right</SelectItem>
                      <SelectItem value="Left">Left</SelectItem>
                      <SelectItem value="Center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Custom Text</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Call assistant"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Custom Image URL</label>
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter custom image URL"
                  />
                </div>
              </div>

              <a
                href="https://docs.ibl.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium underline"
              >
                Create a custom trigger button ↗
              </a>
            </div>
          </div>
        )}

        {activeTab === "Limits" && (
          <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
            {/* Allowlist Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-600">Allowlist</h2>
                  <p className="text-gray-600">Specify the hosts that will be allowed to connect to this agent.</p>
                </div>
                <Button onClick={addHost} disabled={!newHost.trim()}>
                  Add host
                </Button>
              </div>

              <div className="space-y-2 mb-4">
                <input
                  type="text"
                  value={newHost}
                  onChange={(e) => setNewHost(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addHost()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter host URL (e.g., https://example.com)"
                />
              </div>

              {allowedHosts.length > 0 && (
                <div className="space-y-2">
                  {allowedHosts.map((host, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                      <span className="text-sm text-gray-700">{host}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeHost(host)}>
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Max Idle Time */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-600 mb-2">Max Idle Time (Seconds)</label>
              <p className="text-gray-600 text-sm mb-3">
                Maximum time the agent can be idle before it is disconnected.
              </p>
              <input
                type="number"
                value={maxIdleTime}
                onChange={(e) => setMaxIdleTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Max Session Duration */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <label className="block text-sm font-medium text-gray-600 mb-2">Max Session Duration (Seconds)</label>
              <p className="text-gray-600 text-sm mb-3">Maximum call duration before it is disconnected.</p>
              <input
                type="number"
                value={maxSessionDuration}
                onChange={(e) => setMaxSessionDuration(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {activeTab === "Sample code" && (
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Sample Code Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h2 className="text-lg font-semibold text-gray-600">Sample code</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyCode(sampleCode)}
                  className="w-full sm:w-auto"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy code
                </Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 overflow-x-auto mb-4">
                <pre className="text-gray-800 font-mono text-xs sm:text-sm">
                  <code>
                    <span className="text-purple-600">const</span> <span className="text-blue-600">response</span> ={" "}
                    <span className="text-purple-600">await</span> <span className="text-blue-600">fetch</span>(
                    <span className="text-orange-500">
                      "https://api.ibl.ai/session/{character?.agentId || "b9a8ace6-0763-455c-b79d-8b83b6ca8bed"}
                      /********"
                    </span>
                    , {"{"}
                    {"\n  "}
                    <span className="text-green-600">method</span>: <span className="text-orange-500">"GET"</span>,
                    {"\n  "}
                    <span className="text-green-600">headers</span>: {"{"}
                    {"\n    "}
                    <span className="text-orange-500">"Content-Type"</span>:{" "}
                    <span className="text-orange-500">"application/json"</span>,{"\n    "}
                    <span className="text-orange-500">"Accept"</span>:{" "}
                    <span className="text-orange-500">"application/json"</span>,{"\n  "}
                    {"},"}
                    {"\n"}
                    {"})"}
                    {"\n\n"}
                    <span className="text-purple-600">const</span> <span className="text-blue-600">data</span> ={" "}
                    <span className="text-purple-600">await</span> <span className="text-blue-600">response</span>.
                    <span className="text-blue-600">json</span>();
                    {"\n"}
                    <span className="text-purple-600">const</span> <span className="text-blue-600">roomUrl</span> ={" "}
                    <span className="text-blue-600">data</span>.<span className="text-blue-600">roomUrl</span>;
                  </code>
                </pre>
              </div>

              <p className="text-gray-600 text-sm sm:text-base">
                You can paste this code into{" "}
                <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-sm">IBLAgent.tsx</span> in Create IBL
                Agent starter repo to get started.
              </p>
            </div>

            {/* Create IBL Agent Section */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-xl font-semibold mb-3 text-gray-600">Create IBL Agent</h3>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Create, test, and deploy your AI avatar in the Create IBL Agent repo. Quickly get started and build your
                AI Agent with IBL.
              </p>
              <a
                href="https://platform.ibl.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Create IBL Agent
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        open={isShareModalOpen}
        onOpenChange={setIsShareModalOpen}
        agentId={character?.agentId || ""}
        characterName={character?.name || ""}
        avatarId={params.id}
      />

      {/* ChooseVoiceModal */}
      <ChooseVoiceModal open={isVoiceModalOpen} onOpenChange={setIsVoiceModalOpen} onSelectVoice={handleVoiceSelect} />
    </div>
  )
}
