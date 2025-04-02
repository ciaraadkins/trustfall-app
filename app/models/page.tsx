"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import ProtectedRoute from "@/components/protected-route"
import ModelSelector from "@/components/model-selector"
import GlobalScore from "@/components/global-score"
import { PlayCircle } from "lucide-react"

export default function ModelsPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#121212] text-[#33FF33] flex flex-col relative">
        {/* Subtle tech pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        {/* Scan lines effect */}
        <div className="absolute inset-0 bg-scanline pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl py-12 px-4 z-10">
          <h1 className="text-3xl font-mono font-bold mb-8">AI MODEL SETTINGS</h1>
          
          <GlobalScore />
          
          <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-mono mb-6">SELECT YOUR OPPONENT</h2>
            
            <p className="text-[#ccc] mb-8">
              Choose which AI model you want to play against. Each model has its own unique strategy
              and approach to the game.
            </p>
            
            <ModelSelector />
            
            <div className="mt-8 text-center">
              <Link 
                href="/game"
                className="inline-flex items-center gap-2 bg-[#33FF33]/20 hover:bg-[#33FF33]/30 border-2 border-[#33FF33] rounded-lg px-8 py-4 font-mono text-[#33FF33] text-xl transition-all duration-200 hover:glow-text"
              >
                <PlayCircle className="w-6 h-6" />
                PLAY NOW
              </Link>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
