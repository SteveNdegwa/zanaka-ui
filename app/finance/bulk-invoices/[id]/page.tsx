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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/src/use-toast"
import {
  ArrowLeft,
  FileText,
  Users,
  Calendar,
  DollarSign,
  User,
  AlertCircle,
  XCircle,
} from "lucide-react"
import Link from "next/link"
import { BulkInvoiceDetail, financeRequests } from "@/lib/requests/finances"

export default function BulkInvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const bulkInvoiceId = params.id as string
  const { toast } = useToast()

  const [detail, setDetail] = useState<BulkInvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState("")

  useEffect(() => {
    const fetchDetail = async () => {
      if (!bulkInvoiceId) return
      setLoading(true)
      try {
        const response = await financeRequests.viewBulkInvoice(bulkInvoiceId)
        if (response.success && response.data) {
          setDetail(response.data)
        } else {
          toast.error("Failed to load bulk invoice", { description: response.error })
          router.push("/finance/bulk-invoices")
        }
      } catch (err) {
        toast.error("Failed to load bulk invoice")
        router.push("/finance/bulk-invoices")
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [bulkInvoiceId, router, toast])

  const handleCancel = async () => {
    if (!detail) return
    if (!cancellationReason.trim()) {
      toast.error("Please provide a reason for cancellation")
      return
    }

    setCancelling(true)
    try {
      const response = await financeRequests.bulkCancelInvoices(detail.bulk_invoice.id, {
        reason: cancellationReason.trim(),
      })
      if (response.success) {
        toast.success("Bulk invoice cancelled successfully")
        setDetail(prev => prev ? {
          ...prev,
          bulk_invoice: {
            ...prev.bulk_invoice,
            is_cancelled: true,
            cancelled_by: "Current User", // Will be updated on refresh
            cancelled_at: new Date().toISOString(),
            cancellation_reason: cancellationReason.trim(),
          }
        } : null)
        setCancelOpen(false)
        setCancellationReason("")
      } else {
        toast.error("Failed to cancel bulk invoice", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong while cancelling")
    } finally {
      setCancelling(false)
    }
  }

  const getStatusBadge = (isCancelled: boolean) => {
    return (
      <Badge variant={isCancelled ? "destructive" : "default"} className="text-sm px-3 py-1">
        {isCancelled ? "Cancelled" : "Active"}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-KE", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading bulk invoice details...</p>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center space-y-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Bulk Invoice Not Found</h2>
              <p className="text-muted-foreground">
                The bulk invoice you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Link href="/finance/bulk-invoices">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bulk Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { bulk_invoice, invoices } = detail

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/finance/bulk-invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Bulk Invoices
              </Button>
            </Link>
          </div>

          {/* Header */}
          <Card className="mb-8 border-2">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-start gap-5">
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <FileText className="w-10 h-10 text-primary" />
                  </div>
                  <div>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold">{bulk_invoice.bulk_reference}</h1>
                        {getStatusBadge(bulk_invoice.is_cancelled)}
                      </div>
                      {/* Description */}
                      {bulk_invoice.description ? (
                        <p className="text-1xl font-medium text-foreground">
                          {bulk_invoice.description}
                        </p>
                      ) : (
                        <p className="text-lg text-muted-foreground italic">No description</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-muted-foreground mt-6">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Created by <strong className="text-foreground">{bulk_invoice.created_by}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Created on {formatDateTime(bulk_invoice.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Due date: {formatDate(bulk_invoice.due_date)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancel Button */}
                {!bulk_invoice.is_cancelled && (
                  <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="lg" className="shadow-md">
                        <XCircle className="mr-2 h-5 w-5" />
                        Cancel Bulk Invoice
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-lg">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Cancel Bulk Invoice</AlertDialogTitle>
                        <AlertDialogDescription className="text-base leading-relaxed">
                          This will permanently cancel <strong>{bulk_invoice.invoice_count}</strong> individual invoices
                          and reverse any applied payments.
                          <br /><br />
                          <strong className="text-destructive">This action cannot be undone.</strong>
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="cancel-reason">Reason for cancellation <span className="text-destructive">*</span></Label>
                          <Textarea
                            id="cancel-reason"
                            placeholder="e.g. Incorrect fees applied, duplicate batch, student withdrawals..."
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            rows={4}
                            className="mt-2"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            This reason will be recorded for audit purposes.
                          </p>
                        </div>
                      </div>

                      <AlertDialogFooter className="flex flex-col sm:flex-row gap-4 mt-6">
                        <AlertDialogCancel className="w-full sm:w-auto order-2 sm:order-1">
                          No, Keep Invoice
                        </AlertDialogCancel>
                        <AlertDialogAction
                          className="w-full sm:w-auto order-1 sm:order-2 bg-destructive hover:bg-destructive/90"
                          onClick={handleCancel}
                          disabled={cancelling || !cancellationReason.trim()}
                        >
                          {cancelling ? "Cancelling..." : "Yes, Cancel Bulk Invoice"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>

              <Separator className="my-8" />

              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-8 h-8 text-primary" />
                    <span className="text-sm text-muted-foreground">Students</span>
                  </div>
                  <p className="text-3xl font-bold">{bulk_invoice.student_count}</p>
                </Card>
                <Card className="p-6 bg-muted/30">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-8 h-8 text-primary" />
                    <span className="text-sm text-muted-foreground">Invoices Created</span>
                  </div>
                  <p className="text-3xl font-bold">{bulk_invoice.invoice_count}</p>
                </Card>
                <Card className="p-6 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-muted-foreground">Total Amount</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    KSh {parseFloat(bulk_invoice.total_amount).toLocaleString()}
                  </p>
                </Card>
              </div>

              {bulk_invoice.notes && (
                <>
                  <Separator className="my-8" />
                  <div className="p-6 bg-muted/30 rounded-xl">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                    <p className="text-base">{bulk_invoice.notes}</p>
                  </div>
                </>
              )}

              {bulk_invoice.is_cancelled && bulk_invoice.cancelled_by && (
                <>
                  <Separator className="my-8" />
                  <div className="p-6 bg-destructive/10 border border-destructive/30 rounded-xl">
                    <p className="text-sm font-medium text-destructive mb-2">This bulk invoice was cancelled</p>
                    <p className="text-base">
                      Cancelled by <strong>{bulk_invoice.cancelled_by}</strong> on {formatDateTime(bulk_invoice.cancelled_at!)}
                    </p>
                    {bulk_invoice.cancellation_reason && (
                      <p className="text-base mt-3">
                        <span className="font-medium">Reason:</span> {bulk_invoice.cancellation_reason}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Individual Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>
                Individual Invoices ({invoices.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice Ref</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Reg No</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Paid</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.invoice_reference}</TableCell>
                        <TableCell>{inv.student_full_name}</TableCell>
                        <TableCell>{inv.student_reg_number}</TableCell>
                        <TableCell className="text-right font-medium">
                          KSh {inv.total_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          KSh {inv.paid_amount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          KSh {inv.balance.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              inv.status === "PAID"
                                ? "default"
                                : inv.status === "CANCELLED"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {inv.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/finance/invoices/${inv.id}`)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainContent>
    </>
  )
}