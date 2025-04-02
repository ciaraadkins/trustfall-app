import { type NextRequest, NextResponse } from "next/server"
import { getApiKey } from "@/lib/api-keys"

export async function POST(request: NextRequest) {
  try {
    // Get the Claude API key from Firebase
    const apiKey = await getApiKey("claude")

    if (!apiKey) {
      console.error("Claude API key not found in Firebase")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Get the request body
    const body = await request.json()

    // Forward the request to Claude API
    console.log("Proxying request to Claude API")
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    })

    // Get the response data
    const data = await response.json()

    // If the response is not ok, return an error
    if (!response.ok) {
      console.error("Error from Claude API:", data)
      return NextResponse.json({ error: "Error from Claude API", details: data }, { status: response.status })
    }

    // Return the response
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Claude API proxy:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

