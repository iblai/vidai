"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Check } from "lucide-react"

interface ShareModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agentId: string
  characterName: string
  avatarId?: string
}

export function ShareModal({ open, onOpenChange, agentId, characterName, avatarId }: ShareModalProps) {
  const [expireAfter, setExpireAfter] = useState("1 day")
  const [copied, setCopied] = useState(false)

  const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const shareUrl = avatarId
    ? `https://ibl-vidai.vercel.app/session/${avatarId}/${generateSessionId()}`
    : `https://ibl-vidai.vercel.app/session/${agentId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleDone = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-600">Talk to avatar link</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* URL Input with Copy Button */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 text-sm"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Expire After Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Expire after</label>
            <Select value={expireAfter} onValueChange={setExpireAfter}>
              <SelectTrigger className="w-full bg-gray-50 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 hour">1 hour</SelectItem>
                <SelectItem value="1 day">1 day</SelectItem>
                <SelectItem value="1 week">1 week</SelectItem>
                <SelectItem value="1 month">1 month</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Done Button */}
          <Button onClick={handleDone} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2.5">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
