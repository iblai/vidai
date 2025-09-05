"use client"

import { ChevronUp } from "lucide-react"

interface ScrollToTopButtonProps {
  showScrollTop: boolean
  scrollToTop: () => void
}

export function ScrollToTopButton({ showScrollTop, scrollToTop }: ScrollToTopButtonProps) {
  if (!showScrollTop) return null

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={scrollToTop}
        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-110 border-2 border-transparent"
        style={{
          background:
            "linear-gradient(white, white) padding-box, linear-gradient(to right, #A6BBEE, #0078FF) border-box",
          border: "2px solid transparent",
        }}
      >
        <ChevronUp
          className="w-6 h-6"
          style={{
            background: "linear-gradient(to right, #A6BBEE, #0078FF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        />
      </button>
    </div>
  )
}
