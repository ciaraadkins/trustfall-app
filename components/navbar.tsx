"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { LogOut, User, Trophy, BarChart3, PlayCircle, Terminal, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const Navbar = () => {
  const { user, signOut } = useAuth()
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Always show navbar, but we'll handle the home page differently in layout.tsx

  return (
    <div className="bg-[#1a1a1a] border-b border-[#33FF33]/30 p-3 sticky top-0 z-50">
      <div className="container mx-auto max-w-6xl flex flex-wrap justify-between items-center gap-y-2">
        {/* Logo and Game Title */}
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[#33FF33]" />
          <Link href="/" className="text-xl font-mono font-bold tracking-tight text-[#33FF33]">
            TRUSTFALL
          </Link>
        </div>

        {/* Navigation Links */}
        <div className={`${isMobile ? 'w-full order-last mt-2' : ''} flex items-center gap-3 md:gap-6`}>
          <Link
            href="/leaderboard"
            className={`flex items-center justify-center gap-1 font-mono text-sm ${
              pathname === "/leaderboard" ? "text-[#33FF33]" : "text-[#33FF33]/70 hover:text-[#33FF33]"
            } ${isMobile ? 'flex-1 py-2 px-1 border border-[#33FF33]/30 rounded' : ''}`}
          >
            <Trophy className="w-4 h-4" />
            <span className={isMobile ? "text-xs" : ""}>LEADERBOARD</span>
          </Link>

          <Link
            href="/select"
            className={`flex items-center justify-center gap-1 font-mono text-sm ${
              pathname === "/game" || pathname === "/select" ? "text-[#33FF33]" : "text-[#33FF33]/70 hover:text-[#33FF33]"
            } ${isMobile ? 'flex-1 py-2 px-1 border border-[#33FF33]/30 rounded' : ''}`}
          >
            <PlayCircle className="w-4 h-4" />
            <span className={isMobile ? "text-xs" : ""}>PLAY</span>
          </Link>

          {/* Removed MODELS from navigation per requirements */}

          {user && (
            <Link
              href="/summary"
              className={`flex items-center justify-center gap-1 font-mono text-sm ${
                pathname === "/summary" ? "text-[#33FF33]" : "text-[#33FF33]/70 hover:text-[#33FF33]"
              } ${isMobile ? 'flex-1 py-2 px-1 border border-[#33FF33]/30 rounded' : ''}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span className={isMobile ? "text-xs" : ""}>RESULTS</span>
            </Link>
          )}
        </div>

        {/* User Section */}
        <div className={`${isMobile ? 'w-full mt-2 flex justify-center' : 'flex items-center gap-4'}`}>
          {user ? (
            <>
              <div className="text-sm font-mono text-[#00FFFF] flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{user.email?.split("@")[0]}</span>
              </div>
              <button 
                onClick={() => signOut()}
                className="flex items-center gap-1 text-[#FF5555]/80 hover:text-[#FF5555] text-sm font-mono ml-4"
              >
                <LogOut className="w-4 h-4" />
                <span>LOGOUT</span>
              </button>
            </>
          ) : (
            <Link
              href="/auth"
              className="flex items-center gap-1 text-[#00FFFF] hover:text-[#00FFFF]/80 text-sm font-mono"
            >
              <LogOut className="w-4 h-4" />
              <span>LOGIN</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar