"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil } from "lucide-react"
import { listHeygenInteractiveAvatars } from "@/lib/heygen/rest"

const HEYGEN_INTERACTIVE_SETUP_URL =
  "https://labs.heygen.com/interactive-avatar"

interface Character {
  id: string
  name: string
  image: string
  badge?: string
  default_voice_id?: string
}

interface CharacterSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  character: Character | null
  isMyCharacter?: boolean
  onCreateVideo: () => void
  onInteractiveChat?: () => void
  onNameUpdate?: (newName: string) => void
}

export default function CharacterSelectionModal({
  isOpen,
  onClose,
  character,
  isMyCharacter = false,
  onCreateVideo,
  onInteractiveChat,
  onNameUpdate,
}: CharacterSelectionModalProps) {
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState("")
  const router = useRouter()

  const handleEditName = () => {
    setEditedName(character?.name || "")
    setIsEditingName(true)
  }

  const handleSaveName = () => {
    if (editedName.trim() && onNameUpdate) {
      onNameUpdate(editedName.trim())
    }
    setIsEditingName(false)
  }

  const handleCancelEdit = () => {
    setIsEditingName(false)
    setEditedName("")
  }

  const [checkingInteractive, setCheckingInteractive] = useState(false)
  /** When true, the avatar isn't configured as interactive on HeyGen;
   *  we show a confirmation dialog before opening the external setup
   *  URL so the user can cancel. */
  const [showSetupPrompt, setShowSetupPrompt] = useState(false)

  const handleInteractiveChat = async () => {
    if (!character || checkingInteractive) return
    setCheckingInteractive(true)
    try {
      // Only avatars registered as interactive at HeyGen's side can be
      // driven by the streaming API. Anything else (static slug
      // characters, plain photo/digital-twin looks) must be configured
      // at labs.heygen.com/interactive-avatar first.
      const interactive = await listHeygenInteractiveAvatars()
      const isInteractive = interactive.some(
        (a) => a.status === "ACTIVE" && a.avatar_id === character.id,
      )
      if (isInteractive) {
        onClose()
        router.push(`/ai-avatar/interactive/${character.id}`)
      } else {
        setShowSetupPrompt(true)
      }
    } catch (err) {
      console.error("[character-selection] interactive check failed:", err)
      setShowSetupPrompt(true)
    } finally {
      setCheckingInteractive(false)
    }
  }

  const handleConfirmOpenSetup = () => {
    setShowSetupPrompt(false)
    onClose()
    window.open(HEYGEN_INTERACTIVE_SETUP_URL, "_blank", "noopener")
  }

  const handleCancelSetup = () => {
    setShowSetupPrompt(false)
  }

  if (!character) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-white">
        <DialogTitle className="sr-only">Select Character</DialogTitle>
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="text-xl font-semibold"
                  autoFocus
                />
                <Button size="sm" onClick={handleSaveName}>
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-600">{character.name}</h2>
                {isMyCharacter && (
                  <Button size="sm" variant="ghost" onClick={handleEditName} className="p-1 h-auto">
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Create Character Video */}
            <div
              className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors group"
              onClick={onCreateVideo}
            >
              <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                <img
                  src={character.image || "/placeholder.svg"}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">On Demand AI Avatar</h3>
              <p className="text-gray-600 text-sm">Create a video using your script</p>
            </div>

            {/* Interactive Character */}
            <div
              className="border rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors group relative"
              onClick={handleInteractiveChat}
            >
              <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                <img
                  src={character.image || "/placeholder.svg"}
                  alt={character.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold group-hover:text-blue-600">Interactive AI Avatar</h3>
              </div>
              <p className="text-gray-600 text-sm">Talk with your avatar</p>
            </div>
          </div>
        </div>
      </DialogContent>

      <Dialog open={showSetupPrompt} onOpenChange={setShowSetupPrompt}>
        <DialogContent className="max-w-md bg-white">
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Set up interactive avatar
          </DialogTitle>
          <p className="text-sm text-gray-600 mt-2">
            <strong>{character.name}</strong> isn't configured as an
            interactive avatar on HeyGen yet. Open labs.heygen.com to set
            it up?
          </p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCancelSetup}>
              Cancel
            </Button>
            <Button
              className="bg-blue-500 hover:bg-blue-600 text-white"
              onClick={handleConfirmOpenSetup}
            >
              Open HeyGen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
