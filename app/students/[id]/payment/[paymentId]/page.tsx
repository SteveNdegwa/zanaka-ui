"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  CreditCard,
  PhoneIncoming,
  Building2,
  Wallet,
  ScrollText,
  AlertTriangle,
  DollarSign,
  Undo2,
  Check,
  XCircle,
  RotateCcw,
  AlertCircle,
  Ban,
} from "lucide-react"
import Link from "next/link"
import {
  Payment,
  PaymentStatus,
  PaymentMethod,
  RefundStatus,
  financeRequests,
  CreateRefundRequest,
} from "@/lib/requests/finances"
import { toast } from "@/src/use-toast"

export default function ViewPaymentPage() {
  const router = useRouter()
  const params = useParams()
  const paymentId = params?.paymentId as string
  const studentId = params?.id as string

  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState(false)
  const [reversing, setReversing] = useState(false)
  const [refundOpen, setRefundOpen] = useState(false)
  const [confirmRefundOpen, setConfirmRefundOpen] = useState(false)
  const [reverseOpen, setReverseOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false)
  const [cancelRefundOpen, setCancelRefundOpen] = useState(false)
  const [refundToCancel, setRefundToCancel] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState("")

  const [reverseReason, setReverseReason] = useState("")
  const [refundForm, setRefundForm] = useState<CreateRefundRequest>({
    amount: 0,
    refund_method: PaymentMethod.MPESA,
  })

  useEffect(() => {
    if (!paymentId) return

    const fetchPayment = async () => {
      setLoading(true)
      const response = await financeRequests.viewPayment(paymentId)
      if (response.success && response.data) {
        setPayment(response.data)
      } else {
        toast.error("Failed to load payment", {
          description: response.error || "Unable to fetch payment details",
        })
        router.push(`/students/${studentId}`)
      }
      setLoading(false)
    }

    fetchPayment()
  }, [paymentId, studentId, router])

  const handleApprovePayment = async () => {
    if (!payment) return
    setApproving(true)
    try {
      const response = await financeRequests.approvePayment(payment.id)
      if (response.success) {
        toast.success("Payment approved successfully")
        setPayment({ ...payment, status: PaymentStatus.COMPLETED, verified_at: new Date().toISOString() })
        setApproveOpen(false)
      } else {
        toast.error("Failed to approve payment", {
          description: response.error || "Approval failed",
        })
      }
    } catch (err) {
      toast.error("Failed to approve payment", {
        description: "Something went wrong. Please try again",
      })
    } finally {
      setApproving(false)
    }
  }

  const handleReversePayment = async () => {
    if (!payment || !reverseReason.trim()) return
    setReversing(true)
    try {
      const response = await financeRequests.reversePayment(payment.id, { reason: reverseReason })
      if (response.success) {
        toast.success("Payment reversed successfully")
        setPayment({ ...payment, status: PaymentStatus.REVERSED })
        setReverseOpen(false)
        setReverseReason("")
      } else {
        toast.error("Failed to reverse payment", {
          description: response.error || "Reverse payment failed",
        })
      }
    } catch (err) {
      toast.error("Failed to reverse payment", {
        description: "Something went wrong. Please try again",
      })
    } finally {
      setReversing(false)
    }
  }

  const handleInitiateRefund = () => {
    if (refundForm.amount <= 0 || refundForm.amount > availableForRefund) {
      toast.error("Invalid refund amount")
      return
    }
    setRefundOpen(false)
    setConfirmRefundOpen(true)
  }

  const handleConfirmRefund = async () => {
    if (!payment) return

    try {
      const response = await financeRequests.createRefund(payment.id, {
        ...refundForm,
        amount: refundForm.amount,
      })

      if (response.success && response.data) {
        toast.success("Refund created successfully")
        setConfirmRefundOpen(false)
        const refreshed = await financeRequests.viewPayment(paymentId)
        if (refreshed.success && refreshed.data) {
          setPayment(refreshed.data)
        }
        setRefundForm({ amount: 0, refund_method: PaymentMethod.MPESA })
      } else {
        toast.error("Failed to create refund", {
          description: response.error || "Create refund failed",
        })
      }
    } catch (err) {
      toast.error("Failed to create refund", {
        description: "Something went wrong. Please try again",
      })
    }
  }

  const handleCancelRefund = async () => {
    if (!refundToCancel || !cancellationReason.trim()) {
      toast.error("Please provide a cancellation reason")
      return
    }

    try {
      const response = await financeRequests.cancelRefund(refundToCancel, {
        reason: cancellationReason,
      })

      if (response.success) {
        toast.success("Refund cancelled successfully")
        const refreshed = await financeRequests.viewPayment(paymentId)
        if (refreshed.success && refreshed.data) {
          setPayment(refreshed.data)
        }
        setCancellationReason("")
      } else {
        toast.error("Failed to cancel refund", {
          description: response.error || "Cancellation failed",
        })
      }
    } catch (err) {
      toast.error("Failed to cancel refund", {
        description: "Something went wrong. Please try again",
      })
    } finally {
      setCancelRefundOpen(false)
      setRefundToCancel(null)
    }
  }

  const openCancelRefundDialog = (refundId: string) => {
    setRefundToCancel(refundId)
    setCancellationReason("")
    setCancelRefundOpen(true)
  }

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "MPESA":
        return <PhoneIncoming className="w-5 h-5" />
      case "BANK":
        return <Building2 className="w-5 h-5" />
      case "CASH":
        return <Wallet className="w-5 h-5" />
      case "CHEQUE":
        return <ScrollText className="w-5 h-5" />
      case "CARD":
        return <CreditCard className="w-5 h-5" />
      default:
        return <CreditCard className="w-5 h-5" />
    }
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

  const getRefundStatusBadge = (status: RefundStatus) => {
    const variants: Record<RefundStatus, "default" | "secondary" | "destructive" | "outline"> = {
      [RefundStatus.COMPLETED]: "default",
      [RefundStatus.PENDING]: "secondary",
      [RefundStatus.FAILED]: "destructive",
      [RefundStatus.CANCELLED]: "outline",
    }

    const labels: Record<RefundStatus, string> = {
      [RefundStatus.COMPLETED]: "Completed",
      [RefundStatus.PENDING]: "Pending",
      [RefundStatus.FAILED]: "Failed",
      [RefundStatus.CANCELLED]: "Cancelled",
    }

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading payment details...</p>
      </div>
    )
  }

  if (!payment || !studentId) return null

  const allocatedAmount = parseFloat(payment.allocated_amount || "0")
  const utilizedAmount = parseFloat(payment.effective_utilized_amount || "0")
  const refundedAmount = parseFloat(payment.completed_refunded_amount || "0")
  const unassignedAmount = parseFloat(payment.unassigned_amount || "0")
  const availableForRefund = parseFloat(payment.available_for_refund || "0")

  const isPending = payment.status === PaymentStatus.PENDING
  const isCompleted = payment.status === PaymentStatus.COMPLETED
  const isReversed = payment.status === PaymentStatus.REVERSED
  const isPartiallyRefunded = payment.status === PaymentStatus.PARTIALLY_REFUNDED
  const isFullyRefunded = payment.status === PaymentStatus.REFUNDED

  const canIssueRefund = (isCompleted || isPartiallyRefunded) && availableForRefund > 0
  const canReverse = isCompleted || isPartiallyRefunded || !isFullyRefunded

  const getRefundMethodLabel = (method: PaymentMethod): string => {
    const labels: Record<PaymentMethod, string> = {
      [PaymentMethod.MPESA]: "M-Pesa",
      [PaymentMethod.BANK]: "Bank Transfer",
      [PaymentMethod.CASH]: "Cash",
      [PaymentMethod.CHEQUE]: "Cheque",
      [PaymentMethod.CARD]: "Card Payment",
    }
    return labels[method] || method.replace("_", " ")
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="mb-8">
            <Link href={`/students/${studentId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Student Profile
              </Button>
            </Link>
          </div>

          {/* Pending Approval Banner */}
          {isPending && (
            <Card className="mb-6 border-orange-500 bg-orange-50 dark:bg-orange-950/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <AlertTriangle className="w-8 h-8 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-lg">Pending Approval</h3>
                    <p className="text-sm text-muted-foreground">
                      This payment was automatically recorded and requires manual approval before it can be used.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Payment Header Card */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <CreditCard className="w-10 h-10 text-primary" />
                      <div>
                        <CardTitle className="text-2xl">{payment.payment_reference}</CardTitle>
                        <p className="text-muted-foreground">
                          Paid by {payment.student_full_name} ({payment.student_reg_number})
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getPaymentStatusBadge(payment.status as PaymentStatus)}
                    </div>
                  </div>
                </CardHeader>

                {/* Action Bar for PENDING payments */}
                {isPending && (
                  <div className="border-t px-6 py-8 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-950/30">
                    <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                      <Dialog open={approveOpen} onOpenChange={setApproveOpen}>
                        <DialogTrigger asChild>
                          <Button size="lg" className="flex-1 bg-green-600 hover:bg-green-700 shadow-lg">
                            <Check className="w-6 h-6 mr-3" />
                            Approve Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Approve Payment</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to approve this payment of KSh {parseFloat(payment.amount).toLocaleString()}?
                              <br />
                              It will become available for allocation and refunds.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button variant="outline" onClick={() => setApproveOpen(false)}>
                              Cancel
                            </Button>
                            <Button onClick={handleApprovePayment} disabled={approving}>
                              {approving ? "Approving..." : "Yes, Approve"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={reverseOpen} onOpenChange={setReverseOpen}>
                        <DialogTrigger asChild>
                          <Button size="lg" variant="destructive" className="flex-1 shadow-lg">
                            <XCircle className="w-6 h-6 mr-3" />
                            Reject Payment
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Payment</DialogTitle>
                            <DialogDescription>
                              This will reverse the payment. Please provide a reason.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <Label htmlFor="reject-reason">Reason for rejection</Label>
                            <Textarea
                              id="reject-reason"
                              placeholder="e.g. Wrong student, duplicate, incorrect amount..."
                              value={reverseReason}
                              onChange={(e) => setReverseReason(e.target.value)}
                              className="mt-2"
                            />
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setReverseOpen(false)
                                setReverseReason("")
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={handleReversePayment}
                              disabled={reversing || !reverseReason.trim()}
                            >
                              {reversing ? "Rejecting..." : "Confirm Rejection"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}

                {/* Action Bar for COMPLETED / PARTIALLY_REFUNDED payments */}
                {(isCompleted || isPartiallyRefunded) && (
                  <div className="border-t px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex flex-wrap gap-3">
                      {canIssueRefund && (
                        <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Undo2 className="w-4 h-4 mr-2" />
                              Issue Refund
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Issue Refund</DialogTitle>
                              <DialogDescription>
                                Refund part of this payment. Max available: KSh {availableForRefund.toLocaleString()}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>Amount</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  max={availableForRefund}
                                  step="0.01"
                                  value={refundForm.amount || ""}
                                  onChange={(e) =>
                                    setRefundForm({ ...refundForm, amount: parseFloat(e.target.value) || 0 })
                                  }
                                />
                              </div>
                              <div>
                                <Label>Refund Method</Label>
                                <Select
                                  value={refundForm.refund_method}
                                  onValueChange={(v) =>
                                    setRefundForm({ ...refundForm, refund_method: v as PaymentMethod })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={PaymentMethod.MPESA}>M-Pesa</SelectItem>
                                    <SelectItem value={PaymentMethod.BANK}>Bank Transfer</SelectItem>
                                    <SelectItem value={PaymentMethod.CASH}>Cash</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              {refundForm.refund_method === PaymentMethod.MPESA && (
                                <>
                                  <div>
                                    <Label>M-Pesa Receipt Number (Optional)</Label>
                                    <Input
                                      value={refundForm.mpesa_receipt_number || ""}
                                      onChange={(e) =>
                                        setRefundForm({ ...refundForm, mpesa_receipt_number: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label>Phone Number</Label>
                                    <Input
                                      value={refundForm.mpesa_phone_number || ""}
                                      onChange={(e) =>
                                        setRefundForm({ ...refundForm, mpesa_phone_number: e.target.value })
                                      }
                                    />
                                  </div>
                                </>
                              )}

                              {refundForm.refund_method === PaymentMethod.BANK && (
                                <>
                                  <div>
                                    <Label>Bank Reference (Optional)</Label>
                                    <Input
                                      value={refundForm.bank_reference || ""}
                                      onChange={(e) =>
                                        setRefundForm({ ...refundForm, bank_reference: e.target.value })
                                      }
                                    />
                                  </div>
                                  <div>
                                    <Label>Bank Name</Label>
                                    <Input
                                      value={refundForm.bank_name || ""}
                                      onChange={(e) =>
                                        setRefundForm({ ...refundForm, bank_name: e.target.value })
                                      }
                                    />
                                  </div>
                                </>
                              )}

                              <div>
                                <Label>Notes (Optional)</Label>
                                <Textarea
                                  value={refundForm.notes || ""}
                                  onChange={(e) => setRefundForm({ ...refundForm, notes: e.target.value })}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setRefundOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleInitiateRefund}>
                                Proceed to Confirm
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}

                      {canReverse && (
                        <Dialog open={reverseOpen} onOpenChange={setReverseOpen}>
                          <DialogTrigger asChild>
                            <Button variant="destructive">
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Reverse Payment
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Reverse Payment</DialogTitle>
                              <DialogDescription>
                                This will deactivate all allocations and mark the payment as REVERSED.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Label htmlFor="reverse-reason">Reason for reversal</Label>
                              <Textarea
                                id="reverse-reason"
                                placeholder="Enter reason..."
                                value={reverseReason}
                                onChange={(e) => setReverseReason(e.target.value)}
                                className="mt-2"
                              />
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setReverseOpen(false)
                                  setReverseReason("")
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleReversePayment}
                                disabled={reversing || !reverseReason.trim()}
                              >
                                {reversing ? "Reversing..." : "Confirm Reversal"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                )}

                {/* Refund Confirmation Dialog */}
                <Dialog open={confirmRefundOpen} onOpenChange={setConfirmRefundOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Refund</DialogTitle>
                      <DialogDescription>
                        You are about to issue a refund. This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex justify-between">
                        <span className="font-medium">Amount:</span>
                        <span className="font-bold text-red-600">
                          KSh {refundForm.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Method:</span>
                        <span>{getRefundMethodLabel(refundForm.refund_method)}</span>
                      </div>
                      {refundForm.notes && (
                        <div>
                          <span className="font-medium">Notes:</span>
                          <p className="text-sm mt-1 text-muted-foreground italic">{refundForm.notes}</p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setConfirmRefundOpen(false)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={handleConfirmRefund}>
                        Yes, Issue Refund
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {/* Cancel Refund Dialog */}
                <Dialog open={cancelRefundOpen} onOpenChange={setCancelRefundOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Refund</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel this refund? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="cancellation-reason">Reason for cancellation</Label>
                      <Textarea
                        id="cancellation-reason"
                        placeholder="e.g. Wrong amount, customer changed mind..."
                        value={cancellationReason}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCancelRefundOpen(false)}>
                        No, Keep Refund
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={!cancellationReason.trim()}
                        onClick={handleCancelRefund}
                      >
                        Yes, Cancel Refund
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Amount</p>
                      <p className="text-2xl font-bold">KSh {parseFloat(payment.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Allocated</p>
                      <p className="text-xl font-semibold text-green-600">KSh {allocatedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Refunded</p>
                      <p className="text-xl font-semibold text-red-600">KSh {refundedAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                      <p className={`text-xl font-semibold ${unassignedAmount > 0 ? "text-orange-600" : "text-green-600"}`}>
                        KSh {unassignedAmount.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Payment Method</p>
                      <div className="flex items-center gap-3">
                        {getMethodIcon(payment.payment_method)}
                        <span className="font-semibold">{payment.payment_method.replace("_", " ")}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Recorded On</p>
                      <p className="font-medium">{new Date(payment.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {(payment.payment_method === "MPESA" || payment.payment_method === "BANK") && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          {payment.payment_method === "MPESA" ? <PhoneIncoming className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                          {payment.payment_method === "MPESA" ? "M-Pesa" : "Bank"} Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          {payment.payment_method === "MPESA" && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Receipt</p>
                                <p className="font-medium">{payment.mpesa_receipt_number || "—"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Phone</p>
                                <p className="font-medium">{payment.mpesa_phone_number || "—"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Date</p>
                                <p className="font-medium">
                                  {payment.mpesa_transaction_date
                                    ? new Date(payment.mpesa_transaction_date).toLocaleDateString()
                                    : "—"}
                                </p>
                              </div>
                            </>
                          )}
                          {payment.payment_method === "BANK" && (
                            <>
                              <div>
                                <p className="text-muted-foreground">Reference</p>
                                <p className="font-medium">{payment.bank_reference || "—"}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Bank</p>
                                <p className="font-medium">{payment.bank_name || "—"}</p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {payment.notes && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Notes</p>
                        <p className="text-sm whitespace-pre-wrap">{payment.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Invoice Allocations */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Allocations</CardTitle>
                </CardHeader>
                <CardContent>
                  {payment.payment_allocations.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Invoice</TableHead>
                          <TableHead>Allocated</TableHead>
                          <TableHead>Invoice Total</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payment.payment_allocations.map((alloc) => (
                          <TableRow key={alloc.id}>
                            <TableCell className="font-medium">{alloc.invoice_reference}</TableCell>
                            <TableCell>KSh {parseFloat(alloc.allocated_amount).toLocaleString()}</TableCell>
                            <TableCell>KSh {parseFloat(alloc.invoice_total_amount).toLocaleString()}</TableCell>
                            <TableCell>KSh {parseFloat(alloc.invoice_balance).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant={alloc.invoice_status === "PAID" ? "default" : "secondary"}>
                                {alloc.invoice_status.replace("_", " ").toUpperCase()}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-10 text-muted-foreground">
                      <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-40" />
                      <p className="font-medium">No allocations</p>
                      <p className="text-sm mt-1">This payment has not been applied to any invoice yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Refunds Issued */}
              {payment.refunds && payment.refunds.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Undo2 className="w-6 h-6" />
                      Refunds Issued
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Processed By</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payment.refunds.map((refund) => (
                          <TableRow key={refund.id}>
                            <TableCell className="font-medium text-red-600">
                              -KSh {parseFloat(refund.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>{refund.refund_method}</TableCell>
                            <TableCell>{getRefundStatusBadge(refund.status as RefundStatus)}</TableCell>
                            <TableCell>{refund.processed_by_full_name || "—"}</TableCell>
                            <TableCell>{new Date(refund.processed_at).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              {(refund.status === RefundStatus.PENDING || refund.status === RefundStatus.COMPLETED) && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openCancelRefundDialog(refund.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  Cancel
                                </Button>
                              )}
                              {refund.status === RefundStatus.CANCELLED && (
                                <div className="text-right">
                                  <Badge variant="outline" className="text-destructive">
                                    Cancelled
                                  </Badge>
                                  {refund.cancellation_reason && (
                                    <p className="text-xs text-muted-foreground mt-1 italic">
                                      Reason: {refund.cancellation_reason}
                                    </p>
                                  )}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Received</span>
                    <span className="font-bold text-2xl">KSh {parseFloat(payment.amount).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Allocated</span>
                      <span className="font-semibold text-purple-600">KSh {allocatedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Refunded</span>
                      <span className="font-semibold text-red-600">KSh {refundedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Utilized</span>
                      <span className="font-semibold text-green-600">KSh {utilizedAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unassigned</span>
                      <span className={`font-semibold ${unassignedAmount > 0 ? "text-orange-600" : "text-muted-foreground"}`}>
                        KSh {unassignedAmount.toLocaleString()}
                      </span>
                    </div>
                    {availableForRefund > 0 && (
                      <div className="flex justify-between pt-3 border-t">
                        <span className="font-medium">Available for Refund</span>
                        <span className="font-bold text-blue-600">KSh {availableForRefund.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Verified By</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium">{payment.verified_by_full_name || "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {payment.verified_at ? new Date(payment.verified_at).toLocaleString() : "Pending verification"}
                  </p>
                </CardContent>
              </Card>

              {isReversed && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-destructive">Reversed By</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium text-destructive">{payment.reversed_by_full_name || "Unknown User"}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.updated_at ? new Date(payment.updated_at).toLocaleString() : "—"}
                    </p>
                    {payment.reversal_reason && (
                      <>
                        <Separator className="my-3" />
                        <div className="p-3 bg-destructive/10 rounded-md">
                          <p className="text-sm font-medium text-destructive">Reversal Reason</p>
                          <p className="text-sm italic mt-1">{payment.reversal_reason}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </MainContent>
    </>
  )
}