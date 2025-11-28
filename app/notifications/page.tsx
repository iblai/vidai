"use client"

import { useState } from "react"
import { Bell, Check, CheckCheck, Clock, Video, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Notification {
  id: string
  type: "character_video" | "video_clip"
  title: string
  message: string
  timestamp: Date
  isRead: boolean
  characterName?: string
  videoTitle?: string
}

// Sample notification data
const sampleNotifications: Notification[] = [
  {
    id: "1",
    type: "character_video",
    title: "AI Avatar Video Completed",
    message: "Your AI avatar video with Mikel (Professional) has been successfully generated and is ready to view.",
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    isRead: false,
    characterName: "Mikel (Professional)",
    videoTitle: "Business Presentation Training",
  },
  {
    id: "2",
    type: "video_clip",
    title: "Video Clip Generated",
    message: "Your video clip 'Marketing Strategy Fundamentals' has been created using Runway AI.",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false,
    videoTitle: "Marketing Strategy Fundamentals",
  },
  {
    id: "3",
    type: "character_video",
    title: "AI Avatar Video Completed",
    message: "Your AI avatar video with Georgia has been successfully generated and is ready to view.",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: true,
    characterName: "Georgia",
    videoTitle: "Patient Care Training",
  },
  {
    id: "4",
    type: "video_clip",
    title: "Video Clip Generated",
    message: "Your video clip 'Chemistry Lab Safety' has been created using Sora AI.",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: true,
    videoTitle: "Chemistry Lab Safety",
  },
  {
    id: "5",
    type: "character_video",
    title: "AI Avatar Video Completed",
    message: "Your AI avatar video with Armando has been successfully generated and is ready to view.",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    isRead: true,
    characterName: "Armando",
    videoTitle: "Calculus Fundamentals",
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const filteredNotifications = filter === "unread" ? notifications.filter((n) => !n.isRead) : notifications

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  const getNotificationIcon = (type: string) => {
    return type === "character_video" ? Users : Video
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bell className="h-6 w-6 text-gray-600" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllAsRead}
            className="text-gray-600 hover:text-gray-900 bg-transparent"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full",
            filter === "all" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-600 hover:text-gray-900",
          )}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === "unread" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("unread")}
          className={cn(
            "rounded-full",
            filter === "unread" ? "bg-blue-600 hover:bg-blue-700 text-white" : "text-gray-600 hover:text-gray-900",
          )}
        >
          Unread ({unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent className="pt-6">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {filter === "unread" ? "No unread notifications" : "No notifications"}
              </h3>
              <p className="text-gray-600">
                {filter === "unread"
                  ? "You're all caught up! Check back later for new updates."
                  : "You'll see notifications about your AI avatar videos and video clips here."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => {
            const IconComponent = getNotificationIcon(notification.type)

            return (
              <Card
                key={notification.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md",
                  !notification.isRead && "bg-blue-50 border-blue-200",
                )}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                        notification.type === "character_video"
                          ? "bg-green-100 text-green-600"
                          : "bg-purple-100 text-purple-600",
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 truncate">{notification.title}</h3>
                        {!notification.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />}
                      </div>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{notification.message}</p>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(notification.timestamp)}
                        </div>

                        {notification.characterName && (
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {notification.characterName}
                          </div>
                        )}

                        {notification.videoTitle && (
                          <div className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {notification.videoTitle}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Read Status */}
                    <div className="flex-shrink-0">
                      {notification.isRead ? (
                        <CheckCheck className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                        >
                          <Check className="h-4 w-4 text-blue-600" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
