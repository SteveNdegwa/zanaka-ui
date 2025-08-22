"use client"

import { useState } from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Filter, MoreHorizontal, UserPlus, Edit, Trash2, Eye } from "lucide-react"

// Mock student data
const studentsData = [
  {
    id: 1,
    name: "Alice Johnson",
    email: "alice.johnson@email.com",
    grade: "10th Grade",
    class: "A",
    status: "Active",
    attendance: "95%",
    phone: "+1 234-567-8901",
    guardian: "Mary Johnson",
    enrollmentDate: "2023-09-01",
    avatar: "/student-alice.png",
  },
  {
    id: 2,
    name: "Bob Smith",
    email: "bob.smith@email.com",
    grade: "11th Grade",
    class: "B",
    status: "Active",
    attendance: "88%",
    phone: "+1 234-567-8902",
    guardian: "John Smith",
    enrollmentDate: "2023-09-01",
    avatar: "/student-bob.png",
  },
  {
    id: 3,
    name: "Carol Davis",
    email: "carol.davis@email.com",
    grade: "9th Grade",
    class: "A",
    status: "Inactive",
    attendance: "72%",
    phone: "+1 234-567-8903",
    guardian: "Sarah Davis",
    enrollmentDate: "2023-09-01",
    avatar: "/student-carol.png",
  },
  {
    id: 4,
    name: "David Wilson",
    email: "david.wilson@email.com",
    grade: "12th Grade",
    class: "A",
    status: "Active",
    attendance: "92%",
    phone: "+1 234-567-8904",
    guardian: "Mike Wilson",
    enrollmentDate: "2022-09-01",
    avatar: "/student-david-studying.png",
  },
  {
    id: 5,
    name: "Emma Brown",
    email: "emma.brown@email.com",
    grade: "10th Grade",
    class: "B",
    status: "Active",
    attendance: "97%",
    phone: "+1 234-567-8905",
    guardian: "Lisa Brown",
    enrollmentDate: "2023-09-01",
    avatar: "/student-emma.png",
  },
  {
    id: 6,
    name: "Frank Miller",
    email: "frank.miller@email.com",
    grade: "11th Grade",
    class: "C",
    status: "Suspended",
    attendance: "65%",
    phone: "+1 234-567-8906",
    guardian: "Tom Miller",
    enrollmentDate: "2023-09-01",
    avatar: "/student-frank.png",
  },
]

export default function StudentsPage() {
  const router = useRouter()
  const [students, setStudents] = useState(studentsData)
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [classFilter, setClassFilter] = useState("all")

  // Filter students based on search and filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGrade = gradeFilter === "all" || student.grade === gradeFilter
    const matchesStatus = statusFilter === "all" || student.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesClass = classFilter === "all" || student.class === classFilter

    return matchesSearch && matchesGrade && matchesStatus && matchesClass
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      Active: "default",
      Inactive: "secondary",
      Suspended: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const getAttendanceColor = (attendance: string) => {
    const rate = Number.parseInt(attendance)
    if (rate >= 90) return "text-green-600"
    if (rate >= 75) return "text-yellow-600"
    return "text-red-600"
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
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="9th Grade">9th Grade</SelectItem>
                        <SelectItem value="10th Grade">10th Grade</SelectItem>
                        <SelectItem value="11th Grade">11th Grade</SelectItem>
                        <SelectItem value="12th Grade">12th Grade</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={classFilter} onValueChange={setClassFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        <SelectItem value="A">Class A</SelectItem>
                        <SelectItem value="B">Class B</SelectItem>
                        <SelectItem value="C">Class C</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
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
                        <TableHead>Grade & Class</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Guardian</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={student.avatar || "/placeholder.svg"} alt={student.name} />
                                <AvatarFallback>
                                  {student.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{student.name}</div>
                                <div className="text-sm text-muted-foreground">{student.email}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.grade}</div>
                              <div className="text-sm text-muted-foreground">Class {student.class}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(student.status)}</TableCell>
                          <TableCell>
                            <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                              {student.attendance}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{student.guardian}</div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{student.phone}</div>
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
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Student
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {filteredStudents.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No students found matching your criteria.</p>
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
