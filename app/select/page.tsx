"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getAIServiceManager } from "@/services/ai-service-manager"
import { placeholderScores } from "@/data/placeholder-scores"

export default function SelectPage() {
  const { signOut, user } = useAuth()
  const router = useRouter()

  const aiModels = [
    {
      name: "CLAUDE",
      trustIndex: 78,
      gamesPlayed: 458923,
      description: "Anthropic's helpful, harmless, and honest AI assistant.",
    },
    {
      name: "CHATGPT",
      trustIndex: 82,
      gamesPlayed: 892451,
      description: "OpenAI's versatile language model with broad knowledge.",
    },
    {
      name: "GEMINI",
      trustIndex: 75,
      gamesPlayed: 345678,
      description: "Google's multimodal AI with strong reasoning capabilities.",
    },
  ]

  // Handle model selection and game start
  const handleModelSelect = (modelName: string) => {
    // Get the AI service manager
    const aiManager = getAIServiceManager();
    
    // Convert UI model names to internal model ids
    let internalModelId = modelName.toLowerCase();
    if (modelName.toLowerCase() === "chatgpt") {
      internalModelId = "openai";
    }
    
    // Set the selected model
    aiManager.setModel(internalModelId as "claude" | "openai" | "gemini");
    
    console.log(`Selected model: ${modelName} (internal id: ${internalModelId})`);
    
    // Navigate to the game page
    router.push('/game');
  }

  return (
    <main className="min-h-screen bg-[#121212] text-[#33FF33] relative overflow-hidden">
      {/* Subtle tech pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>

      {/* Scan lines effect */}
      <div className="absolute inset-0 bg-scanline pointer-events-none"></div>

      <div className="container mx-auto max-w-4xl px-4 py-12 z-10 relative">
        <div className="flex justify-between items-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-[#00FFFF] hover:underline">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono">BACK</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-[#33FF33]/70">LOGGED IN AS: {user?.email}</span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 text-[#FF5555] hover:text-[#FF5555]/80"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">LOGOUT</span>
              </button>
            </div>
          ) : (
            <div className="text-sm text-[#33FF33]/70">
              PLAYING AS GUEST
            </div>
          )}
        </div>

        <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-4 mb-6">
          <h3 className="text-center text-sm text-[#00FFFF] mb-2 font-mono">GLOBAL SCOREBOARD</h3>
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <div className="text-xs mb-1">HUMANS</div>
              <div className="text-xl text-[#33FF33] font-bold">{placeholderScores.humanScore.toLocaleString()}</div>
            </div>
            <div className="h-10 w-px bg-[#33FF33]/30"></div>
            <div className="text-center flex-1">
              <div className="text-xs mb-1">AI</div>
              <div className="text-xl text-[#FF5555] font-bold">{placeholderScores.aiScore.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-mono font-bold mb-2">SELECT OPPONENT</h1>
        <div className="flex justify-between items-center mb-8">
          <p className="text-sm font-mono text-[#00FFFF]">Choose your AI adversary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiModels.map((ai) => (
            <button
              key={ai.name}
              onClick={() => handleModelSelect(ai.name)}
              className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-6 hover:border-[#33FF33] transition-all duration-200 group text-left"
            >
              <h2 className="text-2xl font-mono font-bold mb-4 text-[#00FFFF] group-hover:glow-text">{ai.name}</h2>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span>TRUST INDEX</span>
                    <span>{ai.trustIndex}%</span>
                  </div>
                  <div className="w-full bg-[#2a2a2a] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#33FF33] to-[#00FFFF] h-full rounded-full"
                      style={{ width: `${ai.trustIndex}%` }}
                    ></div>
                  </div>
                </div>

                <div className="text-sm mb-4">
                  <span className="text-[#999]">GAMES PLAYED: </span>
                  <span>{ai.gamesPlayed.toLocaleString()}</span>
                </div>

                <p className="font-mono text-sm text-[#ccc]">{ai.description}</p>

                <div className="mt-6 text-center">
                  <span className="inline-block py-2 px-4 border border-[#00FFFF]/50 rounded font-mono text-[#00FFFF] group-hover:border-[#00FFFF] group-hover:bg-[#00FFFF]/10">
                    SELECT
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
  )
}

