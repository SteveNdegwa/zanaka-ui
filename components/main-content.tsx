"use client"

import type React from "react"

import { useSidebar } from "@/components/sidebar-provider"
import { cn } from "@/lib/utils"

interface MainContentProps {
  children: React.ReactNode
}

export function MainContent({ children }: MainContentProps) {
  const { isCollapsed } = useSidebar()

  return <div className={cn("transition-all duration-300", isCollapsed ? "md:ml-20" : "md:ml-72")}>{children}</div>
}
