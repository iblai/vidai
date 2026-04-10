"use client"

import { useMemo } from "react"
import { NotificationDisplay } from "@iblai/iblai-js/web-containers"
import { resolveAppTenant } from "@/lib/iblai/tenant"

export default function NotificationsPage() {
  const tenantKey = useMemo(() => resolveAppTenant(), [])

  const userId = useMemo(() => {
    if (typeof window === "undefined") return ""
    try {
      const raw = localStorage.getItem("userData")
      return raw ? JSON.parse(raw).user_nicename ?? "" : ""
    } catch {
      return ""
    }
  }, [])

  const isAdmin = useMemo(() => {
    if (typeof window === "undefined" || !tenantKey) return false
    try {
      const raw = localStorage.getItem("tenants")
      if (!raw) return false
      const tenants = JSON.parse(raw)
      const match = tenants.find((t: any) => t.key === tenantKey)
      return !!match?.is_admin
    } catch {
      return false
    }
  }, [tenantKey])

  if (!tenantKey || !userId) return null

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Notifications</h1>
      <NotificationDisplay
        org={tenantKey}
        userId={userId}
        isAdmin={isAdmin}
      />
    </div>
  )
}
