import { NextResponse } from "next/server"
import { getApiKey } from "@/lib/api-keys"

export async function GET() {
  try {
    // Check if the Claude API key is configured
    const claudeApiKey = await getApiKey("claude")

    // Don't return the actual key, just whether it exists and its format
    const apiKeyInfo = claudeApiKey
      ? {
          exists: true,
          format: claudeApiKey.startsWith("sk-ant-") ? "valid" : "invalid",
          length: claudeApiKey.length,
          prefix: claudeApiKey.substring(0, 8),
          suffix: claudeApiKey.substring(claudeApiKey.length - 4),
        }
      : { exists: false }

    // Get server information
    const serverInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      timestamp: Date.now(),
      memoryUsage: process.memoryUsage(),
    }

    return NextResponse.json({
      status: "ok",
      timestamp: Date.now(),
      apiKeys: {
        claude: apiKeyInfo,
      },
      server: serverInfo,
      endpoints: {
        claudeProxy: "/api/claude/messages",
        health: "/api/health",
        debug: "/api/debug",
      },
    })
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

