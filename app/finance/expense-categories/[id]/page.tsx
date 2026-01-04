"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Tag, Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { financeRequests, ExpenseCategory, ExpenseStatus } from "@/lib/requests/finances"
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
import { Badge } from "@/components/ui/badge"

export default function ViewExpenseCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  const { toast } = useToast()

  const [category, setCategory] = useState<ExpenseCategory | null>(null)
  const [expenses, setExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expensesLoading, setExpensesLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.viewExpenseCategory(categoryId)
        if (response.success && response.data) {
          setCategory(response.data)
        }
      } catch (error) {
        toast.error("Failed to load category")
        router.push("/finance/expense-categories")
      } finally {
        setLoading(false)
      }
    }
    fetchCategory()
  }, [categoryId, router, toast])

  useEffect(() => {
    const fetchExpenses = async () => {
      setExpensesLoading(true)
      try {
        const response = await financeRequests.listExpenses({
          category_id: categoryId,
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
  }, [categoryId, statusFilter, searchTerm, toast])

  const handleToggleActive = async () => {
    setDeleting(true)
    try {
      if (category?.is_active) {
        const response = await financeRequests.deactivateExpenseCategory(categoryId)
        if (response.success){
            toast.success("Category deactivated")
            router.push("/finance/expense-categories")
        }
        else{
            toast.error("Failed to deactivate category", {description: response.error})
        }
      } else {
        const response = await financeRequests.activateExpenseCategory(categoryId)
        if (response.success){
            toast.success("Category activated")
        }
        else{
            toast.error("Failed to activate category", {description: response.error})
        }
      }
    } catch (err) {
      toast.error("Failed to update category status")
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
        <span className="ml-3 text-lg">Loading category...</span>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Category not found</div>
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
            <Link href="/finance/expense-categories">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
          </div>

          <Card className="mb-10 border-2 shadow-md">
            <CardContent className="pt-10 pb-12">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
                <div className="flex items-start gap-8">
                  <div className="p-6 bg-primary/10 rounded-xl">
                    <Tag className="w-16 h-16 text-primary" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-xl font-bold text-foreground">{category.name}</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Monthly Budget</p>
                        <p className="text-md">
                          {category.monthly_budget ? formatAmount(category.monthly_budget) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Annual Budget</p>
                        <p className="text-md">
                          {category.annual_budget ? formatAmount(category.annual_budget) : "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                        <p className="text-xl font-bold text-primary">
                          KSh {category.total_spent.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Requires Approval</p>
                        <Badge variant={category.requires_approval ? "default" : "secondary"}>
                          {category.requires_approval ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:self-start">
                  <Link href={`/finance/expense-categories/${category.id}/edit`}>
                    <Button size="lg" variant="outline" className="w-full shadow-md">
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Category
                    </Button>
                  </Link>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="lg"
                        variant="destructive"
                        className="w-full shadow-md"
                        disabled={deleting}
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        {category.is_active ? "Deactivate" : "Activate"} Category
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {category.is_active ? "Deactivate" : "Activate"} Category?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {category.is_active
                            ? "This category will no longer be available for new expenses."
                            : "This category will become available again."}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleToggleActive} disabled={deleting}>
                          {deleting ? "Processing..." : category.is_active ? "Deactivate" : "Activate"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-md">Expenses in {category.name}</CardTitle>
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
                  <p className="text-md text-muted-foreground">No expenses in this category</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Vendor</TableHead>
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
                          <TableCell>{exp.vendor_name || "—"}</TableCell>
                          <TableCell className="font-semibold">{formatAmount(exp.amount)}</TableCell>
                          <TableCell>{getStatusBadge(exp.status)}</TableCell>
                          <TableCell>{exp.department_name || "—"}</TableCell>
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