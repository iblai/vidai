import type React from "react";
import type { Metadata } from "next";

import "./globals.css";
import { ConditionalLayout } from "@/components/conditional-layout"
import { Source_Serif_4 } from "next/font/google";

// Google font loaders MUST be assigned to a const at module scope
const sourceSerif = Source_Serif_4({
  weight: ["200","300","400","500","600","700","800","900"],
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const metadata: Metadata = {
  title: "vidAI",
  description: "AI-powered video generation platform",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
