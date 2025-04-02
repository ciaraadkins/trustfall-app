"use client"

import { useGame } from "@/contexts/game-context"

const GlobalScore = () => {
  const { globalHumanScore, globalAiScore } = useGame()

  return (
    <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-4 mb-4">
      <h3 className="text-center text-sm text-[#00FFFF] mb-2 font-mono">GLOBAL SCOREBOARD</h3>
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
  )
}

export default GlobalScore