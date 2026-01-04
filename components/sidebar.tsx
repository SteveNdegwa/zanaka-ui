"use client"
import { useEffect, useState } from "react"
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
  UserCheck,
  ChevronDown,
  ChevronRight,
  Tags,
  Building2,
  Wallet,
  ScrollText,
} from "lucide-react"

type NavItem =
  | {
      name: string
      href: string
      icon: React.ComponentType<any>
    }
  | {
      name: string
      icon: React.ComponentType<any>
      subItems: {
        name: string
        href: string
        icon: React.ComponentType<any>
      }[]
    }

const navigation: NavItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: GraduationCap },
  { name: "Staff", href: "/staff", icon: Users },
  { name: "Classes", href: "/classrooms", icon: BookOpen },
  { name: "Branches", href: "/branches", icon: Building },
  {
    name: "Finance",
    icon: DollarSign,
    subItems: [
      { name: "Fee Items", href: "/finance/fee-items", icon: DollarSign },
      { name: "Invoices", href: "/finance/invoices", icon: FileText },
      { name: "Bulk Invoices", href: "/finance/bulk-invoices", icon: Files },
      { name: "Payments", href: "/finance/payments", icon: CreditCard },
    ],
  },
  {
    name: "Expenses",
    icon: Receipt,
    subItems: [
      { name: "Departments", href: "/finance/departments", icon: Building2 },
      { name: "Expense Categories", href: "/finance/categories", icon: Tags },
      { name: "Vendors", href: "/finance/vendors", icon: UserCheck },
      { name: "Petty Cash", href: "/finance/petty-cash", icon: Wallet },
      { name: "Expenses", href: "/finance/expenses", icon: ScrollText },
    ],
  },
  // { name: "Reports", href: "/reports", icon: FileText },
  // { name: "Notifications", href: "/notifications", icon: Bell },
  // { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set(["Expenses"]))
  const pathname = usePathname()

  const toggleSubmenu = (name: string) => {
    setOpenSubmenus((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(name)) {
        newSet.delete(name)
      } else {
        newSet.add(name)
      }
      return newSet
    })
  }

  // Auto-open submenu if current path is inside it
  useEffect(() => {
    const newOpen = new Set<string>()
    navigation.forEach((item) => {
      if ("subItems" in item) {
        const hasActiveChild = item.subItems.some((sub) => pathname.startsWith(sub.href))
        if (hasActiveChild) {
          newOpen.add(item.name)
        }
      }
    })
    setOpenSubmenus(newOpen)
  }, [pathname])

  // Determine active state correctly
  const getIsActive = (item: NavItem) => {
    if ("href" in item) {
      if (item.href === "/") {
        // Dashboard active only on exact root and when no other main route matches
        const otherMainRoutes = navigation.filter((n): n is NavItem & { href: string } => "href" in n && n.href !== "/")
        const onOtherRoute = otherMainRoutes.some((n) => pathname.startsWith(n.href))
        return pathname === "/" && !onOtherRoute
      }
      return pathname.startsWith(item.href)
    }

    // Parent with subItems
    if ("subItems" in item) {
      return item.subItems.some((sub) => pathname.startsWith(sub.href))
    }

    return false
  }

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
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
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
                const isActive = getIsActive(item)
                const isOpen = openSubmenus.has(item.name)

                if ("subItems" in item) {
                  return (
                    <div key={item.name} className="space-y-1">
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                          isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && <span className="flex-1 text-left">{item.name}</span>}
                        {!isCollapsed && (
                          <div className="ml-auto">
                            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </div>
                        )}
                      </button>

                      {/* Submenu items */}
                      {!isCollapsed && isOpen && (
                        <div className="ml-6 space-y-1 border-l border-muted pl-4">
                          {item.subItems.map((sub) => {
                            const subActive = pathname.startsWith(sub.href)
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                className={cn(
                                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-accent/50",
                                  subActive ? "bg-accent/70 text-accent-foreground font-medium" : "text-muted-foreground"
                                )}
                                onClick={() => setIsMobileOpen(false)}
                              >
                                <sub.icon className="h-4 w-4 flex-shrink-0" />
                                <span>{sub.name}</span>
                              </Link>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                }

                // Regular item
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                      isCollapsed && "justify-center px-2"
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