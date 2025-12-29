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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Search, Filter, MoreHorizontal, UserPlus, Edit, Trash2, Eye } from "lucide-react"
import { UserProfile, usersRequests } from "@/lib/requests/users"
import { Loader2 } from "lucide-react"
import { useToast } from "@/src/use-toast"
import { BranchProfile, ClassroomProfile, schoolRequests } from "@/lib/requests/schools"


export default function StudentsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tableLoading, setTableLoading] = useState(true)
  const [students, setStudents] = useState<UserProfile[]>([])
  const [branches, setBranches] = useState<BranchProfile[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [branchFilter, setBranchFilter] = useState("all")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState<number | "all">(10)

  const [deleteStudentId, setDeleteStudentId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, branchFilter, gradeFilter, statusFilter, classFilter, pageSize])


  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await usersRequests.filterUsers({ role_name: "STUDENT" })
        if (response.success && response.data) {
          setStudents(response.data)
        } else {
          toast.error("Failed to load students", {
            description: "An error occurred while fetching student records. Please try again.",
          });
        }
      } catch (error) {
        toast.error("Filter students failed", {
          description: "Something went wrong. Please try again.",
        })
      } finally {
        setTableLoading(false)
      }
    }
    fetchStudents()
  }, [])


  useEffect(() => {
    try {
      const fetchBranches = async () => {
        const response = await schoolRequests.listBranches()
        if (response.success && response.data){
          setBranches(response.data)
        }
      }
      fetchBranches()
    } catch (error) {
      toast.error("Fetch branches failed", {
        description: "Something went wrong. Please try again.",
      })
    }
  }, [])
  

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await schoolRequests.listClassrooms()
        if (response.success && response.data) {
          setClassrooms(response.data)
        }
      } catch (error) {
        toast.error("Fetch classrooms failed", {
          description: "Something went wrong. Please try again.",
        })
      }
    }
    fetchClassrooms()
  }, [])

  const formatGrade = (grade: string) => grade.replace("_", " ").toUpperCase()

  const filteredClassrooms = classrooms.filter((classroom) => {
      return classroom.branch_id === branchFilter && classroom.grade_level == gradeFilter
  })

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.other_name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesBranch = branchFilter === "all" || student.branches.some(branch => branch.id === branchFilter)
    const matchesGrade = gradeFilter === "all" || student.grade_level === gradeFilter
    const matchesStatus = statusFilter === "all" || student.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesClass = classFilter === "" || student.classroom_id === classFilter

    return matchesSearch && matchesBranch && matchesGrade && matchesStatus && matchesClass
  })

  const isShowAll = pageSize === "all"

  const totalPages = isShowAll
    ? 1
    : Math.ceil(filteredStudents.length / pageSize)

  const paginatedStudents = isShowAll
    ? filteredStudents
    : filteredStudents.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
      )

  const getStatusBadge = (status: string) => {
    const STATUS_CONFIG = {
      ACTIVE: { label: "Active", variant: "default" },
      GRADUATED: { label: "Graduated", variant: "outline" },
      TRANSFERRED: { label: "Transferred", variant: "secondary" },
      SUSPENDED: { label: "Suspended", variant: "destructive" },
    } as const

    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]

    return (
      <Badge variant={config?.variant ?? "secondary"}>
        {config?.label ?? status}
      </Badge>
    )
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      const res = await usersRequests.deleteUser(studentId)
      if (res.success) {
        toast.success("Delete student successful!", {
          description: "Student deleted successfully.",
          duration: 5000,
        })
        setStudents((prev) => prev.filter((s) => s.id !== studentId))
      } else {
        toast.error("Delete student failed!", { description: res.error || "Unable to delete student." })
      }
    } catch (err) {
      toast.error("Delete student failed!", { description: "Something went wrong. Please try again." })
    }
  }

  const openDeleteDialog = (studentId: string) => {
    setDeleteStudentId(studentId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (deleteStudentId) {
      handleDeleteStudent(deleteStudentId)
      setDeleteStudentId(null)
      setDeleteDialogOpen(false)
    }
  }

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
                <h1 className="text-3xl font-bold text-foreground">Students</h1>
                <p className="text-muted-foreground">Manage student records and information</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90" onClick={() => router.push("/students/create")}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
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
                        placeholder="Search students by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Select value={branchFilter} onValueChange={(value) => {
                      setBranchFilter(value)
                      setClassFilter("")
                      }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
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

                    <Select value={gradeFilter}
                     onValueChange={(value) => {
                      setGradeFilter(value)
                      setClassFilter("")
                      }}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Grade" />
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

                    <Select 
                        value={classFilter} 
                        onValueChange={setClassFilter}
                        disabled={branchFilter === "all" || gradeFilter === "all" || filteredClassrooms.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={
                            branchFilter === "all" || gradeFilter === "all"
                              ? "Select branch & grade first" 
                              : filteredClassrooms.length === 0 
                                ? "No classrooms available" 
                                : "Select classroom"
                          } />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredClassrooms.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id}>
                              {classroom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="GRADUATED">Graduated</SelectItem>
                        <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Students Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Students ({filteredStudents.length})</span>
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
                        <TableHead>Student</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {tableLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="py-10 text-center">
                            <div className="flex justify-center">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredStudents.length > 0 ? (
                        paginatedStudents.map((student) => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback>
                                    {student.full_name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{student.full_name}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{student.branches[0].name}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{formatGrade(student.grade_level!)}</div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">{student.classroom_name}</div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(student.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => router.push(`/students/${student.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => router.push(`/students/${student.id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Student
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600" onClick={() => openDeleteDialog(student.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Student
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                            No students found matching your criteria.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-4">
                    <div className="text-sm text-muted-foreground">
                      {pageSize === "all" ? (
                        <>Showing all {filteredStudents.length} students</>
                      ) : (
                        <>
                          Showing{" "}
                          {Math.min((currentPage - 1) * pageSize + 1, filteredStudents.length)}–
                          {Math.min(currentPage * pageSize, filteredStudents.length)} of{" "}
                          {filteredStudents.length} students
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this student? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 text-white hover:bg-red-700" onClick={confirmDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainContent>
    </div>
  )
}
