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
import { Loader2, Search, Eye, School, MapPin, Phone, Mail, User, Building } from "lucide-react"
import Link from "next/link"
import { schoolRequests, BranchProfile } from "@/lib/requests/schools"
import { useToast } from "@/src/use-toast"

export default function BranchesListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [branches, setBranches] = useState<BranchProfile[]>([])
  const [filteredBranches, setFilteredBranches] = useState<BranchProfile[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await schoolRequests.listBranches()
        if (response.success && response.data) {
          setBranches(response.data)
          setFilteredBranches(response.data)
        } else {
          toast.error("Failed to load branches", {
            description: response.error || "Please try again later.",
          })
        }
      } catch (error) {
        toast.error("Failed to load branches", {
          description: "Something went wrong. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchBranches()
  }, [toast])

  useEffect(() => {
    let filtered = branches

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(branch =>
        branch.name.toLowerCase().includes(lowerSearch) ||
        branch.school_name.toLowerCase().includes(lowerSearch) ||
        (branch.location && branch.location.toLowerCase().includes(lowerSearch)) ||
        (branch.contact_phone && branch.contact_phone.includes(lowerSearch)) ||
        (branch.principal_name && branch.principal_name.toLowerCase().includes(lowerSearch))
      )
    }

    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter(branch => {
        console.log(typeof branch.is_active, branch.is_active)
        return branch.is_active === isActive})
    }

    setFilteredBranches(filtered)
  }, [searchTerm, statusFilter, branches])

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
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
                <h1 className="text-3xl font-bold text-foreground">Branches</h1>
                <p className="text-muted-foreground">Manage all school branches</p>
              </div>
              <Link href="/branches/create">
                <Button>
                  <Building className="w-4 h-4 mr-2" />
                  Add Branch
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
                        placeholder="Search by name, school, location, phone, or principal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as "all" | "active" | "inactive")}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branches Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  All Branches ({filteredBranches.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Branch</TableHead>
                        {/* <TableHead>School</TableHead> */}
                        <TableHead>Location</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Principal</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-10 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredBranches.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                            No branches found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBranches.map((branch) => (
                          <TableRow key={branch.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-primary" />
                                {branch.name}
                              </div>
                            </TableCell>
                            {/* <TableCell>
                              <div className="flex items-center gap-2">
                                <School className="w-4 h-4 text-muted-foreground" />
                                {branch.school_name}
                              </div>
                            </TableCell> */}
                            <TableCell>
                              {branch.location ? (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  {branch.location}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-sm">
                                {branch.contact_phone && (
                                  <div className="flex items-center gap-2">
                                    <Phone className="w-3 h-3 text-muted-foreground" />
                                    {branch.contact_phone}
                                  </div>
                                )}
                                {branch.contact_email && (
                                  <div className="flex items-center gap-2">
                                    <Mail className="w-3 h-3 text-muted-foreground" />
                                    {branch.contact_email}
                                  </div>
                                )}
                                {!branch.contact_phone && !branch.contact_email && (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {branch.principal_name ? (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  {branch.principal_name}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">Not assigned</span>
                              )}
                            </TableCell>
                            <TableCell>{branch.capacity.toLocaleString()}</TableCell>
                            <TableCell>{getStatusBadge(branch.is_active)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/branches/${branch.id}`)}
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