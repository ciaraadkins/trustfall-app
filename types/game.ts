export type Message = {
  sender: "SYSTEM" | "CLAUDE" | "CHATGPT" | "GEMINI" | "YOU" | string
  content: string
  timestamp: number
  isTyping?: boolean
}

export type Decision = "SHARE" | "KEEP" | null

export type GameResult = {
  yourDecision: Decision
  aiDecision: Decision
  yourPoints: number
  aiPoints: number
  date: string
}

export type GameHistory = {
  results: GameResult[]
  totalHumanScore: number
  totalAiScore: number
}

