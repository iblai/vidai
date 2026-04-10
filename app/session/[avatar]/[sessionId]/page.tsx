"use client"

import type React from "react"
import { Share2, Mic, MicOff, MessageCircle, Send, X, Phone } from "lucide-react"
import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Markdown } from "@iblai/iblai-js/web-containers"
import { Loader } from "@iblai/iblai-js/web-containers"

interface Message {
  id: string
  sender: "user" | "avatar"
  content: string
  timestamp: Date
}

export default function SessionPage({ params: paramsPromise }: { params: Promise<{ avatar: string; sessionId: string }> }) {
  const params = use(paramsPromise)
  const router = useRouter()
  const [sessionState, setSessionState] = useState<"initial" | "calling" | "connected">("initial")
  const [isMuted, setIsMuted] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isCallMode, setIsCallMode] = useState(true)
  const [selectedLanguage, setSelectedLanguage] = useState("English")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [character, setCharacter] = useState<any>(null)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [heygenInitialized, setHeygenInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const heygenIframeRef = useRef<HTMLIFrameElement>(null)

  const getHeyGenUrl = (characterId: string) => {
    switch (characterId) {
      case "vincent-de-paul":
        return "https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiJlMjA2YzQzYTRkYWM0MjVkOTg4MzQ0OGEy%0D%0ANGI0Yzc3ZiIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3Yz%0D%0AL2UyMDZjNDNhNGRhYzQyNWQ5ODgzNDQ4YTI0YjRjNzdmL2Z1bGwvMi4yL3ByZXZpZXdfdGFyZ2V0%0D%0ALndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImRl%0D%0AbW8tMSIsInVzZXJuYW1lIjoiNzAyMDc1ZjUwZGE4NDYzNDk4ZWRlZDM5NTk3NjRiMmUifQ%3D%3D&inIFrame=1"
      case "marcus-aurelius":
        return "https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiIxZWE4ODAwZDYzNGQ0OWE0YjIwN2YwYTVh%0AZGY2NzhmYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3Yz%0ALzFlYTg4MDBkNjM0ZDQ5YTRiMjA3ZjBhNWFkZjY3OGZjL2Z1bGwvMi4yL3ByZXZpZXdfdGFyZ2V0%0ALndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImY0%0AOTNhNjQ0MjlmZTQzNjliMTQ5ZmYxN2E2YTkwNDEwIiwidXNlcm5hbWUiOiI3MDIwNzVmNTBkYTg0%0ANjM0OThlZGVkMzk1OTc2NGIyZSJ9&inIFrame=1"
      case "william-shakespeare":
        return "https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiI1NWY4NTM3MDYyYTA0NzNkYjM0OWRhZGQ4Yjc4ZDJkZSIsInByZXZpZXdfdGltZUxvY2F0aW9uIjoiY2FjaGUtaW4tZGVzaWduZWQiLCJwcmV2aWV3SW1nIjoiaHR0cHM6Ly9maWxlczIuaGV5Z2VuLmFpL2F2YXRhci92My81NWY4NTM3MDYyYTA0NzNkYjM0OWRhZGQ4Yjc4ZDJkZS9mdWxsLzIuMi9wcmV2aWV3X3RhcmdldC53ZWJwIiwibmVlZFJlbW92ZUJhY2tncm91bmQiOmZhbHNlLCJrbm93bGVkZ2VCYXNlSWQiOiIxMjUzZTZlOTEyZWM0ZDc2OTU0ZjI2MDI4NDdjM2ViMyIsInVzZXJuYW1lIjoiNzAyMDc1ZjUwZGE4NDYzNDk4ZWRlZDM5NTk3NjRiMmUifQ&inIFrame=1"
      case "thomas-aquinas":
        return "https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiI5YmE4NmZhY2M3ZjQ0NGU5OTM3ZmI2ZmIy%0ANmMxMmI4NyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3Yz%0ALzliYTg2ZmFjYzdmNDQ0ZTk5MzdmYjZmYjI2YzEyYjg3L2Z1bGwvMi4yL3ByZXZpZXdfdGFyZ2V0%0ALndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImMw%0AMzU3OTQwMjY0MTQ5YzM4MDliYzhhMjg5YTgxZGUxIiwidXNlcm5hbWUiOiI3MDIwNzVmNTBkYTg0%0ANjM0OThlZGVkMzk1OTc2NGIyZSJ9&inIFrame=1"
      default:
        return null
    }
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement
    setImageDimensions({ width: img.width, height: img.height })
    setImageLoaded(true)
  }

  useEffect(() => {
    const savedCharacters = localStorage.getItem("myCharacters")
    if (savedCharacters) {
      const characters = JSON.parse(savedCharacters)
      const foundCharacter = characters.find((char: any) => char.id === params.avatar)
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

    const foundCharacter = staticCharacters.find((char) => char.id === params.avatar)
    if (foundCharacter) {
      setCharacter(foundCharacter)
    }
  }, [params.avatar])

  useEffect(() => {
    const heygenUrl = getHeyGenUrl(params.avatar)
    if (heygenUrl) {
      const handleHeyGenMessage = (event: MessageEvent) => {
        if (event.origin !== "https://labs.heygen.com" || !event.data || event.data.type !== "streaming-embed") {
          return
        }
        if (event.data.action === "init") {
          setHeygenInitialized(true)
        }
      }

      window.addEventListener("message", handleHeyGenMessage)
      return () => window.removeEventListener("message", handleHeyGenMessage)
    }
  }, [params.avatar])

  useEffect(() => {
    const heygenUrl = getHeyGenUrl(params.avatar)
    if (heygenUrl && heygenIframeRef.current) {
      const iframe = heygenIframeRef.current

      const attemptButtonStyling = () => {
        try {
          // Try to access iframe content (will likely fail due to CORS)
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
          if (iframeDoc) {
            const style = iframeDoc.createElement("style")
            style.textContent = `
              .css-iogrug > img {
                object-fit: contain !important;
                background-image: url(/assets/video-bg-0aee0c5e.jpg);
                border-radius: 22px !important;
              }
            `
            iframeDoc.head.appendChild(style)

            // Find buttons that might be the "Chat now" button
            const buttons = iframeDoc.querySelectorAll("button")
            buttons.forEach((button) => {
              const buttonText = button.textContent?.toLowerCase() || ""
              if (buttonText.includes("chat") || buttonText.includes("start") || buttonText.includes("begin")) {
                button.style.backgroundColor = "#3B82F6"
                button.style.background = "linear-gradient(135deg, #3B82F6, #1D4ED8)"
                button.style.borderColor = "#3B82F6"
                button.style.color = "white"
              }
            })
          }
        } catch (error) {
          // CORS will prevent this, so try postMessage approach
          console.log("[v0] CORS prevented direct access, trying postMessage")

          iframe.contentWindow?.postMessage(
            {
              type: "style-update",
              styles: {
                buttonColor: "#3B82F6",
                buttonGradient: "linear-gradient(135deg, #3B82F6, #1D4ED8)",
                textColor: "white",
              },
              css: `
                .css-iogrug > img {
                  object-fit: contain !important;
                  background-image: url(/assets/video-bg-0aee0c5e.jpg);
                  border-radius: 22px !important;
                }
              `,
            },
            "https://labs.heygen.com",
          )
        }
      }

      // Try when iframe loads
      iframe.addEventListener("load", attemptButtonStyling)

      // Also try after a delay in case content loads later
      const timeouts = [1000, 2000, 3000, 5000].map((delay) => setTimeout(attemptButtonStyling, delay))

      return () => {
        iframe.removeEventListener("load", attemptButtonStyling)
        timeouts.forEach(clearTimeout)
      }
    }
  }, [params.avatar, heygenInitialized])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (sessionState === "connected") {
      interval = setInterval(() => {
        setTimeElapsed((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [sessionState])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStartCall = () => {
    setSessionState("calling")
    setTimeout(() => {
      setSessionState("connected")
      if (!isCallMode) {
        setIsChatOpen(true)
      }
    }, 2000)
  }

  const handleEndCall = () => {
    setSessionState("initial")
    setIsChatOpen(false)
  }

  const generateSmartResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()

    if (
      message.includes("help") &&
      (message.includes("task") || message.includes("assignment") || message.includes("work"))
    ) {
      return "I'm IBL AI, your intelligent assistant! I'd be happy to help you with your task. Could you provide more details about what specific assistance you need? I can help with planning, problem-solving, research, or breaking down complex tasks into manageable steps."
    }

    if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
      return `Hello! I'm IBL AI, powered by advanced artificial intelligence. I'm here to assist you with any questions or tasks you might have. How can I help you today?`
    }

    if (message.includes("what") && message.includes("do")) {
      return "As IBL AI, I can help you with a wide range of tasks including answering questions, providing explanations, helping with analysis, creative writing, problem-solving, and much more. What would you like to work on together?"
    }

    if (message.includes("thank")) {
      return "You're very welcome! I'm glad I could help. If you have any other questions or need assistance with anything else, feel free to ask. That's what IBL AI is here for!"
    }

    // Default response
    return "Thank you for your message! As IBL AI, I'm here to provide intelligent assistance with whatever you need. Could you tell me more about how I can help you today?"
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: "user",
        content: newMessage,
        timestamp: new Date(),
      }
      setMessages([...messages, message])
      const currentMessage = newMessage
      setNewMessage("")

      setTimeout(() => {
        const avatarResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: "avatar",
          content: generateSmartResponse(currentMessage),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, avatarResponse])
      }, 1000)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!character) {
    return <div className="h-screen bg-white"><Loader /></div>
  }

  const isPortrait = imageDimensions.height > imageDimensions.width
  const aspectRatio =
    imageDimensions.width && imageDimensions.height ? imageDimensions.width / imageDimensions.height : 16 / 10

  const heygenUrl = getHeyGenUrl(params.avatar)

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-600 truncate">Talk with {character.name}</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600 hidden sm:flex">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600 sm:hidden p-2">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full">
          <div
            className={`h-full ${
              isChatOpen ? "flex flex-col lg:grid lg:grid-cols-2 gap-0" : "flex justify-center items-center"
            }`}
          >
            {/* Avatar Section */}
            <div className="bg-gray-50 flex flex-col h-full w-full px-0 md:px-12 py-0 md:py-14">
              <div
                className={`relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden flex items-center justify-center w-full ${
                  isChatOpen ? "h-1/2 lg:h-full" : "h-full"
                }`}
              >
                {/* Time Remaining */}
                {sessionState === "connected" && (
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium z-20 border border-white/10">
                    {formatTime(timeElapsed)}
                  </div>
                )}

                {/* Toggle buttons for call/message mode */}
                {sessionState === "connected" && (
                  <div className="absolute top-2 right-2 z-20">
                    <div className="flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-lg p-1 border border-white/10">
                      <Button
                        size="sm"
                        className={`rounded-md w-8 h-8 transition-all text-xs ${
                          isCallMode
                            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                            : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                        onClick={() => {
                          setIsCallMode(true)
                          setIsChatOpen(false)
                        }}
                      >
                        <Phone className="h-3 w-3" />
                      </Button>

                      <Button
                        size="sm"
                        className={`rounded-md w-8 h-8 transition-all text-xs ${
                          !isCallMode
                            ? "bg-blue-500 hover:bg-blue-600 text-white shadow-lg"
                            : "bg-transparent text-white/70 hover:text-white hover:bg-white/10"
                        }`}
                        onClick={() => {
                          setIsCallMode(false)
                          setIsChatOpen(true)
                        }}
                      >
                        <MessageCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {heygenUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Background Image Container */}
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-xl"
                      style={{
                        backgroundImage: "url(/assets/video-bg-0aee0c5e.jpg)",
                      }}
                    />

                    {/* Mobile-sized HeyGen iframe overlay */}
                    <div className="relative z-10 w-full h-full sm:w-[375px] sm:h-[600px] max-w-[85vw] max-h-[75vh] py-0 md:py-3 flex items-center justify-center">
                      <div className="w-full h-full rounded-xl overflow-hidden shadow-2xl">
                        <iframe
                          ref={heygenIframeRef}
                          src={heygenUrl}
                          className="w-full h-full border-0"
                          allow="microphone"
                          title={`${character.name} HeyGen Streaming`}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={character.image || "/placeholder.svg?height=600&width=800"}
                    alt={character.name}
                    className="w-full h-full object-cover"
                    onLoad={handleImageLoad}
                  />
                )}

                {/* Control Buttons */}
                <div className="absolute bottom-0 left-0 right-0 pb-4 flex items-center justify-center gap-2 px-4">
                  {sessionState === "initial" && !heygenUrl && (
                    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="w-20 sm:w-24 bg-white/90 backdrop-blur-sm text-xs border-0 shadow-lg rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                          <SelectItem value="French">French</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleStartCall}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg shadow-lg text-xs font-medium transition-all hover:scale-105"
                      >
                        Talk Now
                      </Button>
                    </div>
                  )}

                  {sessionState === "calling" && (
                    <div className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full w-10 h-10 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all"
                      >
                        <Mic className="h-4 w-4 text-white" />
                      </Button>
                      <Button
                        onClick={handleEndCall}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 shadow-lg transition-all hover:scale-105"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {sessionState === "connected" && (
                    <div className="flex items-center gap-2 sm:gap-3 bg-black/60 backdrop-blur-sm rounded-lg p-2 border border-white/10">
                      {isCallMode && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full w-10 h-10 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30 transition-all"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <MicOff className="h-4 w-4 text-white" /> : <Mic className="h-4 w-4 text-white" />}
                        </Button>
                      )}

                      <Button
                        onClick={handleEndCall}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full w-10 h-10 shadow-lg transition-all hover:scale-105"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Panel */}
              {isChatOpen && !isCallMode && (
                <div className={`bg-white flex flex-col shadow-sm w-full h-1/2 lg:h-full`}>
                  {/* Chat Header */}
                  <div className="flex items-center justify-between p-3 border-b border-gray-200 flex-shrink-0 rounded-t-lg">
                    <h3 className="font-semibold text-gray-600 text-sm truncate">Chat with {character.name}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsChatOpen(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                    {messages.length === 0 && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                          {character.name[0]}
                        </div>
                        <div className="text-sm text-gray-600">Get question.</div>
                      </div>
                    )}
                    {messages.map((message) => (
                      <div key={message.id} className="space-y-2">
                        {message.sender === "avatar" && (
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {character.name[0]}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                              <Markdown>{message.content}</Markdown>
                            </div>
                          </div>
                        )}
                        {message.sender === "user" && (
                          <div className="flex justify-end">
                            <div className="max-w-[80%] bg-blue-500 text-white rounded-lg p-3">
                              <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-t border-gray-200 flex-shrink-0 rounded-b-lg">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Send me message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                      <Button
                        onClick={handleSendMessage}
                        size="sm"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
