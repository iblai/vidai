"use client"

import { ClientErrorPage } from "@iblai/iblai-js/web-containers/next"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ClientErrorPage
      errorCode="500"
      header="Something went wrong"
      message={error.message}
      handleError={reset}
      showHomeButton
    />
  )
}
