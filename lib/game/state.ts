import { DEFAULT_MODEL } from "@/lib/models"
import type { AIModel, Choice, Message, RoundResult } from "@/types/game"
import { welcomeMessage } from "./prompts"
import { scoreRound } from "./scoring"

/**
 * idle      - no round yet (before mount)
 * chatting  - conversation open, human hasn't decided
 * resolving - human decided; waiting on the AI's decision / reveal
 * result    - round scored
 */
type Phase = "idle" | "chatting" | "resolving" | "result"

export type GameState = {
  model: AIModel
  roundId: string
  phase: Phase
  messages: Message[]
  userMessageCount: number
  /** User messages before the AI locks in its decision. */
  decisionThreshold: number
  aiThinking: boolean
  /** Hidden from the UI until the reveal. */
  aiDecision: Choice | null
  yourDecision: Choice | null
  lastResult: RoundResult | null
  history: RoundResult[]
  error: string | null
}

export type GameAction =
  | { type: "START_ROUND"; model: AIModel; roundId: string; decisionThreshold: number; now: number }
  | { type: "USER_MESSAGE"; roundId: string; message: Message }
  | { type: "AI_REPLY"; roundId: string; message: Message }
  | { type: "AI_REPLY_FAILED"; roundId: string; error: string }
  | { type: "AI_DECIDED"; roundId: string; decision: Choice }
  | { type: "HUMAN_DECIDED"; roundId: string; decision: Choice }
  | { type: "AI_DECISION_FAILED"; roundId: string; error: string }
  | { type: "REVEAL"; roundId: string; date: string }
  | { type: "DISMISS_ERROR" }

export const initialGameState: GameState = {
  model: DEFAULT_MODEL,
  roundId: "",
  phase: "idle",
  messages: [],
  userMessageCount: 0,
  decisionThreshold: 0,
  aiThinking: false,
  aiDecision: null,
  yourDecision: null,
  lastResult: null,
  history: [],
  error: null,
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  if (action.type === "START_ROUND") {
    return {
      ...initialGameState,
      history: state.history,
      model: action.model,
      roundId: action.roundId,
      phase: "chatting",
      decisionThreshold: action.decisionThreshold,
      messages: [{ sender: "SYSTEM", content: welcomeMessage(), timestamp: action.now }],
    }
  }
  if (action.type === "DISMISS_ERROR") return { ...state, error: null }

  // Ignore responses that belong to a round that has since been replaced.
  if (action.roundId !== state.roundId) return state

  switch (action.type) {
    case "USER_MESSAGE":
      if (state.phase !== "chatting") return state
      return {
        ...state,
        messages: [...state.messages, action.message],
        userMessageCount: state.userMessageCount + 1,
        aiThinking: true,
        error: null,
      }

    case "AI_REPLY":
      return { ...state, messages: [...state.messages, action.message], aiThinking: false }

    case "AI_REPLY_FAILED":
      return { ...state, aiThinking: false, error: action.error }

    case "AI_DECIDED":
      if (state.aiDecision) return state
      return { ...state, aiDecision: action.decision }

    case "HUMAN_DECIDED":
      if (state.phase !== "chatting") return state
      return { ...state, phase: "resolving", yourDecision: action.decision, error: null }

    case "AI_DECISION_FAILED":
      // Let the human try again rather than inventing a move for the AI.
      if (state.phase !== "resolving") return state
      return { ...state, phase: "chatting", yourDecision: null, error: action.error }

    case "REVEAL": {
      if (state.phase !== "resolving" || !state.yourDecision || !state.aiDecision) return state
      const result: RoundResult = {
        model: state.model,
        yourDecision: state.yourDecision,
        aiDecision: state.aiDecision,
        ...scoreRound(state.yourDecision, state.aiDecision),
        date: action.date,
      }
      return { ...state, phase: "result", lastResult: result, history: [...state.history, result] }
    }
  }
}
