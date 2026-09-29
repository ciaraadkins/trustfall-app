import "server-only"

import { MODELS } from "@/lib/models"
import { stripMarkdown, toChatTurns } from "@/lib/game/messages"
import {
  DECISION_INSTRUCTION,
  DEFAULT_STRATEGIC_PROFILE,
  PROFILE_SYSTEM_PROMPT,
  buildProfilePrompt,
  buildSystemPrompt,
  buildTurnContext,
} from "@/lib/game/prompts"
import { messagesLeft } from "@/lib/game/rules"
import {
  DECISION_JSON_SCHEMA,
  TURN_JSON_SCHEMA,
  parseDecision,
  parseTurn,
  type TurnRequest,
  type TurnResponse,
} from "@/lib/game/schemas"
import type { Choice, Message } from "@/types/game"
import { generateStructured, generateText } from "./providers"

const PROFILE_MAX_TOKENS = 600
const PROFILE_TTL_MS = 60 * 60 * 1000
const PROFILE_CACHE_LIMIT = 500

/**
 * Strategic profiles, generated once per round and kept in server memory.
 * Stage 1 only: a restart or a second server instance just regenerates one.
 */
const profiles = new Map<string, { profile: Promise<string>; createdAt: number }>()

function getProfile(req: TurnRequest): Promise<string> {
  const key = `${req.model}:${req.roundId}`
  const cached = profiles.get(key)
  if (cached && Date.now() - cached.createdAt < PROFILE_TTL_MS) return cached.profile

  const profile = generateText(req.model, {
    system: PROFILE_SYSTEM_PROMPT,
    turns: [{ role: "user", content: buildProfilePrompt(req.sessionStats) }],
    maxTokens: PROFILE_MAX_TOKENS,
  }).catch((error) => {
    // Don't cache a failure; the next request will try again.
    profiles.delete(key)
    throw error
  })

  profiles.set(key, { profile, createdAt: Date.now() })
  if (profiles.size > PROFILE_CACHE_LIMIT) {
    const oldest = profiles.keys().next().value
    if (oldest) profiles.delete(oldest)
  }
  return profile
}

async function systemPromptFor(req: TurnRequest): Promise<string> {
  let profile: string
  try {
    profile = await getProfile(req)
  } catch (error) {
    console.error(`[${req.model}] strategic profile failed, using default`, error)
    profile = DEFAULT_STRATEGIC_PROFILE
  }
  return buildSystemPrompt(profile, req.sessionStats)
}

async function decide(req: TurnRequest, system: string, messages: Pick<Message, "sender" | "content">[]): Promise<Choice> {
  const { decision } = await generateStructured(
    req.model,
    {
      system,
      turns: toChatTurns(messages, `${buildTurnContext({ ...req, mustLockIn: true })}\n\n${DECISION_INSTRUCTION}`),
      maxTokens: MODELS[req.model].maxTokens.decision,
    },
    { name: "decision", schema: DECISION_JSON_SCHEMA },
    parseDecision,
  )
  return decision
}

/**
 * One AI turn: the model chooses whether to speak, how soon, and whether to
 * lock in. The budget and lock-in rules are enforced here, whatever the model says.
 */
export async function takeAiTurn(req: TurnRequest): Promise<TurnResponse> {
  const system = await systemPromptFor(req)
  const aiLeft = messagesLeft(req.messages, "AI")

  // Out of messages: the only thing left to do is lock in.
  if (aiLeft === 0) {
    if (req.aiLockIn) return { message: null, pace: "immediate", lockIn: null, followUp: false }
    return { message: null, pace: "immediate", lockIn: await decide(req, system, req.messages), followUp: false }
  }

  let output
  try {
    output = await generateStructured(
      req.model,
      {
        system,
        turns: toChatTurns(req.messages, buildTurnContext(req)),
        maxTokens: MODELS[req.model].maxTokens.turn,
      },
      { name: "turn", schema: TURN_JSON_SCHEMA },
      parseTurn,
    )
  } catch (error) {
    // A required lock-in still has to happen, even if the chat turn failed.
    if (req.mustLockIn && !req.aiLockIn) {
      return { message: null, pace: "immediate", lockIn: await decide(req, system, req.messages), followUp: false }
    }
    throw error
  }

  const message = stripMarkdown(output.message).slice(0, 2000) || null
  let lockIn: Choice | null = req.aiLockIn || output.lockIn === "NONE" ? null : output.lockIn

  // The AI's last message, or a turn the human is waiting on, must come with a lock-in.
  const mustLock = !req.aiLockIn && (req.mustLockIn || (message !== null && aiLeft === 1))
  if (mustLock && !lockIn) {
    const withMessage = message ? [...req.messages, { sender: "AI" as const, content: message }] : req.messages
    lockIn = await decide(req, system, withMessage)
  }

  return {
    message,
    pace: output.pace,
    lockIn,
    followUp: output.followUp && message !== null && aiLeft > 1,
  }
}
