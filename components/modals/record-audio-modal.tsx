"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Mic } from "lucide-react"

interface RecordAudioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onRecordComplete: (audioData: any) => void
}

export function RecordAudioModal({ open, onOpenChange, onRecordComplete }: RecordAudioModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [activeTab, setActiveTab] = useState<"record" | "upload">("record")

  const handleRecord = () => {
    setIsRecording(!isRecording)
    // Recording logic would go here
  }

  const handleComplete = () => {
    // Process the recorded audio and pass it back
    onRecordComplete({ audio: "recorded_audio_data" })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        {/* Custom Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-600">Record Audio</h2>
        </div>

        <div className="space-y-6">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "record"
                  ? "text-blue-500 border-blue-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("record")}
            >
              Record Audio
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "upload"
                  ? "text-blue-500 border-blue-500"
                  : "text-gray-500 border-transparent hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("upload")}
            >
              Upload Audio
            </button>
          </div>

          {activeTab === "record" ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-8">Record an audio clip, and your avatar will lip-sync it.</p>

              <div className="flex flex-col items-center gap-6">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  onClick={handleRecord}
                  className={`w-20 h-20 rounded-full ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {isRecording ? (
                    <div className="w-6 h-6 bg-white rounded-sm" />
                  ) : (
                    <div className="w-6 h-6 bg-white rounded-full" />
                  )}
                </Button>

                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Mic className="w-4 h-4" />
                  Default - MacBook Microphone (Built-in)
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="w-12 h-12 mx-auto mb-4 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-full h-full">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7,10 12,15 17,10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">Drag and drop an audio file or click to browse</p>
                <Button variant="outline">Choose File</Button>
              </div>
              <p className="text-xs text-gray-500 mt-4">Supported formats: MP3, WAV, M4A. Max size: 25MB.</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="px-8">
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              className="px-8 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!isRecording && activeTab === "record"}
            >
              Use Audio
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
