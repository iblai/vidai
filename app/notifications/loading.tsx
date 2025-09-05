import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function NotificationsLoading() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filter Tabs Skeleton */}
      <div className="flex gap-2 mb-6">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Notifications List Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
