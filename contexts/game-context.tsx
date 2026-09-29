"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react"
import { DEFAULT_MODEL, MODELS, isAIModel } from "@/lib/models"
import { requestDecision, requestReply } from "@/lib/game/api-client"
import { computeSessionStats } from "@/lib/game/scoring"
import { gameReducer, initialGameState, type GameState } from "@/lib/game/state"
import { randomInt, weightedRandom } from "@/utils/random"
import type { AIModel, Choice, Message, SessionStats } from "@/types/game"

const MODEL_STORAGE_KEY = "selectedModel"
const REVEAL_DELAY_MS = 1500

interface GameContextType {
  state: GameState
  aiName: string
  sessionStats: SessionStats
  sendMessage: (content: string) => Promise<void>
  makeDecision: (decision: Choice) => Promise<void>
  /** Start a fresh round, optionally against a different model. */
  startRound: (model?: AIModel) => void
  /** Switch opponent; resets the round only if the model changes. */
  selectModel: (model: AIModel) => void
  dismissError: () => void
}

const GameContext = createContext<GameContextType | null>(null)

export const useGame = () => {
  const context = useContext(GameContext)
  if (!context) throw new Error("useGame must be used inside GameProvider")
  return context
}

function newRoundId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function realismDelay(): number {
  const responseType = weightedRandom([
    { value: "immediate", weight: 60 },
    { value: "short-delay", weight: 30 },
    { value: "long-delay", weight: 10 },
  ])
  if (responseType === "immediate") return 500
  if (responseType === "short-delay") return randomInt(2000, 5000)
  return randomInt(5000, 10000)
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(gameReducer, initialGameState)

  // Async callbacks read the latest state through this ref instead of a stale closure.
  const stateRef = useRef(state)
  stateRef.current = state

  // One in-flight AI decision per round, shared by the threshold trigger and makeDecision.
  const pendingDecision = useRef<{ roundId: string; promise: Promise<Choice | null> } | null>(null)

  const sessionStats = useMemo(() => computeSessionStats(state.history), [state.history])
  const sessionStatsRef = useRef(sessionStats)
  sessionStatsRef.current = sessionStats

  const startRound = useCallback((model?: AIModel) => {
    const nextModel = model ?? stateRef.current.model
    try {
      localStorage.setItem(MODEL_STORAGE_KEY, nextModel)
    } catch {
      // Storage may be unavailable (private mode); the choice just won't persist.
    }
    pendingDecision.current = null
    dispatch({
      type: "START_ROUND",
      model: nextModel,
      roundId: newRoundId(),
      decisionThreshold: randomInt(3, 7),
      now: Date.now(),
    })
  }, [])

  const selectModel = useCallback(
    (model: AIModel) => {
      const current = stateRef.current
      if (current.phase === "idle" || model !== current.model) startRound(model)
    },
    [startRound],
  )

  // Restore the saved opponent and start the first round after mount.
  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(MODEL_STORAGE_KEY)
    } catch {
      // ignore
    }
    if (stateRef.current.phase === "idle") startRound(isAIModel(saved) ? saved : DEFAULT_MODEL)
  }, [startRound])

  /**
   * Get the AI's decision for a round, reusing a request that's already in
   * flight. Resolves to null on failure; `reportErrors` surfaces it to the player.
   */
  const ensureAiDecision = useCallback(
    (roundId: string, messages: Message[], reportErrors: boolean): Promise<Choice | null> => {
      const current = stateRef.current
      if (current.roundId === roundId && current.aiDecision) return Promise.resolve(current.aiDecision)

      let pending = pendingDecision.current
      if (!pending || pending.roundId !== roundId) {
        const promise = requestDecision({
          model: current.model,
          roundId,
          messages,
          sessionStats: sessionStatsRef.current,
        }).then(
          (decision) => {
            dispatch({ type: "AI_DECIDED", roundId, decision })
            return decision
          },
          (error: Error) => {
            if (pendingDecision.current?.promise === promise) pendingDecision.current = null
            return Promise.reject(error)
          },
        )
        pending = { roundId, promise: promise as Promise<Choice | null> }
        pendingDecision.current = pending
      }

      return pending.promise.catch((error: Error) => {
        if (reportErrors) dispatch({ type: "AI_DECISION_FAILED", roundId, error: error.message })
        return null
      })
    },
    [],
  )

  const sendMessage = useCallback(
    async (content: string) => {
      const current = stateRef.current
      const text = content.trim()
      if (!text || current.phase !== "chatting" || current.aiThinking) return

      const { roundId, model } = current
      const userMessage: Message = { sender: "YOU", content: text, timestamp: Date.now() }
      const messages = [...current.messages, userMessage]
      dispatch({ type: "USER_MESSAGE", roundId, message: userMessage })

      const startedAt = Date.now()
      try {
        const reply = await requestReply({ model, roundId, messages, sessionStats: sessionStatsRef.current })
        await sleep(Math.max(0, realismDelay() - (Date.now() - startedAt)))

        const aiMessage: Message = { sender: "AI", content: reply, timestamp: Date.now() }
        dispatch({ type: "AI_REPLY", roundId, message: aiMessage })

        const after = stateRef.current
        if (after.roundId === roundId && current.userMessageCount + 1 >= current.decisionThreshold) {
          // Lock in the AI's decision in the background; errors surface only if the human is waiting on it.
          void ensureAiDecision(roundId, [...messages, aiMessage], false)
        }
      } catch (error) {
        dispatch({ type: "AI_REPLY_FAILED", roundId, error: (error as Error).message })
      }
    },
    [ensureAiDecision],
  )

  const makeDecision = useCallback(
    async (decision: Choice) => {
      const current = stateRef.current
      if (current.phase !== "chatting") return

      const { roundId } = current
      dispatch({ type: "HUMAN_DECIDED", roundId, decision })

      const aiChoice = await ensureAiDecision(roundId, current.messages, true)
      if (!aiChoice) return

      await sleep(REVEAL_DELAY_MS)
      dispatch({ type: "REVEAL", roundId, date: new Date().toISOString() })
    },
    [ensureAiDecision],
  )

  const dismissError = useCallback(() => dispatch({ type: "DISMISS_ERROR" }), [])

  const value = useMemo<GameContextType>(
    () => ({
      state,
      aiName: MODELS[state.model].displayName,
      sessionStats,
      sendMessage,
      makeDecision,
      startRound,
      selectModel,
      dismissError,
    }),
    [state, sessionStats, sendMessage, makeDecision, startRound, selectModel, dismissError],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
