export type AIModel = "claude" | "openai"

export type Choice = "SHARE" | "KEEP"

type Sender = "SYSTEM" | "YOU" | "AI"

export type Message = {
  sender: Sender
  content: string
  timestamp: number
}

export type RoundResult = {
  model: AIModel
  yourDecision: Choice
  aiDecision: Choice
  yourPoints: number
  aiPoints: number
  date: string
}

/** In-session totals and outcome counts, sent to the server to build prompts. */
export type SessionStats = {
  humanTotal: number
  aiTotal: number
  gamesPlayed: number
  bothShare: number
  humanShareAiKeep: number
  humanKeepAiShare: number
  bothKeep: number
}
