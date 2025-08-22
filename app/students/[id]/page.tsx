"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  Receipt,
  CreditCard,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
} from "lucide-react"

// Mock student data - in real app this would come from API
const studentData = {
  id: 1,
  name: "Alice Johnson",
  email: "alice.johnson@email.com",
  phone: "+1 234-567-8901",
  grade: "10th Grade",
  class: "A",
  status: "Active",
  attendance: "95%",
  avatar: "/student-alice.png",
  studentId: "STU-2024-001",
  dateOfBirth: "2008-03-15",
  gender: "Female",
  nationality: "American",
  address: "123 Oak Street, Springfield, IL 62701",
  enrollmentDate: "2023-09-01",
  branch: "Main Campus",
  academicYear: "2024-2025",
  guardians: [
    {
      name: "Mary Johnson",
      relationship: "Mother",
      phone: "+1 234-567-8901",
      email: "mary.johnson@email.com",
      occupation: "Teacher",
    },
    {
      name: "Robert Johnson",
      relationship: "Father",
      phone: "+1 234-567-8902",
      email: "robert.johnson@email.com",
      occupation: "Engineer",
    },
  ],
  classes: [
    { name: "Mathematics 101", teacher: "Ms. Johnson", grade: "A-" },
    { name: "English Literature", teacher: "Mr. Smith", grade: "B+" },
    { name: "Physics Advanced", teacher: "Dr. Wilson", grade: "A" },
    { name: "World History", teacher: "Ms. Davis", grade: "B" },
  ],
  financials: {
    totalFees: 12500,
    paidAmount: 8500,
    pendingAmount: 4000,
    lastPayment: "2024-01-15",
    nextDueDate: "2024-02-15",
  },
  recentInvoices: [
    { id: "INV-001", date: "2024-01-15", amount: 2500, status: "Paid", description: "Tuition Fee - January" },
    { id: "INV-002", date: "2024-02-01", amount: 1500, status: "Pending", description: "Activity Fee - February" },
    { id: "INV-003", date: "2024-02-15", amount: 2000, status: "Overdue", description: "Lab Fee - February" },
  ],
  recentPayments: [
    { id: "PAY-001", date: "2024-01-15", amount: 2500, method: "Bank Transfer", reference: "TXN123456" },
    { id: "PAY-002", date: "2024-01-01", amount: 3000, method: "Credit Card", reference: "CC789012" },
    { id: "PAY-003", date: "2023-12-15", amount: 3000, method: "Cash", reference: "CASH001" },
  ],
}

export default function ViewStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusBadge = (status: string) => {
    const variants = {
      Active: "default",
      Inactive: "secondary",
      Suspended: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "default"}>{status}</Badge>
  }

  const getInvoiceStatusBadge = (status: string) => {
    const variants = {
      Paid: "default",
      Pending: "secondary",
      Overdue: "destructive",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  const handleCreateInvoice = () => {
    router.push(`/finance/invoices?student=${studentData.id}`)
  }

  const handleEditStudent = () => {
    router.push(`/students/${params.id}/edit`)
  }

  const handleViewTransactions = () => {
    router.push(`/students/${params.id}/transactions`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <MainContent>
        <DashboardHeader />

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => router.push("/students")}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Students
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Student Profile</h1>
                  <p className="text-muted-foreground">View and manage student information</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleViewTransactions}>
                  <FileText className="w-4 h-4 mr-2" />
                  Transaction Report
                </Button>
                <Button variant="outline" onClick={handleCreateInvoice}>
                  <Receipt className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
                <Button onClick={handleEditStudent}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Student
                </Button>
              </div>
            </div>

            {/* Student Header Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={studentData.avatar || "/placeholder.svg"} alt={studentData.name} />
                    <AvatarFallback className="text-2xl">
                      {studentData.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{studentData.name}</h2>
                        <p className="text-muted-foreground">ID: {studentData.studentId}</p>
                      </div>
                      {getStatusBadge(studentData.status)}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {studentData.grade} - Class {studentData.class}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{studentData.email}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">{studentData.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Attendance: {studentData.attendance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <Button
                variant={activeTab === "overview" ? "default" : "outline"}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </Button>
              <Button
                variant={activeTab === "invoices" ? "default" : "outline"}
                onClick={() => setActiveTab("invoices")}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Invoices
              </Button>
              <Button
                variant={activeTab === "payments" ? "default" : "outline"}
                onClick={() => setActiveTab("payments")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payments
              </Button>
              <Button variant={activeTab === "balance" ? "default" : "outline"} onClick={() => setActiveTab("balance")}>
                <DollarSign className="w-4 h-4 mr-2" />
                Balance
              </Button>
            </div>

            {/* Content based on active tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Personal Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                          <p className="text-sm">{new Date(studentData.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Gender</p>
                          <p className="text-sm">{studentData.gender}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Nationality</p>
                          <p className="text-sm">{studentData.nationality}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Enrollment Date</p>
                          <p className="text-sm">{new Date(studentData.enrollmentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Address</p>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <p className="text-sm">{studentData.address}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Academic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Academic Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Branch</p>
                          <p className="text-sm">{studentData.branch}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
                          <p className="text-sm">{studentData.academicYear}</p>
                        </div>
                      </div>
                      <Separator className="my-4" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-3">Enrolled Classes</p>
                        <div className="space-y-2">
                          {studentData.classes.map((classItem, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                              <div>
                                <p className="font-medium text-sm">{classItem.name}</p>
                                <p className="text-xs text-muted-foreground">{classItem.teacher}</p>
                              </div>
                              <Badge variant="outline">{classItem.grade}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Guardian Information */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Users className="w-5 h-5 mr-2" />
                        Guardian Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {studentData.guardians.map((guardian, index) => (
                        <div key={index} className="space-y-2">
                          {index > 0 && <Separator />}
                          <div>
                            <p className="font-medium text-sm">{guardian.name}</p>
                            <p className="text-xs text-muted-foreground">{guardian.relationship}</p>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs">{guardian.phone}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Mail className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs">{guardian.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="w-3 h-3 text-muted-foreground" />
                              <p className="text-xs">{guardian.occupation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Financial Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <DollarSign className="w-5 h-5 mr-2" />
                        Financial Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Fees</span>
                          <span className="text-sm font-medium">
                            ${studentData.financials.totalFees.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Paid Amount</span>
                          <span className="text-sm font-medium text-green-600">
                            ${studentData.financials.paidAmount.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Pending Amount</span>
                          <span className="text-sm font-medium text-red-600">
                            ${studentData.financials.pendingAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Last Payment</span>
                          <span className="text-sm">
                            {new Date(studentData.financials.lastPayment).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Next Due Date</span>
                          <div className="flex items-center space-x-1">
                            <AlertCircle className="w-3 h-3 text-orange-500" />
                            <span className="text-sm">
                              {new Date(studentData.financials.nextDueDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "invoices" && (
              <Card>
                <CardHeader>
                  <CardTitle>Student Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentData.recentInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString()}</TableCell>
                          <TableCell>{invoice.description}</TableCell>
                          <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeTab === "payments" && (
              <Card>
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Payment ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {studentData.recentPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">{payment.id}</TableCell>
                          <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                          <TableCell>${payment.amount.toLocaleString()}</TableCell>
                          <TableCell>{payment.method}</TableCell>
                          <TableCell>{payment.reference}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Receipt
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {activeTab === "balance" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Outstanding Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      ${studentData.financials.pendingAmount.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Due by {new Date(studentData.financials.nextDueDate).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Paid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      ${studentData.financials.paidAmount.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {Math.round((studentData.financials.paidAmount / studentData.financials.totalFees) * 100)}% of
                      total fees
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Fees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">${studentData.financials.totalFees.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-2">Academic Year {studentData.academicYear}</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </MainContent>
    </div>
  )
}
