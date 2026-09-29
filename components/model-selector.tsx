"use client"

import { useGame } from "@/contexts/game-context"
import { MODELS, MODEL_IDS } from "@/lib/models"

const ModelSelector = () => {
  const { state, selectModel } = useGame()

  return (
    <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-4 mb-4">
      <h3 className="font-mono text-lg mb-4">SELECT AI MODEL</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {MODEL_IDS.map((id) => (
          <button
            key={id}
            onClick={() => selectModel(id)}
            className={`
              py-3 font-mono rounded transition-all duration-200
              ${
                state.model === id
                  ? "bg-gradient-to-r from-[#33FF33]/30 to-[#00FFFF]/30 border border-[#33FF33]"
                  : "bg-[#2a2a2a] hover:bg-gradient-to-r hover:from-[#33FF33]/20 hover:to-[#00FFFF]/20 border border-[#33FF33]/50 hover:border-[#33FF33]"
              }
            `}
          >
            {MODELS[id].displayName}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#ccc] font-mono">Switching opponents starts a new round.</p>
    </div>
  )
}

export default ModelSelector
