import { describe, expect, it } from "vitest"
import { gameRequestSchema, parseDecision } from "@/lib/game/schemas"
import { EMPTY_SESSION_STATS } from "@/lib/game/scoring"

describe("parseDecision", () => {
  it("parses a valid structured decision", () => {
    expect(parseDecision('{"reasoning":"They seem honest.","decision":"SHARE"}')).toEqual({
      reasoning: "They seem honest.",
      decision: "SHARE",
    })
  })

  it("does not treat a negated SHARE as SHARE", () => {
    // The old substring check read "I won't SHARE — KEEP" as SHARE.
    expect(parseDecision('{"reasoning":"I won\'t SHARE this time.","decision":"KEEP"}').decision).toBe("KEEP")
  })

  it("rejects non-JSON text", () => {
    expect(() => parseDecision("KEEP")).toThrow("not valid JSON")
  })

  it("rejects decisions outside SHARE/KEEP", () => {
    expect(() => parseDecision('{"reasoning":"x","decision":"share"}')).toThrow()
    expect(() => parseDecision('{"reasoning":"x","decision":"MAYBE"}')).toThrow()
  })

  it("rejects a missing decision", () => {
    expect(() => parseDecision('{"reasoning":"x"}')).toThrow()
  })
})

describe("gameRequestSchema", () => {
  const valid = {
    model: "claude",
    roundId: "round-1",
    messages: [{ sender: "YOU", content: "hi" }],
    sessionStats: EMPTY_SESSION_STATS,
  }

  it("accepts a valid request", () => {
    expect(gameRequestSchema.safeParse(valid).success).toBe(true)
  })

  it("rejects models that aren't built yet", () => {
    expect(gameRequestSchema.safeParse({ ...valid, model: "gemini" }).success).toBe(false)
  })

  it("rejects unknown senders and oversized messages", () => {
    expect(gameRequestSchema.safeParse({ ...valid, messages: [{ sender: "CLAUDE", content: "x" }] }).success).toBe(false)
    expect(
      gameRequestSchema.safeParse({ ...valid, messages: [{ sender: "YOU", content: "x".repeat(2001) }] }).success,
    ).toBe(false)
  })

  it("rejects negative or fractional stats", () => {
    expect(gameRequestSchema.safeParse({ ...valid, sessionStats: { ...EMPTY_SESSION_STATS, humanTotal: -1 } }).success).toBe(false)
    expect(gameRequestSchema.safeParse({ ...valid, sessionStats: { ...EMPTY_SESSION_STATS, bothKeep: 1.5 } }).success).toBe(false)
  })
})
