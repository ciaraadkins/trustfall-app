import { doc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

// Cache for API keys to avoid excessive Firestore reads
const apiKeyCache: Record<string, { key: string; timestamp: number }> = {}
const CACHE_DURATION = 1000 * 60 * 60 // 1 hour in milliseconds

/**
 * Fetch an API key from Firebase Firestore
 * @param keyName The name of the API key to fetch
 * @returns The API key or null if not found
 */
export async function getApiKey(keyName: string): Promise<string | null> {
  // Check cache first
  const cachedKey = apiKeyCache[keyName]
  if (cachedKey && Date.now() - cachedKey.timestamp < CACHE_DURATION) {
    return cachedKey.key
  }

  try {
    // Fetch from Firestore
    const apiKeyDoc = await getDoc(doc(db, "api-keys", keyName))

    if (apiKeyDoc.exists()) {
      let apiKey = apiKeyDoc.data().value

      // Clean up the API key (remove whitespace, quotes, etc.)
      if (typeof apiKey === "string") {
        apiKey = apiKey.trim()

        // Remove quotes if they exist
        if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
          apiKey = apiKey.substring(1, apiKey.length - 1)
        }
      } else {
        console.error(`API key "${keyName}" is not a string:`, typeof apiKey)
        return null
      }

      // Update cache
      apiKeyCache[keyName] = {
        key: apiKey,
        timestamp: Date.now(),
      }

      return apiKey
    } else {
      console.error(`API key "${keyName}" not found in Firestore`)
      return null
    }
  } catch (error) {
    console.error("Error fetching API key from Firestore:", error)
    return null
  }
}

/**
 * Clear the API key cache
 * @param keyName Optional specific key to clear, or all keys if not specified
 */
export function clearApiKeyCache(keyName?: string): void {
  if (keyName) {
    delete apiKeyCache[keyName]
  } else {
    Object.keys(apiKeyCache).forEach((key) => {
      delete apiKeyCache[key]
    })
  }
}

