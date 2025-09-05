"use client"

import { useState, useEffect } from "react"

export function useSlides() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)
  const [preloadedImages, setPreloadedImages] = useState<HTMLImageElement[]>([])

  const slides = [
    {
      image: "/slide-1.png?v=2.0",
      alt: "Generate and preview your characters",
      width: "100%",
      maxWidth: "500px",
    },
    {
      image: "/slide-2.png?v=2.0",
      alt: "Generate and preview your video clips",
      width: "100%",
      maxWidth: "500px",
    },
    {
      image: "/slide-3.png?v=2.0",
      alt: "See what others are generating",
      width: "100%",
      maxWidth: "500px",
    },
  ]

  const slideStyles = [
    { width: "100%", maxWidth: "500px", aspectRatio: "1.2" },
    { width: "100%", maxWidth: "500px", aspectRatio: "1.2" },
    { width: "100%", maxWidth: "500px", aspectRatio: "1.2" },
  ]

  useEffect(() => {
    const loadImages = async () => {
      const imagePromises = slides.map((slide) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image()
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = slide.image
        })
      })

      try {
        const loadedImages = await Promise.all(imagePromises)
        setPreloadedImages(loadedImages)
      } catch (error) {
        console.error("Failed to preload images:", error)
      }
    }

    loadImages()
  }, [])

  const changeSlide = (index: number) => {
    if (index === currentSlide) return

    setFadeIn(false)
    setTimeout(() => {
      setCurrentSlide(index)
      setFadeIn(true)
    }, 150)
  }

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setFadeIn(true)
      }, 150)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  return {
    currentSlide,
    fadeIn,
    slideStyles,
    slides,
    changeSlide,
    preloadedImages,
  }
}
