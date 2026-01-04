"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Users, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { financeRequests, Department } from "@/lib/requests/finances"
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

export default function ViewDepartmentPage() {
  const router = useRouter()
  const params = useParams()
  const deptId = params.id as string
  const { toast } = useToast()

  const [department, setDepartment] = useState<Department | null>(null)
  const [breakdown, setBreakdown] = useState<any>({ expenses: [], total_spent: 0, budget_utilization: 0 })
  const [loading, setLoading] = useState(true)
  const [breakdownLoading, setBreakdownLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchDepartment = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.viewDepartment(deptId)
        if (response.success && response.data) {
          setDepartment(response.data)
        }
      } catch (error) {
        toast.error("Failed to load department")
        router.push("/finance/departments")
      } finally {
        setLoading(false)
      }
    }
    fetchDepartment()
  }, [deptId, router, toast])

  useEffect(() => {
    const fetchBreakdown = async () => {
      setBreakdownLoading(true)
      try {
        const response = await financeRequests.getDepartmentExpenseBreakdown(deptId)
        if (response.success && response.data) {
          setBreakdown(response.data)
        }
      } catch (error) {
        toast.error("Failed to load expense breakdown")
        setBreakdown({ expenses: [], total_spent: 0, budget_utilization: 0 })
      } finally {
        setBreakdownLoading(false)
      }
    }
    fetchBreakdown()
  }, [deptId, toast])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await financeRequests.deactivateDepartment(deptId)
      toast.success("Department deactivated successfully")
      router.push("/finance/departments")
    } catch (err) {
      toast.error("Failed to deactivate department")
    } finally {
      setDeleting(false)
    }
  }

  const formatAmount = (amount: string | number) => `KSh ${parseFloat(String(amount)).toLocaleString()}`

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading department...</span>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Department not found</div>
      </div>
    )
  }

  const expenses = breakdown.expenses || []

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="mb-8">
            <Link href="/finance/departments">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Departments
              </Button>
            </Link>
          </div>

          <Card className="mb-10 border-2 shadow-md">
            <CardContent className="pt-10 pb-12">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10">
                <div className="flex items-start gap-8">
                  <div className="p-6 bg-primary/10 rounded-xl">
                    <Users className="w-16 h-16 text-primary" />
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-xl font-bold text-foreground">{department.name}</h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Department Head</p>
                        <p className="text-md">{department.head_full_name || "Not assigned"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Budget Allocated</p>
                        <p className="text-xl font-bold text-primary">
                          KSh {parseFloat(department.budget_allocated).toLocaleString()}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
                        <p className="text-xl font-bold text-green-600">
                          KSh {formatAmount(breakdown.total_spent || 0)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-muted-foreground">Budget Utilization</p>
                        <p className="text-xl font-bold">
                          {breakdown.budget_utilization !== undefined 
                            ? `${breakdown.budget_utilization.toFixed(1)}%`
                            : "0%"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 lg:self-start">
                  <Link href={`/finance/departments/${department.id}/edit`}>
                    <Button size="lg" variant="outline" className="w-full shadow-md">
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Department
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
                        Deactivate Department
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Deactivate Department?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This department will no longer be available for new expenses.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={deleting}>
                          {deleting ? "Processing..." : "Deactivate"}
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
              <CardTitle className="text-md">Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {breakdownLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : expenses.length === 0 ? (
                <div className="text-center py-16">
                  <p className="text-md text-muted-foreground">No expenses recorded for this department</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenses.map((exp: any) => (
                        <TableRow key={exp.id}>
                          <TableCell className="font-mono">{exp.expense_reference}</TableCell>
                          <TableCell>{new Date(exp.expense_date).toLocaleDateString()}</TableCell>
                          <TableCell>{exp.vendor_name || "—"}</TableCell>
                          <TableCell>{exp.name}</TableCell>
                          <TableCell className="font-semibold">{formatAmount(exp.amount)}</TableCell>
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