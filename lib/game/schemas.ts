import { z } from "zod"
import { MODEL_IDS } from "@/lib/models"
import type { AIModel } from "@/types/game"

const count = z.number().int().min(0).max(1_000_000_000)

const sessionStatsSchema = z.object({
  humanTotal: count,
  aiTotal: count,
  gamesPlayed: count,
  bothShare: count,
  humanShareAiKeep: count,
  humanKeepAiShare: count,
  bothKeep: count,
})

export const gameRequestSchema = z.object({
  model: z.enum(MODEL_IDS as [AIModel, ...AIModel[]]),
  roundId: z.string().min(1).max(100),
  messages: z
    .array(
      z.object({
        sender: z.enum(["SYSTEM", "YOU", "AI"]),
        content: z.string().max(2000),
      }),
    )
    .max(100),
  sessionStats: sessionStatsSchema,
})

export type GameRequest = z.infer<typeof gameRequestSchema>

const decisionSchema = z.object({
  reasoning: z.string(),
  decision: z.enum(["SHARE", "KEEP"]),
})

export type DecisionOutput = z.infer<typeof decisionSchema>

/** JSON Schema sent to the providers for structured decision output. */
export const DECISION_JSON_SCHEMA = {
  type: "object",
  properties: {
    reasoning: { type: "string", description: "One or two sentences on why." },
    decision: { type: "string", enum: ["SHARE", "KEEP"] },
  },
  required: ["reasoning", "decision"],
  additionalProperties: false,
} as const

/** Parse a provider's structured decision text. Throws if it isn't valid. */
export function parseDecision(text: string): DecisionOutput {
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error("Decision was not valid JSON")
  }
  return decisionSchema.parse(json)
}
