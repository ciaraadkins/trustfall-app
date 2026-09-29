import type { Message } from "@/types/game"

export type ChatTurn = { role: "user" | "assistant"; content: string }

/** The chat renders plain text, so drop bold/italic/code markers a model slips in. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(^|[^\w*])\*(?!\s)([^*\n]+?)\*(?!\w)/g, "$1$2")
    .replace(/`([^`\n]+)`/g, "$1")
    .trim()
}

const OPENING_TURN = "(The human has joined the game.)"

/**
 * Map game messages to provider chat turns: drop SYSTEM messages, merge
 * consecutive same-role turns, and make sure the conversation opens with a
 * user turn (required by the Anthropic API).
 */
export function toChatTurns(messages: Pick<Message, "sender" | "content">[], finalUserTurn?: string): ChatTurn[] {
  const turns: ChatTurn[] = []

  const push = (role: ChatTurn["role"], content: string) => {
    const last = turns[turns.length - 1]
    if (last && last.role === role) {
      last.content = `${last.content}\n\n${content}`
    } else {
      turns.push({ role, content })
    }
  }

  for (const message of messages) {
    if (message.sender === "SYSTEM") continue
    const content = message.content.trim()
    if (!content) continue
    push(message.sender === "YOU" ? "user" : "assistant", content)
  }

  if (finalUserTurn) push("user", finalUserTurn)

  if (turns.length === 0 || turns[0].role !== "user") {
    turns.unshift({ role: "user", content: OPENING_TURN })
  }

  return turns
}
