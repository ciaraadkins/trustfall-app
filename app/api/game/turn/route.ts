import { takeAiTurn } from "@/lib/server/game"
import { handleGameRequest } from "@/lib/server/route"

export async function POST(request: Request) {
  return handleGameRequest(request, takeAiTurn)
}
