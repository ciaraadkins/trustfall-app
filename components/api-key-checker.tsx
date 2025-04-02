"use client"

import { useEffect, useState } from "react"
import { getApiKey } from "@/lib/api-keys"
import { AlertTriangle, CheckCircle2, Info } from "lucide-react"

export default function ApiKeyChecker() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "warning">("loading")
  const [message, setMessage] = useState<string>("")
  const [details, setDetails] = useState<string>("")

  useEffect(() => {
    async function checkApiKey() {
      try {
        const apiKey = await getApiKey("claude")
        if (apiKey) {
          // Check if the API key looks valid (basic format check)
          if (apiKey.startsWith("sk-ant-")) {
            setStatus("success")
            setMessage("Claude API key is configured correctly")
          } else {
            setStatus("warning")
            setMessage("Claude API key found but may be invalid")
            setDetails("API key doesn't match expected format (should start with 'sk-ant-')")
          }
        } else {
          setStatus("error")
          setMessage("Claude API key not found in Firebase")
          setDetails("Please add the API key to the 'api-keys' collection in Firestore")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Error checking API key: " + (error instanceof Error ? error.message : String(error)))
      }
    }

    checkApiKey()
  }, [])

  if (status === "loading") {
    return (
      <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-3 my-2 flex items-center gap-2">
        <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#33FF33]/50 border-r-transparent"></div>
        <span className="text-xs text-[#ccc] font-mono">Checking API configuration...</span>
      </div>
    )
  }

  if (status === "success") {
    return (
      <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-3 my-2 flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-[#33FF33]" />
        <span className="text-xs text-[#33FF33] font-mono">{message}</span>
      </div>
    )
  }

  if (status === "warning") {
    return (
      <div className="bg-[#1e1e1e] border border-[#FFAA55]/30 rounded-lg p-3 my-2 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#FFAA55] shrink-0 mt-0.5" />
        <div>
          <span className="text-xs text-[#FFAA55] font-mono">{message}</span>
          {details && <p className="text-xs text-[#ccc] mt-1">{details}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#FF5555]/30 rounded-lg p-3 my-2 flex items-start gap-2">
      <AlertTriangle className="w-4 h-4 text-[#FF5555] shrink-0 mt-0.5" />
      <div>
        <span className="text-xs text-[#FF5555] font-mono">{message}</span>
        {details && <p className="text-xs text-[#ccc] mt-1">{details}</p>}
        <p className="text-xs text-[#ccc] mt-1">
          Please add the Claude API key to your Firebase Firestore in the "api-keys" collection.
        </p>
      </div>
    </div>
  )
}

