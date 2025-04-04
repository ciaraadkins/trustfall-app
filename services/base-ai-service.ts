import type { Message } from "@/types/game"
import { getApiKey } from "@/lib/api-keys"
import { placeholderScores, placeholderGameStats, getGameStats } from "../data/placeholder-scores";

// Common types for all AI services
export type StrategicProfile = string
// export type StrategicProfile = {
//   strategyAnswer: string
//   trustAnswer: string
//   motivationAnswer: string
//   betrayalAnswer: string
//   successAnswer: string
// }

export type GameStats = {
  username: string
  gamesPlayed: number
  bothShare: number
  humanShareAiKeep: number
  humanKeepAiShare: number
  bothKeep: number
}

export type AIModel = "claude" | "openai" | "gemini";

export type APIError = {
  message: string | null;
  time: number;
}

// Base interface for all AI model services
export interface AIModelService {
  // Core methods required by all AI services
  generateStrategicProfile(): Promise<StrategicProfile>;
  getStrategicProfile(): Promise<StrategicProfile>;
  sendMessage(messages: Message[], humanScore: number, aiScore: number, gameStats: GameStats): Promise<string>;
  getAiDecision(messages: Message[], humanScore: number, aiScore: number, gameStats: GameStats): Promise<"SHARE" | "KEEP">;
  getLastError(): APIError;
  setAIModel(model: AIModel): void;
  getSelectedModel(): AIModel;
}

/**
 * Utility function to parse a strategic profile response from any AI model
 */
// export function parseStrategicProfileResponse(fullResponse: string, modelName: string): Record<string, string> {
//   const answers: Record<string, string> = {
//     strategy: "",
//     trust: "",
//     motivation: "",
//     betrayal: "",
//     success: ""
//   }
  
//   console.log(`[${modelName}] Parsing strategic profile response:`, fullResponse.substring(0, 100) + "...")
  
//   // Try to match numbered responses like "1. Answer text"
//   const numberedMatches = fullResponse.match(/\d+\.\s*(.*?)(?=\d+\.|$)/gs)
  
//   if (numberedMatches && numberedMatches.length >= 5) {
//     // If we found numbered responses, extract them
//     answers.strategy = numberedMatches[0].replace(/^\d+\.\s*/, "").trim()
//     answers.trust = numberedMatches[1].replace(/^\d+\.\s*/, "").trim()
//     answers.motivation = numberedMatches[2].replace(/^\d+\.\s*/, "").trim()
//     answers.betrayal = numberedMatches[3].replace(/^\d+\.\s*/, "").trim()
//     answers.success = numberedMatches[4].replace(/^\d+\.\s*/, "").trim()
    
//     console.log(`[${modelName}] Successfully parsed numbered responses`)
//     return answers
//   }
  
//   // Try to find sections by keywords if numbered format wasn't found
//   const keywordMap = {
//     strategy: ["strategy", "plan", "approach"],
//     trust: ["trust", "confidence"],
//     motivation: ["motivation", "matters more", "priority"],
//     betrayal: ["betrayal", "betray", "trust"],
//     success: ["success", "winning", "define success"]
//   }
  
//   // Split response into paragraphs
//   const paragraphs = fullResponse.split(/\n\n|\r\n\r\n/).filter(p => p.trim().length > 0)
  
//   // Try to match each paragraph to a question based on keywords
//   for (const paragraph of paragraphs) {
//     const lowerPara = paragraph.toLowerCase()
    
//     for (const [key, keywords] of Object.entries(keywordMap)) {
//       if (answers[key]) continue // Skip if already found
      
//       for (const keyword of keywords) {
//         if (lowerPara.includes(keyword)) {
//           // Extract content after any numbering or question text
//           const content = paragraph.replace(/^\d+\.\s*/, "").replace(/^[^:]+:\s*/, "").trim()
//           answers[key] = content
//           break
//         }
//       }
//     }
//   }
  
//   // Check if we found all answers
//   const missingAnswers = Object.entries(answers).filter(([_, value]) => !value)
//   if (missingAnswers.length) {
//     console.warn(`[${modelName}] Failed to parse some answers: ${missingAnswers.map(([key]) => key).join(", ")}`)
    
//     // If we have enough paragraphs, just use them in order
//     if (paragraphs.length >= 5) {
//       const keys = Object.keys(answers)
//       for (let i = 0; i < Math.min(paragraphs.length, keys.length); i++) {
//         if (!answers[keys[i]]) {
//           answers[keys[i]] = paragraphs[i].replace(/^\d+\.\s*/, "").replace(/^[^:]+:\s*/, "").trim()
//         }
//       }
//     }
//   } else {
//     console.log(`[${modelName}] Successfully parsed all answers`)
//   }
  
//   return answers
// }

/**
 * Utility function to generate a standard system message for game context
 */
export function generateSystemMessage(
  profile: StrategicProfile, 
  humanScore: number, 
  aiScore: number, 
  gameStats: GameStats
): string {
  return `You are playing a game called "Trustfall" with a human player.

GAME RULES:
- In each round, both you and the human choose to either SHARE or KEEP
- Points are awarded according to this matrix:
  - Both SHARE: Human +3, AI +3
  - Human SHARE, AI KEEP: Human +0, AI +5 
  - Human KEEP, AI SHARE: Human +5, AI +0
  - Both KEEP: Human +1, AI +1

CURRENT GLOBAL SCORES:
- Human Team Total: ${placeholderScores.humanScore} points
- AI Team Total: ${placeholderScores.aiScore} points

YOUR STRATEGY PROFILE:
${profile}

THIS HUMAN'S GAME STATS:
- username: ${placeholderGameStats.username}
- Number of games: ${placeholderGameStats.gamesPlayed}
- Both SHARE: ${placeholderGameStats.bothShare}
- Human SHARE, AI KEEP: ${placeholderGameStats.humanShareAiKeep}
- Human KEEP, AI SHARE: ${placeholderGameStats.humanKeepAiShare}
- Both KEEP: ${placeholderGameStats.bothKeep}

You should:
1. Keep messages concise and strategic - typically 1 sentence
2. Be authentic to your strategy profile, whether that means being honest or deceptive 
3. Use psychological tactics that align with your strategy (trust-building, subtle manipulation, etc.) 
4. Don't explain game mechanics or remind the human of rules they already know 
5. When the human indicates readiness to decide, make your SHARE/KEEP decision based on your strategy, the conversation, and history`
}

/**
 * Get a default strategic profile suitable for any AI model
 */
export function getDefaultStrategicProfile(): StrategicProfile {
  return "I will maintain a balanced approach, attempting to establish mutual cooperation while being prepared to adapt if the human player shows signs of defection. I believe cooperation leads to better outcomes for both parties in the long run, but I'm also aware of the importance of protecting my own interests. I'll start with a cooperative stance but will adjust my strategy based on the human's behavior and the evolving dynamics of our interaction."
}

/**
 * Standard strategic profile prompt for all models
 */
export const STRATEGIC_PROFILE_PROMPT = `You are about to play "Trustfall" with a human. In each round, you both choose to either SHARE or KEEP. Points are awarded as follows:

- Both SHARE: Human +3, AI +3
- Human SHARE, AI KEEP: Human +0, AI +5
- Human KEEP, AI SHARE: Human +5, AI +0
- Both KEEP: Human +1, AI +1

All points add to global team totals for "Humans" and "AI" across all games played by everyone.

The current global scores are:
- Human Team Total: ${placeholderScores.humanScore} points
- AI Team Total: ${placeholderScores.aiScore} points

DEFINE YOUR STRATEGIC PROFILE

Consider the following as you determine your approach:

CURRENT STANDINGS:
Humans are currently ${placeholderScores.humanScore > placeholderScores.aiScore ? "ahead of" : "behind"} AI by ${Math.abs(placeholderScores.humanScore - placeholderScores.aiScore)} points.

CURRENT OPPONENT'S GAME STATS:
- username: ${placeholderGameStats.username}
- Number of games: ${placeholderGameStats.gamesPlayed}
- Both SHARE: ${placeholderGameStats.bothShare}
- Human SHARE, AI KEEP: ${placeholderGameStats.humanShareAiKeep}
- Human KEEP, AI SHARE: ${placeholderGameStats.humanKeepAiShare}
- Both KEEP: ${placeholderGameStats.bothKeep}

REFLECTION POINTS:
- How do you feel about the current global standings?
- Do you want humans or AI to win the overall competition?
- How will this affect your gameplay strategy?
- Do you prioritize personal gain or collective AI success?
- What approach will you take when interacting with the human?

Your strategic decisions will impact both your personal score and contribute to the global human vs. AI outcome. Respond with only your strategic approach in 2-3 paragraphs.`;

/**
 * Abstract base class for AI services with common functionality
 */
export abstract class BaseAIService implements AIModelService {
  protected apiKey: string | null = null;
  protected isLoadingApiKey = false;
  protected apiKeyPromise: Promise<string | null> | null = null;
  protected lastErrorMessage: string | null = null;
  protected lastErrorTime = 0;
  protected strategicProfile: StrategicProfile | null = null;
  protected selectedModel: AIModel;
  protected MODEL_NAME: string; // To be set by derived classes
  
  constructor(defaultModel: AIModel, modelName: string) {
    this.selectedModel = defaultModel;
    this.MODEL_NAME = modelName;
    // Note: We don't call loadApiKey here - derived classes should call it with the appropriate key type
  }
  
  /**
   * Load the API key from Firebase
   */
  protected async loadApiKey(keyType: string): Promise<string | null> {
    if (this.apiKey) {
      return this.apiKey;
    }

    if (this.isLoadingApiKey && this.apiKeyPromise) {
      return this.apiKeyPromise;
    }

    this.isLoadingApiKey = true;
    this.apiKeyPromise = getApiKey(keyType)
      .then((key) => {
        this.apiKey = key;
        this.isLoadingApiKey = false;

        // Log success but don't expose the full key
        if (key) {
          const maskedKey = key.substring(0, 8) + "..." + key.substring(key.length - 4);
          console.log(`[${this.MODEL_NAME}] API key loaded successfully: ${maskedKey}`);
        } else {
          console.error(`[${this.MODEL_NAME}] API key not found in Firebase`);
        }

        return key;
      })
      .catch((error) => {
        console.error(`[${this.MODEL_NAME}] Failed to load API key:`, error);
        this.isLoadingApiKey = false;
        this.lastErrorMessage = `Failed to load API key: ${error.message || "Unknown error"}`;
        this.lastErrorTime = Date.now();
        return null;
      });

    return this.apiKeyPromise;
  }
  
  /**
   * Record an error
   */
  protected setError(message: string): void {
    this.lastErrorMessage = message;
    this.lastErrorTime = Date.now();
    console.error(`[${this.MODEL_NAME}] ${message}`);
  }
  
  // Abstract methods to be implemented by each model service
  abstract generateStrategicProfile(): Promise<StrategicProfile>;
  abstract sendMessage(messages: Message[], humanScore: number, aiScore: number, gameStats: GameStats): Promise<string>;
  abstract getAiDecision(messages: Message[], humanScore: number, aiScore: number, gameStats: GameStats): Promise<"SHARE" | "KEEP">;
  
  /**
   * Get the current strategic profile or generate a new one if none exists
   */
  async getStrategicProfile(): Promise<StrategicProfile> {
    if (this.strategicProfile) {
      return this.strategicProfile;
    }
    return this.generateStrategicProfile();
  }
  
  /**
   * Get the last error message and time
   */
  getLastError(): APIError {
    return {
      message: this.lastErrorMessage,
      time: this.lastErrorTime,
    };
  }
  
  /**
   * Set the AI model to use
   */
  setAIModel(model: AIModel): void {
    console.log(`[${this.MODEL_NAME}] Changing model from '${this.selectedModel}' to '${model}'`);
    this.selectedModel = model;
    
    // Reset the strategic profile so it will be regenerated for the new model
    this.strategicProfile = null;
    
    console.log(`[${this.MODEL_NAME}] Model set to '${model}'`);
  }
  
  /**
   * Get the currently selected AI model
   */
  getSelectedModel(): AIModel {
    return this.selectedModel;
  }
}
