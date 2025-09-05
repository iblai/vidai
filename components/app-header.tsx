"use client"

import { ChevronRight, ChevronDown, Bell, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useSidebar } from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function AppHeader() {
  const { toggleSidebar, state, isMobile, openMobile } = useSidebar()

  const handleToggleClick = () => {
    console.log("[v0] Toggle button clicked - isMobile:", isMobile, "state:", state, "openMobile:", openMobile)
    toggleSidebar()
  }

  const notificationCount = 2

  const notifications = [
    {
      id: 1,
      message: "Your video generation is complete",
      time: "2 minutes ago",
      read: false,
    },
    {
      id: 2,
      message: "New character avatar available",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "System maintenance scheduled",
      time: "3 hours ago",
      read: true,
    },
  ]

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    // Handle mark all as read functionality
    console.log("Mark all notifications as read")
  }

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-vidgen-stroke bg-white px-6">
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleClick}
          className="h-8 w-8 bg-white border border-gray-200 rounded-md hover:bg-gray-50 focus:ring-0 focus:ring-offset-0 transition-colors"
        >
          <ChevronRight className="h-4 w-4 text-gray-600" />
        </Button>
      )}

      <div className="flex-1">{/* Header content can be added here in the future */}</div>

      <div className="flex items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 hover:bg-vidgen-accent rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount}
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="px-4 py-3">
              <p className="text-sm font-bold text-vidgen-text">Notifications</p>
            </div>
            <DropdownMenuSeparator />
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="cursor-pointer px-4 py-3 focus:bg-gray-50">
                  <div className="flex items-start gap-3 w-full">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        notification.read ? "bg-gray-300" : "bg-vidgen-primary",
                      )}
                    />
                    <div className="flex-1">
                      <p
                        className={cn("text-sm", notification.read ? "text-gray-500" : "text-vidgen-text font-medium")}
                      >
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <div className="px-4 py-2">
              <button
                onClick={markAllAsRead}
                className="text-sm text-vidgen-primary hover:text-vidgen-primary font-medium w-full text-center py-1"
              >
                Mark all as read
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/images/user-profile.png" alt="Profile" className="rounded-full object-cover" />
                <AvatarFallback className="bg-vidgen-gradient text-white rounded-full text-xs">MA</AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuItem className="cursor-pointer py-4">
              <User className="mr-3 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer py-4">
              <LogOut className="mr-3 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
