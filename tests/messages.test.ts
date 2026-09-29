import { describe, expect, it } from "vitest"
import { stripMarkdown, toChatTurns } from "@/lib/game/messages"

describe("toChatTurns", () => {
  it("drops SYSTEM messages instead of sending them as assistant turns", () => {
    const turns = toChatTurns([
      { sender: "SYSTEM", content: "Welcome to TRUSTFALL." },
      { sender: "YOU", content: "Hello" },
      { sender: "AI", content: "Hi there." },
    ])
    expect(turns).toEqual([
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi there." },
    ])
  })

  it("merges consecutive same-role turns", () => {
    const turns = toChatTurns([
      { sender: "YOU", content: "one" },
      { sender: "YOU", content: "two" },
      { sender: "AI", content: "reply" },
    ])
    expect(turns).toEqual([
      { role: "user", content: "one\n\ntwo" },
      { role: "assistant", content: "reply" },
    ])
  })

  it("starts with a user turn when the AI spoke first", () => {
    const turns = toChatTurns([{ sender: "AI", content: "I'll go first." }])
    expect(turns[0].role).toBe("user")
    expect(turns[1]).toEqual({ role: "assistant", content: "I'll go first." })
  })

  it("appends the final instruction, merging into a trailing user turn", () => {
    expect(toChatTurns([{ sender: "AI", content: "a" }, { sender: "YOU", content: "b" }], "Decide.")).toEqual([
      { role: "user", content: "(The human has joined the game.)" },
      { role: "assistant", content: "a" },
      { role: "user", content: "b\n\nDecide." },
    ])
    expect(toChatTurns([{ sender: "YOU", content: "b" }, { sender: "AI", content: "a" }], "Decide.").at(-1)).toEqual({
      role: "user",
      content: "Decide.",
    })
  })

  it("skips blank messages", () => {
    expect(toChatTurns([{ sender: "YOU", content: "  " }, { sender: "YOU", content: "real" }])).toEqual([
      { role: "user", content: "real" },
    ])
  })
})

describe("stripMarkdown", () => {
  it("removes bold, italic, and code markers", () => {
    expect(stripMarkdown("we both come out ahead. **SHARE**")).toBe("we both come out ahead. SHARE")
    expect(stripMarkdown("I *really* mean it, __trust__ me")).toBe("I really mean it, trust me")
    expect(stripMarkdown("say `KEEP`")).toBe("say KEEP")
  })

  it("leaves ordinary asterisks and text alone", () => {
    expect(stripMarkdown("5 * 3 points")).toBe("5 * 3 points")
    expect(stripMarkdown("Let's both SHARE.")).toBe("Let's both SHARE.")
  })
})
