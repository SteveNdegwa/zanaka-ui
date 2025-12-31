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
import { CalendarIcon, Search, Eye, DollarSign, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { financeRequests, Invoice, InvoiceStatus } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

type DateRangePreset = "all" | "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "last_month" | "this_year" | "last_year" | "custom"

export default function InvoicesPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [allInvoices, setAllInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [feeItemFilter, setFeeItemFilter] = useState<string>("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all")
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | "all">(10)

  // Minimizable filters
  const [filtersOpen, setFiltersOpen] = useState(true)

  // Unique fee items
  const feeItems = Array.from(new Set(allInvoices.flatMap(inv => inv.invoice_items.map(item => item.description))))

  // Fetch invoices
  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true)
      const response = await financeRequests.listInvoices({})
      if (response.success && response.data) {
        setAllInvoices(response.data)
      } else {
        toast.error("Failed to load invoices")
      }
      setLoading(false)
    }

    fetchInvoices()
  }, [toast])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, feeItemFilter, minAmount, maxAmount, datePreset, customStartDate, customEndDate, pageSize])

  // Apply filters
  const filteredInvoices = allInvoices
    .filter(inv => 
      searchTerm === "" || 
      inv.invoice_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.student_full_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(inv => statusFilter === "all" || inv.status === statusFilter)
    .filter(inv => {
      if (feeItemFilter === "all") return true
      return inv.invoice_items.some(item =>
        item.description.toLowerCase() === feeItemFilter.toLowerCase()
      )
    })
    .filter(inv => {
      const amount = parseFloat(inv.total_amount)
      const min = minAmount ? parseFloat(minAmount) : -Infinity
      const max = maxAmount ? parseFloat(maxAmount) : Infinity
      return amount >= min && amount <= max
    })
    .filter(inv => {
      if (datePreset === "all") return true
      const issueDate = new Date(inv.created_at)
      const now = new Date()

      switch (datePreset) {
        case "today":
          return format(issueDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
        case "yesterday":
          return format(issueDate, "yyyy-MM-dd") === format(subDays(now, 1), "yyyy-MM-dd")
        case "this_week":
          return issueDate >= startOfWeek(now) && issueDate <= endOfWeek(now)
        case "last_week":
          const lastWeekStart = startOfWeek(subWeeks(now, 1))
          const lastWeekEnd = endOfWeek(subWeeks(now, 1))
          return issueDate >= lastWeekStart && issueDate <= lastWeekEnd
        case "this_month":
          return issueDate >= startOfMonth(now) && issueDate <= endOfMonth(now)
        case "last_month":
          const lastMonthStart = startOfMonth(subMonths(now, 1))
          const lastMonthEnd = endOfMonth(subMonths(now, 1))
          return issueDate >= lastMonthStart && issueDate <= lastMonthEnd
        case "this_year":
          return issueDate >= startOfYear(now) && issueDate <= endOfYear(now)
        case "last_year":
          const lastYearStart = startOfYear(subYears(now, 1))
          const lastYearEnd = endOfYear(subYears(now, 1))
          return issueDate >= lastYearStart && issueDate <= lastYearEnd
        case "custom":
          if (!customStartDate || !customEndDate) return true
          return issueDate >= customStartDate && issueDate <= customEndDate
        default:
          return true
      }
    })

  // Totals (exclude cancelled)
  const activeInvoicesForTotals = filteredInvoices.filter(inv => inv.status !== InvoiceStatus.CANCELLED)
  const totalInvoiced = activeInvoicesForTotals.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0)
  const totalPaid = activeInvoicesForTotals.reduce((sum, inv) => sum + parseFloat(inv.paid_amount), 0)
  const totalBalance = activeInvoicesForTotals.reduce((sum, inv) => sum + parseFloat(inv.balance), 0)

  // Pagination logic
  const isShowAll = pageSize === "all"
  const totalPages = isShowAll ? 1 : Math.ceil(filteredInvoices.length / (pageSize as number))
  const paginatedInvoices = isShowAll
    ? filteredInvoices
    : filteredInvoices.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number))

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; variant: any }> = {
      [InvoiceStatus.PAID]: { label: "Paid", variant: "default" },
      [InvoiceStatus.PARTIALLY_PAID]: { label: "Partially Paid", variant: "secondary" },
      [InvoiceStatus.PENDING]: { label: "Pending", variant: "secondary" },
      [InvoiceStatus.OVERDUE]: { label: "Overdue", variant: "destructive" },
      [InvoiceStatus.CANCELLED]: { label: "Cancelled", variant: "destructive" },
    }

    const cfg = config[status] || { label: status, variant: "secondary" }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/finance/invoices/${invoiceId}`)
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground">View and manage all student invoices</p>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">KSh {totalInvoiced.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">From active invoices</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">KSh {totalPaid.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Received on active invoices</p>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium">Outstanding Balance</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">KSh {totalBalance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Remaining on active invoices</p>
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
                        placeholder="Invoice ref, student name..."
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
                        <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                        <SelectItem value={InvoiceStatus.PARTIALLY_PAID}>Partially Paid</SelectItem>
                        <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                        <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
                        <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fee Item */}
                  <div>
                    <Label htmlFor="feeItem" className="text-sm font-medium">
                      Fee Item
                    </Label>
                    <Select value={feeItemFilter} onValueChange={setFeeItemFilter}>
                      <SelectTrigger id="feeItem" className="mt-2">
                        <SelectValue placeholder="All Fee Items" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Fee Items</SelectItem>
                        {feeItems.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
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

          {/* Invoices Table */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Invoices ({filteredInvoices.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Reference</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">
                          Loading invoices...
                        </TableCell>
                      </TableRow>
                    ) : filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                          No invoices found matching your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.invoice_reference}</TableCell>
                          <TableCell>{invoice.student_full_name}</TableCell>
                          <TableCell>KSh {parseFloat(invoice.total_amount).toLocaleString()}</TableCell>
                          <TableCell>KSh {parseFloat(invoice.paid_amount).toLocaleString()}</TableCell>
                          <TableCell>KSh {parseFloat(invoice.balance).toLocaleString()}</TableCell>
                          <TableCell>{format(new Date(invoice.created_at), "dd MMM yyyy")}</TableCell>
                          <TableCell>{invoice.due_date ? format(new Date(invoice.due_date), "dd MMM yyyy") : "—"}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice.id)}>
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
              {!loading && filteredInvoices.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="text-sm text-muted-foreground">
                    {isShowAll ? (
                      <>Showing all {filteredInvoices.length} invoices</>
                    ) : (
                      <>
                        Showing {(currentPage - 1) * (pageSize as number) + 1}–
                        {Math.min(currentPage * (pageSize as number), filteredInvoices.length)} of {filteredInvoices.length} invoices
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