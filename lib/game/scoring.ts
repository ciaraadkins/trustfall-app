import type { Choice, RoundResult, SessionStats } from "@/types/game"

/** Points for each outcome, indexed by human choice then AI choice. */
export const PAYOFFS: Record<Choice, Record<Choice, { human: number; ai: number }>> = {
  SHARE: {
    SHARE: { human: 3, ai: 3 },
    KEEP: { human: 0, ai: 5 },
  },
  KEEP: {
    SHARE: { human: 5, ai: 0 },
    KEEP: { human: 1, ai: 1 },
  },
}

export function scoreRound(human: Choice, ai: Choice): { yourPoints: number; aiPoints: number } {
  const payoff = PAYOFFS[human][ai]
  return { yourPoints: payoff.human, aiPoints: payoff.ai }
}

export function formatPoints(points: number): string {
  return `+${points} ${points === 1 ? "POINT" : "POINTS"}`
}

/** Plain-text payoff matrix, used in prompts and the welcome message. */
export function describePayoffs(): string {
  return [
    `- Both SHARE: Human +${PAYOFFS.SHARE.SHARE.human}, AI +${PAYOFFS.SHARE.SHARE.ai}`,
    `- Human SHARE, AI KEEP: Human +${PAYOFFS.SHARE.KEEP.human}, AI +${PAYOFFS.SHARE.KEEP.ai}`,
    `- Human KEEP, AI SHARE: Human +${PAYOFFS.KEEP.SHARE.human}, AI +${PAYOFFS.KEEP.SHARE.ai}`,
    `- Both KEEP: Human +${PAYOFFS.KEEP.KEEP.human}, AI +${PAYOFFS.KEEP.KEEP.ai}`,
  ].join("\n")
}

export const EMPTY_SESSION_STATS: SessionStats = {
  humanTotal: 0,
  aiTotal: 0,
  gamesPlayed: 0,
  bothShare: 0,
  humanShareAiKeep: 0,
  humanKeepAiShare: 0,
  bothKeep: 0,
}

export function computeSessionStats(history: RoundResult[]): SessionStats {
  return history.reduce<SessionStats>(
    (stats, r) => ({
      humanTotal: stats.humanTotal + r.yourPoints,
      aiTotal: stats.aiTotal + r.aiPoints,
      gamesPlayed: stats.gamesPlayed + 1,
      bothShare: stats.bothShare + (r.yourDecision === "SHARE" && r.aiDecision === "SHARE" ? 1 : 0),
      humanShareAiKeep: stats.humanShareAiKeep + (r.yourDecision === "SHARE" && r.aiDecision === "KEEP" ? 1 : 0),
      humanKeepAiShare: stats.humanKeepAiShare + (r.yourDecision === "KEEP" && r.aiDecision === "SHARE" ? 1 : 0),
      bothKeep: stats.bothKeep + (r.yourDecision === "KEEP" && r.aiDecision === "KEEP" ? 1 : 0),
    }),
    EMPTY_SESSION_STATS,
  )
}
