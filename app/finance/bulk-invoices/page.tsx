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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Eye, FileText, Users, Calendar, DollarSign } from "lucide-react"
import Link from "next/link"
import { financeRequests } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

interface BulkInvoiceSummary {
  id: string
  bulk_reference: string
  created_by: string
  created_at: string
  student_count: number
  invoice_count: number
  total_amount: string
  due_date: string
  description: string
  notes: string | null
  is_cancelled: boolean
}

export default function BulkInvoicesListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [bulkInvoices, setBulkInvoices] = useState<BulkInvoiceSummary[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<BulkInvoiceSummary[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "cancelled">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | "all">(10)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, pageSize])

  useEffect(() => {
    const fetchBulkInvoices = async () => {
      try {
        const response = await financeRequests.listBulkInvoices()
        if (response.success && response.data) {
          setBulkInvoices(response.data)
          setFilteredInvoices(response.data)
        } else {
          toast.error("Failed to load bulk invoices", {
            description: response.error || "Please try again later.",
          })
        }
      } catch (error) {
        toast.error("Failed to load bulk invoices", {
          description: "Something went wrong. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBulkInvoices()
  }, [toast])

  useEffect(() => {
    let filtered = bulkInvoices

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(invoice =>
        invoice.bulk_reference.toLowerCase().includes(lowerSearch) ||
        invoice.created_by.toLowerCase().includes(lowerSearch) ||
        invoice.description.toLowerCase().includes(lowerSearch) ||
        (invoice.notes && invoice.notes.toLowerCase().includes(lowerSearch))
      )
    }

    if (statusFilter !== "all") {
      const isCancelled = statusFilter === "cancelled"
      filtered = filtered.filter(invoice => invoice.is_cancelled === isCancelled)
    }

    setFilteredInvoices(filtered)
  }, [searchTerm, statusFilter, bulkInvoices])

  const isShowAll = pageSize === "all"
  const totalPages = isShowAll ? 1 : Math.ceil(filteredInvoices.length / pageSize)

  const paginatedInvoices = isShowAll
    ? filteredInvoices
    : filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const getStatusBadge = (isCancelled: boolean) => {
    if (isCancelled) {
      return <Badge variant="destructive">Cancelled</Badge>
    }
    return <Badge variant="default">Active</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatDueDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <>
      <Sidebar />
      <MainContent>
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Bulk Invoices</h1>
                <p className="text-muted-foreground">View and manage all bulk invoice operations</p>
              </div>
              <Link href="/finance/bulk-invoices/create">
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Bulk Invoice
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by reference, creator, description, or notes..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "cancelled")}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bulk Invoices Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Bulk Invoices ({filteredInvoices.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead>Created On</TableHead>
                        <TableHead>Students</TableHead>
                        <TableHead>Invoices</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={10} className="py-10 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredInvoices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={10} className="py-8 text-center text-muted-foreground">
                            No bulk invoices found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        paginatedInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" />
                                {invoice.bulk_reference}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={invoice.description}>
                                {invoice.description || <span className="text-muted-foreground italic">No description</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{invoice.created_by}</div>
                            </TableCell>
                            <TableCell>{formatDate(invoice.created_at)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {invoice.student_count}
                              </div>
                            </TableCell>
                            <TableCell>{invoice.invoice_count}</TableCell>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4" />
                                KSh {parseFloat(invoice.total_amount).toLocaleString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {formatDueDate(invoice.due_date)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(invoice.is_cancelled)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/finance/bulk-invoices/${invoice.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
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
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
                  <div className="text-sm text-muted-foreground">
                    {pageSize === "all" ? (
                      <>Showing all {filteredInvoices.length} bulk invoices</>
                    ) : (
                      <>
                        Showing{" "}
                        {Math.min((currentPage - 1) * pageSize + 1, filteredInvoices.length)}–
                        {Math.min(currentPage * pageSize, filteredInvoices.length)} of{" "}
                        {filteredInvoices.length} bulk invoices
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Rows</span>
                      <Select
                        value={String(pageSize)}
                        onValueChange={(value) =>
                          setPageSize(value === "all" ? "all" : Number(value))
                        }
                      >
                        <SelectTrigger className="w-[100px]">
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
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1 || pageSize === "all"}
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === totalPages || pageSize === "all"}
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </MainContent>
    </>
  )
}