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
import { Search, Plus, MoreHorizontal, Mail, Phone, MapPin, Calendar, Users, BookOpen } from "lucide-react"

// Mock data for teachers
const teachers = [
  {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@school.edu",
    phone: "+1 (555) 123-4567",
    avatar: "/teacher-sarah.png",
    subject: "Mathematics",
    department: "Science",
    experience: "8 years",
    status: "active",
    classes: 5,
    students: 125,
    branch: "Main Campus",
    joinDate: "2016-08-15",
  },
  {
    id: 2,
    name: "Michael Chen",
    email: "michael.chen@school.edu",
    phone: "+1 (555) 234-5678",
    avatar: "/teacher-michael.png",
    subject: "Physics",
    department: "Science",
    experience: "12 years",
    status: "active",
    classes: 4,
    students: 98,
    branch: "North Campus",
    joinDate: "2012-01-20",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    email: "emily.rodriguez@school.edu",
    phone: "+1 (555) 345-6789",
    avatar: "/teacher-emily.png",
    subject: "English Literature",
    department: "Arts",
    experience: "6 years",
    status: "active",
    classes: 6,
    students: 142,
    branch: "Main Campus",
    joinDate: "2018-09-01",
  },
  {
    id: 4,
    name: "David Thompson",
    email: "david.thompson@school.edu",
    phone: "+1 (555) 456-7890",
    avatar: "/teacher-david.png",
    subject: "History",
    department: "Social Studies",
    experience: "15 years",
    status: "on-leave",
    classes: 3,
    students: 78,
    branch: "South Campus",
    joinDate: "2009-03-10",
  },
  {
    id: 5,
    name: "Lisa Wang",
    email: "lisa.wang@school.edu",
    phone: "+1 (555) 567-8901",
    avatar: "/teacher-lisa.png",
    subject: "Computer Science",
    department: "Technology",
    experience: "4 years",
    status: "active",
    classes: 4,
    students: 89,
    branch: "Tech Campus",
    joinDate: "2020-08-25",
  },
  {
    id: 6,
    name: "Robert Martinez",
    email: "robert.martinez@school.edu",
    phone: "+1 (555) 678-9012",
    avatar: "/teacher-robert.png",
    subject: "Physical Education",
    department: "Sports",
    experience: "10 years",
    status: "active",
    classes: 8,
    students: 200,
    branch: "Main Campus",
    joinDate: "2014-06-01",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "on-leave":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export default function TeachersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const matchesSearch =
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment =
        departmentFilter === "all" || teacher.department.toLowerCase().replace(" ", "-") === departmentFilter
      const matchesBranch = branchFilter === "all" || teacher.branch.toLowerCase().replace(" ", "") === branchFilter
      const matchesStatus = statusFilter === "all" || teacher.status === statusFilter

      return matchesSearch && matchesDepartment && matchesBranch && matchesStatus
    })
  }, [searchTerm, departmentFilter, branchFilter, statusFilter])

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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Teachers</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">Manage teaching staff and their assignments</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Teacher
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teachers</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">156</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Teachers</p>
                        <p className="text-2xl font-bold text-green-600">142</p>
                      </div>
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">On Leave</p>
                        <p className="text-2xl font-bold text-yellow-600">8</p>
                      </div>
                      <Calendar className="w-8 h-8 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departments</p>
                        <p className="text-2xl font-bold text-purple-600">12</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Teachers Directory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search teachers by name or email..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                        <SelectItem value="arts">Arts</SelectItem>
                        <SelectItem value="social-studies">Social Studies</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="sports">Sports</SelectItem>
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
                        <SelectItem value="on-leave">On Leave</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Teachers Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Teacher</TableHead>
                          <TableHead>Subject & Department</TableHead>
                          <TableHead>Branch</TableHead>
                          <TableHead>Classes</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTeachers.map((teacher) => (
                          <TableRow key={teacher.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <Avatar className="w-10 h-10">
                                  <AvatarImage src={teacher.avatar || "/placeholder.svg"} alt={teacher.name} />
                                  <AvatarFallback>
                                    {teacher.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">{teacher.name}</p>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                                    <span className="flex items-center">
                                      <Mail className="w-3 h-3 mr-1" />
                                      {teacher.email}
                                    </span>
                                    <span className="flex items-center">
                                      <Phone className="w-3 h-3 mr-1" />
                                      {teacher.phone}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{teacher.subject}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{teacher.department}</p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                <span className="text-sm">{teacher.branch}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{teacher.classes}</span>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium">{teacher.students}</span>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm">{teacher.experience}</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(teacher.status)}>
                                {teacher.status.replace("-", " ")}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Profile</DropdownMenuItem>
                                  <DropdownMenuItem>Edit Details</DropdownMenuItem>
                                  <DropdownMenuItem>View Classes</DropdownMenuItem>
                                  <DropdownMenuItem>Contact</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
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
