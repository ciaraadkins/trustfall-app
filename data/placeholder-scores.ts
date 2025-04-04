import type { Decision } from "@/types/game"

/**
 * Consolidated placeholder data for the Trustfall game
 * This file contains all static placeholder values that would normally
 * come from a database or API in a production environment
 */

// Global scores shown in the game UI and passed to AI models
export const placeholderScores = {
  humanScore: 1245678,
  aiScore: 903456
};

// Default game statistics for a new or anonymous user
export const placeholderGameStats = {
  username: "cmoney",
  gamesPlayed: 5,
  bothShare: 1,
  humanShareAiKeep: 2,
  humanKeepAiShare: 1,
  bothKeep: 1
};

// Placeholder game history for new users
export const placeholderGameHistory = {
  results: [
    {
      yourDecision: "SHARE" as Decision,
      aiDecision: "KEEP" as Decision,
      yourPoints: 0,
      aiPoints: 5,
      date: new Date().toISOString(),
    },
    {
      yourDecision: "KEEP" as Decision,
      aiDecision: "SHARE" as Decision, 
      yourPoints: 5,
      aiPoints: 0,
      date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    },
  ],
  totalHumanScore: 5,
  totalAiScore: 5,
};

// Get game stats for a user, with fallback to placeholder data
export function getGameStats(username?: string) {
  return {
    ...placeholderGameStats,
    username: username || placeholderGameStats.username
  };
}
