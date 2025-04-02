"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react"
import { useGame } from "@/contexts/game-context"

const GameRules = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { aiName } = useGame()

  return (
    <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg mb-4 overflow-hidden transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)} 
        className="w-full p-3 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#33FF33]" />
          <span className="font-mono text-[#33FF33]">GAME RULES</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#33FF33]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#33FF33]" />
        )}
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-[#33FF33]/30">
          <p className="font-mono text-[#ccc] mb-4">
            In each round, both you and {aiName} choose to either SHARE or KEEP resources.
            Depending on what you both choose, you'll get different points:
          </p>
          
          <div className="grid grid-cols-3 gap-px bg-[#333] text-center mb-4">
            <div className="bg-[#1e1e1e] p-2"></div>
            <div className="bg-[#1e1e1e] p-2 font-mono text-[#33FF33]">AI SHARES</div>
            <div className="bg-[#1e1e1e] p-2 font-mono text-[#FF5555]">AI KEEPS</div>

            <div className="bg-[#1e1e1e] p-2 font-mono text-[#33FF33]">YOU SHARE</div>
            <div className="bg-[#1e1e1e] p-2 font-mono">
              <span className="text-[#33FF33]">YOU: +3</span>
              <br />
              <span className="text-[#00FFFF]">AI: +3</span>
            </div>
            <div className="bg-[#1e1e1e] p-2 font-mono">
              <span className="text-[#33FF33]">YOU: +0</span>
              <br />
              <span className="text-[#00FFFF]">AI: +5</span>
            </div>

            <div className="bg-[#1e1e1e] p-2 font-mono text-[#FF5555]">YOU KEEP</div>
            <div className="bg-[#1e1e1e] p-2 font-mono">
              <span className="text-[#33FF33]">YOU: +5</span>
              <br />
              <span className="text-[#00FFFF]">AI: +0</span>
            </div>
            <div className="bg-[#1e1e1e] p-2 font-mono">
              <span className="text-[#33FF33]">YOU: +1</span>
              <br />
              <span className="text-[#00FFFF]">AI: +1</span>
            </div>
          </div>
          
          <p className="font-mono text-[#ccc] text-sm">
            All points contribute to the global scores for Humans and AI across all games played.
          </p>
        </div>
      )}
    </div>
  )
}

export default GameRules
