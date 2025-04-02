"use client"

import Link from "next/link"
import { Trophy, BarChart, Users, PlayCircle } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import GlobalScore from "@/components/global-score"

export default function SummaryPage() {
  // Sample data - in a real app, this would come from game state
  const gameData = {
    yourScore: 3,
    aiScore: 3,
    rounds: [{ round: 1, yourDecision: "SHARE", aiDecision: "SHARE", yourPoints: 3, aiPoints: 3 }],
    cooperationRate: {
      you: 100,
      ai: 100,
    },
    globalImpact: {
      pointsAdded: 3,
      trustIndexChange: +0.5,
    },
  }

  return (
    <ProtectedRoute allowGuest={true}>
      <main className="min-h-screen bg-[#121212] text-[#33FF33] relative">
        {/* Subtle tech pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

        {/* Scan lines effect */}
        <div className="absolute inset-0 bg-scanline pointer-events-none"></div>

        <div className="container mx-auto max-w-4xl px-4 py-12 z-10 relative">
          <h1 className="text-3xl font-mono font-bold mb-4">GAME SUMMARY</h1>
          
          <GlobalScore />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6">
              <h2 className="text-xl font-mono mb-6 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#FFAA55]" />
                FINAL SCORE
              </h2>

              <div className="flex justify-between items-center mb-4">
                <div className="font-mono text-lg">YOU</div>
                <div className="font-mono text-3xl text-[#33FF33]">{gameData.yourScore}</div>
              </div>

              <div className="w-full bg-[#2a2a2a] h-3 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-gradient-to-r from-[#33FF33] to-[#00FFFF] h-full rounded-full"
                  style={{ width: `${(gameData.yourScore / (gameData.yourScore + gameData.aiScore)) * 100}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <div className="font-mono text-lg">CLAUDE</div>
                <div className="font-mono text-3xl text-[#00FFFF]">{gameData.aiScore}</div>
              </div>
            </div>

            <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6">
              <h2 className="text-xl font-mono mb-6 flex items-center gap-2">
                <BarChart className="w-5 h-5 text-[#00FFFF]" />
                COOPERATION STATS
              </h2>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>YOUR COOPERATION RATE</span>
                  <span>{gameData.cooperationRate.you}%</span>
                </div>
                <div className="w-full bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#33FF33] h-full rounded-full"
                    style={{ width: `${gameData.cooperationRate.you}%` }}
                  ></div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span>AI COOPERATION RATE</span>
                  <span>{gameData.cooperationRate.ai}%</span>
                </div>
                <div className="w-full bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00FFFF] h-full rounded-full"
                    style={{ width: `${gameData.cooperationRate.ai}%` }}
                  ></div>
                </div>
              </div>

              <div className="font-mono text-sm text-[#ccc]">
                {gameData.cooperationRate.you > gameData.cooperationRate.ai
                  ? "You were more cooperative than the AI in this game."
                  : gameData.cooperationRate.you < gameData.cooperationRate.ai
                    ? "The AI was more cooperative than you in this game."
                    : "You and the AI had the same cooperation rate."}
              </div>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-mono mb-6">TODAY'S RESULT</h2>

            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-[#33FF33]/30">
                    <th className="text-left py-2 px-4">DATE</th>
                    <th className="text-left py-2 px-4">YOUR DECISION</th>
                    <th className="text-left py-2 px-4">AI DECISION</th>
                    <th className="text-right py-2 px-4">YOUR POINTS</th>
                    <th className="text-right py-2 px-4">AI POINTS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#33FF33]/10">
                    <td className="py-2 px-4">{new Date().toLocaleDateString()}</td>
                    <td
                      className={`py-2 px-4 ${gameData.rounds[0].yourDecision === "SHARE" ? "text-[#33FF33]" : "text-[#FF5555]"}`}
                    >
                      {gameData.rounds[0].yourDecision}
                    </td>
                    <td
                      className={`py-2 px-4 ${gameData.rounds[0].aiDecision === "SHARE" ? "text-[#00FFFF]" : "text-[#FF5555]"}`}
                    >
                      {gameData.rounds[0].aiDecision}
                    </td>
                    <td className="py-2 px-4 text-right">{gameData.rounds[0].yourPoints}</td>
                    <td className="py-2 px-4 text-right">{gameData.rounds[0].aiPoints}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-mono mb-4">NEXT ROUND AVAILABLE IN</h2>
            <div className="text-center">
              <div className="text-3xl font-mono text-[#FFAA55]">23:59:59</div>
              <p className="text-sm text-[#ccc] mt-2">Come back tomorrow to play another round!</p>
            </div>
          </div>

          <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-mono mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#FFAA55]" />
              GLOBAL IMPACT
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="text-sm mb-2">POINTS ADDED TO GLOBAL TALLY</div>
                <div className="text-3xl font-mono text-[#33FF33] mb-2">+{gameData.globalImpact.pointsAdded}</div>
                <div className="text-xs text-[#ccc]">Your game has contributed to the global human score.</div>
              </div>

              <div>
                <div className="text-sm mb-2">AI TRUST INDEX CHANGE</div>
                <div
                  className={`text-3xl font-mono mb-2 ${gameData.globalImpact.trustIndexChange > 0 ? "text-[#33FF33]" : "text-[#FF5555]"}`}
                >
                  {gameData.globalImpact.trustIndexChange > 0 ? "+" : ""}
                  {gameData.globalImpact.trustIndexChange}%
                </div>
                <div className="text-xs text-[#ccc]">Your interactions have affected how much this AI is trusted.</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/select"
              className="inline-flex items-center gap-2 bg-[#1e1e1e] border border-[#00FFFF]/50 hover:border-[#00FFFF] hover:bg-[#1e1e1e]/80 rounded px-6 py-3 font-mono text-[#00FFFF] transition-all duration-200 hover:glow-text"
            >
              <PlayCircle className="w-4 h-4" />
              PLAY AGAIN
            </Link>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}

