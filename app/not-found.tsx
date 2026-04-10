"use client"

import { ErrorPage } from "@iblai/iblai-js/web-containers/next"

export default function NotFound() {
  return (
    <ErrorPage
      errorCode="404"
      customTitle="Page Not Found"
      customDescription="The page you're looking for doesn't exist or has been moved."
      showHomeButton
      homeButtonText="Back to Home"
      homeButtonHref="/ai-avatar/generate"
      showSupportButton={false}
    />
  )
}
