"use client"

import { Bell, Search, Settings, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authRequests } from "@/lib/requests/auth"
import { useRouter } from "next/navigation"
import { useToast } from "@/src/use-toast"
import { useUserProfileStore } from "@/store/store"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const router = useRouter()
  const { toast } = useToast()
  const [scrolled, setScrolled] = useState(false)
  const { userProfile, fullName, roleName, clearUserProfile } = useUserProfileStore()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      const response = await authRequests.logout()
      if (response.success) {
        clearUserProfile()
        router.push("/auth")
        toast.success('Logged out', { description: 'You have been successfully logged out' })
      } else {
        toast.success('Logout failed', { description: response.error })
      }
    } catch (err) {
      toast.success('Logout failed', { description: 'Network error. Please try again.' })
    }
  }

  const displayName = fullName() || "User"
  const displayRole = roleName() ? roleName()!.replace("_", " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : "User"
  const initials = displayName
    .split(" ")
    .map(n => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    // <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-all duration-300",
        scrolled
          ? "bg-background/75 backdrop-blur supports-[backdrop-filter]:bg-background/20 shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Left: Empty for symmetry (logo/menu handled by sidebar on mobile) */}
        <div className="flex items-center gap-6">
          <div className="md:hidden" />
        </div>

        {/* Right: Search + Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar - Hidden on small screens */}
          {/* <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search..." 
              className="w-72 pl-10 bg-muted/50 border-muted focus:bg-background"
            />
          </div> */}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          {/* <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
              3
            </span>
          </Button> */}

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={userProfile?.photo || undefined} alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile?.reg_number || userProfile?.username || "admin@school.edu"}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground capitalize">
                    {displayRole}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator /> */}
              <DropdownMenuItem 
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}