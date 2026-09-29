import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app"
import { getAuth, type Auth } from "firebase/auth"

// Initialized lazily so the app runs without any Firebase config while
// NEXT_PUBLIC_AUTH_ENABLED is off. Stage 2 rebuilds this properly.
function getFirebaseApp(): FirebaseApp {
  if (getApps().length) return getApp()

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }
  if (!config.apiKey || !config.authDomain || !config.projectId) {
    throw new Error("Missing Firebase configuration. Set the NEXT_PUBLIC_FIREBASE_* variables in .env.local.")
  }
  return initializeApp(config)
}

export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp())
}
