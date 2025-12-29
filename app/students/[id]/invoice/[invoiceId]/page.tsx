"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/src/use-toast"
import {
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  AlertCircle,
  XCircle,
  User,
  Hash,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { financeRequests } from "@/lib/requests/finances"
import { Invoice, InvoiceStatus } from "@/lib/requests/finances"

export default function ViewInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.id as string
  const invoiceId = params.invoiceId as string
  const { toast } = useToast()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)

  useEffect(() => {
    const fetchInvoice = async () => {
      if (!invoiceId) return
      setLoading(true)
      const response = await financeRequests.viewInvoice(invoiceId)
      if (response.success && response.data) {
        setInvoice(response.data)
      } else {
        toast.error("Failed to load invoice", { description: response.error })
        router.push(`/students/${studentId}`)
      }
      setLoading(false)
    }
    fetchInvoice()
  }, [invoiceId, studentId, router, toast])

  const handleCancel = async () => {
    setCancelling(true)
    try {
      const response = await financeRequests.cancelInvoice(invoiceId) // No payload/reason

      if (response.success) {
        toast.success("Invoice cancelled successfully")
        setInvoice(prev => prev ? { ...prev, status: InvoiceStatus.CANCELLED } : null)
        setCancelOpen(false)
      } else {
        toast.error("Failed to cancel invoice", { description: response.error || "Unknown error" })
      }
    } catch (err) {
      toast.error("Failed to cancel invoice", { description: "Something went wrong. Please try again." })
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      [InvoiceStatus.PAID]: "default",
      [InvoiceStatus.PARTIALLY_PAID]: "secondary",
      [InvoiceStatus.PENDING]: "outline",
      [InvoiceStatus.OVERDUE]: "destructive",
      [InvoiceStatus.CANCELLED]: "destructive",
    }
    return (
      <Badge variant={variants[status] || "outline"} className="text-sm px-3 py-1">
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    )
  }

  const canCancel = invoice?.status !== InvoiceStatus.CANCELLED && invoice?.status !== InvoiceStatus.PAID

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center space-y-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Invoice Not Found</h2>
              <p className="text-muted-foreground">
                The invoice you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Link href={`/students/${studentId}`}>
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Student
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href={`/students/${studentId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Student Profile
              </Button>
            </Link>
          </div>

          {/* Header with Invoice Ref, Status, and Cancel Button */}
          <Card className="mb-8 border-2">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{invoice.invoice_reference}</h1>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{invoice.student_full_name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="w-4 h-4" />
                        <span>{invoice.student_reg_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due: {invoice.due_date || "Not set"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancel Invoice Button with Improved Button Spacing */}
                {canCancel && (
                  <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="lg"
                        className="shadow-md"
                      >
                        <XCircle className="mr-2 h-5 w-5" />
                        Cancel Invoice
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Cancel Invoice</DialogTitle>
                        <DialogDescription className="text-base leading-relaxed">
                          Are you sure you want to cancel this invoice?
                          <br />
                          This will reverse any applied payments and cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter className="flex flex-col sm:flex-row gap-4 mt-8">
                        <Button 
                          variant="outline" 
                          onClick={() => setCancelOpen(false)}
                          className="w-full sm:w-auto order-2 sm:order-1"
                        >
                          No, Keep Invoice
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleCancel}
                          disabled={cancelling}
                          className="w-full sm:w-auto order-1 sm:order-2"
                        >
                          {cancelling ? "Cancelling..." : "Yes, Cancel Invoice"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <Separator className="my-6" />

              {/* Quick Financial Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-5 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-2xl font-bold">KSh {parseFloat(invoice.total_amount).toLocaleString()}</p>
                </div>
                <div className="text-center p-5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Paid Amount</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    KSh {parseFloat(invoice.paid_amount).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-5 bg-red-50 dark:bg-red-900/20 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Balance Due</p>
                  <p className={`text-2xl font-bold ${parseFloat(invoice.balance) > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                    KSh {parseFloat(invoice.balance).toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-5 bg-muted/50 rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Priority</p>
                  <Badge variant={invoice.priority <= 3 ? "destructive" : "secondary"} className="text-lg px-5 py-2 mt-2">
                    {invoice.priority}
                  </Badge>
                </div>
              </div>

              {invoice.notes && (
                <>
                  <Separator className="my-6" />
                  <div className="p-5 bg-muted/30 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                    <p className="text-base">{invoice.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.invoice_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>KSh {parseFloat(item.unit_price).toLocaleString()}</TableCell>
                          <TableCell className="text-right font-medium">
                            KSh {parseFloat(item.amount).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={3} className="text-right">
                          Total
                        </TableCell>
                        <TableCell className="text-right text-xl">
                          KSh {parseFloat(invoice.total_amount).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Payments Allocated */}
              {invoice.payments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payments Applied</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment Reference</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-right">Allocated Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invoice.payments.map((alloc) => (
                          <TableRow key={alloc.id}>
                            <TableCell className="font-medium">{alloc.payment_reference}</TableCell>
                            <TableCell>{alloc.payment_method.replace("_", " ")}</TableCell>
                            <TableCell className="text-right font-medium">
                              KSh {parseFloat(alloc.allocated_amount).toLocaleString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between text-xl">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold">KSh {parseFloat(invoice.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl">
                      <span className="text-muted-foreground">Paid</span>
                      <span className="font-bold text-green-600">KSh {parseFloat(invoice.paid_amount).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-xl">
                      <span className="text-muted-foreground">Balance</span>
                      <span className={`font-bold ${parseFloat(invoice.balance) > 0 ? "text-red-600" : "text-green-600"}`}>
                        KSh {parseFloat(invoice.balance).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      {getStatusBadge(invoice.status)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date</span>
                      <span>{invoice.due_date || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created By</span>
                      <span className="font-medium">{invoice.created_by_full_name}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainContent>
    </>
  )
}