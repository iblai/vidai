"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X } from "lucide-react"

interface DesignAIModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGeneratePreview: (data: AvatarData) => void
}

interface AvatarData {
  name: string
  age: string
  gender: string
  ethnicity: string
  description: string
  orientation: string
  pose: string
  style: string
}

export function DesignAIModal({ open, onOpenChange, onGeneratePreview }: DesignAIModalProps) {
  const [formData, setFormData] = useState<AvatarData>({
    name: "",
    age: "Young Adult",
    gender: "",
    ethnicity: "Unspecified",
    description: "",
    orientation: "Portrait",
    pose: "Upper Body",
    style: "Unspecified",
  })

  const handleSubmit = () => {
    onGeneratePreview(formData)
    onOpenChange(false)
  }

  const orientationOptions = [
    { value: "Landscape", label: "Landscape" },
    { value: "Portrait", label: "Portrait" },
    { value: "Square", label: "Square" },
  ]

  const poseOptions = [
    { value: "Full Body", label: "Full Body" },
    { value: "Upper Body", label: "Upper Body" },
    { value: "Face", label: "Face" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-gray-600">Describe your avatar's look</DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="h-6 w-6 rounded-sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-600">Basics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="What do you want to name your avatar?"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Age <span className="text-red-500">*</span>
                </label>
                <Select value={formData.age} onValueChange={(value) => setFormData({ ...formData, age: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Child">Child</SelectItem>
                    <SelectItem value="Teen">Teen</SelectItem>
                    <SelectItem value="Young Adult">Young Adult</SelectItem>
                    <SelectItem value="Adult">Adult</SelectItem>
                    <SelectItem value="Senior">Senior</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Non-binary">Non-binary</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Ethnicity</label>
                <Select
                  value={formData.ethnicity}
                  onValueChange={(value) => setFormData({ ...formData, ethnicity: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unspecified">Unspecified</SelectItem>
                    <SelectItem value="Asian">Asian</SelectItem>
                    <SelectItem value="Black">Black</SelectItem>
                    <SelectItem value="Hispanic">Hispanic</SelectItem>
                    <SelectItem value="White">White</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Appearance Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-600">Appearance</h3>
              <Button variant="link" className="text-purple-600 p-0 h-auto">
                Try a sample
              </Button>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Describe your avatar</label>
              <Textarea
                placeholder="Describe the appearance, clothing, and style of your avatar..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>

          {/* Orientation Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-600">Orientation</h3>
            <div className="flex gap-2">
              {orientationOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={formData.orientation === option.value ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, orientation: option.value })}
                  className={formData.orientation === option.value ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Pose Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-600">Pose</h3>
            <div className="flex gap-2">
              {poseOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={formData.pose === option.value ? "default" : "outline"}
                  onClick={() => setFormData({ ...formData, pose: option.value })}
                  className={formData.pose === option.value ? "bg-purple-600 hover:bg-purple-700" : ""}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Style Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-600">Style</h3>
            <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Unspecified">Unspecified</SelectItem>
                <SelectItem value="Realistic">Realistic</SelectItem>
                <SelectItem value="Artistic">Artistic</SelectItem>
                <SelectItem value="Cartoon">Cartoon</SelectItem>
                <SelectItem value="Professional">Professional</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => onOpenChange(false)} className="px-8">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.gender}
              className="px-8 bg-purple-500 hover:bg-purple-600"
            >
              Generate Preview
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
