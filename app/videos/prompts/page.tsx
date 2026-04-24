"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Play, Copy, Trash2, Plus, Loader2 } from "lucide-react"
import PromptModal from "@/components/modals/prompt-modal"
import {
  createVideoPromptResource,
  deleteCatalogResource,
  listVideoPromptResources,
  type VideoPromptResource,
} from "@/lib/iblai/catalog"
import { resolveAppTenant } from "@/lib/iblai/tenant"

const categories = [
  "All",
  "Instructional Designer",
  "AI Professors",
  "AI TAs",
  "Students",
  "AI University Roles",
  "Course Creators",
  "Other",
]

interface Prompt {
  id: number
  title: string
  category: string
  description: string
}

function toPrompt(r: VideoPromptResource): Prompt {
  return {
    id: r.id,
    title: r.data.title || r.name,
    category: r.data.category || "Other",
    description: r.data.description || r.description,
  }
}

export default function PromptsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null)
  const [mutating, setMutating] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    promptId: number | null
    promptTitle: string
  }>({
    isOpen: false,
    promptId: null,
    promptTitle: "",
  })

  const loadPrompts = useCallback(async () => {
    const platform = resolveAppTenant()
    if (!platform) {
      setPrompts([])
      setLoading(false)
      return
    }
    setError(null)
    try {
      const resources = await listVideoPromptResources(platform)
      setPrompts(resources.map(toPrompt))
    } catch (err) {
      console.error("[prompts] load failed:", err)
      setError((err as Error)?.message ?? "Failed to load prompts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPrompts()
  }, [loadPrompts])

  const filteredPrompts =
    selectedCategory === "All" ? prompts : prompts.filter((p) => p.category === selectedCategory)

  const handleUsePrompt = (description: string) => {
    router.push(`/videos/generate?prompt=${encodeURIComponent(description)}`)
  }

  const handleAddPrompt = () => {
    setEditingPrompt(null)
    setIsModalOpen(true)
  }

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt)
    setIsModalOpen(true)
  }

  const handleSavePrompt = async (data: { title: string; category: string; description: string }) => {
    const platform = resolveAppTenant()
    if (!platform) {
      setError("No tenant resolved — please sign in again.")
      return
    }
    setMutating(true)
    setError(null)
    try {
      // Update = delete + recreate; the catalog has no update endpoint.
      if (editingPrompt) {
        await deleteCatalogResource(editingPrompt.id, { platform, resource_type: "video_prompt" })
      }
      await createVideoPromptResource(platform, data)
      await loadPrompts()
      setIsModalOpen(false)
      setEditingPrompt(null)
    } catch (err) {
      console.error("[prompts] save failed:", err)
      setError((err as Error)?.message ?? "Failed to save prompt")
    } finally {
      setMutating(false)
    }
  }

  const handleDeletePrompt = (id: number, title: string) => {
    setDeleteConfirmation({ isOpen: true, promptId: id, promptTitle: title })
  }

  const confirmDelete = async () => {
    const id = deleteConfirmation.promptId
    setDeleteConfirmation({ isOpen: false, promptId: null, promptTitle: "" })
    if (!id) return
    const platform = resolveAppTenant()
    if (!platform) {
      setError("No tenant resolved — please sign in again.")
      return
    }
    setMutating(true)
    setError(null)
    try {
      await deleteCatalogResource(id, { platform, resource_type: "video_prompt" })
      await loadPrompts()
    } catch (err) {
      console.error("[prompts] delete failed:", err)
      setError((err as Error)?.message ?? "Failed to delete prompt")
    } finally {
      setMutating(false)
    }
  }

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, promptId: null, promptTitle: "" })
  }

  const handleCopyPrompt = (description: string) => {
    navigator.clipboard.writeText(description)
  }

  const groupedPrompts = filteredPrompts.reduce(
    (acc, prompt) => {
      if (!acc[prompt.category]) acc[prompt.category] = []
      acc[prompt.category].push(prompt)
      return acc
    },
    {} as Record<string, Prompt[]>,
  )

  const renderCard = (prompt: Prompt) => (
    <Card
      key={prompt.id}
      className="border border-gray-200 hover:shadow-md transition-shadow h-full flex flex-col"
      style={{ backgroundColor: "#F5F8FF" }}
    >
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex flex-col flex-1 gap-3">
          <h3 className="text-lg font-semibold text-gray-700 line-clamp-1">{prompt.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-3 min-h-[3.75rem] pl-3 border-l-2 border-[#D0E0FF]">
            {prompt.description}
          </p>
          <div className="mt-auto flex items-center justify-between gap-1 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-600 text-xs sm:text-sm"
              onClick={() => handleEditPrompt(prompt)}
              disabled={mutating}
            >
              <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
              onClick={() => handleUsePrompt(prompt.description)}
            >
              <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Use
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-600 text-xs sm:text-sm"
              onClick={() => handleCopyPrompt(prompt.description)}
            >
              <Copy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 text-xs sm:text-sm"
              onClick={() => handleDeletePrompt(prompt.id, prompt.title)}
              disabled={mutating}
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-600">Prompt Gallery</h1>
        <Button
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleAddPrompt}
          disabled={mutating}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Prompt
        </Button>
      </div>

      {/* Category Tabs */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              className={`whitespace-nowrap text-sm sm:text-base ${
                selectedCategory === category
                  ? "bg-blue-500 text-white hover:bg-blue-600"
                  : "text-gray-600 hover:text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
        {error && (
          <div className="p-3 rounded border border-red-200 bg-red-50 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading prompts…
          </div>
        ) : filteredPrompts.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No prompts yet. Click "Add Prompt" to create one.
          </div>
        ) : selectedCategory === "All" ? (
          Object.entries(groupedPrompts).map(([category, categoryPrompts]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPrompts.map(renderCard)}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map(renderCard)}
          </div>
        )}
      </div>

      <PromptModal
        isOpen={isModalOpen}
        onClose={() => {
          if (mutating) return
          setIsModalOpen(false)
          setEditingPrompt(null)
        }}
        onSave={handleSavePrompt}
        editPrompt={editingPrompt}
      />

      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-4">Delete Prompt</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirmation.promptTitle}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={cancelDelete}
                className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                Cancel
              </Button>
              <Button onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
