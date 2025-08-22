"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Plus,
  FileText,
  Send,
  Eye,
  Edit,
  Download,
  Search,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Building,
  GraduationCap,
} from "lucide-react"

// Mock data for students
const mockStudents = [
  { id: "STU-001", name: "Alice Johnson", grade: "Grade 10", class: "10A", branch: "Main Campus" },
  { id: "STU-002", name: "Bob Smith", grade: "Grade 9", class: "9B", branch: "North Branch" },
  { id: "STU-003", name: "Carol Davis", grade: "Grade 11", class: "11A", branch: "Main Campus" },
  { id: "STU-004", name: "David Wilson", grade: "Grade 8", class: "8C", branch: "South Branch" },
  { id: "STU-005", name: "Emma Brown", grade: "Grade 10", class: "10A", branch: "Main Campus" },
  { id: "STU-006", name: "Frank Miller", grade: "Grade 9", class: "9B", branch: "North Branch" },
]

// Mock data for invoices
const mockInvoices = [
  {
    id: "INV-001",
    studentName: "Alice Johnson",
    studentId: "STU-001",
    grade: "Grade 10",
    branch: "Main Campus",
    amount: 1200.0,
    dueDate: "2024-02-15",
    issueDate: "2024-01-15",
    status: "paid",
    items: [
      { description: "Tuition Fee", amount: 1000.0 },
      { description: "Library Fee", amount: 100.0 },
      { description: "Lab Fee", amount: 100.0 },
    ],
  },
  {
    id: "INV-002",
    studentName: "Bob Smith",
    studentId: "STU-002",
    grade: "Grade 9",
    branch: "North Branch",
    amount: 1150.0,
    dueDate: "2024-02-20",
    issueDate: "2024-01-20",
    status: "pending",
    items: [
      { description: "Tuition Fee", amount: 1000.0 },
      { description: "Sports Fee", amount: 150.0 },
    ],
  },
  {
    id: "INV-003",
    studentName: "Carol Davis",
    studentId: "STU-003",
    grade: "Grade 11",
    branch: "Main Campus",
    amount: 1300.0,
    dueDate: "2024-01-30",
    issueDate: "2024-01-01",
    status: "overdue",
    items: [
      { description: "Tuition Fee", amount: 1000.0 },
      { description: "Lab Fee", amount: 100.0 },
      { description: "Field Trip Fee", amount: 200.0 },
    ],
  },
  {
    id: "INV-004",
    studentName: "David Wilson",
    studentId: "STU-004",
    grade: "Grade 8",
    branch: "South Branch",
    amount: 1050.0,
    dueDate: "2024-02-25",
    issueDate: "2024-01-25",
    status: "draft",
    items: [
      { description: "Tuition Fee", amount: 1000.0 },
      { description: "Activity Fee", amount: 50.0 },
    ],
  },
]

export default function InvoicesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [branchFilter, setBranchFilter] = useState("all")
  const [showCreateInvoice, setShowCreateInvoice] = useState(false)
  const [showBulkInvoice, setShowBulkInvoice] = useState(false)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [bulkCriteria, setBulkCriteria] = useState<"class" | "branch" | "grade">("class")
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedBranch, setSelectedBranch] = useState("")
  const [selectedGrade, setSelectedGrade] = useState("")

  // Filter invoices
  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesBranch = branchFilter === "all" || invoice.branch === branchFilter

    return matchesSearch && matchesStatus && matchesBranch
  })

  // Calculate totals
  const totalAmount = mockInvoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = mockInvoices.filter((i) => i.status === "paid").reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingAmount = mockInvoices
    .filter((i) => i.status === "pending")
    .reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdueAmount = mockInvoices
    .filter((i) => i.status === "overdue")
    .reduce((sum, invoice) => sum + invoice.amount, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "overdue":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Overdue
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="secondary">
            <FileText className="h-3 w-3 mr-1" />
            Draft
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStudentsForBulkInvoice = () => {
    switch (bulkCriteria) {
      case "class":
        return mockStudents.filter((student) => student.class === selectedClass)
      case "branch":
        return mockStudents.filter((student) => student.branch === selectedBranch)
      case "grade":
        return mockStudents.filter((student) => student.grade === selectedGrade)
      default:
        return []
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <MainContent>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Student Invoices</h1>
                <p className="text-muted-foreground">Create and manage student billing</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowBulkInvoice(true)} variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Bulk Invoice
                </Button>
                <Button onClick={() => setShowCreateInvoice(true)} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Invoice
                </Button>
              </div>
            </div>

            {/* Invoice Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">{mockInvoices.length} invoices</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">${paidAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockInvoices.filter((i) => i.status === "paid").length} invoices
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">${pendingAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockInvoices.filter((i) => i.status === "pending").length} invoices
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">${overdueAmount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {mockInvoices.filter((i) => i.status === "overdue").length} invoices
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Invoices Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Invoices</CardTitle>
                    <CardDescription>Manage student invoices and payments</CardDescription>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student name or invoice ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={branchFilter} onValueChange={setBranchFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Branch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Branches</SelectItem>
                      <SelectItem value="Main Campus">Main Campus</SelectItem>
                      <SelectItem value="North Branch">North Branch</SelectItem>
                      <SelectItem value="South Branch">South Branch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice ID</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Branch</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{invoice.studentName}</div>
                            <div className="text-sm text-muted-foreground">{invoice.studentId}</div>
                          </div>
                        </TableCell>
                        <TableCell>{invoice.grade}</TableCell>
                        <TableCell>{invoice.branch}</TableCell>
                        <TableCell className="font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                        <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Create Invoice Modal */}
            {showCreateInvoice && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>Create New Invoice</CardTitle>
                    <CardDescription>Generate an invoice for a student</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="student">Select Student</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a student" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockStudents.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.name} ({student.id}) - {student.grade} - {student.branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="issueDate">Issue Date</Label>
                        <Input id="issueDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Due Date</Label>
                        <Input id="dueDate" type="date" />
                      </div>
                    </div>

                    {/* Invoice Items */}
                    <div className="space-y-4">
                      <Label>Invoice Items</Label>
                      <div className="border rounded-lg p-4 space-y-4">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="item1">Description</Label>
                            <Input id="item1" placeholder="Tuition Fee" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="amount1">Amount</Label>
                            <Input id="amount1" type="number" placeholder="1000.00" />
                          </div>
                          <div className="flex items-end">
                            <Button variant="outline" size="sm">
                              Remove
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Item
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => setShowCreateInvoice(false)} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Save as Draft
                      </Button>
                      <Button onClick={() => setShowCreateInvoice(false)} className="flex-1">
                        Create & Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {showBulkInvoice && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <CardTitle>Bulk Invoice Creation</CardTitle>
                    <CardDescription>Create invoices for multiple students at once</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Bulk Criteria Selection */}
                    <div className="space-y-4">
                      <Label>Select Students By:</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="class"
                            checked={bulkCriteria === "class"}
                            onCheckedChange={() => setBulkCriteria("class")}
                          />
                          <Label htmlFor="class" className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Class
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="branch"
                            checked={bulkCriteria === "branch"}
                            onCheckedChange={() => setBulkCriteria("branch")}
                          />
                          <Label htmlFor="branch" className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            Branch
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="grade"
                            checked={bulkCriteria === "grade"}
                            onCheckedChange={() => setBulkCriteria("grade")}
                          />
                          <Label htmlFor="grade" className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Grade
                          </Label>
                        </div>
                      </div>
                    </div>

                    {/* Criteria Selection */}
                    <div className="grid grid-cols-3 gap-4">
                      {bulkCriteria === "class" && (
                        <div className="space-y-2">
                          <Label>Select Class</Label>
                          <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10A">Class 10A</SelectItem>
                              <SelectItem value="9B">Class 9B</SelectItem>
                              <SelectItem value="11A">Class 11A</SelectItem>
                              <SelectItem value="8C">Class 8C</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {bulkCriteria === "branch" && (
                        <div className="space-y-2">
                          <Label>Select Branch</Label>
                          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose branch" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Main Campus">Main Campus</SelectItem>
                              <SelectItem value="North Branch">North Branch</SelectItem>
                              <SelectItem value="South Branch">South Branch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      {bulkCriteria === "grade" && (
                        <div className="space-y-2">
                          <Label>Select Grade</Label>
                          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                            <SelectTrigger>
                              <SelectValue placeholder="Choose grade" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Grade 8">Grade 8</SelectItem>
                              <SelectItem value="Grade 9">Grade 9</SelectItem>
                              <SelectItem value="Grade 10">Grade 10</SelectItem>
                              <SelectItem value="Grade 11">Grade 11</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    {/* Preview Students */}
                    {(selectedClass || selectedBranch || selectedGrade) && (
                      <div className="space-y-4">
                        <Label>Students to be Invoiced ({getStudentsForBulkInvoice().length})</Label>
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Student Name</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>Grade</TableHead>
                                <TableHead>Class</TableHead>
                                <TableHead>Branch</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {getStudentsForBulkInvoice().map((student) => (
                                <TableRow key={student.id}>
                                  <TableCell>{student.name}</TableCell>
                                  <TableCell>{student.id}</TableCell>
                                  <TableCell>{student.grade}</TableCell>
                                  <TableCell>{student.class}</TableCell>
                                  <TableCell>{student.branch}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Common Invoice Items */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="bulkIssueDate">Issue Date</Label>
                        <Input id="bulkIssueDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bulkDueDate">Due Date</Label>
                        <Input id="bulkDueDate" type="date" />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button onClick={() => setShowBulkInvoice(false)} variant="outline" className="flex-1">
                        Cancel
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent">
                        Save as Drafts
                      </Button>
                      <Button onClick={() => setShowBulkInvoice(false)} className="flex-1">
                        Create & Send All
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </MainContent>
      </div>
    </div>
  )
}
