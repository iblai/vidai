"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Play, Copy, Trash2, Plus } from "lucide-react"
import PromptModal from "@/components/modals/prompt-modal"

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

const initialPrompts = [
  // Instructional Designer
  {
    id: 1,
    category: "Instructional Designer",
    title: "Course Introduction Video",
    description:
      "Create a welcoming course introduction video featuring a professor in a modern classroom setting, explaining course objectives and expectations with engaging visual elements.",
  },
  {
    id: 2,
    category: "Instructional Designer",
    title: "Interactive Learning Module",
    description:
      "Design a video showing students actively participating in an interactive learning session with digital tools, collaborative activities, and real-time feedback mechanisms.",
  },
  {
    id: 3,
    category: "Instructional Designer",
    title: "Assessment Explanation Video",
    description:
      "Create a comprehensive video explaining different assessment methods, rubrics, and grading criteria with visual examples and clear demonstrations.",
  },
  {
    id: 4,
    category: "Instructional Designer",
    title: "Learning Objectives Presentation",
    description:
      "Generate a video presenting SMART learning objectives with visual aids, examples, and alignment with course outcomes and Bloom's taxonomy.",
  },

  // AI Professors
  {
    id: 5,
    category: "AI Professors",
    title: "Lecture Delivery Video",
    description:
      "Create a professional lecture video with an AI professor explaining complex concepts using visual aids, diagrams, and real-world examples in an academic setting.",
  },
  {
    id: 6,
    category: "AI Professors",
    title: "Research Methodology Explanation",
    description:
      "Generate a video showing research methods and techniques with step-by-step demonstrations, data analysis examples, and academic best practices.",
  },
  {
    id: 7,
    category: "AI Professors",
    title: "Exam Review Session",
    description:
      "Create an engaging exam review video covering key topics, sample questions, and study strategies with clear explanations and helpful tips.",
  },
  {
    id: 8,
    category: "AI Professors",
    title: "Academic Writing Workshop",
    description:
      "Design a video workshop on academic writing techniques, citation methods, and research paper structure with practical examples and exercises.",
  },

  // AI TAs
  {
    id: 9,
    category: "AI TAs",
    title: "Office Hours Session",
    description:
      "Create a video simulating office hours with a teaching assistant helping students with homework questions, clarifying concepts, and providing guidance.",
  },
  {
    id: 10,
    category: "AI TAs",
    title: "Lab Demonstration",
    description:
      "Generate a hands-on lab demonstration video showing experimental procedures, safety protocols, and data collection techniques with clear instructions.",
  },

  // Students
  {
    id: 11,
    category: "Students",
    title: "Study Group Session",
    description:
      "Create a video showing students collaborating in a study group, discussing course material, solving problems together, and sharing knowledge.",
  },
  {
    id: 12,
    category: "Students",
    title: "Presentation Skills Training",
    description:
      "Generate a video demonstrating effective presentation techniques, public speaking tips, and visual aid usage for student presentations.",
  },

  // AI University Roles
  {
    id: 13,
    category: "AI University Roles",
    title: "Academic Advisor Meeting",
    description:
      "Create a video showing an academic advisor meeting with students to discuss course selection, degree planning, and career guidance.",
  },
  {
    id: 14,
    category: "AI University Roles",
    title: "Campus Orientation Tour",
    description:
      "Generate a comprehensive campus tour video highlighting key facilities, resources, and services available to new students.",
  },

  // Course Creators
  {
    id: 15,
    category: "Course Creators",
    title: "Curriculum Development Process",
    description:
      "Create a video explaining the course development process, including needs assessment, learning design, and content creation strategies.",
  },
  {
    id: 16,
    category: "Course Creators",
    title: "Educational Technology Integration",
    description:
      "Generate a video demonstrating how to integrate various educational technologies and digital tools into course design and delivery.",
  },

  // Other
  {
    id: 17,
    category: "Other",
    title: "Campus Life Showcase",
    description:
      "Create an engaging video showcasing student life on campus, including dormitories, dining facilities, recreational activities, and social events.",
  },
  {
    id: 18,
    category: "Other",
    title: "University Marketing Video",
    description:
      "Generate a promotional video highlighting university achievements, faculty expertise, student success stories, and unique program offerings.",
  },
]

export default function PromptsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [prompts, setPrompts] = useState(initialPrompts)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<(typeof initialPrompts)[0] | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean
    promptId: number | null
    promptTitle: string
  }>({
    isOpen: false,
    promptId: null,
    promptTitle: "",
  })
  const router = useRouter()

  const filteredPrompts =
    selectedCategory === "All" ? prompts : prompts.filter((prompt) => prompt.category === selectedCategory)

  const handleUsePrompt = (promptDescription: string) => {
    // Redirect to videos/generate with the prompt pre-filled
    const encodedPrompt = encodeURIComponent(promptDescription)
    router.push(`/videos/generate?prompt=${encodedPrompt}`)
  }

  const handleAddPrompt = () => {
    setEditingPrompt(null)
    setIsModalOpen(true)
  }

  const handleEditPrompt = (prompt: (typeof initialPrompts)[0]) => {
    setEditingPrompt(prompt)
    setIsModalOpen(true)
  }

  const handleSavePrompt = (promptData: { title: string; category: string; description: string }) => {
    if (editingPrompt) {
      setPrompts(prompts.map((p) => (p.id === editingPrompt.id ? { ...p, ...promptData } : p)))
    } else {
      const newPrompt = {
        id: Math.max(...prompts.map((p) => p.id)) + 1,
        ...promptData,
      }
      setPrompts([...prompts, newPrompt])
    }
  }

  const handleDeletePrompt = (promptId: number, promptTitle: string) => {
    setDeleteConfirmation({
      isOpen: true,
      promptId,
      promptTitle,
    })
  }

  const confirmDelete = () => {
    if (deleteConfirmation.promptId) {
      setPrompts(prompts.filter((p) => p.id !== deleteConfirmation.promptId))
    }
    setDeleteConfirmation({ isOpen: false, promptId: null, promptTitle: "" })
  }

  const cancelDelete = () => {
    setDeleteConfirmation({ isOpen: false, promptId: null, promptTitle: "" })
  }

  const groupedPrompts = filteredPrompts.reduce(
    (acc, prompt) => {
      if (!acc[prompt.category]) {
        acc[prompt.category] = []
      }
      acc[prompt.category].push(prompt)
      return acc
    },
    {} as Record<string, typeof initialPrompts>,
  )

  const handleCopyPrompt = (promptDescription: string) => {
    navigator.clipboard.writeText(promptDescription)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-600">Prompt Gallery</h1>
        <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleAddPrompt}>
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
        {selectedCategory === "All" ? (
          // Show all categories with sections
          Object.entries(groupedPrompts).map(([category, categoryPrompts]) => (
            <div key={category} className="space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryPrompts.map((prompt) => (
                  <Card
                    key={prompt.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow"
                    style={{ backgroundColor: "#F5F8FF" }}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-600">{prompt.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-3">{prompt.description}</p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 sm:gap-2 pt-2 flex-wrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-600 text-xs sm:text-sm"
                            onClick={() => handleEditPrompt(prompt)}
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
                          >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          // Show only selected category
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="border border-gray-200 hover:shadow-md transition-shadow"
                style={{ backgroundColor: "#F5F8FF" }}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-600">{prompt.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{prompt.description}</p>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 sm:gap-2 pt-2 flex-wrap">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-600 text-xs sm:text-sm"
                        onClick={() => handleEditPrompt(prompt)}
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
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <PromptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
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
