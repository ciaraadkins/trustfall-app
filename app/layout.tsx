import type React from "react"
import type { Metadata } from "next"
import { Space_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { GameProvider } from "@/contexts/game-context"
import NavbarWrapper from "@/components/navbar-wrapper"

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-space-mono",
})

export const metadata: Metadata = {
  title: "TRUSTFALL - Humans vs. AI",
  description: "A modern console-inspired game of trust and strategy",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${spaceMono.variable} font-mono`}>
        <AuthProvider>
          <GameProvider>
            <NavbarWrapper />
            {children}
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  )
}



import './globals.css'