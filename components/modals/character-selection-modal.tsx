"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Pencil } from "lucide-react"

interface Character {
  id: string
  name: string
  image: string
  badge?: string
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

  const handleInteractiveChat = () => {
    if (character) {
      onClose() // Close the modal first
      router.push(`/ai-avatar/interactive/${character.id}`)
    }
  }

  if (!character) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 bg-white">
        {/* Header */}
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
              <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600">Create AI Avatar Video</h3>
              <p className="text-gray-600 text-sm">Quick and easy. Create video using your own script.</p>
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
    </Dialog>
  )
}
