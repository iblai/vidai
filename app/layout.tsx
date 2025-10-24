import type React from "react"
import type { Metadata } from "next"

import "./globals.css"
import { ConditionalLayout } from "@/components/conditional-layout"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"

import { Source_Serif_4 as V0_Font_Source_Serif_4 } from "next/font/google"

const _sourceSerif_4 = V0_Font_Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--v0-font-source-serif-4",
})

const _v0_fontVariables = `${_sourceSerif_4.variable}`

export const metadata: Metadata = {
  title: "vidAI",
  description: "AI-powered video generation platform",
    generator: 'v0.app'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className + " " + _v0_fontVariables}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  )
}
