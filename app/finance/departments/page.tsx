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
import { Loader2, Search, Users, Eye } from "lucide-react"
import Link from "next/link"
import { financeRequests, Department } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"

export default function DepartmentListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [departments, setDepartments] = useState<Department[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.listDepartments({
          search_term: searchTerm || undefined,
        })
        if (response.success && response.data) {
          setDepartments(response.data)
        }
      } catch (error) {
        toast.error("Failed to load departments")
      } finally {
        setLoading(false)
      }
    }
    fetchDepartments()
  }, [searchTerm, toast])

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
                <h1 className="text-4xl font-bold text-foreground">Departments</h1>
                <p className="text-muted-foreground mt-2">Manage school departments and budgets</p>
              </div>
              <Button onClick={() => router.push("/finance/departments/create")} className="shadow-lg">
                <Users className="w-5 h-5 mr-2" />
                Add Department
              </Button>
            </div>

            {/* Search */}
            <Card className="mb-8">
              <CardContent className="p-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Search by name or head..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Departments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Departments ({departments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : departments.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-xl text-muted-foreground">No departments found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>Head</TableHead>
                          <TableHead>Budget Allocated</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departments.map((dept) => (
                          <TableRow key={dept.id}>
                            <TableCell className="font-medium">{dept.name}</TableCell>
                            <TableCell>{dept.head_full_name || "—"}</TableCell>
                            <TableCell className="font-semibold">
                              KSh {parseFloat(dept.budget_allocated).toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/finance/departments/${dept.id}`)}
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