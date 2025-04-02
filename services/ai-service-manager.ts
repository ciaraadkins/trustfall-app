import { getClaudeService } from "./claude-service"
import { getOpenAIService } from "./openai-service"
import type { Message } from "@/types/game"
import type { AIModel, StrategicProfile, AIModelService } from "./base-ai-service"

class AIServiceManager {
  private selectedModel: AIModel = "claude";
  private eventListeners: Array<(model: AIModel) => void> = [];

  constructor() {
    // Initialize with model from localStorage or default
    if (typeof window !== 'undefined') {
      const savedModel = localStorage.getItem('selectedModel');
      if (savedModel) {
        console.log(`AI Service Manager: Found savedModel in localStorage: '${savedModel}'`);
        if (savedModel === "claude" || savedModel === "openai" || savedModel === "gemini") {
          this.setModel(savedModel);
        } else {
          console.warn(`AI Service Manager: Invalid model in localStorage: '${savedModel}', using default (claude)`);
          this.setModel("claude");
        }
      } else {
        console.log(`AI Service Manager: No model in localStorage, using default (claude)`);
        this.setModel("claude");
      }
    } else {
      console.log(`AI Service Manager: No window, using default model (claude)`);
      this.setModel("claude");
    }
  }

  /**
   * Get the appropriate service instance for the current model
   */
  private getServiceForModel(model: AIModel = this.selectedModel): AIModelService {
    switch(model) {
      case "claude":
        return getClaudeService();
      case "openai":
        return getOpenAIService();
      case "gemini":
        // TODO: Implement Gemini service
        console.log("Gemini service not yet implemented, using Claude as fallback");
        return getClaudeService();
      default:
        console.log(`Unknown model '${model}', falling back to Claude`);
        return getClaudeService();
    }
  }

  /**
   * Set the AI model to use for all future requests
   */
  setModel(model: AIModel): void {
    console.log(`AI Service Manager: Changing model from '${this.selectedModel}' to '${model}'`)
    this.selectedModel = model
    
    // Persist the selected model in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedModel', model);
      console.log(`AI Service Manager: Model '${model}' saved to localStorage`);
    }
    
    // Update the model selection in each service
    getClaudeService().setAIModel(model)
    getOpenAIService().setAIModel(model)
    
    // Gemini would be updated here as well
    
    // Notify all listeners of the model change
    this.eventListeners.forEach(listener => listener(model));
    
    console.log(`AI Service Manager: Model set to '${model}'`)
  }

  /**
   * Get the currently selected model
   */
  getSelectedModel(): AIModel {
    return this.selectedModel
  }
  
  /**
   * Register a listener for model changes
   */
  onModelChange(callback: (model: AIModel) => void): () => void {
    this.eventListeners.push(callback);
    
    // Return a function to remove the listener
    return () => {
      this.eventListeners = this.eventListeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Generate a strategic profile using the selected model
   */
  async generateStrategicProfile(): Promise<StrategicProfile> {
    const service = this.getServiceForModel();
    return service.generateStrategicProfile();
  }

  /**
   * Get the strategic profile from the selected model
   */
  async getStrategicProfile(): Promise<StrategicProfile> {
    const service = this.getServiceForModel();
    return service.getStrategicProfile();
  }

  /**
   * Send a message using the selected model
   */
  async sendMessage(messages: Message[], humanScore: number, aiScore: number, gameStats: any): Promise<string> {
    console.log(`AI Service Manager: Sending message using model '${this.selectedModel}'`);
    
    const service = this.getServiceForModel();
    
    // For Claude service, we want to use the specific Claude method
    if (this.selectedModel === "claude" && "sendClaudeMessage" in service) {
      return (service as any).sendClaudeMessage(messages, humanScore, aiScore, gameStats);
    }
    
    return service.sendMessage(messages, humanScore, aiScore, gameStats);
  }

  /**
   * Get an AI decision using the selected model
   */
  async getAiDecision(
    messages: Message[],
    humanScore: number,
    aiScore: number,
    gameStats: any,
  ): Promise<"SHARE" | "KEEP"> {
    console.log(`AI Service Manager: Getting decision using model '${this.selectedModel}'`);
    
    const service = this.getServiceForModel();
    
    // For Claude service, we want to use the specific Claude method
    if (this.selectedModel === "claude" && "getClaudeDecision" in service) {
      return (service as any).getClaudeDecision(messages, humanScore, aiScore, gameStats);
    }
    
    return service.getAiDecision(messages, humanScore, aiScore, gameStats);
  }

  /**
   * Get the last error from the selected model
   */
  getLastError(): { message: string | null; time: number } {
    const service = this.getServiceForModel();
    return service.getLastError();
  }
}

// Create a singleton instance
let managerInstance: AIServiceManager | null = null

export function getAIServiceManager(): AIServiceManager {
  if (!managerInstance) {
    managerInstance = new AIServiceManager()
  }
  return managerInstance
}
