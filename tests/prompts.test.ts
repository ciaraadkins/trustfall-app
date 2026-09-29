import { describe, expect, it } from "vitest"
import { buildProfilePrompt, buildSystemPrompt, welcomeMessage } from "@/lib/game/prompts"
import { EMPTY_SESSION_STATS } from "@/lib/game/scoring"

const stats = {
  ...EMPTY_SESSION_STATS,
  humanTotal: 12,
  aiTotal: 20,
  gamesPlayed: 4,
  bothShare: 2,
  humanShareAiKeep: 1,
  bothKeep: 1,
}

describe("buildProfilePrompt", () => {
  it("uses the real session values, not placeholders", () => {
    const prompt = buildProfilePrompt(stats)
    expect(prompt).toContain("Human Team Total: 12 points")
    expect(prompt).toContain("AI Team Total: 20 points")
    expect(prompt).toContain("Humans are currently behind AI by 8 points.")
    expect(prompt).toContain("- Rounds played: 4")
    expect(prompt).not.toContain("cmoney")
  })

  it("describes a tie", () => {
    expect(buildProfilePrompt(EMPTY_SESSION_STATS)).toContain("Humans and AI are currently tied.")
  })

  it("includes the payoff matrix", () => {
    expect(buildProfilePrompt(stats)).toContain("- Human SHARE, AI KEEP: Human +0, AI +5")
  })
})

describe("buildSystemPrompt", () => {
  it("includes the profile and the session stats", () => {
    const prompt = buildSystemPrompt("Be a cunning negotiator.", stats)
    expect(prompt).toContain("Be a cunning negotiator.")
    expect(prompt).toContain("Human Team Total: 12 points")
    expect(prompt).toContain("- Both SHARE: 2")
    expect(prompt).toContain('"Trustfall"')
    expect(prompt).not.toContain("Coexist or Conquer")
  })
})

describe("welcomeMessage", () => {
  it("states the payoffs", () => {
    expect(welcomeMessage()).toContain("you each get 3 points")
    expect(welcomeMessage()).toContain("the keeper gets 5 points and the sharer gets 0")
  })
})

describe("chat rules", () => {
  it("tells the model the decision is secret and to write plain text", () => {
    const prompt = buildSystemPrompt("p", stats)
    expect(prompt).toContain("made separately and in secret")
    expect(prompt).toContain("no markdown")
  })
})
