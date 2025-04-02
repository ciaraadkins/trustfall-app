import { NextResponse } from "next/server"
import { getApiKey } from "@/lib/api-keys"

export async function GET() {
  try {
    // Check if the Claude API key is configured
    const claudeApiKey = await getApiKey("claude")

    if (!claudeApiKey) {
      return NextResponse.json(
        {
          status: "error",
          message: "Claude API key not found in Firebase",
          timestamp: Date.now(),
        },
        { status: 500 },
      )
    }

    // Check if the API key has the correct format
    if (!claudeApiKey.startsWith("sk-ant-")) {
      return NextResponse.json(
        {
          status: "error",
          message: "Claude API key has invalid format",
          timestamp: Date.now(),
        },
        { status: 500 },
      )
    }

    // Make a simple request to the Claude API to verify the key works
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": claudeApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-7-sonnet-20250219",
          max_tokens: 10,
          messages: [{ role: "user", content: "Say hello" }],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        return NextResponse.json(
          {
            status: "error",
            message: `Claude API error: ${JSON.stringify(errorData)}`,
            timestamp: Date.now(),
          },
          { status: 500 },
        )
      }

      return NextResponse.json({
        status: "ok",
        message: "Claude API is working correctly",
        timestamp: Date.now(),
      })
    } catch (error) {
      return NextResponse.json(
        {
          status: "error",
          message: `Error testing Claude API: ${error instanceof Error ? error.message : String(error)}`,
          timestamp: Date.now(),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : String(error),
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}

