"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  error: string | null
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/select")
    } catch (err: any) {
      setError("LOGIN FAILED: " + (err.message || "Unknown error"))
      console.error(err)
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      await createUserWithEmailAndPassword(auth, email, password)
      router.push("/select")
    } catch (err: any) {
      setError("SIGNUP FAILED: " + (err.message || "Unknown error"))
      console.error(err)
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push("/select")
    } catch (err: any) {
      setError("GOOGLE LOGIN FAILED: " + (err.message || "Unknown error"))
      console.error(err)
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/")
    } catch (err: any) {
      setError("LOGOUT FAILED: " + (err.message || "Unknown error"))
      console.error(err)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut, error }}>
      {children}
    </AuthContext.Provider>
  )
}

