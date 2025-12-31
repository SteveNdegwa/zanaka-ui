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
import { Loader2, Search, Eye, BookOpen, Building, Users } from "lucide-react"
import Link from "next/link"
import { schoolRequests, ClassroomProfile, BranchProfile } from "@/lib/requests/schools"
import { useToast } from "@/src/use-toast"

export default function ClassroomsListPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([])
  const [branches, setBranches] = useState<BranchProfile[]>([])
  const [filteredClassrooms, setFilteredClassrooms] = useState<ClassroomProfile[]>([])

  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")

  // Fetch branches for filter dropdown
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await schoolRequests.listBranches()
        if (response.success && response.data) {
          setBranches(response.data)
        }
      } catch (error) {
        toast.error("Failed to load branches for filter")
      }
    }
    fetchBranches()
  }, [toast])

  // Fetch all classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await schoolRequests.listClassrooms()
        if (response.success && response.data) {
          setClassrooms(response.data)
          setFilteredClassrooms(response.data)
        } else {
          toast.error("Failed to load classrooms", {
            description: response.error || "Please try again later.",
          })
        }
      } catch (error) {
        toast.error("Failed to load classrooms", {
          description: "Something went wrong. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchClassrooms()
  }, [toast])

  // Apply filters
  useEffect(() => {
    let filtered = classrooms

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(lowerSearch) ||
          c.branch_name.toLowerCase().includes(lowerSearch) ||
          c.grade_level.toLowerCase().replace("_", " ").includes(lowerSearch)
      )
    }

    if (branchFilter !== "all") {
      filtered = filtered.filter((c) => c.branch_id === branchFilter)
    }

    if (gradeFilter !== "all") {
      filtered = filtered.filter((c) => c.grade_level === gradeFilter)
    }

    setFilteredClassrooms(filtered)
  }, [searchTerm, branchFilter, gradeFilter, classrooms])

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    )
  }

  const gradeLevelDisplay = (grade: string) => {
    return grade.replace("_", " ").toUpperCase()
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
                <h1 className="text-3xl font-bold text-foreground">Classrooms</h1>
                <p className="text-muted-foreground">Manage all classrooms across branches</p>
              </div>
              <Link href="/classrooms/create">
                <Button>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Add Classroom
                </Button>
              </Link>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="lg:col-span-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Search by classroom name, branch, or grade..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Branches" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      <SelectItem value="baby_class">Baby Class</SelectItem>
                      <SelectItem value="pp_1">PP 1</SelectItem>
                      <SelectItem value="pp_2">PP 2</SelectItem>
                      <SelectItem value="grade_1">Grade 1</SelectItem>
                      <SelectItem value="grade_2">Grade 2</SelectItem>
                      <SelectItem value="grade_3">Grade 3</SelectItem>
                      <SelectItem value="grade_4">Grade 4</SelectItem>
                      <SelectItem value="grade_5">Grade 5</SelectItem>
                      <SelectItem value="grade_6">Grade 6</SelectItem>
                      <SelectItem value="grade_7">Grade 7</SelectItem>
                      <SelectItem value="grade_8">Grade 8</SelectItem>
                      <SelectItem value="grade_9">Grade 9</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Classrooms Table */}
            <Card>
              <CardHeader>
                <CardTitle>
                  All Classrooms ({filteredClassrooms.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classroom</TableHead>
                        <TableHead>Grade Level</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Capacity</TableHead>
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
                      ) : filteredClassrooms.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                            No classrooms found matching your criteria.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredClassrooms.map((classroom) => (
                          <TableRow key={classroom.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-primary" />
                                {classroom.name}
                              </div>
                            </TableCell>
                            <TableCell>{gradeLevelDisplay(classroom.grade_level)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Building className="w-4 h-4 text-muted-foreground" />
                                {classroom.branch_name}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                {classroom.capacity.toLocaleString()} students
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/classrooms/${classroom.id}`)}
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