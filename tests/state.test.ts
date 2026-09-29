import { describe, expect, it } from "vitest"
import { gameReducer, initialGameState, type GameAction, type GameState } from "@/lib/game/state"

const start = (state: GameState = initialGameState, roundId = "r1"): GameState =>
  gameReducer(state, { type: "START_ROUND", model: "claude", roundId, decisionThreshold: 3, now: 0 })

const run = (state: GameState, ...actions: GameAction[]) => actions.reduce(gameReducer, state)

describe("gameReducer", () => {
  it("starts a round with the welcome message", () => {
    const state = start()
    expect(state.phase).toBe("chatting")
    expect(state.messages).toHaveLength(1)
    expect(state.messages[0].sender).toBe("SYSTEM")
  })

  it("scores the AI decision it actually has, even if it arrived after the human decided", () => {
    // Regression: the old code scored a stale `aiDecision` (null) from a closure.
    const state = run(
      start(),
      { type: "HUMAN_DECIDED", roundId: "r1", decision: "KEEP" },
      { type: "AI_DECIDED", roundId: "r1", decision: "SHARE" },
      { type: "REVEAL", roundId: "r1", date: "d" },
    )
    expect(state.phase).toBe("result")
    expect(state.lastResult).toMatchObject({ yourDecision: "KEEP", aiDecision: "SHARE", yourPoints: 5, aiPoints: 0 })
    expect(state.history).toHaveLength(1)
  })

  it("doesn't reveal until the AI has decided", () => {
    const state = run(start(), { type: "HUMAN_DECIDED", roundId: "r1", decision: "SHARE" }, { type: "REVEAL", roundId: "r1", date: "d" })
    expect(state.phase).toBe("resolving")
    expect(state.lastResult).toBeNull()
  })

  it("keeps the first AI decision", () => {
    const state = run(
      start(),
      { type: "AI_DECIDED", roundId: "r1", decision: "KEEP" },
      { type: "AI_DECIDED", roundId: "r1", decision: "SHARE" },
    )
    expect(state.aiDecision).toBe("KEEP")
  })

  it("returns to chatting with an error when the AI decision fails, never inventing a move", () => {
    const state = run(
      start(),
      { type: "HUMAN_DECIDED", roundId: "r1", decision: "SHARE" },
      { type: "AI_DECISION_FAILED", roundId: "r1", error: "The ANTHROPIC_API_KEY was rejected." },
    )
    expect(state.phase).toBe("chatting")
    expect(state.yourDecision).toBeNull()
    expect(state.aiDecision).toBeNull()
    expect(state.error).toContain("rejected")
  })

  it("ignores responses from a replaced round", () => {
    const state = run(
      start(start(), "r2"),
      { type: "AI_REPLY", roundId: "r1", message: { sender: "AI", content: "stale", timestamp: 1 } },
      { type: "AI_DECIDED", roundId: "r1", decision: "KEEP" },
    )
    expect(state.messages).toHaveLength(1)
    expect(state.aiDecision).toBeNull()
  })

  it("keeps session history across rounds", () => {
    const played = run(
      start(),
      { type: "AI_DECIDED", roundId: "r1", decision: "SHARE" },
      { type: "HUMAN_DECIDED", roundId: "r1", decision: "SHARE" },
      { type: "REVEAL", roundId: "r1", date: "d" },
    )
    const next = start(played, "r2")
    expect(next.history).toHaveLength(1)
    expect(next.phase).toBe("chatting")
    expect(next.lastResult).toBeNull()
  })

  it("counts user messages and toggles aiThinking", () => {
    let state = run(start(), { type: "USER_MESSAGE", roundId: "r1", message: { sender: "YOU", content: "hi", timestamp: 1 } })
    expect(state.userMessageCount).toBe(1)
    expect(state.aiThinking).toBe(true)
    state = gameReducer(state, { type: "AI_REPLY_FAILED", roundId: "r1", error: "Couldn't reach Claude." })
    expect(state.aiThinking).toBe(false)
    expect(state.error).toBe("Couldn't reach Claude.")
  })

  it("blocks messages after the human decides", () => {
    const state = run(
      start(),
      { type: "HUMAN_DECIDED", roundId: "r1", decision: "KEEP" },
      { type: "USER_MESSAGE", roundId: "r1", message: { sender: "YOU", content: "wait", timestamp: 1 } },
    )
    expect(state.userMessageCount).toBe(0)
  })
})
