"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

interface HeyGenStreamingProps {
  isActive: boolean
  onClose: () => void
}

export function HeyGenStreaming({ isActive, onClose }: HeyGenStreamingProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const heygenUrl =
    "https://labs.heygen.com/guest/streaming-embed?share=eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiIxZWE4ODAwZDYzNGQ0OWE0YjIwN2YwYTVhZGY2NzhmYyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3YzLzFlYTg4MDBkNjM0ZDQ5YTRiMjA3ZjBhNWFkZjY3OGZjL2Z1bGwvMi4yL3ByZXZpZXdfdGFyZ2V0LndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImY0OTNhNjQ0MjlmZTQzNjliMTQ5ZmYxN2E2YTkwNDEwIiwidXNlcm5hbWUiOiI3MDIwNzVmNTBkYTg0NjM0OThlZGVkMzk1OTc2NGIyZSJ9&inIFrame=1"

  useEffect(() => {
    if (!isActive) return

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://labs.heygen.com" || !event.data || event.data.type !== "streaming-embed") {
        return
      }

      if (event.data.action === "init") {
        setIsInitialized(true)
      }
      if (event.data.action === "show") {
        setIsExpanded(true)
      }
      if (event.data.action === "hide") {
        setIsExpanded(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isExpanded) {
        setIsExpanded(false)
      }
    }

    window.addEventListener("message", handleMessage)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("message", handleMessage)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isActive, isExpanded])

  useEffect(() => {
    if (isExpanded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isExpanded])

  if (!isActive) return null

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 z-[10000] transition-opacity duration-150"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* HeyGen Streaming Container */}
      <div
        className={`fixed z-[10001] transition-all duration-150 ${
          isExpanded
            ? "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-[calc(100vh*9/16)] aspect-[9/16] border-0 rounded-none"
            : "right-10 bottom-10 w-48 h-48 rounded-full border-2 border-white shadow-2xl"
        } ${isInitialized ? "opacity-100 visible" : "opacity-0 invisible"} overflow-hidden bg-black`}
      >
        <div className="w-full h-full flex justify-center items-center">
          <iframe
            ref={iframeRef}
            src={heygenUrl}
            className={`border-0 ${isExpanded ? "w-auto h-full aspect-[9/16]" : "w-full h-full"}`}
            allow="microphone"
            allowFullScreen
            title="HeyGen Streaming"
          />
        </div>

        {/* Control buttons when not expanded */}
        {!isExpanded && isInitialized && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              onClick={() => setIsExpanded(true)}
              className="bg-blue-500/80 hover:bg-blue-600/80 text-white rounded-full w-12 h-12 backdrop-blur-sm"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
