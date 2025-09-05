"use client"

import { useEffect } from "react"

interface HeyGenWidgetProps {
  shareToken?: string
}

export default function HeyGenWidget({ shareToken }: HeyGenWidgetProps) {
  useEffect(() => {
    const host = "https://labs.heygen.com"
    const defaultToken =
      "eyJxdWFsaXR5IjoiaGlnaCIsImF2YXRhck5hbWUiOiI5YmE4NmZhY2M3ZjQ0NGU5OTM3ZmI2ZmIy%0ANmMxMmI4NyIsInByZXZpZXdJbWciOiJodHRwczovL2ZpbGVzMi5oZXlnZW4uYWkvYXZhdGFyL3Yz%0ALzliYTg2ZmFjYzdmNDQ0ZTk5MzdmYjZmYjI2YzEyYjg3L2Z1bGwvMi4yL3ByZXZpZXdfdGFyZ2V0%0ALndlYnAiLCJuZWVkUmVtb3ZlQmFja2dyb3VuZCI6ZmFsc2UsImtub3dsZWRnZUJhc2VJZCI6ImMw%0AMzU3OTQwMjY0MTQ5YzM4MDliYzhhMjg5YTgxZGUxIiwidXNlcm5hbWUiOiI3MDIwNzVmNTBkYTg0%0ANjM0OThlZGVkMzk1OTc2NGIyZSJ9"
    const url = `${host}/guest/streaming-embed?share=${shareToken || defaultToken}&inIFrame=1`

    // Check if widget already exists
    if (document.getElementById("heygen-fullscreen")) {
      return
    }

    // Create fullscreen container
    const wrap = document.createElement("div")
    wrap.id = "heygen-fullscreen"

    const container = document.createElement("div")
    container.id = "heygen-streaming-container"

    // Add styles
    const style = document.createElement("style")
    style.innerHTML = `
      #heygen-fullscreen {
        position: fixed; inset: 0; z-index: 10001;
        width: 100vw; height: 100vh; height: 100dvh;
        background: #000; display: flex; align-items: center; justify-content: center;
        opacity: 0; visibility: hidden; transition: opacity .12s linear;
        overflow: hidden;
      }
      #heygen-fullscreen.show { opacity: 1; visibility: visible; }

      #heygen-streaming-container {
        width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
      }

      #heygen-streaming-container iframe {
        height: 100vh; height: 100dvh;
        width: auto; max-width: 100vw;
        aspect-ratio: 9 / 16;
        border: 0; background: #000;
      }

      body.heygen-no-scroll { overflow: hidden; }
    `

    // Create iframe
    const iframe = document.createElement("iframe")
    iframe.allowFullscreen = true
    iframe.title = "Streaming Embed"
    iframe.role = "dialog"
    iframe.allow = "microphone"
    iframe.src = url

    // State management
    let isVisible = false
    function setVisible(on: boolean) {
      isVisible = !!on
      wrap.classList.toggle("show", isVisible)
      document.body.classList.toggle("heygen-no-scroll", isVisible)
    }

    // Message listener for HeyGen events
    const messageHandler = (e: MessageEvent) => {
      if (e.origin !== host || !e.data || e.data.type !== "streaming-embed") return
      if (e.data.action === "init") setVisible(true)
      if (e.data.action === "show") setVisible(true)
      if (e.data.action === "hide") setVisible(false)
    }

    // ESC key handler
    const keyHandler = (ev: KeyboardEvent) => {
      if (ev.key === "Escape" && isVisible) setVisible(false)
    }

    // Add event listeners
    window.addEventListener("message", messageHandler)
    window.addEventListener("keydown", keyHandler)

    // Assemble and append to DOM
    container.appendChild(iframe)
    wrap.appendChild(style)
    wrap.appendChild(container)
    document.body.appendChild(wrap)

    // Cleanup function
    return () => {
      window.removeEventListener("message", messageHandler)
      window.removeEventListener("keydown", keyHandler)
      if (wrap.parentNode) {
        wrap.parentNode.removeChild(wrap)
      }
      document.body.classList.remove("heygen-no-scroll")
    }
  }, [shareToken])

  return null // This component doesn't render anything visible directly
}

// Export function to show HeyGen widget
export function showHeyGenWidget() {
  const event = new MessageEvent("message", {
    data: { type: "streaming-embed", action: "show" },
    origin: "https://labs.heygen.com",
  })
  window.dispatchEvent(event)
}
