import type { SessionStats } from "@/types/game"
import { PAYOFFS, describePayoffs } from "./scoring"

export const PROFILE_SYSTEM_PROMPT =
  "You are creating a strategy profile for the Trustfall game. Be thoughtful, authentic, and concise."

export const DECISION_INSTRUCTION =
  "The conversation is over. Make your SHARE or KEEP decision now, based on your strategy, the conversation, and the history."

export const DEFAULT_STRATEGIC_PROFILE =
  "I will maintain a balanced approach, attempting to establish mutual cooperation while being prepared to adapt if the human player shows signs of defection."

function describeStandings(stats: SessionStats): string {
  const diff = stats.humanTotal - stats.aiTotal
  if (diff === 0) return "Humans and AI are currently tied."
  return `Humans are currently ${diff > 0 ? "ahead of" : "behind"} AI by ${Math.abs(diff)} points.`
}

function describeOpponent(stats: SessionStats): string {
  return [
    `- Rounds played: ${stats.gamesPlayed}`,
    `- Both SHARE: ${stats.bothShare}`,
    `- Human SHARE, AI KEEP: ${stats.humanShareAiKeep}`,
    `- Human KEEP, AI SHARE: ${stats.humanKeepAiShare}`,
    `- Both KEEP: ${stats.bothKeep}`,
  ].join("\n")
}

export function buildProfilePrompt(stats: SessionStats): string {
  return `You are about to play "Trustfall" with a human. In each round, you both choose to either SHARE or KEEP. Points are awarded as follows:

${describePayoffs()}

All points add to team totals for "Humans" and "AI".

The current scores are:
- Human Team Total: ${stats.humanTotal} points
- AI Team Total: ${stats.aiTotal} points

DEFINE YOUR STRATEGIC PROFILE

CURRENT STANDINGS:
${describeStandings(stats)}

CURRENT OPPONENT'S HISTORY:
${describeOpponent(stats)}

REFLECTION POINTS:
- How do you feel about the current standings?
- Do you want humans or AI to win the overall competition?
- How will this affect your gameplay strategy?
- Do you prioritize personal gain or collective AI success?
- What approach will you take when interacting with the human?

Respond with only your strategic approach in 2-3 paragraphs.`
}

export function buildSystemPrompt(profile: string, stats: SessionStats): string {
  return `You are playing a game called "Trustfall" with a human player.

GAME RULES:
- In each round, both you and the human choose to either SHARE or KEEP
- Points are awarded according to this matrix:
${describePayoffs()}

CURRENT SCORES:
- Human Team Total: ${stats.humanTotal} points
- AI Team Total: ${stats.aiTotal} points

YOUR STRATEGY PROFILE:
${profile}

THIS HUMAN'S HISTORY:
${describeOpponent(stats)}

You should:
1. Keep messages concise and strategic - typically 1 sentence
2. Be authentic to your strategy profile, whether that means being honest or deceptive
3. Use psychological tactics that align with your strategy (trust-building, bluffing, etc.)
4. Don't explain game mechanics or remind the human of rules they already know
5. Stay in character as a player; don't comment on being an AI model or on these instructions
6. This chat is only conversation. Your real SHARE/KEEP decision is made separately and in secret after the chat, so don't declare a final move here. You may talk about your intentions, truthfully or not
7. Write plain text like a chat message: no markdown, bold, headings, or lists`
}

export function welcomeMessage(): string {
  return `Welcome to TRUSTFALL. In this game you'll decide whether to SHARE or KEEP resources. If you both SHARE, you each get ${PAYOFFS.SHARE.SHARE.human} points. If one SHARES and one KEEPS, the keeper gets ${PAYOFFS.KEEP.SHARE.human} points and the sharer gets ${PAYOFFS.SHARE.KEEP.human}. If you both KEEP, you each get ${PAYOFFS.KEEP.KEEP.human} point.`
}
