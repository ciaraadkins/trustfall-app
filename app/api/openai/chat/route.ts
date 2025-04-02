import { type NextRequest, NextResponse } from "next/server"
import { getApiKey } from "@/lib/api-keys"

export async function POST(request: NextRequest) {
  try {
    // Get the OpenAI API key from Firebase
    const apiKey = await getApiKey("openai")

    if (!apiKey) {
      console.error("OpenAI API key not found in Firebase")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Get the request body
    const body = await request.json()

    // Forward the request to OpenAI API
    console.log("Proxying request to OpenAI API")
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    })

    // Get the response data
    const data = await response.json()

    // If the response is not ok, return an error
    if (!response.ok) {
      console.error("Error from OpenAI API:", data)
      return NextResponse.json({ error: "Error from OpenAI API", details: data }, { status: response.status })
    }

    // Return the response
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in OpenAI API proxy:", error)
    return NextResponse.json(
      { error: "Internal server error", message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
