"use client"

import Link from "next/link"
import { PlayCircle, Terminal } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { placeholderScores } from "@/data/placeholder-scores"

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] text-[#33FF33] relative overflow-hidden">
      {/* Subtle tech pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

      {/* Scan lines effect */}
      <div className="absolute inset-0 bg-scanline pointer-events-none"></div>

      <div className="z-10 w-full max-w-4xl flex flex-col items-center px-4">
        <div className="flex items-center gap-3 mb-4">
          <Terminal className="w-12 h-12" />
          <h1 className="text-6xl font-mono font-bold tracking-tight glow-text">TRUSTFALL</h1>
        </div>

        <h2 className="text-2xl font-mono text-[#00FFFF] mb-10">HUMANS VS. AI v1.0</h2>

        {/* Global Score - More Prominent and Central at Top with Animation */}
        <div className="w-full flex justify-between items-center mb-12">
          <div className="text-center flex-1 p-8 rounded-xl transition-all duration-300 hover:bg-[#33FF33]/5">
            <div className="text-2xl mb-3 font-mono text-[#33FF33]/90">HUMANS</div>
            <div className="text-7xl text-[#33FF33] font-bold font-mono glow-text animate-pulse-subtle">{placeholderScores.humanScore.toLocaleString()}</div>
          </div>
          <div className="h-32 w-px bg-[#33FF33]/30 mx-4"></div>
          <div className="text-center flex-1 p-8 rounded-xl transition-all duration-300 hover:bg-[#FF5555]/5">
            <div className="text-2xl mb-3 font-mono text-[#FF5555]/90">AI</div>
            <div className="text-7xl text-[#FF5555] font-bold font-mono glow-text animate-pulse-subtle">{placeholderScores.aiScore.toLocaleString()}</div>
          </div>
        </div>

        <p className="text-center font-mono text-[#ccc] mb-8 max-w-2xl">
          Can you outsmart AI in a game of trust and strategy? Make the right decisions, contribute to the global human score, and help us understand the dynamics of human-AI cooperation.
        </p>

        <Link
          href="/select"
          className="inline-flex items-center gap-3 bg-[#33FF33]/20 hover:bg-[#33FF33]/30 border-2 border-[#33FF33] rounded-lg px-10 py-5 font-mono text-[#33FF33] text-2xl transition-all duration-200 hover:glow-text animate-pulse-subtle"
        >
          <PlayCircle className="w-8 h-8" />
          PLAY NOW
        </Link>

        {!user && (
          <Link
            href="/auth"
            className="font-mono text-[#00FFFF] hover:text-[#00FFFF]/80 mt-4 text-sm"
          >
            LOGIN / SIGNUP TO TRACK YOUR PROGRESS
          </Link>
        )}
      </div>

      <footer className="absolute bottom-4 text-xs font-mono text-[#33FF33]/70">v1.0.0 © MOONBIRD AI</footer>
    </main>
  )
}
