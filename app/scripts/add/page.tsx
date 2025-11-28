"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sparkles, Play, Pause, Clock3, Upload, LinkIcon, ChevronRight, Mic, FileText } from 'lucide-react'

type TabKey = "text" | "audio" | "files"

export default function AddScriptPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("text")
  const [script, setScript] = useState("")
  const [speed, setSpeed] = useState<number[]>([1])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  // AI Help dialog
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState(
    "Photosynthesis for Grade 7 biology class (10-minute explanation with examples)"
  )

  const charLimit = 3875
  const charCount = script.length
  const remaining = useMemo(() => Math.max(0, charLimit - charCount), [charCount])

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Speech Synthesis
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null

  useEffect(() => {
    return () => {
      // cleanup speech on unmount
      if (synth && synth.speaking) synth.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePlayPause = () => {
    if (!synth) return
    if (!script.trim()) {
      alert("Please type or generate a script first.")
      return
    }

    if (isPlaying) {
      synth.pause()
      setIsPlaying(false)
      return
    }

    // Resume if paused
    if (synth.paused) {
      synth.resume()
      setIsPlaying(true)
      return
    }

    // Fresh start
    const utterance = new SpeechSynthesisUtterance(script)
    utterance.rate = speed[0] || 1
    utterance.onend = () => {
      setIsPlaying(false)
      utteranceRef.current = null
    }
    utterance.onerror = () => {
      setIsPlaying(false)
      utteranceRef.current = null
    }
    utteranceRef.current = utterance
    synth.speak(utterance)
    setIsPlaying(true)
  }

  const handleSpeedChange = (val: number[]) => {
    setSpeed(val)
    // If speaking and we change speed, restart at new rate
    if (synth && synth.speaking && utteranceRef.current) {
      const currentText = script
      synth.cancel()
      const u = new SpeechSynthesisUtterance(currentText)
      u.rate = val[0] || 1
      u.onend = () => {
        setIsPlaying(false)
        utteranceRef.current = null
      }
      u.onerror = () => {
        setIsPlaying(false)
        utteranceRef.current = null
      }
      utteranceRef.current = u
      synth.speak(u)
      setIsPlaying(true)
    }
  }

  const handleUploadClick = () => fileInputRef.current?.click()

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleGenerateFromAI = () => {
    const topic = aiPrompt?.trim() || "General Lesson"
    const generated = generateLessonScript(topic)
    setScript(generated)
    setAiOpen(false)
  }

  return (
    <div className="min-h-full bg-white">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-[#4E5460]">Create Script</h1>
      </div>

      <div className="px-6 pb-6 grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_520px] gap-6">
        {/* Left Column */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            {/* Tabs */}
            <div className="px-5 pt-5">
              <div className="flex items-center gap-10 border-b border-gray-200">
                <TabButton label="Text" active={activeTab === "text"} onClick={() => setActiveTab("text")} />
                <TabButton label="Audio" active={activeTab === "audio"} onClick={() => setActiveTab("audio")} />
                <TabButton label="Files" active={activeTab === "files"} onClick={() => setActiveTab("files")} />
              </div>
            </div>

            {/* Content */}
            <div className="px-5 pt-4">
              {activeTab === "text" && (
                <div className="relative">
                  {/* Textarea with extra padding to prevent overlap with embedded controls */}
                  <div className="relative">
                    <Textarea
                      placeholder="Type your script"
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="min-h-[500px] resize-none pr-40 pb-20 rounded-t-md rounded-b-none border border-gray-300"
                    />

                    {/* Bottom-right: AI Help button INSIDE textarea */}
                    <div className="absolute bottom-2 right-2">
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setAiOpen(true)}
                        className="bg-[#E6EDFC] text-[#0376C1] hover:bg-[#d9e6fb]"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        AI Help
                      </Button>
                    </div>
                  </div>

                  {/* Play bar attached flush to textarea bottom */}
                  <div className="-mt-px flex items-center justify-between rounded-b-md border border-gray-300 bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={isPlaying ? "Pause" : "Play"}
                        className="h-8 w-8 rounded-full"
                        onClick={handlePlayPause}
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                    {/* Character counter moved here, with clock icon */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Clock3 className="w-4 h-4" />
                      <span>{`${charCount.toLocaleString()}/${charLimit.toLocaleString()} AI avatars`}</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "audio" && (
                <div className="space-y-3">
                  <Dropzone
                    icon={<Mic className="w-6 h-6 text-gray-400" />}
                    title="Drag & drop an audio, paste from clipboard, or upload a file"
                    isDragOver={isDragOver}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onUploadClick={handleUploadClick}
                  />
                  <p className="text-xs text-gray-500">Supported formats: MP3, WAV. Max size: 20MB.</p>
                </div>
              )}

              {activeTab === "files" && (
                <div className="space-y-3">
                  <Dropzone
                    icon={<FileText className="w-6 h-6 text-gray-400" />}
                    title="Drag & drop an lesson, presentations, paste from clipboard, or upload a file"
                    isDragOver={isDragOver}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onUploadClick={handleUploadClick}
                  />
                  <p className="text-xs text-gray-500">Supported formats: DOCX, PPTX, TXT, PDF. Max size: 20MB.</p>
                </div>
              )}

              {/* Hidden input for uploads */}
              <input ref={fileInputRef} type="file" className="hidden" />

              {/* Voice row */}
              <div className="mt-4">
                <button className="w-full rounded-md border border-[#E6EDFC] bg-[#E6EDFC] text-[#4E5460] px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium">Aa</span>
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Emma</div>
                      <div className="text-xs text-gray-500">English (United States)</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Speed row aligned */}
              <div className="mt-4 mb-5 flex items-center gap-4">
                <div className="text-sm text-gray-600 shrink-0">{`Speed(${(speed[0] || 1).toFixed(1)}x)`}</div>
                <div className="flex-1">
                  <Slider value={speed} onValueChange={handleSpeedChange} min={0.5} max={2} step={0.1} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column (fixed width) */}
        <Card className="border border-gray-200 shadow-sm self-start">
          <CardContent className="p-0">
            <div className="p-6">
              <h2 className="text-lg font-bold text-[#4E5460] text-center">AI Script</h2>
              <p className="mt-2 text-center text-gray-600">
                By describing imagined text or audio reference, you can obtain the desired script.
              </p>

              <div className="mt-6">
                <div className="h-64 rounded-lg border border-gray-200 bg-gray-50 shadow-sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Help Dialog */}
      <Dialog open={aiOpen} onOpenChange={setAiOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-[#4E5460]">AI Help</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <label className="text-sm text-gray-600">Describe the lesson or topic</label>
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g., Introduction to fractions for Grade 4 with real-life examples"
              className="min-h-[120px] resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAiOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateFromAI} className="bg-[#0376C1] hover:bg-[#056fb4] text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative -mb-px pb-3 pt-2 text-sm font-medium transition-colors ${
        active ? "text-[#0376C1]" : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
      <span className={`absolute bottom-0 left-0 h-0.5 w-full rounded ${active ? "bg-[#0376C1]" : "bg-transparent"}`} />
    </button>
  )
}

function Dropzone({
  icon,
  title,
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onUploadClick,
}: {
  icon: React.ReactNode
  title: string
  isDragOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onUploadClick: () => void
}) {
  return (
    <div
      className={`rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
        isDragOver ? "border-[#0376C1] bg-blue-50" : "border-gray-300"
      }`}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      role="button"
      tabIndex={0}
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400">
        {icon}
      </div>
      <p className="text-gray-600 mb-4">{title}</p>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onUploadClick()
          }}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload File
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <LinkIcon className="w-4 h-4 mr-2" />
          Enter URL
        </Button>
      </div>
    </div>
  )
}

function generateLessonScript(topic: string) {
  return `Lesson Plan: ${topic}

Objective:
- Students will understand key concepts and be able to explain them in their own words.
- Students will apply the concept through a short practice activity.

Warm‑Up (2 min):
- Quick question: What do you already know about ${topic.toLowerCase()}?
- Show one real‑life example and let 2–3 students share.

Direct Instruction (3 min):
- Definition: Provide a clear, student‑friendly definition.
- Key idea #1
- Key idea #2
- Visual/Diagram: Draw or display a simple visual to anchor the concept.

Guided Practice (3 min):
- Work through 2 short examples together as a class.
- Ask checking‑for‑understanding questions after each step.

Independent Practice (4 min):
- Students complete 3 quick problems or a short prompt in pairs.
- Teacher circulates, gives feedback, and selects 1–2 examples to share.

Formative Check (2 min):
- Exit ticket: “In one sentence, explain ${topic.toLowerCase()} and give a real‑world example.”

Extension/Differentiation:
- Early finishers: Create your own example and swap with a partner to solve.
- Support: Provide a scaffolded example with hints.

Homework (optional):
- Watch a 3‑minute video or read a short paragraph about ${topic.toLowerCase()} and bring one question to class.

Teacher Notes:
- Emphasize clarity, concrete examples, and frequent checks for understanding.
- Keep transitions tight to maintain lesson momentum.`
}
