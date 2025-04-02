"use client"

import { usePathname } from "next/navigation"
import Navbar from "./navbar"

const NavbarWrapper = () => {
  const pathname = usePathname()
  
  // Don't show navbar on auth page
  if (pathname === "/auth") {
    return null
  }

  return <Navbar />
}

export default NavbarWrapper
