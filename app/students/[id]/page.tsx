"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  AlertCircle,
  Calendar,
  User,
  Eye,
  ArrowRightLeft,
  ListChecks,
  Clock,
  Loader2,
  Trash2,
} from "lucide-react"
import Link from "next/link"
import { UserProfile, usersRequests } from "@/lib/requests/users"
import { Invoice, Payment, InvoiceStatus, PaymentStatus, RefundStatus } from "@/lib/requests/finances"
import { toast, useToast } from "@/src/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ViewStudentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params?.id as string
  const { toast: showToast } = useToast()

  const [student, setStudent] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [allocating, setAllocating] = useState(false)
  const [activeTab, setActiveTab] = useState<"overview" | "invoices" | "payments" | "balance" | "ledger">("overview")

  // Filters
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all")
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!studentId) return
    const fetchStudent = async () => {
      setLoading(true)
      const response = await usersRequests.getUser(studentId)
      if (response.success && response.data) {
        setStudent(response.data)
      } else {
        showToast.error("Failed to load student", {
          description: response.error || "Unable to fetch student details",
        })
        router.push("/students")
      }
      setLoading(false)
    }
    fetchStudent()
  }, [studentId, router])

  const formatGrade = (grade: string) => grade.replace("_", " ").toUpperCase()

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: "default",
      graduated: "secondary",
      transferred: "destructive",
      suspended: "destructive",
      expelled: "destructive",
    }
    return (
      <Badge variant={variants[status.toLowerCase()] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getInvoiceStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      [InvoiceStatus.PAID]: "default",
      [InvoiceStatus.PARTIALLY_PAID]: "secondary",
      [InvoiceStatus.PENDING]: "secondary",
      [InvoiceStatus.OVERDUE]: "destructive",
      [InvoiceStatus.CANCELLED]: "outline",
    }
    return (
      <Badge variant={variants[status as InvoiceStatus] || "secondary"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
      [PaymentStatus.COMPLETED]: "default",
      [PaymentStatus.PENDING]: "secondary",
      [PaymentStatus.REVERSED]: "destructive",
      [PaymentStatus.FAILED]: "destructive",
      [PaymentStatus.REFUNDED]: "destructive",
      [PaymentStatus.PARTIALLY_REFUNDED]: "secondary",
    }
    const labels: Record<PaymentStatus, string> = {
      [PaymentStatus.COMPLETED]: "Completed",
      [PaymentStatus.PENDING]: "Pending Approval",
      [PaymentStatus.REVERSED]: "Reversed",
      [PaymentStatus.FAILED]: "Failed",
      [PaymentStatus.REFUNDED]: "Fully Refunded",
      [PaymentStatus.PARTIALLY_REFUNDED]: "Partially Refunded",
    }
    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    )
  }

  const handleEditStudent = () => {
    router.push(`/students/${studentId}/edit`)
  }

  const handleCreateInvoice = () => {
    router.push(`/students/${studentId}/invoice`)
  }

  const handleRecordPayment = () => {
    router.push(`/students/${studentId}/payment`)
  }

  const handleViewInvoice = (invoiceId: string) => {
    router.push(`/students/${studentId}/invoice/${invoiceId}`)
  }

  const handleViewPayment = (paymentId: string) => {
    router.push(`/students/${studentId}/payment/${paymentId}`)
  }

  const handleAllocatePayments = async () => {
    setAllocating(true)
    try {
      showToast.success("Payment allocation started", {
        description: "Unallocated payments are being processed in the background.",
      })
    } catch (error) {
      showToast.error("Allocation failed", {
        description: "Something went wrong. Please try again later.",
      })
    } finally {
      setAllocating(false)
    }
  }

  const handleDeleteStudent = async () => {
    if (!student) return

    setDeleting(true)
    try {
      const res = await usersRequests.deleteUser(studentId)
      if (res.success) {
        showToast.success("Student deleted permanently!", {
          description: "The student record has been removed.",
        })
        router.push("/students")
      } else {
        showToast.error("Delete failed", { description: res.error || "Unable to delete student." })
      }
    } catch (err) {
      showToast.error("Delete failed", { description: "Something went wrong. Please try again." })
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  // === Financial Calculations ===
  const activeInvoices = student?.invoices?.filter(inv => inv.status !== InvoiceStatus.CANCELLED) || []
  const totalInvoiced = activeInvoices.reduce((sum, inv) => sum + parseFloat(inv.total_amount), 0)
  const totalAllocatedToInvoices = activeInvoices.reduce((sum, inv) => sum + parseFloat(inv.paid_amount), 0)

  const nonReversedPayments = student?.payments?.filter(p => p.status !== PaymentStatus.REVERSED) || []
  const totalReceived = nonReversedPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)

  const totalRefunded = student?.payments
    ?.reduce((sum, p) => sum + parseFloat(p.completed_refunded_amount || "0"), 0) || 0

  const completedPayments = student?.payments?.filter(p => p.status === PaymentStatus.COMPLETED) || []
  const unallocatedFromApproved = completedPayments.reduce((sum, p) => sum + parseFloat(p.unassigned_amount || "0"), 0)

  const pendingPayments = student?.payments?.filter(p => p.status === PaymentStatus.PENDING) || []
  const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0)

  const outstandingBalance = totalInvoiced - totalAllocatedToInvoices
  const hasUnallocatedApproved = unallocatedFromApproved > 0.01

  // Filtered data for tabs
  const filteredInvoices = student?.invoices?.filter(inv =>
    invoiceStatusFilter === "all" || inv.status === invoiceStatusFilter
  ) || []

  const filteredPayments = student?.payments?.filter(p =>
    paymentStatusFilter === "all" || p.status === paymentStatusFilter
  ) || []

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading student profile...</span>
      </div>
    )
  }

  if (!student) return null

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link href="/students">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Students
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {hasUnallocatedApproved && (
                  <Button
                    variant="default"
                    onClick={handleAllocatePayments}
                    disabled={allocating}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                    {allocating ? "Allocating..." : "Allocate Payments"}
                  </Button>
                )}
                <Button variant="outline" onClick={handleRecordPayment}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Record Payment
                </Button>
                <Button variant="outline" onClick={handleCreateInvoice}>
                  <Receipt className="w-4 h-4 mr-2" />
                  Create Invoice
                </Button>
                <Button variant="outline" onClick={handleEditStudent}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Student
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={deleting}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Student
                </Button>
              </div>
            </div>

            {/* Pending Payments Banner */}
            {totalPendingAmount > 0 && (
              <Card className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Clock className="w-8 h-8 text-orange-600" />
                      <div>
                        <h3 className="font-semibold text-lg">Pending Approval Payments</h3>
                        <p className="text-sm text-muted-foreground">
                          {pendingPayments.length} payment{pendingPayments.length !== 1 ? "s" : ""} awaiting approval
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-orange-600">
                        KSh {totalPendingAmount.toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Total pending amount</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Header Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={student.photo || ""} alt={student.full_name} />
                    <AvatarFallback className="text-2xl">
                      {student.full_name
                        .split(" ")
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">{student.full_name}</h2>
                        <p className="text-muted-foreground">Reg No: {student.reg_number}</p>
                      </div>
                      {getStatusBadge(student.status)}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      {student.classroom_name && (
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatGrade(student.grade_level!)} - {student.classroom_name}
                          </span>
                        </div>
                      )}
                      {student.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{student.email}</span>
                        </div>
                      )}
                      {student.phone_number && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{student.phone_number}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">Adm: {student.admission_date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b overflow-x-auto">
              <Button
                variant={activeTab === "overview" ? "default" : "ghost"}
                onClick={() => setActiveTab("overview")}
              >
                Overview
              </Button>
              <Button
                variant={activeTab === "invoices" ? "default" : "ghost"}
                onClick={() => setActiveTab("invoices")}
              >
                <Receipt className="w-4 h-4 mr-2" />
                Invoices ({student.invoices?.length || 0})
              </Button>
              <Button
                variant={activeTab === "payments" ? "default" : "ghost"}
                onClick={() => setActiveTab("payments")}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Payments ({student.payments?.length || 0})
              </Button>
              <Button
                variant={activeTab === "balance" ? "default" : "ghost"}
                onClick={() => setActiveTab("balance")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Balance
              </Button>
              <Button
                variant={activeTab === "ledger" ? "default" : "ghost"}
                onClick={() => setActiveTab("ledger")}
              >
                <ListChecks className="w-4 h-4 mr-2" />
                Ledger
              </Button>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <User className="w-5 h-5 mr-2" />
                        Personal Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                          <p className="text-sm">{student.date_of_birth}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Gender</p>
                          <p className="text-sm capitalize">{student.gender}</p>
                        </div>
                        {student.knec_number && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">KNEC Number</p>
                            <p className="text-sm">{student.knec_number}</p>
                          </div>
                        )}
                        {student.nemis_number && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">NEMIS Number</p>
                            <p className="text-sm">{student.nemis_number}</p>
                          </div>
                        )}
                      </div>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Address</p>
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-sm">{student.town_of_residence}, {student.county_of_residence}</p>
                            <p className="text-sm text-muted-foreground">{student.address}</p>
                          </div>
                        </div>
                      </div>
                      {student.medical_info && (
                        <>
                          <Separator />
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Medical Information</p>
                            <p className="text-sm">{student.medical_info}</p>
                          </div>
                        </>
                      )}
                      {student.additional_info && (
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Additional Notes</p>
                          <p className="text-sm">{student.additional_info}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Academic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <GraduationCap className="w-5 h-5 mr-2" />
                        Academic Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Student Type</p>
                          <p className="text-sm capitalize">{student.student_type?.replace("_", " ")}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
                          <p className="text-sm">{student.academic_year}</p>
                        </div>
                        {student.subscribed_to_transport !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Transport</p>
                            <p className="text-sm">{student.subscribed_to_transport ? "Subscribed" : "Not subscribed"}</p>
                          </div>
                        )}
                        {student.subscribed_to_meals !== undefined && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Meals</p>
                            <p className="text-sm">{student.subscribed_to_meals ? "Subscribed" : "Not subscribed"}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Guardians */}
                  {student.guardians && student.guardians.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          Guardians
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {student.guardians.map((guardian: any, index) => (
                          <div key={guardian.guardian_id} className="space-y-4">
                            {index > 0 && <Separator />}
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-semibold text-lg">{guardian.guardian_name}</p>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {guardian.relationship}
                                  {guardian.is_primary && " (Primary)"}
                                </p>
                              </div>
                              {guardian.can_receive_reports && (
                                <Badge variant="outline">Receives Reports</Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              {guardian.phone_number && (
                                <div className="flex items-center space-x-2">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{guardian.phone_number}</span>
                                </div>
                              )}
                              {guardian.email && (
                                <div className="flex items-center space-x-2">
                                  <Mail className="w-4 h-4 text-muted-foreground" />
                                  <span>{guardian.email}</span>
                                </div>
                              )}
                              {guardian.id_number && (
                                <div className="flex items-center space-x-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span>ID: {guardian.id_number}</span>
                                </div>
                              )}
                              {guardian.occupation && (
                                <div className="flex items-center space-x-2">
                                  <FileText className="w-4 h-4 text-muted-foreground" />
                                  <span>{guardian.occupation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

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
                          <span className="text-sm text-muted-foreground">Total Invoiced</span>
                          <span className="text-sm font-medium">KSh {totalInvoiced.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Received</span>
                          <span className="text-sm font-medium text-blue-600">KSh {totalReceived.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Allocated to Invoices</span>
                          <span className="text-sm font-medium text-green-600">KSh {totalAllocatedToInvoices.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Refunded</span>
                          <span className="text-sm font-medium text-red-600">KSh {totalRefunded.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Unallocated (Approved)</span>
                          <span className={`text-sm font-medium ${hasUnallocatedApproved ? "text-orange-600" : "text-green-600"}`}>
                            KSh {unallocatedFromApproved.toLocaleString()}
                          </span>
                        </div>
                        {totalPendingAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Pending Approval</span>
                            <span className="text-sm font-medium text-orange-600">KSh {totalPendingAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg">
                          <span className="font-medium">Outstanding Balance</span>
                          <span className={`font-bold ${outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                            KSh {outstandingBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        * "Total Received" includes pending payments. Only approved payments are allocated.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Invoices Tab */}
            {activeTab === "invoices" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Invoices</CardTitle>
                  <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={InvoiceStatus.PENDING}>Pending</SelectItem>
                      <SelectItem value={InvoiceStatus.PARTIALLY_PAID}>Partially Paid</SelectItem>
                      <SelectItem value={InvoiceStatus.PAID}>Paid</SelectItem>
                      <SelectItem value={InvoiceStatus.OVERDUE}>Overdue</SelectItem>
                      <SelectItem value={InvoiceStatus.CANCELLED}>Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {filteredInvoices.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.invoice_reference}</TableCell>
                            <TableCell>{invoice.due_date || "—"}</TableCell>
                            <TableCell>KSh {parseFloat(invoice.total_amount).toLocaleString()}</TableCell>
                            <TableCell>KSh {parseFloat(invoice.paid_amount).toLocaleString()}</TableCell>
                            <TableCell>KSh {parseFloat(invoice.balance).toLocaleString()}</TableCell>
                            <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" onClick={() => handleViewInvoice(invoice.id)}>
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No invoices found</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Payments Tab */}
            {activeTab === "payments" && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Payment History</CardTitle>
                  <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value={PaymentStatus.COMPLETED}>Completed</SelectItem>
                      <SelectItem value={PaymentStatus.PENDING}>Pending Approval</SelectItem>
                      <SelectItem value={PaymentStatus.REVERSED}>Reversed</SelectItem>
                      <SelectItem value={PaymentStatus.FAILED}>Failed</SelectItem>
                      <SelectItem value={PaymentStatus.REFUNDED}>Fully Refunded</SelectItem>
                      <SelectItem value={PaymentStatus.PARTIALLY_REFUNDED}>Partially Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  {filteredPayments.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reference</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Unallocated</TableHead>
                          <TableHead className="text-right">Refundable</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => {
                          const isPending = payment.status === PaymentStatus.PENDING
                          const refundable = parseFloat(payment.available_for_refund || "0")
                          return (
                            <TableRow key={payment.id} className={isPending ? "bg-orange-50 dark:bg-orange-950/30" : ""}>
                              <TableCell className="font-medium">{payment.payment_reference}</TableCell>
                              <TableCell>{new Date(payment.created_at).toLocaleDateString()}</TableCell>
                              <TableCell className="capitalize">{payment.payment_method.replace("_", " ")}</TableCell>
                              <TableCell>KSh {parseFloat(payment.amount).toLocaleString()}</TableCell>
                              <TableCell>{getPaymentStatusBadge(payment.status as PaymentStatus)}</TableCell>
                              <TableCell>
                                {parseFloat(payment.unassigned_amount || "0") > 0 ? (
                                  <span className="text-orange-600 font-medium">
                                    KSh {parseFloat(payment.unassigned_amount || "0").toLocaleString()}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {refundable > 0 ? (
                                  <span className="text-blue-600 font-medium">
                                    KSh {refundable.toLocaleString()}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" onClick={() => handleViewPayment(payment.id)}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">No payments recorded</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Balance Tab */}
            {activeTab === "balance" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Invoiced</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">KSh {totalInvoiced.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-2">All active invoices</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Received</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">KSh {totalReceived.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-2">All non-reversed payments (incl. pending)</p>
                  </CardContent>
                </Card>
                {totalPendingAmount > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-orange-600" />
                        Pending Approval
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">KSh {totalPendingAmount.toLocaleString()}</div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Payments recorded but awaiting manual approval
                      </p>
                    </CardContent>
                  </Card>
                )}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Allocated to Invoices</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">KSh {totalAllocatedToInvoices.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-2">Actually applied to fees</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Total Refunded</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">KSh {totalRefunded.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground mt-2">Completed refunds</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Unallocated (Approved)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${hasUnallocatedApproved ? "text-orange-600" : "text-green-600"}`}>
                      KSh {unallocatedFromApproved.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      From approved payments, ready for allocation
                    </p>
                  </CardContent>
                </Card>
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle className="text-lg">Outstanding Balance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${outstandingBalance > 0 ? "text-red-600" : "text-green-600"}`}>
                      KSh {outstandingBalance.toLocaleString()}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Total invoiced minus amount allocated to invoices
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Ledger Tab */}
            {activeTab === "ledger" && (
              <Card>
                <CardHeader>
                  <CardTitle>Ledger</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    type LedgerItem = {
                      date: string
                      type: "Invoice" | "Invoice Cancelled" | "Payment" | "Reversal" | "Refund"
                      reference: string
                      description: string
                      debit: number
                      credit: number
                      balance: number
                    }
                    const ledger: LedgerItem[] = []
                    let runningBalance = 0
                    const transactions: LedgerItem[] = []

                    // Invoices (debit) — only if not cancelled
                    if (student.invoices) {
                      student.invoices
                        .filter(inv => inv.status !== InvoiceStatus.CANCELLED)
                        .forEach(inv => {
                          transactions.push({
                            date: inv.created_at,
                            type: "Invoice",
                            reference: inv.invoice_reference,
                            description: "Invoice issued",
                            debit: parseFloat(inv.total_amount),
                            credit: 0,
                            balance: 0,
                          })
                        })

                      // Cancelled invoices — show original + cancellation reversal
                      student.invoices
                        .filter(inv => inv.status === InvoiceStatus.CANCELLED)
                        .forEach(inv => {
                          // Original invoice entry
                          transactions.push({
                            date: inv.created_at,
                            type: "Invoice",
                            reference: inv.invoice_reference,
                            description: "Invoice issued",
                            debit: parseFloat(inv.total_amount),
                            credit: 0,
                            balance: 0,
                          })
                          // Cancellation entry
                          transactions.push({
                            date: inv.updated_at || inv.created_at,
                            type: "Invoice Cancelled",
                            reference: inv.invoice_reference,
                            description: `Invoice cancelled`,
                            debit: 0,
                            credit: parseFloat(inv.total_amount),
                            balance: 0,
                          })
                        })
                    }

                    // Payments and related events
                    if (student.payments) {
                      student.payments.forEach(p => {
                        // Original payment as credit
                        transactions.push({
                          date: p.created_at,
                          type: "Payment",
                          reference: p.payment_reference,
                          description: "Payment received",
                          debit: 0,
                          credit: parseFloat(p.amount),
                          balance: 0,
                        })

                        // Refunds as debits
                        if (p.refunds && p.refunds.length > 0) {
                          p.refunds.forEach(refund => {
                            if (refund.status === RefundStatus.COMPLETED) {
                              transactions.push({
                                date: refund.processed_at,
                                type: "Refund",
                                reference: p.payment_reference,
                                description: `Refund via ${refund.refund_method}`,
                                debit: parseFloat(refund.amount),
                                credit: 0,
                                balance: 0,
                              })
                            }
                          })
                        }

                        // Reversal as debit
                        if (p.status === PaymentStatus.REVERSED) {
                          transactions.push({
                            date: p.updated_at || p.created_at,
                            type: "Reversal",
                            reference: p.payment_reference,
                            description: `Payment reversed${p.reversal_reason ? `: ${p.reversal_reason}` : ""}`,
                            debit: parseFloat(p.amount),
                            credit: 0,
                            balance: 0,
                          })
                        }
                      })
                    }

                    // Sort by date
                    transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

                    // Calculate running balance
                    transactions.forEach(tx => {
                      runningBalance += tx.debit - tx.credit
                      ledger.push({ ...tx, balance: runningBalance })
                    })

                    return ledger.length > 0 ? (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Reference</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {ledger.map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    item.type === "Invoice" || item.type === "Payment"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {item.type}
                                </Badge>
                              </TableCell>
                              <TableCell>{item.description}</TableCell>
                              <TableCell className="font-medium">{item.reference}</TableCell>
                              <TableCell className="text-right text-red-600">
                                {item.debit > 0 ? `KSh ${item.debit.toLocaleString()}` : "—"}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                {item.credit > 0 ? `KSh ${item.credit.toLocaleString()}` : "—"}
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                KSh {item.balance.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No transactions to display.
                      </p>
                    )
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Delete Student Confirmation Dialog */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Permanently Delete Student?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-4">
                    <p>
                      You are about to <strong>permanently delete</strong> the student{" "}
                      <strong>{student.full_name}</strong> (Reg: {student.reg_number}).
                    </p>
                    <p>
                      This will remove the student record, all invoices, payments, and financial history.
                    </p>
                    <p className="font-bold text-destructive">
                      This action is irreversible and cannot be undone.
                    </p>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteStudent}
                    disabled={deleting}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    {deleting ? "Deleting..." : "Yes, Delete Permanently"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </MainContent>
    </>
  )
}