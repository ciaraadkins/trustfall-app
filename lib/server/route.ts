import "server-only"

import { NextResponse } from "next/server"
import { gameRequestSchema, type GameRequest } from "@/lib/game/schemas"
import { GameError } from "./providers"

/** Validate a game request body, run the handler, and map errors to JSON responses. */
export async function handleGameRequest<T>(request: Request, handler: (req: GameRequest) => Promise<T>) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Request body must be JSON." }, { status: 400 })
  }

  const parsed = gameRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request.", issues: parsed.error.issues }, { status: 400 })
  }

  try {
    return NextResponse.json(await handler(parsed.data))
  } catch (error) {
    if (error instanceof GameError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error("Unexpected game route error", error)
    return NextResponse.json({ error: "Something went wrong on the server." }, { status: 500 })
  }
}
