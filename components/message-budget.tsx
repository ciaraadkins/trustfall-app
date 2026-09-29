"use client"

import { useGame } from "@/contexts/game-context"
import { MESSAGES_PER_PLAYER } from "@/lib/game/rules"

function Pips({ left, color }: { left: number; color: string }) {
  return (
    <span className="inline-flex gap-1" aria-hidden="true">
      {Array.from({ length: MESSAGES_PER_PLAYER }, (_, i) => (
        <span key={i} className={`inline-block w-2 h-2 rounded-full ${i < left ? color : "bg-[#333]"}`} />
      ))}
    </span>
  )
}

/** Messages each side has left this round. */
const MessageBudget = () => {
  const { aiName, yourMessagesLeft, aiMessagesLeft } = useGame()

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2 border-b border-[#33FF33]/20 font-mono text-xs">
      <span className="flex items-center gap-2 text-[#00FFFF]">
        YOU <Pips left={yourMessagesLeft} color="bg-[#00FFFF]" /> {yourMessagesLeft} left
      </span>
      <span className="flex items-center gap-2 text-[#33FF33]">
        {aiName} <Pips left={aiMessagesLeft} color="bg-[#33FF33]" /> {aiMessagesLeft} left
      </span>
    </div>
  )
}

export default MessageBudget
