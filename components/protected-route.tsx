"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

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

  useEffect(() => {
    // If not loading and user not logged in
    if (!loading && !user) {
      // If guest access is not allowed, redirect to auth
      if (!allowGuest) {
        router.push(`/auth?redirect=${pathname}`)
      }
    }
  }, [user, loading, router, allowGuest, pathname])

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

  // If user is not logged in and guest access is not allowed, don't render children
  if (!user && !allowGuest) {
    return null
  }

  return <>{children}</>
}

