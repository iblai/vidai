"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  const isAuthPage = pathname === "/login" || pathname === "/"

  if (isAuthPage) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <div className="flex h-screen w-full">
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto bg-white">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}
