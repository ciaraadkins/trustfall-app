"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { DEFAULT_MODEL, MODELS, isAIModel } from "@/lib/models"
import { requestTurn } from "@/lib/game/api-client"
import { createGameEngine, type GameEngine } from "@/lib/game/engine"
import { messagesLeft } from "@/lib/game/rules"
import { computeSessionStats } from "@/lib/game/scoring"
import { humanFinished, initialGameState, type GameState } from "@/lib/game/state"
import type { AIModel, Choice, SessionStats } from "@/types/game"

const MODEL_STORAGE_KEY = "selectedModel"

interface GameContextType {
  state: GameState
  aiName: string
  sessionStats: SessionStats
  yourMessagesLeft: number
  aiMessagesLeft: number
  /** You've locked in and have nothing left to do but wait for the AI. */
  waitingOnAi: boolean
  sendMessage: (content: string) => boolean
  notifyTyping: () => void
  lockIn: (choice: Choice) => void
  doneTalking: () => void
  retryLockIn: () => void
  reveal: () => void
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

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [engine] = useState<GameEngine>(() => createGameEngine({ requestTurn }))
  // The provider lives in the root layout for the whole session, so the engine is never torn down.
  const state = useSyncExternalStore(engine.subscribe, engine.getState, () => initialGameState)

  const sessionStats = useMemo(() => computeSessionStats(state.history), [state.history])

  const startRound = useCallback(
    (model?: AIModel) => {
      const nextModel = model ?? engine.getState().model
      try {
        localStorage.setItem(MODEL_STORAGE_KEY, nextModel)
      } catch {
        // Storage may be unavailable (private mode); the choice just won't persist.
      }
      engine.startRound(nextModel, newRoundId())
    },
    [engine],
  )

  const selectModel = useCallback(
    (model: AIModel) => {
      const current = engine.getState()
      if (current.phase === "idle" || model !== current.model) startRound(model)
    },
    [engine, startRound],
  )

  // Restore the saved opponent and start the first round after mount.
  useEffect(() => {
    let saved: string | null = null
    try {
      saved = localStorage.getItem(MODEL_STORAGE_KEY)
    } catch {
      // ignore
    }
    if (engine.getState().phase === "idle") startRound(isAIModel(saved) ? saved : DEFAULT_MODEL)
  }, [engine, startRound])

  const value = useMemo<GameContextType>(
    () => ({
      state,
      aiName: MODELS[state.model].displayName,
      sessionStats,
      yourMessagesLeft: messagesLeft(state.messages, "YOU"),
      aiMessagesLeft: messagesLeft(state.messages, "AI"),
      waitingOnAi: state.phase === "chatting" && !state.aiLockIn && humanFinished(state),
      sendMessage: engine.sendMessage,
      notifyTyping: engine.notifyTyping,
      lockIn: engine.lockIn,
      doneTalking: engine.doneTalking,
      retryLockIn: engine.retryLockIn,
      reveal: engine.reveal,
      startRound,
      selectModel,
      dismissError: engine.dismissError,
    }),
    [state, sessionStats, engine, startRound, selectModel],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
