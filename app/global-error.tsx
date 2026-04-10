"use client"

import { ClientErrorPage } from "@iblai/iblai-js/web-containers/next"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <ClientErrorPage
          errorCode="500"
          header="Something went wrong"
          message={error.message}
          handleError={reset}
          showHomeButton
        />
      </body>
    </html>
  )
}
