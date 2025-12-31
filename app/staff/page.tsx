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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Filter, UserPlus, Eye } from "lucide-react"
import Link from "next/link"
import { UserProfile, usersRequests } from "@/lib/requests/users"
import { Loader2 } from "lucide-react"
import { useToast } from "@/src/use-toast"
import { schoolRequests, BranchProfile } from "@/lib/requests/schools"

// Role-specific status options (matching Django model)
const STATUS_OPTIONS: Record<string, { value: string; label: string }[]> = {
  all: [{ value: "all", label: "All Status" }],
  ADMIN: [
    { value: "all", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_LEAVE", label: "On Leave" },
    { value: "TERMINATED", label: "Terminated" },
  ],
  TEACHER: [
    { value: "all", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_LEAVE", label: "On Leave" },
    { value: "SUSPENDED", label: "Suspended" },
    { value: "RETIRED", label: "Retired" },
    { value: "TERMINATED", label: "Terminated" },
  ],
  CLERK: [
    { value: "all", label: "All Status" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_LEAVE", label: "On Leave" },
    { value: "TERMINATED", label: "Terminated" },
  ],
}

export default function StaffListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<UserProfile[]>([])
  const [branches, setBranches] = useState<BranchProfile[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState("all") // New status filter

  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | "all">(10)

  useEffect(() => {
    setCurrentPage(1)
    setStatusFilter("all") // Reset status when role changes
  }, [searchTerm, branchFilter, roleFilter, pageSize])

  // Fetch staff
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await usersRequests.filterUsers({
          role_names: ["TEACHER", "CLERK", "ADMIN"],
        })
        if (response.success && response.data) {
          setStaff(response.data)
        } else {
          toast.error("Failed to load staff", {
            description: "An error occurred while fetching staff records.",
          })
        }
      } catch (error) {
        toast.error("Failed to load staff", {
          description: "Something went wrong. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [toast])

  // Fetch branches
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

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
      ADMIN: { label: "Admin", variant: "default" },
      TEACHER: { label: "Teacher", variant: "secondary" },
      CLERK: { label: "Clerk", variant: "outline" },
    }
    const cfg = config[role] || { label: role, variant: "outline" }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const getStatusBadge = (user: UserProfile) => {
    const statusLabel = user.status ? user.status.replace("_", " ") : "Active"
    let variant: "default" | "secondary" | "destructive" = "default"

    if (["SUSPENDED", "TERMINATED", "RETIRED"].includes(statusLabel.toUpperCase())) {
      variant = "destructive"
    } else if (statusLabel.toUpperCase() === "ON LEAVE") {
      variant = "secondary"
    }

    return <Badge variant={variant}>{statusLabel}</Badge>
  }

  const getBranchDisplay = (user: UserProfile) => {
    if (user.branches.length === 0) {
      return <span className="text-sm font-medium text-primary">All Branches</span>
    }
    return user.branches.length > 0 ? user.branches[0].name : "—"
  }

  const filteredStaff = staff.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.reg_number.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBranch =
      branchFilter === "all" ||
      user.branches.length === 0 ||
      user.branches.some((b) => b.id === branchFilter)

    const matchesRole =
      roleFilter === "all" ||
      user.role_name === roleFilter

    const matchesStatus =
      statusFilter === "all" ||
      user.status === statusFilter

    return matchesSearch && matchesBranch && matchesRole && matchesStatus
  })

  const isShowAll = pageSize === "all"
  const totalPages = isShowAll ? 1 : Math.ceil(filteredStaff.length / pageSize)
  const paginatedStaff = isShowAll
    ? filteredStaff
    : filteredStaff.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Get current status options based on selected role
  const currentStatusOptions = STATUS_OPTIONS[roleFilter] || STATUS_OPTIONS.all

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MainContent>
        <DashboardHeader />
        <main className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Staff</h1>
                <p className="text-muted-foreground">Manage teachers, clerks, and administrators</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => router.push("/staff/create")}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Staff
              </Button>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by name, email, or reg number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-[160px]">
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

                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="All Roles" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="TEACHER">Teacher</SelectItem>
                        <SelectItem value="CLERK">Clerk</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentStatusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Staff Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Staff Members ({filteredStaff.length})</span>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Staff Member</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-10 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredStaff.length > 0 ? (
                        paginatedStaff.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {member.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{member.full_name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Reg: {member.reg_number}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getBranchDisplay(member)}</TableCell>
                            <TableCell>{getRoleBadge(member.role_name)}</TableCell>
                            <TableCell>{member.email || "—"}</TableCell>
                            <TableCell>{member.phone_number || "—"}</TableCell>
                            <TableCell>{getStatusBadge(member)}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/staff/${member.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            No staff members found matching your criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
                    <div className="text-sm text-muted-foreground">
                      {pageSize === "all" ? (
                        <>Showing all {filteredStaff.length} staff members</>
                      ) : (
                        <>
                          Showing{" "}
                          {Math.min((currentPage - 1) * pageSize + 1, filteredStaff.length)}–
                          {Math.min(currentPage * pageSize, filteredStaff.length)} of{" "}
                          {filteredStaff.length} staff members
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
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </MainContent>
    </div>
  )
}