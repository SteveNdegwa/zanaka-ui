"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from "date-fns"
import { CalendarIcon, Search, Eye, DollarSign, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, PhoneIncoming, Building2, Wallet, ScrollText, CreditCard } from "lucide-react"
import { financeRequests, Payment, PaymentStatus, PaymentMethod } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

type DateRangePreset = "all" | "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "last_month" | "this_year" | "last_year" | "custom"

export default function PaymentsPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [allPayments, setAllPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all")
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | "all">(10)

  // Minimizable filters
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Fetch payments
  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true)
      const response = await financeRequests.listPayments({})
      if (response.success && response.data) {
        setAllPayments(response.data)
      } else {
        toast.error("Failed to load payments")
      }
      setLoading(false)
    }
    fetchPayments()
  }, [toast])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, methodFilter, minAmount, maxAmount, datePreset, customStartDate, customEndDate, pageSize])

  // Apply filters
  const filteredPayments = allPayments
    .filter(p =>
      searchTerm === "" ||
      p.payment_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.student_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.student_reg_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.mpesa_receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.bank_reference?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(p => statusFilter === "all" || p.status === statusFilter)
    .filter(p => methodFilter === "all" || p.payment_method === methodFilter)
    .filter(p => {
      const amount = parseFloat(p.amount)
      const min = minAmount ? parseFloat(minAmount) : -Infinity
      const max = maxAmount ? parseFloat(maxAmount) : Infinity
      return amount >= min && amount <= max
    })
    .filter(p => {
      if (datePreset === "all") return true
      const paymentDate = new Date(p.created_at)
      const now = new Date()
      switch (datePreset) {
        case "today":
          return format(paymentDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
        case "yesterday":
          return format(paymentDate, "yyyy-MM-dd") === format(subDays(now, 1), "yyyy-MM-dd")
        case "this_week":
          return paymentDate >= startOfWeek(now) && paymentDate <= endOfWeek(now)
        case "last_week":
          const lastWeekStart = startOfWeek(subWeeks(now, 1))
          const lastWeekEnd = endOfWeek(subWeeks(now, 1))
          return paymentDate >= lastWeekStart && paymentDate <= lastWeekEnd
        case "this_month":
          return paymentDate >= startOfMonth(now) && paymentDate <= endOfMonth(now)
        case "last_month":
          const lastMonthStart = startOfMonth(subMonths(now, 1))
          const lastMonthEnd = endOfMonth(subMonths(now, 1))
          return paymentDate >= lastMonthStart && paymentDate <= lastMonthEnd
        case "this_year":
          return paymentDate >= startOfYear(now) && paymentDate <= endOfYear(now)
        case "last_year":
          const lastYearStart = startOfYear(subYears(now, 1))
          const lastYearEnd = endOfYear(subYears(now, 1))
          return paymentDate >= lastYearStart && paymentDate <= lastYearEnd
        case "custom":
          if (!customStartDate || !customEndDate) return true
          return paymentDate >= customStartDate && paymentDate <= customEndDate
        default:
          return true
      }
    })

  // Totals
  const totalCollected = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const completedPayments = filteredPayments.filter(p => p.status === PaymentStatus.COMPLETED)
  const totalCompleted = completedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
  const pendingPayments = filteredPayments.filter(p => p.status === PaymentStatus.PENDING)
  const totalPending = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)

  // Pagination logic
  const isShowAll = pageSize === "all"
  const totalPages = isShowAll ? 1 : Math.ceil(filteredPayments.length / (pageSize as number))
  const paginatedPayments = isShowAll
    ? filteredPayments
    : filteredPayments.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number))

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "MPESA": return <PhoneIncoming className="h-4 w-4" />
      case "BANK": return <Building2 className="h-4 w-4" />
      case "CASH": return <Wallet className="h-4 w-4" />
      case "CHEQUE": return <ScrollText className="h-4 w-4" />
      case "CARD": return <CreditCard className="h-4 w-4" />
      default: return <CreditCard className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: PaymentStatus) => {
    const config: Record<PaymentStatus, { label: string; variant: any }> = {
      [PaymentStatus.COMPLETED]: { label: "Completed", variant: "default" },
      [PaymentStatus.PENDING]: { label: "Pending Approval", variant: "secondary" },
      [PaymentStatus.REVERSED]: { label: "Reversed", variant: "destructive" },
      [PaymentStatus.FAILED]: { label: "Failed", variant: "destructive" },
      [PaymentStatus.REFUNDED]: { label: "Fully Refunded", variant: "destructive" },
      [PaymentStatus.PARTIALLY_REFUNDED]: { label: "Partially Refunded", variant: "secondary" },
    }
    const cfg = config[status] || { label: status, variant: "secondary" }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const handleViewPayment = (studentId: string, paymentId: string) => {
    router.push(`/students/${studentId}/payments/${paymentId}`)
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
            <p className="text-muted-foreground">View and manage all student payments</p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KSh {totalCollected.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">All filtered payments</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">KSh {totalCompleted.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Approved and usable</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">KSh {totalPending.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
              </CardContent>
            </Card>
          </div>

          {/* Minimizable Filters - Enhanced Styling */}
            <Card className="mb-6 shadow-sm">
            <CardHeader className="pb-3">
                <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center justify-between w-full text-left hover:bg-accent/50 rounded-lg px-4 py-2 -mx-4 transition-colors"
                >
                <CardTitle className="text-lg">Filters</CardTitle>
                {filtersOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
            </CardHeader>

            {filtersOpen && (
                <CardContent className="pt-6 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {/* Search */}
                    <div className="lg:col-span-2 xl:col-span-1">
                    <Label htmlFor="search" className="text-sm font-medium">
                        Search
                    </Label>
                    <div className="relative mt-2">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                        id="search"
                        placeholder="Reference, student, receipt, bank ref..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        />
                    </div>
                    </div>

                    {/* Status */}
                    <div>
                    <Label htmlFor="status" className="text-sm font-medium">
                        Status
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status" className="mt-2">
                        <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                        <SelectItem value={PaymentStatus.PENDING}>Pending Approval</SelectItem>
                        <SelectItem value={PaymentStatus.REVERSED}>Reversed</SelectItem>
                        <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                        <SelectItem value={PaymentStatus.REFUNDED}>Fully Refunded</SelectItem>
                        <SelectItem value={PaymentStatus.PARTIALLY_REFUNDED}>Partially Refunded</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    {/* Payment Method */}
                    <div>
                    <Label htmlFor="method" className="text-sm font-medium">
                        Payment Method
                    </Label>
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                        <SelectTrigger id="method" className="mt-2">
                        <SelectValue placeholder="All Methods" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Methods</SelectItem>
                        <SelectItem value={PaymentMethod.MPESA}>M-Pesa</SelectItem>
                        <SelectItem value={PaymentMethod.BANK}>Bank Transfer</SelectItem>
                        <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                        <SelectItem value={PaymentMethod.CHEQUE}>Cheque</SelectItem>
                        <SelectItem value={PaymentMethod.CARD}>Card</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    {/* Amount Range */}
                    <div className="lg:col-span-2 xl:col-span-1">
                    <Label className="text-sm font-medium">Amount Range (KSh)</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <Input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        />
                        <Input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        />
                    </div>
                    </div>

                    {/* Date Range Preset */}
                    <div>
                    <Label htmlFor="date-preset" className="text-sm font-medium">
                        Date Range
                    </Label>
                    <Select value={datePreset} onValueChange={(v) => setDatePreset(v as DateRangePreset)}>
                        <SelectTrigger id="date-preset" className="mt-2">
                        <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="this_week">This Week</SelectItem>
                        <SelectItem value="last_week">Last Week</SelectItem>
                        <SelectItem value="this_month">This Month</SelectItem>
                        <SelectItem value="last_month">Last Month</SelectItem>
                        <SelectItem value="this_year">This Year</SelectItem>
                        <SelectItem value="last_year">Last Year</SelectItem>
                        <SelectItem value="custom">Custom Range</SelectItem>
                        </SelectContent>
                    </Select>
                    </div>

                    {/* Custom Date Range */}
                    {datePreset === "custom" && (
                    <div className="lg:col-span-2 xl:col-span-2">
                        <Label className="text-sm font-medium">Custom Date Range</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="justify-start text-left font-normal w-full"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customStartDate ? format(customStartDate, "PPP") : "Start date"}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={customStartDate}
                                onSelect={setCustomStartDate}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>

                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="justify-start text-left font-normal w-full"
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customEndDate ? format(customEndDate, "PPP") : "End date"}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={customEndDate}
                                onSelect={setCustomEndDate}
                                initialFocus
                            />
                            </PopoverContent>
                        </Popover>
                        </div>
                    </div>
                    )}
                </div>
                </CardContent>
            )}
            </Card>

          {/* Payments Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Payments ({filteredPayments.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Unassigned</TableHead>
                      {/* <TableHead>Available Refund</TableHead> */}
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          Loading payments...
                        </TableCell>
                      </TableRow>
                    ) : filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          No payments found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.payment_reference}</TableCell>
                          <TableCell>{payment.student_full_name}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            {getMethodIcon(payment.payment_method)}
                            <span>{payment.payment_method.replace("_", " ")}</span>
                          </TableCell>
                          <TableCell>KSh {parseFloat(payment.amount).toLocaleString()}</TableCell>
                          <TableCell>KSh {parseFloat(payment.unassigned_amount || "0").toLocaleString()}</TableCell>
                          {/* <TableCell>KSh {parseFloat(payment.available_for_refund || "0").toLocaleString()}</TableCell> */}
                          <TableCell>{format(new Date(payment.created_at), "dd MMM yyyy")}</TableCell>
                          <TableCell>{getStatusBadge(payment.status as PaymentStatus)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewPayment(payment.student_id!, payment.id)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {!loading && filteredPayments.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="text-sm text-muted-foreground">
                    {isShowAll ? (
                      <>Showing all {filteredPayments.length} payments</>
                    ) : (
                      <>
                        Showing {(currentPage - 1) * (pageSize as number) + 1}–
                        {Math.min(currentPage * (pageSize as number), filteredPayments.length)} of {filteredPayments.length} payments
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rows per page</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(value) => setPageSize(value === "all" ? "all" : Number(value))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1 || isShowAll}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <span className="text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || isShowAll}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainContent>
    </>
  )
}