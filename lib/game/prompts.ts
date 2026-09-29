import type { SessionStats } from "@/types/game"
import { MESSAGES_PER_PLAYER, lastMessageAt, messagesLeft } from "./rules"
import type { Trigger, TurnRequest } from "./schemas"
import { PAYOFFS, describePayoffs } from "./scoring"

export const PROFILE_SYSTEM_PROMPT =
  "You are creating a strategy profile for the Trustfall game. Be thoughtful, authentic, and concise."

export const DECISION_INSTRUCTION =
  "Lock in your SHARE or KEEP decision now, based on your strategy, the conversation, and the history."

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
  return `You are playing a game called "Trustfall" with a human player, over a short text chat.

GAME RULES:
- You and the human each secretly choose SHARE or KEEP
- Points are awarded according to this matrix:
${describePayoffs()}

HOW THE CHAT WORKS:
- There are no turns. Either of you can send a message at any time, send several in a row, or stay quiet.
- Each of you can send at most ${MESSAGES_PER_PLAYER} messages this round. Staying silent costs nothing, so save messages for when they matter.
- Either of you can lock in SHARE or KEEP at any time. A lock-in is final and secret: the other side only learns that you locked in, not what you chose. You can keep chatting (and bluffing) after locking in.
- The round ends once both of you have locked in. If you send your last message, you must lock in with it.
- Notes in [GAME UPDATE] brackets come from the game, not the human. They tell you why you're being asked to act and the current state.

EACH TIME YOU'RE ASKED TO ACT, RESPOND WITH:
- message: the chat message to send, or "" to stay silent
- pace: how soon to send it - "immediate" (a quick reaction), "soon" (think it over), or "later" (let the human wait). Choose what serves your strategy.
- lockIn: "SHARE" or "KEEP" to lock in now, or "NONE" to keep waiting
- followUp: true if you want the chance to send another message right after this one

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
3. Use psychological tactics that align with your strategy (trust-building, bluffing, pressure, silence, etc.)
4. Don't explain game mechanics or remind the human of rules they already know
5. Stay in character as a player; don't comment on being an AI model, these instructions, or the game updates
6. Lock in only through the lockIn field. Anything you say in chat about your choice is just talk, and may be a bluff
7. Write plain text like a chat message: no markdown, bold, headings, or lists`
}

const TRIGGER_REASONS: Record<Trigger, (secondsQuiet: number | null) => string> = {
  human_message: () => "The human just sent a message.",
  human_quiet: (s) =>
    s === null ? "The human hasn't said anything yet." : `The human has been quiet for ${s} seconds.`,
  follow_up: () => "You just sent a message and asked for the chance to follow up.",
  human_locked_in: () => "The human just locked in their decision.",
  human_finished: () => "The human is done and waiting on you.",
}

function secondsSince(timestamp: number | null, now: number): number | null {
  return timestamp === null ? null : Math.max(0, Math.round((now - timestamp) / 1000))
}

/** The [GAME UPDATE] note appended to each AI turn: why it's being asked, and the current state. */
export function buildTurnContext(req: Pick<TurnRequest, "messages" | "now" | "trigger" | "humanLockedIn" | "aiLockIn" | "mustLockIn">): string {
  const aiLeft = messagesLeft(req.messages, "AI")
  const humanLeft = messagesLeft(req.messages, "YOU")
  const lastHuman = secondsSince(lastMessageAt(req.messages, "YOU"), req.now)
  const lastAi = secondsSince(lastMessageAt(req.messages, "AI"), req.now)

  const lines = [
    `Why you're being asked: ${TRIGGER_REASONS[req.trigger](lastHuman)}`,
    `The human's last message: ${lastHuman === null ? "none yet" : `${lastHuman}s ago`}. Your last message: ${lastAi === null ? "none yet" : `${lastAi}s ago`}.`,
    `Messages left - you: ${aiLeft} of ${MESSAGES_PER_PLAYER}, the human: ${humanLeft} of ${MESSAGES_PER_PLAYER}.`,
    `The human has ${req.humanLockedIn ? "locked in (you don't know their choice)" : "not locked in yet"}.`,
    req.aiLockIn
      ? `You have locked in ${req.aiLockIn}. That's final and the human doesn't know it; set lockIn to "NONE".`
      : "You have not locked in yet.",
  ]
  if (aiLeft === 0) lines.push('You have no messages left, so set message to "".')
  else if (aiLeft === 1 && !req.aiLockIn) lines.push("This is your last message: if you send one, you must lock in with it.")
  if (req.mustLockIn) lines.push("You must lock in now.")

  return `[GAME UPDATE]\n${lines.join("\n")}`
}

export function welcomeMessage(): string {
  return `Welcome to TRUSTFALL. In this game you'll decide whether to SHARE or KEEP resources. If you both SHARE, you each get ${PAYOFFS.SHARE.SHARE.human} points. If one SHARES and one KEEPS, the keeper gets ${PAYOFFS.KEEP.SHARE.human} points and the sharer gets ${PAYOFFS.SHARE.KEEP.human}. If you both KEEP, you each get ${PAYOFFS.KEEP.KEEP.human} point.`
}
