import type { AIModel, Choice, Message, SessionStats } from "@/types/game"

type GamePayload = {
  model: AIModel
  roundId: string
  messages: Message[]
  sessionStats: SessionStats
}

async function post<T>(path: string, payload: GamePayload): Promise<T> {
  let response: Response
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        messages: payload.messages.map(({ sender, content }) => ({ sender, content })),
      }),
    })
  } catch {
    throw new Error("Network error. Check your connection and try again.")
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed (${response.status}).`)
  }
  return data as T
}

export async function requestReply(payload: GamePayload): Promise<string> {
  const { reply } = await post<{ reply: string }>("/api/game/message", payload)
  return reply
}

export async function requestDecision(payload: GamePayload): Promise<Choice> {
  const { decision } = await post<{ decision: Choice }>("/api/game/decide", payload)
  return decision
}
