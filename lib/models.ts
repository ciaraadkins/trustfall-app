import type { AIModel } from "@/types/game"

export type Provider = "anthropic" | "openai"

export type ModelConfig = {
  id: AIModel
  provider: Provider
  /** Default provider model ID; override with `envVar` on the server. */
  apiModel: string
  envVar: string
  displayName: string
  description: string
  maxTokens: { chat: number; decision: number }
}

export const MODELS: Record<AIModel, ModelConfig> = {
  claude: {
    id: "claude",
    provider: "anthropic",
    apiModel: "claude-sonnet-5-5",
    envVar: "CLAUDE_MODEL",
    displayName: "CLAUDE",
    description: "Anthropic's helpful, harmless, and honest AI assistant.",
    // Thinking is turned off for Claude chat turns, so these budgets are output only.
    maxTokens: { chat: 150, decision: 300 },
  },
  openai: {
    id: "openai",
    provider: "openai",
    apiModel: "gpt-6-sol",
    envVar: "OPENAI_MODEL",
    displayName: "CHATGPT",
    description: "OpenAI's versatile language model with broad knowledge.",
    // Reasoning tokens count against max_output_tokens, so leave headroom beyond the 1-sentence reply.
    maxTokens: { chat: 1000, decision: 1000 },
  },
}

export const MODEL_IDS = Object.keys(MODELS) as AIModel[]

export const DEFAULT_MODEL: AIModel = "claude"

export function isAIModel(value: unknown): value is AIModel {
  return typeof value === "string" && value in MODELS
}

/** Server-side: the provider model ID, honoring env overrides. */
export function resolveApiModel(id: AIModel): string {
  const config = MODELS[id]
  return process.env[config.envVar]?.trim() || config.apiModel
}
