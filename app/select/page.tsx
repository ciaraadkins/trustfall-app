"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LogOut } from "lucide-react"
import { AUTH_ENABLED, useAuth } from "@/contexts/auth-context"
import { useGame } from "@/contexts/game-context"
import Scoreboard from "@/components/scoreboard"
import { MODELS, MODEL_IDS } from "@/lib/models"
import type { AIModel } from "@/types/game"

export default function SelectPage() {
  const { signOut, user } = useAuth()
  const { startRound } = useGame()
  const router = useRouter()

  const handleModelSelect = (model: AIModel) => {
    startRound(model)
    router.push("/game")
  }

  return (
    <main className="min-h-screen bg-[#121212] text-[#33FF33] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-scanline pointer-events-none"></div>

      <div className="container mx-auto max-w-4xl px-4 py-12 z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-[#00FFFF] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono">BACK</span>
          </Link>

          {AUTH_ENABLED && user && !user.isGuest ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#33FF33]/70">LOGGED IN AS: {user.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 text-[#FF5555] hover:text-[#FF5555]/80"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">LOGOUT</span>
              </button>
            </div>
          ) : (
            <div className="text-sm text-[#33FF33]/70">PLAYING AS GUEST</div>
          )}
        </div>

        <Scoreboard className="mb-6" />

        <h1 className="text-3xl font-mono font-bold mb-2">SELECT OPPONENT</h1>
        <p className="text-sm font-mono text-[#00FFFF] mb-8">Choose your AI adversary</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MODEL_IDS.map((id) => {
            const ai = MODELS[id]
            return (
              <button
                key={id}
                onClick={() => handleModelSelect(id)}
                className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 hover:border-[#33FF33] transition-all duration-200 group text-left"
              >
                <h2 className="text-2xl font-mono font-bold mb-4 text-[#00FFFF] group-hover:glow-text">
                  {ai.displayName}
                </h2>

                <p className="font-mono text-sm text-[#ccc]">{ai.description}</p>

                <div className="mt-6 text-center">
                  <span className="inline-block py-2 px-4 border border-[#00FFFF]/50 rounded font-mono text-[#00FFFF] group-hover:border-[#00FFFF] group-hover:bg-[#00FFFF]/10">
                    SELECT
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}
