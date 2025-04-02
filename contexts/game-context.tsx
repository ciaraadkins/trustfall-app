"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { getAIServiceManager } from "@/services/ai-service-manager"
import type { GameStats } from "@/services/claude-service"
import type { Message, Decision, GameResult, GameHistory } from "@/types/game"
import { randomInt, weightedRandom } from "@/utils/random"

interface GameContextType {
  messages: Message[]
  aiThinking: boolean
  aiHasDecided: boolean
  yourDecision: Decision
  aiDecision: Decision
  yourScore: number
  aiScore: number
  globalHumanScore: number
  globalAiScore: number
  conversationStarted: boolean
  showDecision: boolean
  aiName: string
  sendMessage: (content: string) => Promise<void>
  makeDecision: (decision: Decision) => Promise<void>
  resetGame: () => void
}

const GameContext = createContext<GameContextType>({
  messages: [],
  aiThinking: false,
  aiHasDecided: false,
  yourDecision: null,
  aiDecision: null,
  yourScore: 0,
  aiScore: 0,
  globalHumanScore: 1245678,
  globalAiScore: 1203456,
  conversationStarted: false,
  showDecision: false,
  aiName: "CLAUDE",
  sendMessage: async () => {},
  makeDecision: async () => {},
  resetGame: () => {},
})

export const useGame = () => useContext(GameContext)

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [aiThinking, setAiThinking] = useState(false)
  const [aiHasDecided, setAiHasDecided] = useState(false)
  const [yourDecision, setYourDecision] = useState<Decision>(null)
  const [aiDecision, setAiDecision] = useState<Decision>(null)
  const [yourScore, setYourScore] = useState(0)
  const [aiScore, setAiScore] = useState(0)
  const [globalHumanScore, setGlobalHumanScore] = useState(1245678)
  const [globalAiScore, setGlobalAiScore] = useState(1203456)
  const [messageThreshold, setMessageThreshold] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [conversationStarted, setConversationStarted] = useState(false)
  const [showDecision, setShowDecision] = useState(false)
  const [gameHistory, setGameHistory] = useState<GameHistory>({
    results: [],
    totalHumanScore: 0,
    totalAiScore: 0,
  })
  const [aiName, setAiName] = useState<string>("CLAUDE")

  // Initialize the game when the component mounts
  useEffect(() => {
    initializeGame()
    loadGameHistory()
  }, [user])
  
  // Generate strategic profile when the game initializes
  useEffect(() => {
    if (user) {
      generateStrategicProfile()
    }
  }, [user])
  
  // Use a model change listener to update AI name
  useEffect(() => {
    const aiManager = getAIServiceManager()
    
    // Set the AI name based on the current model
    const updateAiName = (model: AIModel) => {
      let newName = "AI";
      switch (model) {
        case "claude":
          newName = "CLAUDE";
          break
        case "openai":
          newName = "CHATGPT";
          break
        case "gemini":
          newName = "GEMINI";
          break
      }
      
      // Update the AI name
      setAiName(newName);
      
      // Reset messages when the model changes (except on first load)
      if (messages.length > 0) {
        // Small timeout to ensure aiName is updated before initializing
        setTimeout(() => {
          resetGame();
        }, 100);
      }
    }
    
    // Set initial AI name based on the saved model or current selection
    const currentModel = aiManager.getSelectedModel()
    console.log('Current model in game context:', currentModel)
    updateAiName(currentModel)
    
    // Register a listener for model changes
    const removeListener = aiManager.onModelChange(updateAiName)
    
    // Clean up the listener when the component unmounts
    return () => removeListener()
  }, [])

  const loadGameHistory = async () => {
    if (!user) return

    try {
      // In a real app, this would come from a database
      // For now, we'll use mock data
      const mockHistory: GameHistory = {
        results: [
          {
            yourDecision: "SHARE",
            aiDecision: "KEEP",
            yourPoints: 0,
            aiPoints: 5,
            date: new Date().toISOString(),
          },
          {
            yourDecision: "KEEP",
            aiDecision: "SHARE",
            yourPoints: 5,
            aiPoints: 0,
            date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
          },
        ],
        totalHumanScore: 5,
        totalAiScore: 5,
      }

      setGameHistory(mockHistory)
    } catch (error) {
      console.error("Error loading game history:", error)
    }
  }

  const generateStrategicProfile = async () => {
    try {
      // Get the AI service manager and generate a strategic profile
      const aiManager = getAIServiceManager()
      await aiManager.generateStrategicProfile()
      console.log("Strategic profile generated successfully")
    } catch (error) {
      console.error("Error generating strategic profile:", error)
    }
  }

  const initializeGame = () => {
    // Set a random message threshold for AI decision (3-7 messages)
    const threshold = randomInt(3, 7)
    setMessageThreshold(threshold)
    
    // Check the current model being used
    const aiManager = getAIServiceManager()
    const currentModelId = aiManager.getSelectedModel()
    console.log(`Game initialized with model: '${currentModelId}', aiName: '${aiName}'`)

    // 50% chance for AI to initiate conversation
    const aiInitiates = Math.random() < 0.5
    
    // Get the current AI name
    const currentAiName = aiName
    
    // Prepare personalized greeting based on AI name
    let greeting = "Hello!"
    if (currentAiName === "CLAUDE") {
      greeting = "Hello! I'm Claude."
    } else if (currentAiName === "CHATGPT") {
      greeting = "Hello! I'm ChatGPT."
    } else if (currentAiName === "GEMINI") {
      greeting = "Hello! I'm Gemini."
    }

    const initialMessages: Message[] = [
      {
        sender: "SYSTEM",
        content: "Welcome to TRUSTFALL. You have one round to play today.",
        timestamp: Date.now(),
      },
    ]

    if (aiInitiates) {
      // Create AI-specific greeting
      let greeting = "Hello!"
      if (currentAiName === "CLAUDE") {
        greeting = "Hello! I'm Claude."
      } else if (currentAiName === "CHATGPT") {
        greeting = "Hello! I'm ChatGPT."
      } else if (currentAiName === "GEMINI") {
        greeting = "Hello! I'm Gemini."
      }

      initialMessages.push({
        sender: currentAiName,
        content: `${greeting} In this game, we'll both decide whether to SHARE or KEEP resources. If we both SHARE, we each get 3 points. If one SHARES and one KEEPS, the keeper gets 5 points and the sharer gets 0. If we both KEEP, we each get 1 point. What's your strategy?`,
        timestamp: Date.now() + 100,
      })
      setConversationStarted(true)
    }

    setMessages(initialMessages)
    setAiThinking(false)
    setAiHasDecided(false)
    setYourDecision(null)
    setAiDecision(null)
    setShowDecision(false)
    setMessageCount(0)
  }

  const getGameStats = (): GameStats => {
    // Calculate stats from game history
    const stats: GameStats = {
      username: user?.email?.split("@")[0] || "anonymous",
      gamesPlayed: gameHistory.results.length,
      bothShare: gameHistory.results.filter((r) => r.yourDecision === "SHARE" && r.aiDecision === "SHARE").length,
      humanShareAiKeep: gameHistory.results.filter((r) => r.yourDecision === "SHARE" && r.aiDecision === "KEEP").length,
      humanKeepAiShare: gameHistory.results.filter((r) => r.yourDecision === "KEEP" && r.aiDecision === "SHARE").length,
      bothKeep: gameHistory.results.filter((r) => r.yourDecision === "KEEP" && r.aiDecision === "KEEP").length,
    }
    return stats
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const newMessage: Message = {
      sender: "YOU",
      content,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, newMessage])

    // Increment message count
    const newMessageCount = messageCount + 1
    setMessageCount(newMessageCount)

    // Set conversation as started if this is the first user message
    if (!conversationStarted) {
      setConversationStarted(true)
    }

    // Randomize response timing
    const responseType = weightedRandom([
      { value: "immediate", weight: 60 },
      { value: "short-delay", weight: 30 },
      { value: "long-delay", weight: 10 },
    ])

    const delay =
      responseType === "immediate"
        ? 500
        : responseType === "short-delay"
          ? randomInt(2000, 5000)
          : randomInt(5000, 10000)

    // Show AI is typing
    setAiThinking(true)

    try {
      // Get AI service manager
      const aiManager = getAIServiceManager()
      
      // Ensure we have a strategic profile
      await aiManager.getStrategicProfile()
      
      // Get AI's response
      const aiResponseText = await aiManager.sendMessage(
        [...messages, newMessage],
        globalHumanScore,
        globalAiScore,
        getGameStats(),
      )

      // Add a delay for realism
      await new Promise((resolve) => setTimeout(resolve, delay))

      setAiThinking(false)

      const aiResponse: Message = {
        sender: aiName,
        content: aiResponseText,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, aiResponse])

      // Check if we've reached the message threshold for AI decision
      checkAndMakeAIDecisionIfNeeded(newMessageCount)
    } catch (error) {
      console.error(`Error getting ${aiName}'s response:`, error)
      setAiThinking(false)

      // Fallback message if there's an error
      const fallbackResponse: Message = {
        sender: aiName,
        content: "I'm thinking about my approach to this game. How would you like to proceed?",
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, fallbackResponse])

      // Still check for AI decision
      checkAndMakeAIDecisionIfNeeded(newMessageCount)
    }
  }

  const checkAndMakeAIDecisionIfNeeded = async (currentMessageCount: number) => {
    if (currentMessageCount >= messageThreshold && !aiHasDecided && !aiDecision) {
      try {
        // Get AI service manager
        const aiManager = getAIServiceManager()
        
        // Ensure we have a strategic profile
        await aiManager.getStrategicProfile()
        
        // Get AI's decision
        const decision = await aiManager.getAiDecision(messages, globalHumanScore, globalAiScore, getGameStats())

        // Store decision internally but don't reveal
        setAiDecision(decision)
        setAiHasDecided(true)
      } catch (error) {
        console.error("Error getting AI decision:", error)
        // Default to a random decision if there's an error
        const randomDecision: Decision = Math.random() > 0.5 ? "SHARE" : "KEEP"
        setAiDecision(randomDecision)
        setAiHasDecided(true)
      }
    }
  }

  const makeDecision = async (decision: Decision) => {
    setYourDecision(decision)

    // If AI hasn't decided yet, force a decision
    if (!aiHasDecided) {
      try {
        // Get AI service manager
        const aiManager = getAIServiceManager()
        
        // Ensure we have a strategic profile
        await aiManager.getStrategicProfile()
        
        // Get AI's decision
        const aiChoice = await aiManager.getAiDecision(messages, globalHumanScore, globalAiScore, getGameStats())

        setAiDecision(aiChoice)
        setAiHasDecided(true)
      } catch (error) {
        console.error("Error getting AI decision:", error)
        // Default to a random decision if there's an error
        const randomDecision: Decision = Math.random() > 0.5 ? "SHARE" : "KEEP"
        setAiDecision(randomDecision)
        setAiHasDecided(true)
      }
    }

    // Show decision screen after both have decided
    setTimeout(() => {
      setShowDecision(true)

      // Calculate scores
      let yourPoints = 0
      let aiPoints = 0

      if (decision === "SHARE" && aiDecision === "SHARE") {
        yourPoints = 3
        aiPoints = 3
      } else if (decision === "SHARE" && aiDecision === "KEEP") {
        yourPoints = 0
        aiPoints = 5
      } else if (decision === "KEEP" && aiDecision === "SHARE") {
        yourPoints = 5
        aiPoints = 0
      } else if (decision === "KEEP" && aiDecision === "KEEP") {
        yourPoints = 1
        aiPoints = 1
      }

      setYourScore((prev) => prev + yourPoints)
      setAiScore((prev) => prev + aiPoints)

      // Update global scores
      setGlobalHumanScore((prev) => prev + yourPoints)
      setGlobalAiScore((prev) => prev + aiPoints)

      // Update game history
      const newResult: GameResult = {
        yourDecision: decision,
        aiDecision: aiDecision!,
        yourPoints,
        aiPoints,
        date: new Date().toISOString(),
      }

      setGameHistory((prev) => ({
        results: [newResult, ...prev.results],
        totalHumanScore: prev.totalHumanScore + yourPoints,
        totalAiScore: prev.totalAiScore + aiPoints,
      }))

      // In a real app, you would save this to a database
    }, 1500)
  }

  const resetGame = () => {
    initializeGame()
  }

  return (
    <GameContext.Provider
      value={{
        messages,
        aiThinking,
        aiHasDecided,
        yourDecision,
        aiDecision,
        yourScore,
        aiScore,
        globalHumanScore,
        globalAiScore,
        conversationStarted,
        showDecision,
        aiName,
        sendMessage,
        makeDecision,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  )
}

