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
import { Badge } from "@/components/ui/badge"
import { Loader2, Search, Tag, Eye } from "lucide-react"
import Link from "next/link"
import { financeRequests, ExpenseCategory } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

export default function ExpenseCategoryListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.listExpenseCategories({
          search_term: searchTerm || undefined,
        })
        if (response.success && response.data) {
          setCategories(response.data)
        }
      } catch (error) {
        toast.error("Failed to load expense categories")
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [searchTerm, toast])

  const formatAmount = (amount: number | null) => amount ? `KSh ${amount.toLocaleString()}` : "—"

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
                <h1 className="text-4xl font-bold text-foreground">Expense Categories</h1>
                <p className="text-muted-foreground mt-2">Manage expense classification and budgeting</p>
              </div>
              <Button onClick={() => router.push("/finance/expense-categories/create")} className="shadow-lg">
                <Tag className="w-5 h-5 mr-2" />
                Add Category
              </Button>
            </div>

            {/* Search */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Table */}
            <Card>
              <CardHeader>
                <CardTitle>Expense Categories ({categories.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">No expense categories found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Category Name</TableHead>
                          <TableHead>Monthly Budget</TableHead>
                          <TableHead>Annual Budget</TableHead>
                          <TableHead>Total Spent</TableHead>
                          <TableHead>Requires Approval</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.map((cat) => (
                          <TableRow key={cat.id}>
                            <TableCell className="font-medium">{cat.name}</TableCell>
                            <TableCell>{formatAmount(cat.monthly_budget ? parseFloat(cat.monthly_budget) : null)}</TableCell>
                            <TableCell>{formatAmount(cat.annual_budget ? parseFloat(cat.annual_budget) : null)}</TableCell>
                            <TableCell className="font-semibold">
                              KSh {cat.total_spent.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge variant={cat.requires_approval ? "default" : "secondary"}>
                                {cat.requires_approval ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/finance/expense-categories/${cat.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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