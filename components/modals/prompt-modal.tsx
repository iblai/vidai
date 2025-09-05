"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface PromptModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (prompt: { title: string; category: string; description: string }) => void
  editPrompt?: {
    id: number
    title: string
    category: string
    description: string
  } | null
}

const categories = [
  "Instructional Designer",
  "AI Professors",
  "AI TAs",
  "Students",
  "AI University Roles",
  "Course Creators",
  "Other",
]

export default function PromptModal({ isOpen, onClose, onSave, editPrompt }: PromptModalProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (editPrompt) {
      setTitle(editPrompt.title)
      setCategory(editPrompt.category)
      setDescription(editPrompt.description)
    } else {
      setTitle("")
      setCategory("")
      setDescription("")
    }
  }, [editPrompt, isOpen])

  const handleSave = () => {
    if (title.trim() && category && description.trim()) {
      onSave({ title: title.trim(), category, description: description.trim() })
      onClose()
    }
  }

  const handleCancel = () => {
    setTitle("")
    setCategory("")
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-200">
          <DialogTitle className="text-xl font-bold text-gray-600">
            {editPrompt ? "Edit Prompt" : "Add New Prompt"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Title</label>
            <Input
              placeholder="Enter prompt title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Prompt Description Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Prompt Description</label>
            <Textarea
              placeholder="Enter the prompt description or instructions..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[200px] resize-none"
            />
            <p className="text-sm text-gray-500">Describe what this prompt does and how it should be used.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="px-6 text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="px-6 bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!title.trim() || !category || !description.trim()}
          >
            {editPrompt ? "Update Prompt" : "Add Prompt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
