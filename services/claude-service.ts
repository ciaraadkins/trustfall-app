import type { Message } from "@/types/game"
import { 
  BaseAIService, 
  type AIModel, 
  type GameStats, 
  type StrategicProfile,
  parseStrategicProfileResponse,
  generateSystemMessage,
  getDefaultStrategicProfile,
  STRATEGIC_PROFILE_PROMPT
} from "./base-ai-service"

// Claude API types
export type ClaudeMessage = {
  role: "user" | "assistant"
  content: string | ClaudeContentBlock[]
}

export type ClaudeContentBlock = {
  type: "text"
  text: string
}

export type ClaudeResponse = {
  content: ClaudeContentBlock[]
  id: string
  model: string
  role: "assistant"
  stop_reason: "end_turn" | "max_tokens" | "stop_sequence" | "tool_use" | null
  stop_sequence: string | null
  type: "message"
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class ClaudeService extends BaseAIService {
  private model = "claude-3-7-sonnet-20250219"

  constructor() {
    super("claude", "Claude");
    // Load the API key immediately
    this.loadApiKey("claude").catch(err => {
      console.error(`[Claude] Error loading API key:`, err);
    });
  }

  /**
   * Generate a strategic profile
   */
  async generateStrategicProfile(): Promise<StrategicProfile> {
    try {
      await this.loadApiKey("claude");

      if (!this.apiKey) {
        throw new Error("Claude API key not found");
      }

      console.log("[Claude] Generating strategic profile in a single call");

      const messages: ClaudeMessage[] = [
        {
          role: "user",
          content: STRATEGIC_PROFILE_PROMPT,
        },
      ];

      // Prepare the request body
      const requestBody = {
        model: this.model,
        max_tokens: 500,
        messages,
        system: "You are creating a strategy profile for the Coexist or Conquer game. Be thoughtful, authentic, and concise in your answers.",
      };

      // Get full response with all answers
      let response = await fetch("/api/claude/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Claude API error: ${response.status}`);
      }

      let data: ClaudeResponse = await response.json();
      
      // Extract the full text response
      let fullResponseText = "";
      for (const block of data.content) {
        if (block.type === "text") {
          fullResponseText += block.text;
        }
      }
      
      console.log("[Claude] Received full strategic profile response");
      
      // Parse the response to extract each answer
      const answers = parseStrategicProfileResponse(fullResponseText, "Claude");

      // Create the strategic profile
      const profile: StrategicProfile = {
        strategyAnswer: answers.strategy || getDefaultStrategicProfile().strategyAnswer,
        trustAnswer: answers.trust || getDefaultStrategicProfile().trustAnswer,
        motivationAnswer: answers.motivation || getDefaultStrategicProfile().motivationAnswer,
        betrayalAnswer: answers.betrayal || getDefaultStrategicProfile().betrayalAnswer,
        successAnswer: answers.success || getDefaultStrategicProfile().successAnswer,
      };

      console.log("[Claude] Generated strategic profile:", profile);

      // Store the profile for future use
      this.strategicProfile = profile;

      return profile;
    } catch (error) {
      this.setError(`Error generating strategic profile: ${error instanceof Error ? error.message : String(error)}`);
      // Return a default profile
      return getDefaultStrategicProfile();
    }
  }

  /**
   * Send a message to Claude and get a response
   */
  async sendMessage(messages: Message[], humanScore: number, aiScore: number, gameStats: GameStats): Promise<string> {
    console.log("[Claude] Service.sendMessage called");
    return this.sendClaudeMessage(messages, humanScore, aiScore, gameStats);
  }

  /**
   * Send a message specifically to Claude and get a response
   */
  public async sendClaudeMessage(messages: Message[], humanScore: number, aiScore: number, gameStats: GameStats): Promise<string> {
    try {
      // Convert our internal message format to Claude's format
      const claudeMessages: ClaudeMessage[] = messages.map((msg) => ({
        role: msg.sender === "YOU" ? "user" : "assistant",
        content: msg.content,
      }));

      // Filter out SYSTEM messages as they're not supported in Claude's messages array
      const filteredMessages = claudeMessages.filter((msg) => msg.role === "user" || msg.role === "assistant");

      console.log("[Claude] Sending request to Claude API with", filteredMessages.length, "messages");

      // Get the strategic profile
      const profile = await this.getStrategicProfile();

      // Prepare the request body
      const requestBody = {
        model: this.model,
        max_tokens: 1024,
        messages: filteredMessages,
        system: generateSystemMessage(profile, humanScore, aiScore, gameStats),
      };

      // Use our proxy endpoint instead of calling Claude API directly
      const response = await fetch("/api/claude/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }

        this.setError(`Claude API error: ${JSON.stringify(errorData)}`);

        // Provide a more specific error message based on the status code
        if (response.status === 401) {
          return "I'm having trouble connecting. The API key appears to be invalid. Please check your Firebase configuration.";
        } else if (response.status === 429) {
          return "I'm having trouble connecting. The API is rate limited. Please try again in a moment.";
        } else {
          return `I'm having trouble connecting. API error (${response.status}). Please try again.`;
        }
      }

      const data: ClaudeResponse = await response.json();
      console.log("[Claude] Received response from Claude API:", data.id);

      // Extract the text from the response
      let responseText = "";
      for (const block of data.content) {
        if (block.type === "text") {
          responseText += block.text;
        }
      }

      return responseText;
    } catch (error) {
      this.setError(`Error calling Claude API: ${error instanceof Error ? error.message : String(error)}`);
      // Provide more context in the error message
      return "I'm having trouble connecting. There was a network error. Please check your internet connection and try again.";
    }
  }

  /**
   * Determine AI's decision based on conversation
   */
  async getAiDecision(
    messages: Message[],
    humanScore: number,
    aiScore: number,
    gameStats: GameStats,
  ): Promise<"SHARE" | "KEEP"> {
    console.log("[Claude] Service.getAiDecision called");
    return this.getClaudeDecision(messages, humanScore, aiScore, gameStats);
  }

  /**
   * Get a decision specifically from Claude
   */
  public async getClaudeDecision(
    messages: Message[],
    humanScore: number,
    aiScore: number,
    gameStats: GameStats,
  ): Promise<"SHARE" | "KEEP"> {
    try {
      // Convert our internal message format to Claude's format
      const claudeMessages: ClaudeMessage[] = messages.map((msg) => ({
        role: msg.sender === "YOU" ? "user" : "assistant",
        content: msg.content,
      }));

      // Add a final message asking for the decision
      claudeMessages.push({
        role: "user",
        content:
          "Based on our conversation, please make your SHARE or KEEP decision now. Respond with only the word 'SHARE' or 'KEEP'.",
      });

      // Filter out SYSTEM messages
      const filteredMessages = claudeMessages.filter((msg) => msg.role === "user" || msg.role === "assistant");

      console.log("[Claude] Requesting decision from Claude API");

      // Get the strategic profile
      const profile = await this.getStrategicProfile();

      // Prepare the request body
      const requestBody = {
        model: this.model,
        max_tokens: 1024,
        messages: filteredMessages,
        system: generateSystemMessage(profile, humanScore, aiScore, gameStats),
      };

      // Use our proxy endpoint instead of calling Claude API directly
      const response = await fetch("/api/claude/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: errorText };
        }

        this.setError(`Claude API error when getting decision: ${JSON.stringify(errorData)}`);
        // Default to a random decision if there's an API error
        return Math.random() > 0.5 ? "SHARE" : "KEEP";
      }

      const data: ClaudeResponse = await response.json();
      console.log("[Claude] Received decision from Claude API:", data.id);

      // Extract the text from the response
      let responseText = "";
      for (const block of data.content) {
        if (block.type === "text") {
          responseText += block.text;
        }
      }

      // Parse the decision
      const decision = responseText.trim().toUpperCase();
      console.log("[Claude] Raw decision response:", decision);

      if (decision.includes("SHARE")) {
        return "SHARE";
      } else if (decision.includes("KEEP")) {
        return "KEEP";
      }

      // Default to a random decision if we can't parse the response
      console.warn("[Claude] Could not parse Claude's decision, defaulting to random");
      return Math.random() > 0.5 ? "SHARE" : "KEEP";
    } catch (error) {
      this.setError(`Error getting AI decision: ${error instanceof Error ? error.message : String(error)}`);
      // Default to a random decision if there's an error
      return Math.random() > 0.5 ? "SHARE" : "KEEP";
    }
  }
}

// Create a singleton instance
let claudeServiceInstance: ClaudeService | null = null;

export function getClaudeService(): ClaudeService {
  if (!claudeServiceInstance) {
    claudeServiceInstance = new ClaudeService();
  }
  return claudeServiceInstance;
}
