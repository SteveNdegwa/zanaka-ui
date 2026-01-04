"use client"

import { useEffect, useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  Receipt, 
  TrendingUp, 
  TrendingDown,
  Users,
  Building2,
  School,
  UserPlus,
  AlertCircle,
  Clock,
  CreditCard,
  Wallet,
  CalendarDays,
  ArrowDownRight
} from "lucide-react"
import { financeRequests, HomepageStatistics } from "@/lib/requests/finances"
import { schoolRequests } from "@/lib/requests/schools"
import { useToast } from "@/src/use-toast"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type PeriodPreset = "today" | "this_week" | "this_month" | "this_year" | "all" | "custom"

interface BranchOption {
  id: string
  name: string
}

export default function FinanceDashboard() {
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<HomepageStatistics | null>(null)

  // Filters
  const [branches, setBranches] = useState<BranchOption[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>("this_month")
  const [customStart, setCustomStart] = useState<Date | undefined>(undefined)
  const [customEnd, setCustomEnd] = useState<Date | undefined>(undefined)

  // Fetch branches
  const fetchBranches = async () => {
    try {
      const response = await schoolRequests.listBranches()
      if (response.success && response.data) {
        setBranches(response.data.map((b: any) => ({ id: b.id, name: b.name })))
      }
    } catch (err) {
      console.error("Failed to load branches")
    }
  }

  const fetchStats = async () => {
    setLoading(true)
    try {
      // Build filter object as plain JSON (not URLSearchParams)
      const filters: Record<string, any> = {}

      if (selectedBranch !== "all") {
        filters.branch_id = selectedBranch
      }

      if (selectedPeriod === "custom") {
        if (customStart) filters.start_date = format(customStart, "yyyy-MM-dd")
        if (customEnd) filters.end_date = format(customEnd, "yyyy-MM-dd")
      } else if (selectedPeriod !== "all") {
        filters.period = selectedPeriod
      }

      // Send as POST body (object), not query string
      const response = await financeRequests.getHomepageStatistics(filters)

      if (response.success && response.data) {
        setStats(response.data)
      } else {
        toast.error('Failed to load statistics', {description: response.error})
      }
    } catch (err) {
      toast.error('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBranches()
    fetchStats()
  }, [])

  // Re-fetch whenever any filter changes
  useEffect(() => {
    fetchStats()
  }, [selectedBranch, selectedPeriod, customStart, customEnd])

  const schoolStats = stats?.school_stats ?? {
    total_branches: 0,
    total_classrooms: 0,
    active_students: 0,
    new_admissions: 0,
  }

  const periodLabel = stats?.period?.label || "All Time"

  const TrendIndicator = ({ 
    value, 
    isPositive 
  }: { 
    value?: number | null; 
    isPositive?: boolean | null 
  }) => {
    if (value == null || isPositive == null) {
      return <Badge variant="secondary" className="text-xs px-2 py-0.5">N/A</Badge>
    }

    return (
      <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-green-600" : "text-red-600")}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        <span>{Math.abs(value)}%</span>
        <span className="text-xs text-muted-foreground">vs previous</span>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Clean Header */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-foreground">Finance Dashboard</h1>
            <p className="text-lg text-muted-foreground mt-2">Real-time financial and operational overview</p>
          </div>

          {/* Professional Filter Bar */}
          <Card className="mb-10 shadow-sm border bg-card">
            <CardHeader className="pb-4 border-b bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Branch Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Branch</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger className="bg-background">
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Period Filter */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Period</label>
                  <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as PeriodPreset)}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="this_week">This Week</SelectItem>
                      <SelectItem value="this_month">This Month</SelectItem>
                      <SelectItem value="this_year">This Year</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Date Range */}
                {selectedPeriod === "custom" && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Start Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal bg-background">
                            {customStart ? format(customStart, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={customStart} onSelect={setCustomStart} />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">End Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className="w-full justify-start font-normal bg-background">
                            {customEnd ? format(customEnd, "PPP") : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar mode="single" selected={customEnd} onSelect={setCustomEnd} />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current Period - Elegant Badge */}
          <div className="mb-10 flex justify-end">
            <div className="inline-flex items-center gap-3 bg-muted/50 px-5 py-3 rounded-full border">
              <CalendarDays className="h-5 w-5 text-primary" />
              <span className="font-medium text-foreground">{periodLabel}</span>
            </div>
          </div>

          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(12)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="h-24 bg-muted/30 rounded-t-lg" />
                  <CardContent className="h-36 bg-muted/20" />
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Institution Overview */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Institution Overview</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text- font-medium">Branches</CardTitle>
                        <Building2 className="h-6 w-6 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-blue-600">{schoolStats.total_branches}</div>
                      <p className="text-sm text-muted-foreground mt-2">Active campuses</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Classrooms</CardTitle>
                        <School className="h-6 w-6 text-purple-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-purple-600">{schoolStats.total_classrooms}</div>
                      <p className="text-sm text-muted-foreground mt-2">Learning spaces</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Active Students</CardTitle>
                        <Users className="h-6 w-6 text-emerald-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-emerald-600">{schoolStats.active_students.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground mt-2">Currently enrolled</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/30 dark:to-amber-900/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">New Admissions</CardTitle>
                        <UserPlus className="h-6 w-6 text-amber-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-4xl font-bold text-amber-600">{schoolStats.new_admissions}</div>
                      <p className="text-sm text-muted-foreground mt-2">In selected period</p>
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Financial Performance */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Financial Performance</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Gross Cash Received</CardTitle>
                        <DollarSign className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.gross_cash_received?.formatted || "KSh 0.00"}</div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Refunds Issued</CardTitle>
                        <ArrowDownRight className="h-6 w-6 text-red-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{stats?.refunds_issued?.formatted || "KSh 0.00"}</div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/40 border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Net Cash Revenue</CardTitle>
                        <Receipt className="h-6 w-6 text-emerald-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600">{stats?.net_cash_revenue?.formatted || "KSh 0.00"}</div>
                      <TrendIndicator value={stats?.net_cash_revenue?.change} isPositive={stats?.net_cash_revenue?.is_positive} />
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/40 dark:to-indigo-900/40 border-indigo-200 dark:border-indigo-800">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Net Cash Profit</CardTitle>
                        <DollarSign className="h-6 w-6 text-indigo-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-indigo-600">{stats?.net_cash_profit?.formatted || "KSh 0.00"}</div>
                      <TrendIndicator value={stats?.net_cash_profit?.change} isPositive={stats?.net_cash_profit?.is_positive} />
                    </CardContent>
                  </Card>
                </div>
              </section>

              {/* Receivables & Operational Alerts */}
              <section className="mb-12">
                <h2 className="text-2xl font-bold text-foreground mb-6">Receivables & Operational Alerts</h2>
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                  <Card className="hover:shadow-lg transition-all duration-300 border-orange-200/60 dark:border-orange-800/60">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Outstanding Balance</CardTitle>
                        <AlertCircle className="h-6 w-6 text-orange-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{stats?.outstanding_balance?.formatted || "KSh 0.00"}</div>
                      <p className="text-sm text-muted-foreground mt-2">Total unpaid invoices</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-300 border-red-200/60 dark:border-red-800/60 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Overdue Balance</CardTitle>
                        <Clock className="h-6 w-6 text-red-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{stats?.overdue_balance?.formatted || "KSh 0.00"}</div>
                      <p className="text-sm text-red-600 mt-2">Requires immediate attention</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-300 border-yellow-200/60 dark:border-yellow-800/60">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Pending Payments</CardTitle>
                        <CreditCard className="h-6 w-6 text-yellow-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{stats?.pending_payments || 0}</div>
                      <p className="text-sm text-muted-foreground mt-2">Awaiting verification</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium">Expenses Paid</CardTitle>
                        <Wallet className="h-6 w-6 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats?.expenses?.formatted || "KSh 0.00"}</div>
                    </CardContent>
                  </Card>
                </div>
              </section>
            </>
          )}
        </div>
      </MainContent>
    </>
  )
}