"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Terminal, AlertTriangle, Database } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] text-[#33FF33] relative overflow-hidden p-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-scanline pointer-events-none"></div>

      <div className="z-10 w-full max-w-md flex flex-col items-center gap-6 px-4">
        <div className="flex items-center gap-2">
          <Terminal className="w-8 h-8" />
          <h1 className="text-4xl font-mono font-bold tracking-tight glow-text">TRUSTFALL</h1>
        </div>

        <div className="w-full bg-[#FF5555]/20 border border-[#FF5555] rounded-lg p-6 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-[#FF5555] shrink-0 mt-0.5" />
            <h2 className="text-xl font-mono text-[#FF5555]">SYSTEM ERROR</h2>
          </div>

          <p className="text-sm text-[#FF5555] font-mono mb-4">
            {error?.message || "An unexpected error occurred. Please check your configuration."}
          </p>

          <div className="bg-[#1a1a1a] p-4 rounded mb-4">
            <h3 className="text-sm font-mono text-[#FFAA55] mb-2 flex items-center gap-2">
              <Database className="w-4 h-4" />
              FIREBASE SETUP REQUIRED
            </h3>
            <p className="text-xs text-[#ccc] mb-3">
              Make sure you have set up the Claude API key in your Firebase Firestore database:
            </p>
            <ol className="text-xs text-[#ccc] list-decimal pl-4 space-y-1">
              <li>Create a collection named "api-keys" in your Firestore database</li>
              <li>Add a document with ID "claude"</li>
              <li>Add a field "value" with your Claude API key as the value</li>
              <li>Set appropriate security rules to protect your API key</li>
            </ol>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => reset()}
              className="bg-[#1e1e1e] border border-[#FF5555]/50 hover:border-[#FF5555] rounded px-4 py-2 font-mono text-[#FF5555]"
            >
              TRY AGAIN
            </button>
          </div>
        </div>

        <Link href="/" className="text-[#33FF33]/70 hover:text-[#33FF33] font-mono text-sm">
          RETURN TO START_
        </Link>
      </div>
    </main>
  )
}

