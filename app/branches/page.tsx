import { MainContent } from "@/components/main-content"
import { DashboardHeader } from "@/components/dashboard-header" // Added DashboardHeader import
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/sidebar"
import {
  Search,
  Plus,
  MoreHorizontal,
  MapPin,
  Users,
  GraduationCap,
  Building,
  Phone,
  Mail,
  Calendar,
} from "lucide-react"

// Mock data for school branches
const branches = [
  {
    id: 1,
    name: "Main Campus",
    code: "MAIN",
    address: "123 Education Street, Downtown",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    phone: "+1 (555) 123-4567",
    email: "main@school.edu",
    principal: "Dr. Margaret Wilson",
    established: "1985",
    status: "active",
    students: 1250,
    teachers: 85,
    classes: 120,
    facilities: ["Library", "Gymnasium", "Science Labs", "Computer Lab", "Auditorium"],
    grades: "K-12",
    type: "Primary Campus",
  },
  {
    id: 2,
    name: "North Campus",
    code: "NORTH",
    address: "456 Learning Avenue, Northside",
    city: "Springfield",
    state: "IL",
    zipCode: "62702",
    phone: "+1 (555) 234-5678",
    email: "north@school.edu",
    principal: "Mr. James Rodriguez",
    established: "1998",
    status: "active",
    students: 890,
    teachers: 62,
    classes: 85,
    facilities: ["Library", "Gymnasium", "Art Studio", "Music Room"],
    grades: "6-12",
    type: "Secondary Campus",
  },
  {
    id: 3,
    name: "South Campus",
    code: "SOUTH",
    address: "789 Knowledge Boulevard, Southside",
    city: "Springfield",
    state: "IL",
    zipCode: "62703",
    phone: "+1 (555) 345-6789",
    email: "south@school.edu",
    principal: "Ms. Sarah Chen",
    established: "2005",
    status: "active",
    students: 650,
    teachers: 45,
    classes: 60,
    facilities: ["Library", "Cafeteria", "Playground", "Computer Lab"],
    grades: "K-8",
    type: "Elementary Campus",
  },
  {
    id: 4,
    name: "Tech Campus",
    code: "TECH",
    address: "321 Innovation Drive, Tech District",
    city: "Springfield",
    state: "IL",
    zipCode: "62704",
    phone: "+1 (555) 456-7890",
    email: "tech@school.edu",
    principal: "Dr. Michael Park",
    established: "2015",
    status: "active",
    students: 420,
    teachers: 28,
    classes: 35,
    facilities: ["Computer Labs", "Robotics Lab", "3D Printing Lab", "Maker Space"],
    grades: "9-12",
    type: "Specialized Campus",
  },
  {
    id: 5,
    name: "West Campus",
    code: "WEST",
    address: "654 Future Lane, Westside",
    city: "Springfield",
    state: "IL",
    zipCode: "62705",
    phone: "+1 (555) 567-8901",
    email: "west@school.edu",
    principal: "Mrs. Lisa Thompson",
    established: "2020",
    status: "under-construction",
    students: 0,
    teachers: 0,
    classes: 0,
    facilities: ["Under Development"],
    grades: "K-12",
    type: "Future Campus",
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    case "under-construction":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
    case "inactive":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

const getTypeColor = (type: string) => {
  switch (type) {
    case "Primary Campus":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
    case "Secondary Campus":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
    case "Elementary Campus":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300"
    case "Specialized Campus":
      return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300"
    case "Future Campus":
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
  }
}

export default function BranchesPage() {
  return (
    <div className="min-h-screen bg-background">
      {" "}
      {/* Added proper wrapper div */}
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">School Branches</h1>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Manage multiple campus locations and facilities
                  </p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Branch
                </Button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Branches</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                      </div>
                      <Building className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Branches</p>
                        <p className="text-2xl font-bold text-green-600">4</p>
                      </div>
                      <Building className="w-8 h-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                        <p className="text-2xl font-bold text-purple-600">3,210</p>
                      </div>
                      <Users className="w-8 h-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teachers</p>
                        <p className="text-2xl font-bold text-orange-600">220</p>
                      </div>
                      <GraduationCap className="w-8 h-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Branch Directory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input placeholder="Search branches by name or location..." className="pl-10" />
                    </div>
                    <Select>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="primary">Primary Campus</SelectItem>
                        <SelectItem value="secondary">Secondary Campus</SelectItem>
                        <SelectItem value="elementary">Elementary Campus</SelectItem>
                        <SelectItem value="specialized">Specialized Campus</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="under-construction">Under Construction</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Branches Table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Branch Details</TableHead>
                          <TableHead>Principal & Contact</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Statistics</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {branches.map((branch) => (
                          <TableRow key={branch.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{branch.name}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <span>{branch.code}</span>
                                  <span>•</span>
                                  <span>{branch.grades}</span>
                                  <span>•</span>
                                  <span className="flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Est. {branch.established}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{branch.principal}</p>
                                <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <div className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    <span>{branch.phone}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Mail className="w-3 h-3 mr-1" />
                                    <span>{branch.email}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-start">
                                <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="text-sm">
                                  <p>{branch.address}</p>
                                  <p className="text-gray-500 dark:text-gray-400">
                                    {branch.city}, {branch.state} {branch.zipCode}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1 text-sm">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500 dark:text-gray-400">Students:</span>
                                  <span className="font-medium">{branch.students.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500 dark:text-gray-400">Teachers:</span>
                                  <span className="font-medium">{branch.teachers}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-500 dark:text-gray-400">Classes:</span>
                                  <span className="font-medium">{branch.classes}</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={getTypeColor(branch.type)}>{branch.type}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(branch.status)}>{branch.status.replace("-", " ")}</Badge>
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
                                  <DropdownMenuItem>Edit Branch</DropdownMenuItem>
                                  <DropdownMenuItem>View Staff</DropdownMenuItem>
                                  <DropdownMenuItem>View Students</DropdownMenuItem>
                                  <DropdownMenuItem>Facilities</DropdownMenuItem>
                                  <DropdownMenuItem>Reports</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">Deactivate</DropdownMenuItem>
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

              {/* Branch Overview Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {branches
                  .filter((branch) => branch.status === "active")
                  .map((branch) => (
                    <Card key={branch.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{branch.name}</CardTitle>
                          <Badge className={getTypeColor(branch.type)}>{branch.type}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Principal:</span>
                            <span className="font-medium">{branch.principal}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <p className="text-2xl font-bold text-blue-600">{branch.students.toLocaleString()}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Students</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">{branch.teachers}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Teachers</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-purple-600">{branch.classes}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Classes</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Facilities:</p>
                            <div className="flex flex-wrap gap-1">
                              {branch.facilities.map((facility, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {facility}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  )
}
