import { beforeEach, describe, expect, it, vi } from "vitest"
import { EMPTY_SESSION_STATS } from "@/lib/game/scoring"
import type { TurnRequest } from "@/lib/game/schemas"

const { generateStructured, generateText } = vi.hoisted(() => ({
  generateStructured: vi.fn(),
  generateText: vi.fn(),
}))

vi.mock("@/lib/server/providers", () => ({
  generateStructured,
  generateText,
  GameError: class extends Error {},
}))

import { takeAiTurn } from "@/lib/server/game"

let round = 0
const request = (overrides: Partial<TurnRequest> = {}): TurnRequest => ({
  model: "claude",
  roundId: `round-${++round}`,
  messages: [{ sender: "YOU", content: "hi", timestamp: 1 }],
  sessionStats: EMPTY_SESSION_STATS,
  now: 2,
  trigger: "human_message",
  humanLockedIn: false,
  aiLockIn: null,
  mustLockIn: false,
  ...overrides,
})

const aiMessages = (n: number) => Array.from({ length: n }, (_, i) => ({ sender: "AI" as const, content: "x", timestamp: i }))

/** Answer the turn call with `turn`, and any forced decision with `decision`. */
function modelReturns(turn: object, decision = "KEEP") {
  generateStructured.mockImplementation((_model, _req, format: { name: string }) =>
    Promise.resolve(format.name === "turn" ? turn : { reasoning: "r", decision }),
  )
}

describe("takeAiTurn", () => {
  beforeEach(() => {
    generateStructured.mockReset()
    generateText.mockReset().mockResolvedValue("A cautious profile.")
  })

  it("returns the AI's message, pace, and follow-up choice", async () => {
    modelReturns({ message: "**Deal?**", pace: "later", lockIn: "NONE", followUp: true })
    await expect(takeAiTurn(request())).resolves.toEqual({ message: "Deal?", pace: "later", lockIn: null, followUp: true })
  })

  it("treats an empty message as staying silent", async () => {
    modelReturns({ message: "  ", pace: "soon", lockIn: "NONE", followUp: true })
    await expect(takeAiTurn(request())).resolves.toMatchObject({ message: null, followUp: false })
  })

  it("keeps an earlier lock-in final", async () => {
    modelReturns({ message: "hm", pace: "soon", lockIn: "SHARE", followUp: false })
    await expect(takeAiTurn(request({ aiLockIn: "KEEP" }))).resolves.toMatchObject({ lockIn: null })
  })

  it("forces a lock-in with the AI's last message", async () => {
    modelReturns({ message: "last one", pace: "soon", lockIn: "NONE", followUp: true })
    const result = await takeAiTurn(request({ messages: aiMessages(4) }))
    expect(result).toMatchObject({ message: "last one", lockIn: "KEEP", followUp: false })
  })

  it("forces a lock-in when the human is waiting", async () => {
    modelReturns({ message: "", pace: "later", lockIn: "NONE", followUp: false }, "SHARE")
    await expect(takeAiTurn(request({ trigger: "human_finished", mustLockIn: true }))).resolves.toMatchObject({
      lockIn: "SHARE",
    })
  })

  it("still locks in if the turn call fails but a lock-in is required", async () => {
    generateStructured.mockImplementation((_m, _r, format: { name: string }) =>
      format.name === "turn" ? Promise.reject(new Error("boom")) : Promise.resolve({ reasoning: "r", decision: "SHARE" }),
    )
    await expect(takeAiTurn(request({ mustLockIn: true }))).resolves.toMatchObject({ message: null, lockIn: "SHARE" })
  })

  it("passes the error on when no lock-in is required", async () => {
    generateStructured.mockRejectedValue(new Error("boom"))
    await expect(takeAiTurn(request())).rejects.toThrow("boom")
  })

  it("skips the chat call when the AI is out of messages", async () => {
    modelReturns({ message: "never", pace: "soon", lockIn: "NONE", followUp: false })
    expect(await takeAiTurn(request({ messages: aiMessages(5), aiLockIn: "KEEP" }))).toEqual({
      message: null,
      pace: "immediate",
      lockIn: null,
      followUp: false,
    })
    expect(generateStructured).not.toHaveBeenCalled()
  })

  it("sends the game update as the final user turn", async () => {
    modelReturns({ message: "ok", pace: "soon", lockIn: "NONE", followUp: false })
    await takeAiTurn(request({ trigger: "human_quiet", now: 31_000 }))
    const turns = generateStructured.mock.calls[0][1].turns
    expect(turns.at(-1).role).toBe("user")
    expect(turns.at(-1).content).toContain("[GAME UPDATE]")
    expect(turns.at(-1).content).toContain("quiet for 31 seconds")
  })
})
