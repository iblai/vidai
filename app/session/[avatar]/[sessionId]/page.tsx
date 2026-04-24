"use client"

import { Share2, Mic, MicOff, Phone, Loader2 } from "lucide-react"
import { useEffect, useRef, useState, use } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useHeygenStreaming } from "@/hooks/use-heygen-streaming"
import {
  listHeygenInteractiveAvatars,
  listHeygenKnowledgeBases,
  type CreateHeygenStreamingSessionInput,
} from "@/lib/heygen/rest"

const HEYGEN_INTERACTIVE_SETUP_URL =
  "https://labs.heygen.com/interactive-avatar"

interface Character {
  id: string
  name: string
  image: string
}

const STATIC_CHARACTERS: Character[] = [
  { id: "vincent-de-paul", name: "Vincent de Paul", image: "/images/characters/vincent-de-paul.jpg" },
  { id: "marcus-aurelius", name: "Marcus Aurelius", image: "/images/characters/interactive-marcus.png" },
  { id: "william-shakespeare", name: "William Shakespeare", image: "/images/characters/william-shakespeare.png" },
  { id: "thomas-aquinas", name: "Thomas Aquinas", image: "/images/characters/thomas-aquinas.png" },
  { id: "nikola-tesla", name: "Nikola Tesla", image: "/images/characters/nikola-tesla.webp" },
  { id: "amelia-earhart", name: "Amelia Earhart", image: "/images/characters/amelia-earhart.webp" },
  { id: "harry-houdini", name: "Harry Houdini", image: "/images/characters/harry-houdini.webp" },
  { id: "marie-curie", name: "Marie Curie", image: "/images/characters/marie-curie.webp" },
  { id: "sally-ride", name: "Sally Ride", image: "/images/characters/sally-ride.webp" },
]

function resolveCharacter(avatarId: string): Character {
  if (typeof window !== "undefined") {
    try {
      const saved = JSON.parse(localStorage.getItem("myCharacters") || "[]")
      const hit = saved.find((c: any) => c.id === avatarId)
      if (hit) return hit
    } catch {
      // fall through
    }
  }
  const hit = STATIC_CHARACTERS.find((c) => c.id === avatarId)
  if (hit) return hit
  return { id: avatarId, name: "AI Avatar", image: "/placeholder.svg" }
}

export default function SessionPage({
  params: paramsPromise,
}: {
  params: Promise<{ avatar: string; sessionId: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()

  const [character] = useState<Character>(() => resolveCharacter(params.avatar))
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [micError, setMicError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  /** Flipped true the first time the session reaches "connected". Used to
   *  suppress the "Session ended" flash that otherwise appears during
   *  React strict-mode double-mount before any real connection. */
  const hasConnectedRef = useRef(false)

  // Resolve which interactive avatar + knowledge base to use. We list
  // whatever the tenant's HeyGen account actually owns and pick from
  // there — the demo ids baked into HeyGen's public share URLs belong
  // to a different account and silently fail (avatar transcribes but
  // never answers).
  const [streamingInput, setStreamingInput] =
    useState<CreateHeygenStreamingSessionInput | null>(null)
  const [resolveError, setResolveError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setResolveError(null)
    ;(async () => {
      try {
        const [avatars, kbs] = await Promise.all([
          listHeygenInteractiveAvatars(),
          listHeygenKnowledgeBases(),
        ])
        if (cancelled) return
        const activeAvatars = avatars.filter((a) => a.status === "ACTIVE")
        if (activeAvatars.length === 0) {
          setResolveError("No interactive avatars available on this tenant")
          return
        }
        // `params.avatar` must be a real HeyGen interactive avatar_id —
        // see the character-selection modal, which only lets users
        // reach this page for avatars that are already interactive.
        const avatar = activeAvatars.find((a) => a.avatar_id === params.avatar)
        if (!avatar) {
          setResolveError(
            `This avatar isn't configured as an interactive avatar on the tenant. Set it up at ${HEYGEN_INTERACTIVE_SETUP_URL} first.`,
          )
          return
        }
        const kb = kbs[0]
        if (!kb) {
          setResolveError("No knowledge bases configured on this tenant.")
          return
        }
        console.log(
          `[session] using avatar ${avatar.pose_name ?? avatar.avatar_id} (${avatar.avatar_id}), kb ${kb.name} (${kb.id})`,
        )
        setStreamingInput({
          avatar_name: avatar.avatar_id!,
          knowledge_base_id: kb.id,
          voice: avatar.default_voice
            ? { voice_id: avatar.default_voice }
            : undefined,
          quality: "medium",
        })
      } catch (err) {
        if (cancelled) return
        console.error("[session] resolve failed:", err)
        setResolveError((err as Error)?.message ?? "Failed to list avatars")
      }
    })()
    return () => {
      cancelled = true
    }
  }, [params.avatar])

  const {
    state,
    error,
    attachVideo,
    stop,
    micOn,
    startVoiceChat,
    stopVoiceChat,
  } = useHeygenStreaming(streamingInput)

  const connected = state === "connected" || state === "speaking"

  useEffect(() => {
    attachVideo(videoRef.current)
    return () => attachVideo(null)
  }, [attachVideo])

  useEffect(() => {
    if (!connected) return
    const t = setInterval(() => setTimeElapsed((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [connected])

  // First time the session connects: remember it + auto-enable the mic.
  // The browser permission prompt inherits the user gesture from the
  // "Talk to AI Avatar" click that navigated us here.
  useEffect(() => {
    if (!connected || hasConnectedRef.current) return
    hasConnectedRef.current = true
    startVoiceChat().catch((err) => {
      console.warn("[session] auto start mic failed:", err)
      setMicError((err as Error)?.message ?? "Mic permission denied")
    })
  }, [connected, startVoiceChat])

  const handleEndCall = async () => {
    await stop()
    router.back()
  }

  const handleToggleMic = async () => {
    setMicError(null)
    try {
      if (micOn) {
        await stopVoiceChat()
      } else {
        await startVoiceChat()
      }
    } catch (err) {
      console.error("[session] mic toggle failed:", err)
      setMicError((err as Error)?.message ?? "Mic toggle failed")
    }
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      <div className="bg-white border-b border-gray-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-600 truncate">
            Talk with {character.name}
          </h1>
          <Button variant="outline" size="sm" className="bg-blue-500 text-white hover:bg-blue-600">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full w-full flex justify-center items-center">
          <div className="bg-gray-50 flex flex-col h-full w-full px-0 md:px-12 py-0 md:py-14">
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden flex items-center justify-center w-full rounded-xl h-full">
              {connected && (
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium z-20 border border-white/10">
                  {formatTime(timeElapsed)}
                </div>
              )}

              {connected && micOn && (
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 bg-green-500/90 text-white px-2 py-1 rounded-lg text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Listening
                </div>
              )}

              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="relative z-10 w-full h-full object-contain"
              />

              {!connected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-20 bg-black/40">
                  {state === "error" || resolveError ? (
                    <>
                      <p className="text-sm font-semibold text-red-300 mb-2">
                        Failed to start avatar
                      </p>
                      <p className="text-xs text-white/70 max-w-md text-center px-4 mb-4">
                        {(resolveError || error || "")
                          .split(
                            /(https?:\/\/[^\s]+|labs\.heygen\.com\/[^\s]+)/g,
                          )
                          .map((part, i) => {
                            if (/^(https?:\/\/|labs\.heygen\.com\/)/.test(part)) {
                              const href = part.startsWith("http")
                                ? part
                                : `https://${part}`
                              return (
                                <a
                                  key={i}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-300 underline hover:text-blue-200"
                                >
                                  {part}
                                </a>
                              )
                            }
                            return <span key={i}>{part}</span>
                          })}
                      </p>
                      <Button
                        onClick={() => router.back()}
                        size="sm"
                        className="bg-white text-gray-900 hover:bg-gray-100"
                      >
                        Go back
                      </Button>
                    </>
                  ) : state === "ended" && hasConnectedRef.current ? (
                    <p className="text-sm">Session ended.</p>
                  ) : (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                      <p className="text-sm">
                        {state === "creating"
                          ? "Creating session…"
                          : state === "connecting"
                            ? "Connecting to LiveKit…"
                            : "Starting…"}
                      </p>
                      <p className="text-[10px] font-mono text-white/50 mt-2">
                        state: {state}
                      </p>
                    </>
                  )}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 pb-6 flex flex-col items-center justify-center gap-3 px-4">
                {micError && (
                  <p className="text-xs text-red-200 bg-red-900/60 backdrop-blur-sm px-3 py-1.5 rounded-lg max-w-md text-center">
                    {micError}
                  </p>
                )}
                {connected && (
                  <div className="flex items-center gap-3 bg-black/60 backdrop-blur-sm rounded-full p-2 border border-white/10">
                    <Button
                      onClick={handleToggleMic}
                      className={`rounded-full w-14 h-14 shadow-lg transition-all hover:scale-105 ${
                        micOn
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-white/20 hover:bg-white/30 text-white"
                      }`}
                      title={micOn ? "Mute" : "Start voice chat"}
                    >
                      {micOn ? (
                        <Mic className="h-6 w-6" />
                      ) : (
                        <MicOff className="h-6 w-6" />
                      )}
                    </Button>
                    <Button
                      onClick={handleEndCall}
                      className="bg-red-500 hover:bg-red-600 text-white rounded-full w-14 h-14 shadow-lg transition-all hover:scale-105"
                      title="End call"
                    >
                      <Phone className="h-6 w-6" />
                    </Button>
                  </div>
                )}
                {connected && !micOn && (
                  <p className="text-xs text-white/70 text-center">
                    Tap the mic to start talking
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
