import type { Message } from "@/types/game"

/** Messages each side may send per round. */
export const MESSAGES_PER_PLAYER = 5

/** Most AI messages allowed in a row before the human speaks. */
export const MAX_AI_STREAK = 3

/** Silent "you've gone quiet" checks allowed in a row before the AI waits for new activity. */
export const MAX_QUIET_CHECKS = 3

export function messagesLeft(messages: Pick<Message, "sender">[], sender: "YOU" | "AI"): number {
  const sent = messages.filter((m) => m.sender === sender).length
  return Math.max(0, MESSAGES_PER_PLAYER - sent)
}

/** How many AI messages end the conversation with no human message after them. */
export function aiStreak(messages: Pick<Message, "sender">[]): number {
  let streak = 0
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === "YOU") break
    if (messages[i].sender === "AI") streak++
  }
  return streak
}

export function lastMessageAt(messages: Pick<Message, "sender" | "timestamp">[], sender: "YOU" | "AI"): number | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].sender === sender) return messages[i].timestamp
  }
  return null
}
