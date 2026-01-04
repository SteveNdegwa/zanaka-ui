"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays, subWeeks, subMonths, subYears } from "date-fns"
import { CalendarIcon, Search, Eye, Receipt, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Building2, Wallet, ScrollText, CreditCard, PhoneIncoming, DollarSign, Ban, XCircle } from "lucide-react"
import Link from "next/link"
import { financeRequests, Expense, ExpenseStatus, ExpensePaymentMethod } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

type DateRangePreset = "all" | "today" | "yesterday" | "this_week" | "last_week" | "this_month" | "last_month" | "this_year" | "last_year" | "custom"

export default function ExpenseListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [allExpenses, setAllExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [vendorFilter, setVendorFilter] = useState<string>("all")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [datePreset, setDatePreset] = useState<DateRangePreset>("all")
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined)
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined)

  // Data for filters
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | "all">(10)

  // Minimizable filters
  const [filtersOpen, setFiltersOpen] = useState(true)

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [expRes, catRes, deptRes, vendRes] = await Promise.all([
          financeRequests.listExpenses({}),
          financeRequests.listExpenseCategories(),
          financeRequests.listDepartments(),
          financeRequests.listVendors(),
        ])

        if (expRes.success && expRes.data) setAllExpenses(expRes.data)
        if (catRes.success && catRes.data) setCategories(catRes.data.map((c: any) => ({ id: c.id, name: c.name })))
        if (deptRes.success && deptRes.data) setDepartments(deptRes.data.map((d: any) => ({ id: d.id, name: d.name })))
        if (vendRes.success && vendRes.data) setVendors(vendRes.data.map((v: any) => ({ id: v.id, name: v.name })))
      } catch (err) {
        toast.error("Failed to load expenses or filters")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [toast])

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, categoryFilter, departmentFilter, vendorFilter, minAmount, maxAmount, datePreset, customStartDate, customEndDate, pageSize])

  // Apply filters
  const filteredExpenses = allExpenses
    .filter(e =>
      searchTerm === "" ||
      e.expense_reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.vendor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(e => statusFilter === "all" || e.status === statusFilter)
    .filter(e => categoryFilter === "all" || e.category_id === categoryFilter)
    .filter(e => departmentFilter === "all" || e.department_id === departmentFilter)
    .filter(e => vendorFilter === "all" || e.vendor_id === vendorFilter || (vendorFilter === "" && !e.vendor_id))
    .filter(e => {
      const amount = parseFloat(e.total_amount)
      const min = minAmount ? parseFloat(minAmount) : -Infinity
      const max = maxAmount ? parseFloat(maxAmount) : Infinity
      return amount >= min && amount <= max
    })
    .filter(e => {
      if (datePreset === "all") return true
      const expDate = e.expense_date ? new Date(e.expense_date) : null
      if (!expDate) return false
      const now = new Date()
      switch (datePreset) {
        case "today": return format(expDate, "yyyy-MM-dd") === format(now, "yyyy-MM-dd")
        case "yesterday": return format(expDate, "yyyy-MM-dd") === format(subDays(now, 1), "yyyy-MM-dd")
        case "this_week": return expDate >= startOfWeek(now) && expDate <= endOfWeek(now)
        case "last_week": return expDate >= startOfWeek(subWeeks(now, 1)) && expDate <= endOfWeek(subWeeks(now, 1))
        case "this_month": return expDate >= startOfMonth(now) && expDate <= endOfMonth(now)
        case "last_month": return expDate >= startOfMonth(subMonths(now, 1)) && expDate <= endOfMonth(subMonths(now, 1))
        case "this_year": return expDate >= startOfYear(now) && expDate <= endOfYear(now)
        case "last_year": return expDate >= startOfYear(subYears(now, 1)) && expDate <= endOfYear(subYears(now, 1))
        case "custom":
          if (!customStartDate || !customEndDate) return true
          return expDate >= customStartDate && expDate <= customEndDate
        default: return true
      }
    })

  // Totals
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.total_amount), 0)

  const approvedExpenses = filteredExpenses.filter(e => e.status === ExpenseStatus.APPROVED)
  const totalApproved = approvedExpenses.reduce((sum, e) => sum + parseFloat(e.total_amount), 0)

  const pendingExpenses = filteredExpenses.filter(e => e.status === ExpenseStatus.PENDING_APPROVAL)
  const totalPending = pendingExpenses.reduce((sum, e) => sum + parseFloat(e.total_amount), 0)

  const paidExpenses = filteredExpenses.filter(e => e.status === ExpenseStatus.PAID)
  const totalPaid = paidExpenses.reduce((sum, e) => sum + parseFloat(e.total_amount), 0)

  const rejectedExpenses = filteredExpenses.filter(e => e.status === ExpenseStatus.REJECTED)
  const totalRejected = rejectedExpenses.reduce((sum, e) => sum + parseFloat(e.total_amount), 0)

  const cancelledExpenses = filteredExpenses.filter(e => e.status === ExpenseStatus.CANCELLED)
  const totalCancelled = cancelledExpenses.reduce((sum, e) => sum + parseFloat(e.total_amount), 0)

  // Pagination
  const isShowAll = pageSize === "all"
  const totalPages = isShowAll ? 1 : Math.ceil(filteredExpenses.length / (pageSize as number))
  const paginatedExpenses = isShowAll
    ? filteredExpenses
    : filteredExpenses.slice((currentPage - 1) * (pageSize as number), currentPage * (pageSize as number))

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "MPESA": return <PhoneIncoming className="h-4 w-4" />
      case "BANK_TRANSFER": return <Building2 className="h-4 w-4" />
      case "CASH": return <Wallet className="h-4 w-4" />
      case "CHEQUE": return <ScrollText className="h-4 w-4" />
      case "CARD": return <CreditCard className="h-4 w-4" />
      case "PETTY_CASH": return <Wallet className="h-4 w-4" />
      default: return null
    }
  }

  const getStatusBadge = (status: ExpenseStatus) => {
    const config: Record<ExpenseStatus, { label: string; variant: any }> = {
      DRAFT: { label: "Draft", variant: "secondary" },
      PENDING_APPROVAL: { label: "Pending Approval", variant: "secondary" },
      APPROVED: { label: "Approved", variant: "default" },
      PAID: { label: "Paid", variant: "default" },
      REJECTED: { label: "Rejected", variant: "destructive" },
      CANCELLED: { label: "Cancelled", variant: "destructive" },
    }
    const cfg = config[status] || { label: status, variant: "secondary" }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MainContent>
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold text-foreground">Expenses</h1>
                <p className="text-muted-foreground mt-2">Manage and track all school expenses</p>
              </div>
              <Button onClick={() => router.push("/finance/expenses/create")} className="shadow-lg">
                <Receipt className="w-5 h-5 mr-2" />
                Record Expense
              </Button>
            </div>

            {/* Summary Cards – Now with Total Cancelled */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">KSh {totalExpenses.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">All recorded expenses</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">KSh {totalPaid.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Actual cash outflow</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Approved</CardTitle>
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">KSh {totalApproved.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Ready for payment</p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">KSh {totalPending.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
                </CardContent>
              </Card>

               <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    Rejected Expenses
                  </CardTitle>
                  <Ban className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold text-red-600">
                    KSh {totalRejected.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Declined during approval
                  </p>
                </CardContent>
              </Card>


              <Card className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  Cancelled Expenses
                </CardTitle>
                <XCircle className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-semibold text-amber-600">
                  KSh {totalCancelled.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Withdrawn by requester
                </p>
              </CardContent>
            </Card>

            </div>

            {/* Minimizable Filters */}
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
                      <Label htmlFor="search" className="text-sm font-medium">Search</Label>
                      <div className="relative mt-2">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Reference, description, vendor..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger id="status" className="mt-2">
                          <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="DRAFT">Draft</SelectItem>
                          <SelectItem value="PENDING_APPROVAL">Pending Approval</SelectItem>
                          <SelectItem value="APPROVED">Approved</SelectItem>
                          <SelectItem value="PAID">Paid</SelectItem>
                          <SelectItem value="REJECTED">Rejected</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Category */}
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger id="category" className="mt-2">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Department */}
                    <div>
                      <Label htmlFor="department" className="text-sm font-medium">Department</Label>
                      <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                        <SelectTrigger id="department" className="mt-2">
                          <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Vendor */}
                    <div>
                      <Label htmlFor="vendor" className="text-sm font-medium">Vendor</Label>
                      <Select value={vendorFilter} onValueChange={setVendorFilter}>
                        <SelectTrigger id="vendor" className="mt-2">
                          <SelectValue placeholder="All Vendors" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vendors</SelectItem>
                          {vendors.map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Amount Range */}
                    <div className="lg:col-span-2 xl:col-span-1">
                      <Label className="text-sm font-medium">Amount Range (KSh)</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Input type="number" placeholder="Min" value={minAmount} onChange={(e) => setMinAmount(e.target.value)} />
                        <Input type="number" placeholder="Max" value={maxAmount} onChange={(e) => setMaxAmount(e.target.value)} />
                      </div>
                    </div>

                    {/* Date Preset */}
                    <div>
                      <Label htmlFor="date-preset" className="text-sm font-medium">Date Range</Label>
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

                    {/* Custom Date */}
                    {datePreset === "custom" && (
                      <div className="lg:col-span-2 xl:col-span-2">
                        <Label className="text-sm font-medium">Custom Range</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="justify-start text-left font-normal w-full">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customStartDate ? format(customStartDate, "PPP") : "Start date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={customStartDate} onSelect={setCustomStartDate} />
                            </PopoverContent>
                          </Popover>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="justify-start text-left font-normal w-full">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {customEndDate ? format(customEndDate, "PPP") : "End date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={customEndDate} onSelect={setCustomEndDate} />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Expenses Table */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Expenses ({filteredExpenses.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center">Loading expenses...</TableCell>
                        </TableRow>
                      ) : filteredExpenses.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                            No expenses found matching your filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedExpenses.map((exp) => (
                          <TableRow key={exp.id}>
                            <TableCell className="font-mono">{exp.expense_reference}</TableCell>
                            <TableCell>{exp.expense_date ? format(new Date(exp.expense_date), "dd MMM yyyy") : "—"}</TableCell>
                            <TableCell className="max-w-xs truncate">{exp.name}</TableCell>
                            <TableCell>{exp.vendor_name || "—"}</TableCell>
                            <TableCell>{exp.department_name}</TableCell>
                            <TableCell className="font-semibold">KSh {parseFloat(exp.total_amount).toLocaleString()}</TableCell>
                            <TableCell>
                              {exp.payment_method ? (
                                <div className="flex items-center gap-2">
                                  {getMethodIcon(exp.payment_method)}
                                  <span>{exp.payment_method.replace("_", " ")}</span>
                                </div>
                              ) : "—"}
                            </TableCell>
                            <TableCell>{getStatusBadge(exp.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/finance/expenses/${exp.id}`)}
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
                {!loading && filteredExpenses.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                    <div className="text-sm text-muted-foreground">
                      {isShowAll ? `Showing all ${filteredExpenses.length} expenses` :
                        `Showing ${(currentPage - 1) * (pageSize as number) + 1}–${Math.min(currentPage * (pageSize as number), filteredExpenses.length)} of ${filteredExpenses.length} expenses`}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Rows per page</span>
                        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(v === "all" ? "all" : Number(v))}>
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
                        <span className="text-sm">Page {currentPage} of {totalPages}</span>
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
        </main>
      </MainContent>
    </div>
  )
}