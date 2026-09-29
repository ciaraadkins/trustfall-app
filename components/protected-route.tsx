"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AUTH_ENABLED, useAuth } from "@/contexts/auth-context"

export default function ProtectedRoute({
  children,
  allowGuest = false,
}: {
  children: React.ReactNode
  allowGuest?: boolean
}) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const mustSignIn = AUTH_ENABLED && !allowGuest

  useEffect(() => {
    if (mustSignIn && !loading && !user) {
      router.push(`/auth?redirect=${pathname}`)
    }
  }, [mustSignIn, user, loading, router, pathname])

  // With auth disabled, every page is open.
  if (!AUTH_ENABLED) return <>{children}</>

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121212] text-[#33FF33]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#33FF33]/50 border-r-transparent"></div>
          <p className="mt-4 font-mono">INITIALIZING_</p>
        </div>
      </div>
    )
  }

  if (!user && mustSignIn) return null

  return <>{children}</>
}
