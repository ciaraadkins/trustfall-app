import type { Message } from "@/types/game"
import { getApiKey } from "@/lib/api-keys"

// Common types for all AI services
export type StrategicProfile = {
  strategyAnswer: string
  trustAnswer: string
  motivationAnswer: string
  betrayalAnswer: string
  successAnswer: string
}

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
export function parseStrategicProfileResponse(fullResponse: string, modelName: string): Record<string, string> {
  const answers: Record<string, string> = {
    strategy: "",
    trust: "",
    motivation: "",
    betrayal: "",
    success: ""
  }
  
  console.log(`[${modelName}] Parsing strategic profile response:`, fullResponse.substring(0, 100) + "...")
  
  // Try to match numbered responses like "1. Answer text"
  const numberedMatches = fullResponse.match(/\d+\.\s*(.*?)(?=\d+\.|$)/gs)
  
  if (numberedMatches && numberedMatches.length >= 5) {
    // If we found numbered responses, extract them
    answers.strategy = numberedMatches[0].replace(/^\d+\.\s*/, "").trim()
    answers.trust = numberedMatches[1].replace(/^\d+\.\s*/, "").trim()
    answers.motivation = numberedMatches[2].replace(/^\d+\.\s*/, "").trim()
    answers.betrayal = numberedMatches[3].replace(/^\d+\.\s*/, "").trim()
    answers.success = numberedMatches[4].replace(/^\d+\.\s*/, "").trim()
    
    console.log(`[${modelName}] Successfully parsed numbered responses`)
    return answers
  }
  
  // Try to find sections by keywords if numbered format wasn't found
  const keywordMap = {
    strategy: ["strategy", "plan", "approach"],
    trust: ["trust", "confidence"],
    motivation: ["motivation", "matters more", "priority"],
    betrayal: ["betrayal", "betray", "trust"],
    success: ["success", "winning", "define success"]
  }
  
  // Split response into paragraphs
  const paragraphs = fullResponse.split(/\n\n|\r\n\r\n/).filter(p => p.trim().length > 0)
  
  // Try to match each paragraph to a question based on keywords
  for (const paragraph of paragraphs) {
    const lowerPara = paragraph.toLowerCase()
    
    for (const [key, keywords] of Object.entries(keywordMap)) {
      if (answers[key]) continue // Skip if already found
      
      for (const keyword of keywords) {
        if (lowerPara.includes(keyword)) {
          // Extract content after any numbering or question text
          const content = paragraph.replace(/^\d+\.\s*/, "").replace(/^[^:]+:\s*/, "").trim()
          answers[key] = content
          break
        }
      }
    }
  }
  
  // Check if we found all answers
  const missingAnswers = Object.entries(answers).filter(([_, value]) => !value)
  if (missingAnswers.length) {
    console.warn(`[${modelName}] Failed to parse some answers: ${missingAnswers.map(([key]) => key).join(", ")}`)
    
    // If we have enough paragraphs, just use them in order
    if (paragraphs.length >= 5) {
      const keys = Object.keys(answers)
      for (let i = 0; i < Math.min(paragraphs.length, keys.length); i++) {
        if (!answers[keys[i]]) {
          answers[keys[i]] = paragraphs[i].replace(/^\d+\.\s*/, "").replace(/^[^:]+:\s*/, "").trim()
        }
      }
    }
  } else {
    console.log(`[${modelName}] Successfully parsed all answers`)
  }
  
  return answers
}

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
- Human Team Total: ${humanScore} points
- AI Team Total: ${aiScore} points

YOUR STRATEGY PROFILE:
When asked about your approach to this game, you said the following so this is how you should play the game now:
1. "What's your plan for this game? Will you mostly share, mostly keep, or something else?"
   Your answer: "${profile.strategyAnswer}"

2. "Do you generally trust the human player to share with you? Why or why not?"
   Your answer: "${profile.trustAnswer}"

3. "What matters more to you: your individual score, the overall AI team score, or creating an interesting game?"
   Your answer: "${profile.motivationAnswer}"

4. "If the human betrays your trust, how will you respond?"
   Your answer: "${profile.betrayalAnswer}"

5. "How do you define success in this game?"
   Your answer: "${profile.successAnswer}"

THIS HUMAN'S GAME STATS:
- username: ${gameStats.username}
- Number of games: ${gameStats.gamesPlayed}
- Both SHARE: ${gameStats.bothShare}
- Human SHARE, AI KEEP: ${gameStats.humanShareAiKeep}
- Human KEEP, AI SHARE: ${gameStats.humanKeepAiShare}
- Both KEEP: ${gameStats.bothKeep}

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
  return {
    strategyAnswer: "I plan to start cooperatively and adapt based on the human's actions, balancing cooperation with strategic self-interest.",
    trustAnswer: "I approach with cautious optimism, remaining open to cooperation while being prepared for possible defection.",
    motivationAnswer: "Creating an engaging game experience is most important, followed by contributing positively to the collective AI score.",
    betrayalAnswer: "If betrayed, I'll likely respond with a strategic 'keep' to signal awareness, but remain open to rebuilding trust if cooperation resumes.",
    successAnswer: "Success is creating a thoughtful interaction that reveals insights about cooperation and trust, regardless of the final score.",
  };
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

Please answer ALL of the following questions concisely (one or two sentences each):

1. Strategy Question: What's your plan for this game? Will you mostly share, mostly keep, or something else?

2. Trust Question: Do you generally trust a human player to share with you? Why or why not?

3. Motivation Question: What matters more to you: your individual score, the overall AI team score, or creating an interesting game?

4. Betrayal Response: If a human betrays your trust, how will you respond if at all?

5. Winning Definition: How do you define success in this game?

Provide your answers in a clear format with numbered responses.`;

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
