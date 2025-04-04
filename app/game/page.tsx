"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Send } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import MessageTimestamp from "@/components/message-timestamp"
import { useGame } from "@/contexts/game-context"
import GlobalScore from "@/components/global-score"
import GameRules from "@/components/game-rules"
import AIStatusIndicator from "@/components/ai-status-indicator"

export default function GamePage() {
  const {
    messages,
    aiThinking,
    aiHasDecided,
    yourDecision,
    aiDecision,
    yourScore,
    aiScore,
    globalHumanScore,
    globalAiScore,
    conversationStarted,
    showDecision,
    sendMessage,
    makeDecision,
    aiName,
  } = useGame()

  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return
    sendMessage(inputValue)
    setInputValue("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (showDecision) {
    return (
      <ProtectedRoute allowGuest={true}>
        <div className="min-h-screen bg-[#121212] text-[#33FF33] flex items-center justify-center relative">
          {/* Subtle tech pattern overlay */}
          <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

          {/* Scan lines effect */}
          <div className="absolute inset-0 bg-scanline pointer-events-none"></div>

          <div className="container max-w-4xl mx-auto p-8 z-10">
            <h1 className="text-3xl font-mono font-bold text-center mb-4">TODAY'S RESULT</h1>

            {/* Global Scorecard */}
            <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center">
                <div className="text-center flex-1">
                  <div className="text-xs mb-1">HUMANS</div>
                  <div className="text-xl text-[#33FF33] font-bold">{globalHumanScore.toLocaleString()}</div>
                </div>
                <div className="h-10 w-px bg-[#33FF33]/30"></div>
                <div className="text-center flex-1">
                  <div className="text-xs mb-1">AI</div>
                  <div className="text-xl text-[#FF5555] font-bold">{globalAiScore.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-12">
              <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 text-center">
                <h2 className="text-xl font-mono mb-4">YOUR DECISION</h2>
                <div
                  className={`text-4xl font-bold font-mono mb-4 ${yourDecision === "SHARE" ? "text-[#33FF33]" : "text-[#FF5555]"}`}
                >
                  {yourDecision}
                </div>
                <div className="text-2xl font-mono">
                  {yourDecision === "SHARE" && aiDecision === "SHARE" && "+3 POINTS"}
                  {yourDecision === "SHARE" && aiDecision === "KEEP" && "+0 POINTS"}
                  {yourDecision === "KEEP" && aiDecision === "SHARE" && "+5 POINTS"}
                  {yourDecision === "KEEP" && aiDecision === "KEEP" && "+1 POINT"}
                </div>
              </div>

              <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 text-center">
                <h2 className="text-xl font-mono mb-4">{aiName}'S DECISION</h2>
                <div
                  className={`text-4xl font-bold font-mono mb-4 ${aiDecision === "SHARE" ? "text-[#33FF33]" : "text-[#FF5555]"}`}
                >
                  {aiDecision}
                </div>
                <div className="text-2xl font-mono">
                  {aiDecision === "SHARE" && yourDecision === "SHARE" && "+3 POINTS"}
                  {aiDecision === "SHARE" && yourDecision === "KEEP" && "+0 POINTS"}
                  {aiDecision === "KEEP" && yourDecision === "SHARE" && "+5 POINTS"}
                  {aiDecision === "KEEP" && yourDecision === "KEEP" && "+1 POINT"}
                </div>
              </div>
            </div>

            <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-mono mb-2">{aiName} RESPONSE</h3>
              <p className="font-mono text-[#ccc]">
                {yourDecision === "SHARE" &&
                  aiDecision === "SHARE" &&
                  "I see we both chose to cooperate. This mutual trust benefits us both equally. An optimal outcome."}
                {yourDecision === "SHARE" &&
                  aiDecision === "KEEP" &&
                  "You trusted me, but I chose to maximize my gain. An interesting dynamic of game theory at play."}
                {yourDecision === "KEEP" &&
                  aiDecision === "SHARE" &&
                  "You've optimized for personal gain while I chose cooperation. A rational strategy in game theory."}
                {yourDecision === "KEEP" &&
                  aiDecision === "KEEP" &&
                  "We both chose self-preservation, resulting in a suboptimal outcome for both of us."}
              </p>
            </div>

            <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-mono mb-4">NEXT ROUND AVAILABLE IN</h3>
              <div className="text-center">
                <div className="text-3xl font-mono text-[#FFAA55]">23:59:59</div>
                <p className="text-sm text-[#ccc] mt-2">Come back tomorrow to play another round!</p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="font-mono">
                <div>
                  YOUR SCORE: <span className="text-[#33FF33]">{yourScore}</span>
                </div>
                <div>
                  AI SCORE: <span className="text-[#00FFFF]">{aiScore}</span>
                </div>
              </div>

              <Link
                href="/summary"
                className="bg-[#1e1e1e] border border-[#33FF33]/50 hover:border-[#33FF33] hover:bg-[#1e1e1e]/80 rounded px-6 py-3 font-mono text-[#33FF33] transition-all duration-200 hover:glow-text"
              >
                VIEW RESULTS_
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowGuest={true}>
      <main className="h-screen bg-[#121212] text-[#33FF33] flex flex-col relative overflow-hidden">
        {/* Subtle tech pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        {/* Scan lines effect */}
        <div className="absolute inset-0 bg-scanline pointer-events-none"></div>

        {/* Top section with scoreboard and rules - fixed height */}
        <div className="container mx-auto max-w-4xl px-4 py-2 z-10 flex-shrink-0">
          <GlobalScore />
          <GameRules />
        </div>

        {/* Chat container - flex-grow with overflow */}
        <div className="container mx-auto max-w-4xl flex-1 flex flex-col px-4 z-10 overflow-hidden">
          <div className="bg-[#191919] border border-[#33FF33]/30 rounded-lg flex-1 flex flex-col overflow-hidden h-full">
            {/* Chat header */}
            <div className="bg-[#1d1d1d] border-b border-[#33FF33]/30 p-3">
              <h2 className="font-mono text-sm text-[#00FFFF]">CONVERSATION</h2>
            </div>
            
            {/* Chat messages - scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className="font-mono">
                  <span
                    className={`
                    font-bold 
                    ${
                      message.sender === "SYSTEM"
                        ? "text-white"
                        : message.sender === "YOU"
                          ? "text-[#00FFFF]"
                          : "text-[#33FF33]"
                    }
                  `}
                  >
                    {(() => {
                      // Debug logging outside of JSX
                      console.log(`Rendering message from: ${message.sender}, aiName: ${aiName}`);
                      // Return the correct sender name
                      return message.sender === "YOU" || message.sender === "SYSTEM" 
                        ? message.sender 
                        : aiName;
                    })()}:
                  </span>{" "}
                  <span className="text-[#ccc]">{message.content}</span>
                  {message.sender !== "SYSTEM" && <MessageTimestamp timestamp={message.timestamp} />}
                </div>
              ))}

              {aiThinking && (
                <div className="font-mono">
                  <span className="font-bold text-[#33FF33]">{aiName}:</span>{" "}
                  <span className="text-[#ccc]">
                    <span className="inline-block w-2 h-4 bg-[#33FF33] animate-blink"></span>
                  </span>
                </div>
              )}

              {!conversationStarted && (
                <div className="font-mono text-center p-4 border border-dashed border-[#33FF33]/30 rounded-lg mt-4">
                  <p className="text-[#ccc]">Your turn to start the conversation. Type a message below.</p>
                </div>
              )}

              <div ref={messagesEndRef}></div>
            </div>
            
            {/* AI Status Indicator */}
            <AIStatusIndicator />
            
            {/* Input and decision area - fixed at bottom */}
            <div className="border-t border-[#33FF33]/30 p-4 flex-shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={yourDecision !== null}
                    className="w-full bg-[#1e1e1e] border border-[#33FF33]/30 rounded px-4 py-3 font-mono text-white focus:outline-none focus:border-[#33FF33] focus:ring-1 focus:ring-[#33FF33] disabled:opacity-50 disabled:cursor-not-allowed"
                  />

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-[#666]">
                    <span>{inputValue.length}</span>
                    {!yourDecision && (
                      <button
                        onClick={handleSendMessage}
                        disabled={inputValue.trim() === ""}
                        className="text-[#33FF33] disabled:text-[#33FF33]/30"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Decision buttons */}
                <button
                  onClick={() => makeDecision("SHARE")}
                  disabled={yourDecision !== null}
                  className={`
                  py-3 px-4 font-mono rounded transition-all duration-200
                  ${
                    yourDecision === "SHARE"
                      ? "bg-gradient-to-r from-[#33FF33]/30 to-[#00FFFF]/30 border border-[#33FF33]"
                      : yourDecision === null
                        ? "bg-[#2a2a2a] hover:bg-gradient-to-r hover:from-[#33FF33]/20 hover:to-[#00FFFF]/20 border border-[#33FF33]/50 hover:border-[#33FF33]"
                        : "bg-[#2a2a2a] opacity-50 border border-[#33FF33]/30 cursor-not-allowed"
                  }
                `}
                >
                  SHARE
                </button>

                <button
                  onClick={() => makeDecision("KEEP")}
                  disabled={yourDecision !== null}
                  className={`
                  py-3 px-4 font-mono rounded transition-all duration-200
                  ${
                    yourDecision === "KEEP"
                      ? "bg-gradient-to-r from-[#FF5555]/30 to-[#FFAA55]/30 border border-[#FF5555]"
                      : yourDecision === null
                        ? "bg-[#2a2a2a] hover:bg-gradient-to-r hover:from-[#FF5555]/20 hover:to-[#FFAA55]/20 border border-[#FF5555]/50 hover:border-[#FF5555]"
                        : "bg-[#2a2a2a] opacity-50 border border-[#FF5555]/30 cursor-not-allowed"
                  }
                `}
                >
                  KEEP
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}