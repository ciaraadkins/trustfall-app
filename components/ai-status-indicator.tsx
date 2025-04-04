"use client"

import { useGame } from "@/contexts/game-context"

const AIStatusIndicator = () => {
  const { aiThinking, aiHasDecided, aiName } = useGame()

  return (
    <div className="flex items-center justify-center gap-3 my-2 flex-shrink-0">
      <div className="h-px flex-grow bg-[#33FF33]/20"></div>
      
      <div className="flex items-center gap-2 bg-[#1a1a1a] border border-[#33FF33]/30 rounded-full px-4 py-2">
        <div 
          className={`
            w-3 h-3 rounded-full
            ${aiHasDecided 
              ? "bg-[#33FF33] shadow-[0_0_8px_rgba(51,255,51,0.8)]" 
              : aiThinking 
                ? "bg-[#FFAA55] animate-pulse" 
                : "bg-[#555]"
            }
          `}
        ></div>
        <span className="font-mono text-xs">
          {aiHasDecided 
            ? `${aiName} HAS DECIDED` 
            : aiThinking 
              ? `${aiName} IS THINKING...` 
              : "AWAITING CONVERSATION"
          }
        </span>
      </div>
      
      <div className="h-px flex-grow bg-[#33FF33]/20"></div>
    </div>
  )
}

export default AIStatusIndicator
