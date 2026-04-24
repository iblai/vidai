"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Mic, Play, Pause, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { uploadHeygenAsset, cloneHeygenVoice } from "@/lib/heygen/rest"
import { createHeygenPrivateVoiceResource } from "@/lib/iblai/catalog"
import { resolveAppTenant } from "@/lib/iblai/tenant"

const LANGUAGE_TO_CODE: Record<string, string> = {
  English: "en",
  Spanish: "es",
}

export default function CreateVoicePage() {
  const router = useRouter()
  const [voiceName, setVoiceName] = useState("")
  const [language, setLanguage] = useState("English")
  const [accent, setAccent] = useState("Original")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

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
    if (files.length > 0 && files[0].type.startsWith("audio/")) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
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

  const handlePlayPause = () => {
    if (!audioRef.current || !previewUrl) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  const handleCreateVoice = async () => {
    if (!selectedFile || !voiceName.trim()) return

    setCreateError(null)
    setIsUploading(true)

    try {
      const asset = await uploadHeygenAsset(selectedFile)
      const { voice_clone_id: voiceId } = await cloneHeygenVoice({
        voice_name: voiceName.trim(),
        audio_asset_id: asset.id,
        language: LANGUAGE_TO_CODE[language],
      })
      const platform = resolveAppTenant()
      if (platform && voiceId) {
        try {
          await createHeygenPrivateVoiceResource(platform, voiceId, {
            name: voiceName.trim(),
            language: LANGUAGE_TO_CODE[language],
          })
        } catch (err) {
          console.warn("[voice-clone] catalog register failed:", err)
        }
      }
      router.back()
    } catch (err) {
      console.error("[voice-clone] create failed:", err)
      setCreateError((err as Error)?.message ?? "Failed to create voice")
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-[#4E5460]">Create New Voice</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
          {/* Left Panel */}
          <div className="space-y-4">
            {/* Voice Name */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-[#4E5460] mb-2">Voice Details</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Voice Name</label>
                    <Input
                      value={voiceName}
                      onChange={(e) => setVoiceName(e.target.value)}
                      placeholder="e.g., My Custom Voice"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Language</label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="English">English</SelectItem>
                          <SelectItem value="Spanish">Spanish</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">Accent</label>
                      <Select value={accent} onValueChange={setAccent}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Original">Original</SelectItem>
                          <SelectItem value="US">US</SelectItem>
                          <SelectItem value="UK">UK</SelectItem>
                          <SelectItem value="Australian">Australian</SelectItem>
                          <SelectItem value="Indian">Indian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Upload */}
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold text-[#4E5460] mb-2">Voice Sample</h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Upload an audio sample to clone the voice. For best results, use a clear recording of at least 30
                  seconds.
                </p>

                {!selectedFile ? (
                  <div
                    className={`p-8 text-center border-2 border-dashed rounded-md transition-colors cursor-pointer ${
                      isDragOver ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleUploadClick}
                  >
                    <div className="w-12 h-12 mx-auto mb-3 text-gray-400 flex items-center justify-center">
                      <Mic className="w-8 h-8" />
                    </div>
                    <p className="text-gray-600 mb-3 text-sm">Upload or Drag & Drop an audio file</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleUploadClick()
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Audio
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 rounded-full flex-shrink-0"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#4E5460] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null)
                          setPreviewUrl(null)
                          setIsPlaying(false)
                        }}
                        className="text-gray-500 hover:text-red-500"
                      >
                        Remove
                      </Button>
                    </div>
                    {previewUrl && (
                      <audio
                        ref={audioRef}
                        src={previewUrl}
                        onEnded={() => setIsPlaying(false)}
                        className="hidden"
                      />
                    )}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">Supported formats: MP3, WAV, M4A, FLAC. Max size: 20MB.</p>
              </CardContent>
            </Card>

            {/* Create Button */}
            <Button
              className="w-full bg-[#0376C1] hover:bg-[#056fb4] text-white py-3"
              disabled={!selectedFile || !voiceName.trim() || isUploading}
              onClick={handleCreateVoice}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Voice...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Create Voice
                </>
              )}
            </Button>

            {createError && (
              <p className="text-sm text-red-600">{createError}</p>
            )}
          </div>

          {/* Right Panel */}
          <div className="lg:pl-4 flex">
            <div className="bg-gray-50 rounded-xl border border-[#E6E6E6] p-6 w-full flex flex-col">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#4E5460] mb-2">Voice Cloning</h2>
                <p className="text-gray-600 text-sm">
                  Clone any voice by uploading an audio sample. The AI will learn the voice characteristics and allow
                  you to use it with your AI avatars.
                </p>
              </div>

              <div className="space-y-4 flex-1">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-[#4E5460] mb-2">Tips for best results</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-[#0376C1] mt-1">&#8226;</span>
                      Use a clear, high-quality recording without background noise
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0376C1] mt-1">&#8226;</span>
                      Record at least 30 seconds of natural speech
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0376C1] mt-1">&#8226;</span>
                      Speak at a normal pace with varied intonation
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#0376C1] mt-1">&#8226;</span>
                      Avoid music or other speakers in the background
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-[#4E5460] mb-2">Supported providers</h4>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">HeyGen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  )
}
