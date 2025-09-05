"use client"

import type React from "react"
import { Suspense } from "react"
import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Upload, Link, Sparkles, ChevronDown, Trash2, RotateCcw } from "lucide-react"
import Image from "next/image"

const models = [
  {
    id: "veo3",
    name: "Veo 3",
    icon: "/images/models/veo3.png",
    description: "Google's latest text-to-video model with integrated audio effects—premium quality among models.",
  },
  {
    id: "kling",
    name: "KlingAI",
    icon: "/images/models/kling.png",
    description:
      "Advanced AI video generation with realistic motion and high-quality output for professional content creation.",
  },
  {
    id: "sora",
    name: "Sora",
    icon: "/images/models/sora.png",
    description:
      "A video generation model, designed to take text, image, and video inputs and generate a new video as an output.",
  },
  {
    id: "runway",
    name: "Runway",
    icon: "/images/models/runway.png",
    description: "A video generation model known for excellent dynamic control and animation.",
  },
]

const resolutions = ["1280×768", "1920×1080", "1024×1024", "768×1280", "1080×1920"]

function VideoGeneratorContent() {
  const searchParams = useSearchParams()
  const [selectedModel, setSelectedModel] = useState("veo3")
  const [videoDuration, setVideoDuration] = useState([5])
  const [prompt, setPrompt] = useState("")
  const [resolution, setResolution] = useState("1280×768")
  const [showModelDropdown, setShowModelDropdown] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [isLoadingUrl, setIsLoadingUrl] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const modelFromUrl = searchParams.get("model")
    if (modelFromUrl && models.find((m) => m.id === modelFromUrl)) {
      setSelectedModel(modelFromUrl)
    }

    const promptFromUrl = searchParams.get("prompt")
    if (promptFromUrl) {
      setPrompt(decodeURIComponent(promptFromUrl))
    }
  }, [searchParams])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowModelDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const currentModel = models.find((m) => m.id === selectedModel) || models[0]

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId)
    setShowModelDropdown(false)
  }

  const validateFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    const maxSize = 5 * 1024 * 1024 // 5MB

    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, GIF, WEBP)")
      return false
    }

    if (file.size > maxSize) {
      alert("File size must be less than 5MB")
      return false
    }

    return true
  }

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }

      setSelectedFile(file)
      const newPreviewUrl = URL.createObjectURL(file)
      setPreviewUrl(newPreviewUrl)
      setShowUrlInput(false)
      setImageUrl("")
    }
  }

  const handleUrlUpload = async () => {
    if (!imageUrl.trim()) {
      alert("Please enter a valid image URL")
      return
    }

    setIsLoadingUrl(true)
    try {
      const response = await fetch(imageUrl)
      if (!response.ok) {
        throw new Error("Failed to fetch image")
      }

      const blob = await response.blob()

      // Check if it's a valid image
      if (!blob.type.startsWith("image/")) {
        throw new Error("URL does not point to a valid image")
      }

      // Create a file from the blob
      const fileName = imageUrl.split("/").pop() || "image"
      const file = new File([blob], fileName, { type: blob.type })

      if (validateFile(file)) {
        // Clean up previous preview URL
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }

        setSelectedFile(file)
        const newPreviewUrl = URL.createObjectURL(file)
        setPreviewUrl(newPreviewUrl)
        setShowUrlInput(false)
        setImageUrl("")
      }
    } catch (error) {
      alert("Failed to load image from URL. Please check the URL and try again.")
    } finally {
      setIsLoadingUrl(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleReUpload = () => {
    fileInputRef.current?.click()
  }

  const handleDelete = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setPreviewUrl(null)
    setShowUrlInput(false)
    setImageUrl("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleShowUrlInput = () => {
    setShowUrlInput(true)
  }

  const handleBackToUpload = () => {
    setShowUrlInput(false)
    setImageUrl("")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 w-full min-h-full">
      {/* Left Panel */}
      <div className="bg-white">
        {/* Header outside content area */}
        <div className="p-4 sm:p-6 pb-0">
          <h1 className="text-xl sm:text-2xl font-bold text-[#4E5460]">Generate Video Clip</h1>
        </div>

        {/* Main content area that aligns with right section */}
        <div className="p-4 sm:p-6 pt-4 sm:pt-6">
          <div className="mx-auto space-y-4 sm:space-y-6 sm:pl-4">
            {/* Upload Reference Image */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-[#4E5460]">Upload Reference Image</h2>

              <Card className="bg-white border border-gray-200 shadow-sm rounded-lg overflow-hidden">
                <CardContent className="p-3 sm:p-4">
                  {!selectedFile ? (
                    <>
                      {!showUrlInput ? (
                        <div
                          className={`p-4 sm:p-8 text-center border-2 border-dashed rounded-md transition-colors cursor-pointer ${
                            isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onClick={handleUploadClick}
                        >
                          <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 text-gray-400">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1"
                              className="w-full h-full"
                            >
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                              <circle cx="9" cy="9" r="2" />
                              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                            </svg>
                          </div>
                          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">
                            Drag & drop an image, paste from clipboard, or upload a file
                          </p>
                          <div className="flex flex-col sm:flex-row gap-2 justify-center">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleUploadClick()
                              }}
                              className="text-xs sm:text-sm"
                            >
                              <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              Upload File
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleShowUrlInput()
                              }}
                              className="text-xs sm:text-sm"
                            >
                              <Link className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                              Enter URL
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 sm:p-8 border-2 border-dashed border-gray-300 rounded-md">
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Input
                                type="url"
                                placeholder="Enter image URL..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                className="flex-1 text-sm"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleUrlUpload()
                                  }
                                }}
                              />
                              <Button
                                onClick={handleUrlUpload}
                                disabled={isLoadingUrl || !imageUrl.trim()}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 text-sm"
                              >
                                {isLoadingUrl ? "Loading..." : "Upload"}
                              </Button>
                            </div>

                            <div className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleBackToUpload}
                                className="text-gray-600 bg-transparent text-xs sm:text-sm"
                              >
                                <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                                Upload File Instead
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-3 sm:space-y-4">
                      {/* Image Preview */}
                      <div className="relative rounded-md overflow-hidden bg-gray-100">
                        <Image
                          src={previewUrl! || "/placeholder.svg"}
                          alt="Selected reference image"
                          width={400}
                          height={300}
                          className="w-full h-32 sm:h-48 object-cover"
                        />
                      </div>

                      {/* File Info */}
                      <div className="text-xs sm:text-sm text-gray-600">
                        <p className="font-medium truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReUpload}
                          className="text-gray-600 hover:text-gray-800 bg-transparent text-xs"
                        >
                          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Re-upload</span>
                          <span className="sm:hidden">Re-up</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDelete}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 bg-transparent text-xs"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <p className="text-xs text-gray-500">Supported formats: JPG, PNG, GIF, WEBP. Max size: 5MB.</p>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>

            {/* Model Selector */}
            <div className="space-y-2" ref={dropdownRef}>
              <div className="relative">
                <Button
                  variant="outline"
                  className="w-full justify-between h-auto p-3 sm:p-4 bg-transparent hover:bg-gray-50 text-left"
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                >
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0 pr-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5">
                      <Image
                        src={currentModel.icon || "/placeholder.svg"}
                        alt={currentModel.name}
                        width={24}
                        height={24}
                        className={`w-full h-full object-contain ${
                          currentModel.id === "freepick" ? "bg-blue-500 rounded-full p-1" : ""
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[#4E5460] mb-1 text-sm sm:text-base">{currentModel.name}</div>
                      <div className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words whitespace-normal">
                        {currentModel.description}
                      </div>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0 transition-transform ${
                      showModelDropdown ? "rotate-180" : ""
                    }`}
                  />
                </Button>

                {showModelDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 sm:max-h-80 overflow-y-auto">
                    {models.map((model) => (
                      <div
                        key={model.id}
                        className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                          selectedModel === model.id ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => handleModelSelect(model.id)}
                      >
                        <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0 mt-0.5">
                          <Image
                            src={model.icon || "/placeholder.svg"}
                            alt={model.name}
                            width={24}
                            height={24}
                            className={`w-full h-full object-contain ${
                              model.id === "freepick" ? "bg-blue-500 rounded-full p-1" : ""
                            }`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="font-semibold text-[#4E5460] mb-1 text-sm sm:text-base">{model.name}</div>
                          <div className="text-xs sm:text-sm text-gray-600 leading-relaxed break-words whitespace-normal">
                            {model.description}
                          </div>
                        </div>
                        {selectedModel === model.id && (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Video Duration */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-[#4E5460] text-sm sm:text-base">Video Duration</h3>
                <span className="text-xs sm:text-sm text-gray-600">{videoDuration[0]} seconds</span>
              </div>

              <div className="space-y-2">
                <Slider
                  value={videoDuration}
                  onValueChange={setVideoDuration}
                  max={10}
                  min={5}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>5s</span>
                  <span>10s</span>
                </div>
              </div>
            </div>

            {/* Prompt Input with Enhance Button */}
            <div className="space-y-2">
              <div className="relative">
                <Textarea
                  placeholder="Describe the video you want to create in detail..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px] sm:min-h-[120px] resize-none pr-4 pb-10 sm:pb-12 text-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute bottom-2 left-2 h-6 sm:h-8 px-2 sm:px-3 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Enhance Prompt</span>
                  <span className="sm:hidden">Enhance</span>
                </Button>
              </div>
            </div>

            {/* Resolution Selector */}
            <div className="space-y-2">
              <Select value={resolution} onValueChange={setResolution}>
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resolutions.map((res) => (
                    <SelectItem key={res} value={res} className="text-sm">
                      {res}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generate Button */}
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5 sm:py-3 text-sm sm:text-base">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              Generate
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Aligned with left content area */}
      <div className="relative">
        {/* Content container with proper alignment */}
        <div className="pt-4 sm:pt-[72px] pb-4 sm:pb-6 px-4 sm:pr-6 h-full">
          <div className="h-full bg-gray-50 rounded-xl border border-[#E6E6E6] flex flex-col min-h-[300px] sm:min-h-0">
            {/* Header Section */}
            <div className="text-center p-4 sm:p-6 pb-3 sm:pb-4">
              <h2 className="text-xl sm:text-2xl font-bold text-[#4E5460] mb-3 sm:mb-4">AI Video Clips</h2>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                By describing imagined scenes or uploading reference images, you can obtain the desired video clip.
              </p>
            </div>

            {/* Video Section - Controlled Height */}
            <div className="flex-1 max-h-60 sm:max-h-80 px-4 sm:px-6 pb-4 sm:pb-6">
              <div className="h-full rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/images/characters/ondemand-marcus.png"
                  alt="On-demand Marcus Aurelius Video"
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function VideoGenerator() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VideoGeneratorContent />
    </Suspense>
  )
}
