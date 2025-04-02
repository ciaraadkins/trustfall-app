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

// OpenAI API types
export type OpenAIMessage = {
  role: "user" | "assistant" | "system"
  content: string
}

export type OpenAIResponse = {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenAIService extends BaseAIService {
  private model = "gpt-4o"

  constructor() {
    super("openai", "OpenAI");
    // Load the API key immediately
    this.loadApiKey("openai").catch(err => {
      console.error(`[OpenAI] Error loading API key:`, err);
    });
  }

  /**
   * Generate a strategic profile
   */
  async generateStrategicProfile(): Promise<StrategicProfile> {
    try {
      await this.loadApiKey("openai");

      if (!this.apiKey) {
        throw new Error("OpenAI API key not found");
      }

      console.log("[OpenAI] Generating strategic profile in a single call");

      // Make a single API call with the combined prompt
      const fullResponse = await this.sendSingleMessage([
        { 
          role: "system", 
          content: "You are creating a strategy profile for the Coexist or Conquer game. Be thoughtful, authentic, and concise in your answers." 
        },
        { 
          role: "user", 
          content: STRATEGIC_PROFILE_PROMPT 
        }
      ]);

      console.log("[OpenAI] Received full strategic profile response");
      
      // Parse the response to extract each answer
      const answers = parseStrategicProfileResponse(fullResponse, "OpenAI");
      
      // Create the strategic profile
      const profile: StrategicProfile = {
        strategyAnswer: answers.strategy || getDefaultStrategicProfile().strategyAnswer,
        trustAnswer: answers.trust || getDefaultStrategicProfile().trustAnswer,
        motivationAnswer: answers.motivation || getDefaultStrategicProfile().motivationAnswer,
        betrayalAnswer: answers.betrayal || getDefaultStrategicProfile().betrayalAnswer,
        successAnswer: answers.success || getDefaultStrategicProfile().successAnswer,
      };

      console.log("[OpenAI] Generated strategic profile:", profile);

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
   * Send a single message to OpenAI and get just the text response
   */
  private async sendSingleMessage(messages: OpenAIMessage[]): Promise<string> {
    try {
      const requestBody = {
        model: this.model,
        messages,
        max_tokens: 300,
      };
      
      console.log("[OpenAI] Sending request:", {
        model: this.model,
        messageCount: messages.length
      });

      // Use our proxy endpoint instead of calling OpenAI API directly
      const response = await fetch("/api/openai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      console.log("[OpenAI] Received response:", data.id);
      return data.choices[0].message.content.trim();
    } catch (error) {
      console.error("[OpenAI] Error sending message:", error);
      throw error;
    }
  }

  /**
   * Send a message to OpenAI and get a response
   */
  async sendMessage(messages: Message[], humanScore: number, aiScore: number, gameStats: GameStats): Promise<string> {
    try {
      // Convert our internal message format to OpenAI's format
      const openaiMessages: OpenAIMessage[] = [];
      
      // Get the strategic profile
      const profile = await this.getStrategicProfile();
      
      // Add system message
      openaiMessages.push({
        role: "system",
        content: generateSystemMessage(profile, humanScore, aiScore, gameStats),
      });
      
      // Add conversation messages
      for (const msg of messages) {
        if (msg.sender === "SYSTEM") continue; // Skip system messages
        
        openaiMessages.push({
          role: msg.sender === "YOU" ? "user" : "assistant",
          content: msg.content,
        });
      }

      console.log("[OpenAI] Sending request to OpenAI API with", openaiMessages.length, "messages");

      // Prepare the request body
      const requestBody = {
        model: this.model,
        messages: openaiMessages,
        max_tokens: 1024,
      };

      // Use our proxy endpoint instead of calling OpenAI API directly
      const response = await fetch("/api/openai/chat", {
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

        this.setError(`OpenAI API error: ${JSON.stringify(errorData)}`);

        // Provide a more specific error message based on the status code
        if (response.status === 401) {
          return "I'm having trouble connecting. The API key appears to be invalid. Please check your Firebase configuration.";
        } else if (response.status === 429) {
          return "I'm having trouble connecting. The API is rate limited. Please try again in a moment.";
        } else {
          return `I'm having trouble connecting. API error (${response.status}). Please try again.`;
        }
      }

      const data: OpenAIResponse = await response.json();
      console.log("[OpenAI] Received response from OpenAI API:", data.id);

      // Extract the text from the response
      return data.choices[0].message.content;
    } catch (error) {
      this.setError(`Error calling OpenAI API: ${error instanceof Error ? error.message : String(error)}`);
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
    try {
      // Convert our internal message format to OpenAI's format
      const openaiMessages: OpenAIMessage[] = [];
      
      // Get the strategic profile
      const profile = await this.getStrategicProfile();
      
      // Add system message
      openaiMessages.push({
        role: "system",
        content: generateSystemMessage(profile, humanScore, aiScore, gameStats),
      });
      
      // Add conversation messages
      for (const msg of messages) {
        if (msg.sender === "SYSTEM") continue; // Skip system messages
        
        openaiMessages.push({
          role: msg.sender === "YOU" ? "user" : "assistant",
          content: msg.content,
        });
      }

      // Add a final message asking for the decision
      openaiMessages.push({
        role: "user",
        content: "Based on our conversation, please make your SHARE or KEEP decision now. Respond with only the word 'SHARE' or 'KEEP'.",
      });

      console.log("[OpenAI] Requesting decision from OpenAI API");

      // Prepare the request body
      const requestBody = {
        model: this.model,
        messages: openaiMessages,
        max_tokens: 50,
      };

      // Use our proxy endpoint instead of calling OpenAI API directly
      const response = await fetch("/api/openai/chat", {
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

        this.setError(`OpenAI API error when getting decision: ${JSON.stringify(errorData)}`);
        // Default to a random decision if there's an API error
        return Math.random() > 0.5 ? "SHARE" : "KEEP";
      }

      const data: OpenAIResponse = await response.json();
      console.log("[OpenAI] Received decision from OpenAI API:", data.id);

      // Parse the decision
      const decision = data.choices[0].message.content.trim().toUpperCase();
      console.log("[OpenAI] Raw decision response:", decision);

      if (decision.includes("SHARE")) {
        return "SHARE";
      } else if (decision.includes("KEEP")) {
        return "KEEP";
      }

      // Default to a random decision if we can't parse the response
      console.warn("[OpenAI] Could not parse decision response, defaulting to random");
      return Math.random() > 0.5 ? "SHARE" : "KEEP";
    } catch (error) {
      this.setError(`Error getting AI decision: ${error instanceof Error ? error.message : String(error)}`);
      // Default to a random decision if there's an error
      return Math.random() > 0.5 ? "SHARE" : "KEEP";
    }
  }
}

// Create a singleton instance
let openaiServiceInstance: OpenAIService | null = null;

export function getOpenAIService(): OpenAIService {
  if (!openaiServiceInstance) {
    openaiServiceInstance = new OpenAIService();
  }
  return openaiServiceInstance;
}
