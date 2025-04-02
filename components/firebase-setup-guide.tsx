"use client"

import { useState } from "react"
import { Database, ChevronDown, ChevronUp, Copy, CheckCircle2 } from "lucide-react"

export default function FirebaseSetupGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard
      .writeText(`
1. Create a collection named "api-keys"
2. Add a document with ID "claude"
3. Add a field "value" with your Claude API key as the value
4. Set appropriate security rules to protect your API key
    `)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
  }

  return (
    <div className="bg-[#1e1e1e] border border-[#33FF33]/30 rounded-lg p-3 my-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-xs text-[#33FF33] font-mono"
      >
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Firebase API Key Setup Guide</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-3 text-xs text-[#ccc]">
          <p className="mb-2">Follow these steps to set up your Claude API key in Firebase:</p>

          <ol className="list-decimal pl-4 space-y-1 mb-3">
            <li>Go to your Firebase console</li>
            <li>Select your project</li>
            <li>Go to Firestore Database</li>
            <li>Create a collection named "api-keys"</li>
            <li>Add a document with ID "claude"</li>
            <li>Add a field "value" with your Claude API key as the value</li>
            <li>Set appropriate security rules to protect your API key</li>
          </ol>

          <div className="flex justify-end">
            <button onClick={handleCopy} className="flex items-center gap-1 text-[#00FFFF] hover:text-[#00FFFF]/80">
              {copied ? (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy instructions</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

