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
import { Loader2, Search, Eye, DollarSign, Building, FileText } from "lucide-react"
import Link from "next/link"
import { financeRequests, FeeItem, FeeItemCategory } from "@/lib/requests/finances"
import { schoolRequests, BranchProfile } from "@/lib/requests/schools"
import { useToast } from "@/src/use-toast"

export default function FeeItemsListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [feeItems, setFeeItems] = useState<FeeItem[]>([])
  const [filteredFeeItems, setFilteredFeeItems] = useState<FeeItem[]>([])
  const [branches, setBranches] = useState<BranchProfile[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [branchFilter, setBranchFilter] = useState<string>("all")

  // Fetch fee items
  useEffect(() => {
    const fetchFeeItems = async () => {
      try {
        const response = await financeRequests.listFeeItems()
        if (response.success && response.data) {
          setFeeItems(response.data)
          setFilteredFeeItems(response.data)
        } else {
          toast.error("Failed to load fee items", {
            description: response.error || "Please try again later.",
          })
        }
      } catch (error) {
        toast.error("Failed to load fee items", {
          description: "Something went wrong. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchFeeItems()
  }, [toast])

  // Fetch branches for filter
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await schoolRequests.listBranches()
        if (response.success && response.data) {
          setBranches(response.data)
        }
      } catch (error) {
        toast.error("Failed to load branches")
      }
    }
    fetchBranches()
  }, [toast])

  // Apply filters
  useEffect(() => {
    let filtered = feeItems

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          (item.description && item.description.toLowerCase().includes(lowerSearch)) ||
          item.category.toLowerCase().includes(lowerSearch)
      )
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter)
    }

    if (branchFilter !== "all") {
      filtered = filtered.filter((item) => {
        if (item.applies_to_all_branches) return true
        return item.branches.some((b) => b.id === branchFilter)
      })
    }

    setFilteredFeeItems(filtered)
  }, [searchTerm, categoryFilter, branchFilter, feeItems])

  const getCategoryBadge = (category: FeeItemCategory) => {
    const colors: Record<FeeItemCategory, string> = {
      [FeeItemCategory.TUITION]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      [FeeItemCategory.BOARDING]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      [FeeItemCategory.TRANSPORT]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      [FeeItemCategory.MEALS]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      [FeeItemCategory.UNIFORM]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      [FeeItemCategory.ACTIVITY]: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      [FeeItemCategory.MEDICAL]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      [FeeItemCategory.EXAM]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      [FeeItemCategory.OTHER]: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }

    return (
      <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>
        {category.replace("_", " ")}
      </Badge>
    )
  }

  const formatAmount = (amount: string) => {
    return `KSh ${parseFloat(amount).toLocaleString()}`
  }

  const getBranchDisplay = (item: FeeItem) => {
    if (item.applies_to_all_branches) return "All Branches"
    return item.branches.length === 0 ? "None" : item.branches.map((b) => b.name).join(", ")
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
                <h1 className="text-3xl font-bold text-foreground">Fee Items</h1>
                <p className="text-muted-foreground">Manage school fee structures and items</p>
              </div>
              <Link href="/finance/fee-items/create">
                <Button>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Add Fee Item
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by name, description, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.values(FeeItemCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Fee Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  All Fee Items ({filteredFeeItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fee Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Default Amount</TableHead>
                        <TableHead>Branches</TableHead>
                        <TableHead>Grade Overrides</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-10 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredFeeItems.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                            No fee items found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredFeeItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-primary" />
                                <div>
                                  <div>{item.name}</div>
                                  {item.description && (
                                    <div className="text-sm text-muted-foreground">{item.description}</div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getCategoryBadge(item.category as FeeItemCategory)}</TableCell>
                            <TableCell className="font-medium">{formatAmount(item.default_amount)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{getBranchDisplay(item)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">{item.grade_level_fees.length} override(s)</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/finance/fee-items/${item.id}`)}
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
              </CardContent>
            </Card>
          </div>
        </main>
      </MainContent>
    </>
  )
}