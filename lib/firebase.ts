import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2KnAV6LuDxzgkI9NifLWYPnxFps2uRac",
  authDomain: "trustfall-5741b.firebaseapp.com",
  projectId: "trustfall-5741b",
  storageBucket: "trustfall-5741b.firebasestorage.app",
  messagingSenderId: "23332499922",
  appId: "1:23332499922:web:a94bae254299aa8331180b",
  measurementId: "G-ZBKGLM56HY",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication
export const auth = getAuth(app)

// Initialize Firestore
export const db = getFirestore(app)

export default app

