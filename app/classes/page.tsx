"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header" // Added DashboardHeader import
import { MainContent } from "@/components/main-content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Users, Clock, MapPin, BookOpen, GraduationCap, Calendar } from "lucide-react"

// Mock data for classes
const classes = [
  {
    id: 1,
    name: "Advanced Mathematics",
    code: "MATH-401",
    teacher: "Sarah Johnson",
    teacherAvatar: "/teacher-sarah.png",
    grade: "Grade 12",
    subject: "Mathematics",
    branch: "Main Campus",
    room: "Room 201",
    schedule: "Mon, Wed, Fri - 9:00 AM",
    students: 28,
    capacity: 30,
    status: "active",
    semester: "Fall 2024",
    credits: 4,
  },
  {
    id: 2,
    name: "Physics Laboratory",
    code: "PHYS-301",
    teacher: "Michael Chen",
    teacherAvatar: "/teacher-michael.png",
    grade: "Grade 11",
    subject: "Physics",
    branch: "North Campus",
    room: "Lab 105",
    schedule: "Tue, Thu - 2:00 PM",
    students: 24,
    capacity: 25,
    status: "active",
    semester: "Fall 2024",
    credits: 3,
  },
  {
    id: 3,
    name: "English Literature",
    code: "ENG-201",
    teacher: "Emily Rodriguez",
    teacherAvatar: "/teacher-emily.png",
    grade: "Grade 10",
    subject: "English",
    branch: "Main Campus",
    room: "Room 115",
    schedule: "Mon, Wed, Fri - 11:00 AM",
    students: 32,
    capacity: 35,
    status: "active",
    semester: "Fall 2024",
    credits: 3,
  },
  {
    id: 4,
    name: "World History",
    code: "HIST-301",
    teacher: "David Thompson",
    teacherAvatar: "/teacher-david.png",
    grade: "Grade 11",
    subject: "History",
    branch: "South Campus",
    room: "Room 308",
    schedule: "Tue, Thu - 10:00 AM",
    students: 26,
    capacity: 30,
    status: "suspended",
    semester: "Fall 2024",
    credits: 3,
  },
  {
    id: 5,
    name: "Computer Programming",
    code: "CS-101",
    teacher: "Lisa Wang",
    teacherAvatar: "/teacher-lisa.png",
    grade: "Grade 9",
    subject: "Computer Science",
    branch: "Tech Campus",
    room: "Lab 201",
    schedule: "Mon, Wed, Fri - 1:00 PM",
    students: 22,
    capacity: 25,
    status: "active",
    semester: "Fall 2024",
    credits: 4,
  },
  {
    id: 6,
    name: "Physical Education",
    code: "PE-101",
    teacher: "Robert Martinez",
    teacherAvatar: "/teacher-robert.png",
    grade: "Grade 9",
    subject: "Physical Education",
    branch: "Main Campus",
    room: "Gymnasium",
    schedule: "Daily - 3:00 PM",
    students: 45,
    capacity: 50,
    status: "active",
    semester: "Fall 2024",
    credits: 2,
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "suspended":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    case "completed":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

const getCapacityColor = (students: number, capacity: number) => {
  const percentage = (students / capacity) * 100
  if (percentage >= 90) return "text-red-600"
  if (percentage >= 75) return "text-yellow-600"
  return "text-green-600"
}

export default function ClassesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [gradeFilter, setGradeFilter] = useState("all")
  const [subjectFilter, setSubjectFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredClasses = useMemo(() => {
    return classes.filter((classItem) => {
      const matchesSearch =
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.code.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGrade = gradeFilter === "all" || classItem.grade.includes(gradeFilter)
      const matchesSubject =
        subjectFilter === "all" || classItem.subject.toLowerCase().replace(" ", "-") === subjectFilter
      const matchesBranch = branchFilter === "all" || classItem.branch.toLowerCase().replace(" ", "") === branchFilter
      const matchesStatus = statusFilter === "all" || classItem.status === statusFilter

      return matchesSearch && matchesGrade && matchesSubject && matchesBranch && matchesStatus
    })
  }, [searchTerm, gradeFilter, subjectFilter, branchFilter, statusFilter])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <MainContent>
        <DashboardHeader /> {/* Added DashboardHeader component */}
        <main className="container mx-auto px-6 py-8">
          {" "}
          {/* Wrapped content in main tag with proper spacing */}
          <div className="max-w-7xl mx-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Classes</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage class schedules and assignments</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Class
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Classes</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">248</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Classes</p>
                        <p className="text-2xl font-bold text-green-600">235</p>
                      </div>
                      <GraduationCap className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                        <p className="text-2xl font-bold text-purple-600">3,247</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Class Size</p>
                        <p className="text-2xl font-bold text-orange-600">26</p>
                      </div>
                      <Calendar className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Class Directory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search classes by name or code..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={gradeFilter} onValueChange={setGradeFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subjects</SelectItem>
                        <SelectItem value="mathematics">Mathematics</SelectItem>
                        <SelectItem value="physics">Physics</SelectItem>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="computer-science">Computer Science</SelectItem>
                        <SelectItem value="physical-education">Physical Education</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={branchFilter} onValueChange={setBranchFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Branch" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        <SelectItem value="maincampus">Main Campus</SelectItem>
                        <SelectItem value="northcampus">North Campus</SelectItem>
                        <SelectItem value="southcampus">South Campus</SelectItem>
                        <SelectItem value="techcampus">Tech Campus</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Classes Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Class Details</TableHead>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Schedule & Location</TableHead>
                          <TableHead>Enrollment</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredClasses.map((classItem) => (
                          <TableRow key={classItem.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{classItem.name}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <span>{classItem.code}</span>
                                  <span>•</span>
                                  <span>{classItem.grade}</span>
                                  <span>•</span>
                                  <span>{classItem.subject}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage
                                    src={classItem.teacherAvatar || "/placeholder.svg"}
                                    alt={classItem.teacher}
                                  />
                                  <AvatarFallback>
                                    {classItem.teacher
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-gray-900 dark:text-white">{classItem.teacher}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm">
                                  <Clock className="w-3 h-3 mr-1 text-gray-400" />
                                  <span>{classItem.schedule}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  <span>
                                    {classItem.room}, {classItem.branch}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span
                                  className={`font-medium ${getCapacityColor(classItem.students, classItem.capacity)}`}
                                >
                                  {classItem.students}/{classItem.capacity}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    (classItem.students / classItem.capacity) * 100 >= 90
                                      ? "bg-red-500"
                                      : (classItem.students / classItem.capacity) * 100 >= 75
                                        ? "bg-yellow-500"
                                        : "bg-green-500"
                                  }`}
                                  style={{ width: `${(classItem.students / classItem.capacity) * 100}%` }}
                                ></div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{classItem.credits}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(classItem.status)}>{classItem.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Details</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Class</DropdownMenuItem>
                                  <DropdownMenuItem>View Students</DropdownMenuItem>
                                  <DropdownMenuItem>Schedule</DropdownMenuItem>
                                  <DropdownMenuItem>Assignments</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Suspend Class</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  )
}
