"use client"

import { useState, useEffect } from "react"
import { type AIModel } from "@/services/claude-service"
import { getAIServiceManager } from "@/services/ai-service-manager"

const ModelSelector = () => {
  const [selectedModel, setSelectedModel] = useState<AIModel>("claude")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationComplete, setGenerationComplete] = useState(false)

  useEffect(() => {
    // Get the current model from the service
    const aiManager = getAIServiceManager()
    setSelectedModel(aiManager.getSelectedModel())
    
    // Listen for model changes from other components
    const removeListener = aiManager.onModelChange((model) => {
      setSelectedModel(model)
    })
    
    return () => removeListener()
  }, [])

  const handleModelChange = async (model: AIModel) => {
    setSelectedModel(model)
    setIsGenerating(true)
    setGenerationComplete(false)

    try {
      // Update the model in the service manager
      const aiManager = getAIServiceManager()
      aiManager.setModel(model)

      // Generate a new strategic profile for the selected model
      await aiManager.generateStrategicProfile()
      setGenerationComplete(true)
    } catch (error) {
      console.error("Error setting model:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-4 mb-4">
      <h3 className="font-mono text-lg mb-4">SELECT AI MODEL</h3>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <button
          onClick={() => handleModelChange("claude")}
          className={`
            py-3 font-mono rounded transition-all duration-200
            ${
              selectedModel === "claude"
                ? "bg-gradient-to-r from-[#33FF33]/30 to-[#00FFFF]/30 border border-[#33FF33]"
                : "bg-[#2a2a2a] hover:bg-gradient-to-r hover:from-[#33FF33]/20 hover:to-[#00FFFF]/20 border border-[#33FF33]/50 hover:border-[#33FF33]"
            }
          `}
          disabled={isGenerating}
        >
          CLAUDE
        </button>

        <button
          onClick={() => handleModelChange("openai")}
          className={`
            py-3 font-mono rounded transition-all duration-200
            ${
              selectedModel === "openai"
                ? "bg-gradient-to-r from-[#33FF33]/30 to-[#00FFFF]/30 border border-[#33FF33]"
                : "bg-[#2a2a2a] hover:bg-gradient-to-r hover:from-[#33FF33]/20 hover:to-[#00FFFF]/20 border border-[#33FF33]/50 hover:border-[#33FF33]"
            }
          `}
          disabled={isGenerating}
        >
          OPENAI (GPT-4o)
        </button>

        <button
          onClick={() => handleModelChange("gemini")}
          className={`
            py-3 font-mono rounded transition-all duration-200
            ${
              selectedModel === "gemini"
                ? "bg-gradient-to-r from-[#33FF33]/30 to-[#00FFFF]/30 border border-[#33FF33]"
                : "bg-[#2a2a2a] hover:bg-gradient-to-r hover:from-[#33FF33]/20 hover:to-[#00FFFF]/20 border border-[#33FF33]/50 hover:border-[#33FF33]"
            }
          `}
          disabled={isGenerating || true} // Temporarily disabled
        >
          GEMINI (COMING SOON)
        </button>
      </div>

      {isGenerating && (
        <div className="text-center p-2 bg-[#2a2a2a] rounded border border-[#33FF33]/30 hidden">
          <p className="text-[#33FF33] text-sm font-mono flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#33FF33] rounded-full animate-pulse"></span>
            Generating AI strategic profile...
          </p>
        </div>
      )}

      {generationComplete && !isGenerating && (
        <div className="text-center p-2 bg-[#2a2a2a] rounded border border-[#33FF33]/30 hidden">
          <p className="text-[#33FF33] text-sm font-mono flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 bg-[#33FF33] rounded-full"></span>
            Strategic profile generated successfully
          </p>
        </div>
      )}
    </div>
  )
}

export default ModelSelector