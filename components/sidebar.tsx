"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSidebar } from "@/components/sidebar-provider"
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  DollarSign,
  FileText,
  Settings,
  Bell,
  Menu,
  X,
  Building,
  Receipt,
  CreditCard,
  Files,
} from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Teachers", href: "/teachers", icon: GraduationCap },
  { name: "Classes", href: "/classes", icon: BookOpen },
  { name: "Branches", href: "/branches", icon: Building },
  { name: "Invoices", href: "/finance/invoices", icon: FileText },
  { name: "Bulk Invoices", href: "/finance/bulk-invoices/", icon: Files },
  { name: "Payments", href: "/finance/payments", icon: CreditCard },
  { name: "Expenses", href: "/finance/expenses", icon: Receipt },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center border-b px-4">
            {!isCollapsed ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg">Zanaka</span>
              </div>
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
                <GraduationCap className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                // Dashboard is active on "/" or when no other route matches
                const isActive =
                  item.href === "/"
                    ? pathname === "/" || !navigation.some(nav => nav.href !== "/" && pathname.startsWith(nav.href))
                    : pathname.startsWith(item.href)

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center px-2",
                    )}
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!isCollapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </nav>
          </ScrollArea>

          {/* Collapse toggle */}
          <div className="border-t p-4 hidden md:block">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full justify-start"
            >
              <Menu className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}