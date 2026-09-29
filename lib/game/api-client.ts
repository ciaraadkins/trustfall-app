import type { TurnRequest, TurnResponse } from "./schemas"

export async function requestTurn(payload: TurnRequest, signal?: AbortSignal): Promise<TurnResponse> {
  let response: Response
  try {
    response = await fetch("/api/game/turn", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    })
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error
    throw new Error("Network error. Check your connection and try again.")
  }

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(data?.error ?? `Request failed (${response.status}).`)
  }
  return data as TurnResponse
}
