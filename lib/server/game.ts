import "server-only"

import { MODELS } from "@/lib/models"
import { stripMarkdown, toChatTurns } from "@/lib/game/messages"
import {
  DECISION_INSTRUCTION,
  DEFAULT_STRATEGIC_PROFILE,
  PROFILE_SYSTEM_PROMPT,
  buildProfilePrompt,
  buildSystemPrompt,
} from "@/lib/game/prompts"
import type { GameRequest } from "@/lib/game/schemas"
import type { Choice } from "@/types/game"
import { generateDecision, generateText } from "./providers"

const PROFILE_MAX_TOKENS = 600
const PROFILE_TTL_MS = 60 * 60 * 1000
const PROFILE_CACHE_LIMIT = 500

/**
 * Strategic profiles, generated once per round and kept in server memory.
 * Stage 1 only: a restart or a second server instance just regenerates one.
 */
const profiles = new Map<string, { profile: Promise<string>; createdAt: number }>()

function getProfile(req: GameRequest): Promise<string> {
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

async function systemPromptFor(req: GameRequest): Promise<string> {
  let profile: string
  try {
    profile = await getProfile(req)
  } catch (error) {
    console.error(`[${req.model}] strategic profile failed, using default`, error)
    profile = DEFAULT_STRATEGIC_PROFILE
  }
  return buildSystemPrompt(profile, req.sessionStats)
}

export async function replyToPlayer(req: GameRequest): Promise<string> {
  const reply = await generateText(req.model, {
    system: await systemPromptFor(req),
    turns: toChatTurns(req.messages),
    maxTokens: MODELS[req.model].maxTokens.chat,
  })
  return stripMarkdown(reply)
}

export async function decideForAI(req: GameRequest): Promise<Choice> {
  const { decision } = await generateDecision(req.model, {
    system: await systemPromptFor(req),
    turns: toChatTurns(req.messages, DECISION_INSTRUCTION),
    maxTokens: MODELS[req.model].maxTokens.decision,
  })
  return decision
}
