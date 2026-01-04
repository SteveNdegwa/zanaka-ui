"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Building, Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { financeRequests, Vendor, ExpenseStatus } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ViewVendorPage() {
  const router = useRouter()
  const params = useParams()
  const vendorId = params.id as string
  const { toast } = useToast()

  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expensesLoading, setExpensesLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchVendor = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.viewVendor(vendorId)
        if (response.success && response.data) {
          setVendor(response.data)
        }
      } catch (error) {
        toast.error("Failed to load vendor")
        router.push("/finance/vendors")
      } finally {
        setLoading(false)
      }
    }
    fetchVendor()
  }, [vendorId, router, toast])

  useEffect(() => {
    const fetchExpenses = async () => {
      setExpensesLoading(true)
      try {
        const response = await financeRequests.listExpenses({
          vendor_id: vendorId,
          status: statusFilter === "all" ? undefined : statusFilter,
          search_term: searchTerm || undefined,
        })
        if (response.success && response.data) {
          setExpenses(response.data)
        }
      } catch (error) {
        toast.error("Failed to load expenses")
      } finally {
        setExpensesLoading(false)
      }
    }
    fetchExpenses()
  }, [vendorId, statusFilter, searchTerm, toast])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const response = await financeRequests.deactivateVendor(vendorId)
      if (response.success) {
        toast.success("Vendor deactivated successfully")
        router.push("/finance/vendors")
      } else {
        toast.error("Failed to deactivate vendor", { description: response.error })
      }
    } catch (err) {
      toast.error("Failed to deactivate vendor")
    } finally {
      setDeleting(false)
    }
  }

  const formatAmount = (amount: string | number) => `KSh ${parseFloat(String(amount)).toLocaleString()}`

  const getStatusBadge = (status: ExpenseStatus) => {
    const config: Record<ExpenseStatus, string> = {
      DRAFT: "bg-gray-100 text-gray-800",
      PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-blue-100 text-blue-800",
      REJECTED: "bg-red-100 text-red-800",
      PAID: "bg-green-100 text-green-800",
      CANCELLED: "bg-gray-100 text-gray-800",
    }
    return <Badge className={config[status] || "bg-gray-100"}>{status.replace("_", " ")}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading vendor...</span>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Vendor not found</div>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="mb-8">
            <Link href="/finance/vendors">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Vendors
              </Button>
            </Link>
          </div>

          {/* Vendor Header */}
          <Card className="mb-10 border-2 shadow-md">
            <CardContent className="pt-10 pb-12">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
                <div className="flex items-start gap-8">
                  <div className="p-6 bg-primary/10 rounded-xl">
                    <Building className="w-16 h-16 text-primary" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-xl font-bold text-foreground">{vendor.name}</h1>
                      <div className="flex items-center gap-4 mt-4">
                        <Badge variant={vendor.is_active ? "default" : "secondary"}>
                          {vendor.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{vendor.payment_terms.replace("_", " ")}</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Contact Person</p>
                        <p className="text-md">{vendor.contact_person || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Email</p>
                        <p className="text-md">{vendor.email || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Phone</p>
                        <p className="text-md">{vendor.phone || "—"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">KRA PIN</p>
                        <p className="text-md font-mono">{vendor.kra_pin || "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Paid (All Time)</p>
                        <p className="text-xl font-bold text-primary">
                          KSh {parseFloat(vendor.total_paid_all_time.toString()).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {vendor.notes && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Notes</p>
                        <p className="text-md mt-2">{vendor.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:self-start">
                  <Link href={`/finance/vendors/${vendor.id}/edit`}>
                    <Button size="lg" variant="outline" className="w-full shadow-md">
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Vendor
                    </Button>
                  </Link>

                  {/* Fixed: Dialog Trigger wrapped around button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="w-full shadow-md"
                        disabled={deleting}
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        {vendor.is_active ? "Deactivate" : "Activate"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {vendor.is_active ? "Deactivate" : "Activate"} Vendor?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {vendor.is_active
                            ? "This vendor will no longer be available for new expenses."
                            : "This vendor will be reactivated and available again."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                          {deleting ? "Processing..." : vendor.is_active ? "Deactivate" : "Activate"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expenses Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-md">Expenses with {vendor.name}</CardTitle>
              <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search expenses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
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
            </CardHeader>
            <CardContent>
              {expensesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-md text-muted-foreground">No expenses recorded for this vendor</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Department</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell className="font-mono">{exp.expense_reference}</TableCell>
                          <TableCell>{new Date(exp.expense_date).toLocaleDateString()}</TableCell>
                          <TableCell>{exp.name || exp.description}</TableCell>
                          <TableCell className="font-semibold">{formatAmount(exp.amount)}</TableCell>
                          <TableCell>{getStatusBadge(exp.status)}</TableCell>
                          <TableCell>{exp.department?.name || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </MainContent>
    </>
  )
}