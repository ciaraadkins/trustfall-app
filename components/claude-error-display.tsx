"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { getClaudeService } from "@/services/claude-service"

export default function ClaudeErrorDisplay() {
  const [error, setError] = useState<{ message: string | null; time: number } | null>(null)
  const [timeAgo, setTimeAgo] = useState<string>("")

  useEffect(() => {
    // Check for errors on mount and every 5 seconds
    const checkForErrors = () => {
      const claudeService = getClaudeService()
      const lastError = claudeService.getLastError()

      if (lastError.message) {
        setError(lastError)

        // Calculate time ago
        const now = Date.now()
        const seconds = Math.floor((now - lastError.time) / 1000)

        if (seconds < 60) {
          setTimeAgo(`${seconds}s ago`)
        } else if (seconds < 3600) {
          setTimeAgo(`${Math.floor(seconds / 60)}m ago`)
        } else {
          setTimeAgo(`${Math.floor(seconds / 3600)}h ago`)
        }
      } else {
        setError(null)
      }
    }

    checkForErrors()
    const interval = setInterval(checkForErrors, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!error || !error.message) {
    return null
  }
  
  return (
    <div className="bg-[#1e1e1e] border border-[#FF5555]/30 rounded-lg p-3 my-2 flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 text-[#FF5555] shrink-0 mt-0.5" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#FF5555] font-mono">Claude API Error</span>
          <span className="text-xs text-[#666]">{timeAgo}</span>
        </div>
        <p className="text-xs text-[#ccc] mt-1">{error.message}</p>
        <div className="mt-2">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-1 text-xs text-[#33FF33] hover:text-[#33FF33]/80"
          >
            <RefreshCw className="w-3 h-3" />
            <span>RELOAD PAGE</span>
          </button>
        </div>
      </div>
    </div>
  )
}

