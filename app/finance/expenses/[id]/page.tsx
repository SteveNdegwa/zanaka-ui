"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, Receipt, Paperclip, CheckCircle, XCircle, DollarSign, Ban, Calendar, Tag, Building2, User, FileText, RefreshCw, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { financeRequests, Expense, ExpenseStatus, ExpensePaymentMethod, PettyCashFund } from "@/lib/requests/finances"
import { useToast } from "@/src/use-toast"
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

export default function ViewExpensePage() {
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [expense, setExpense] = useState<Expense | null>(null)
  const [pettyCashFunds, setPettyCashFunds] = useState<PettyCashFund[]>([])

  // Payment fields
  const [paymentMethod, setPaymentMethod] = useState<ExpensePaymentMethod | "">("")
  const [receiptNumber, setReceiptNumber] = useState("")
  const [chequeNumber, setChequeNumber] = useState("")
  const [transactionReference, setTransactionReference] = useState("")
  const [pettyCashFundId, setPettyCashFundId] = useState("")
  const [payNotes, setPayNotes] = useState("")

  const [showAction, setShowAction] = useState<"submit" | "approve" | "reject" | "pay" | "cancel" | null>(null)

  const actionSuccessMessages: Record<string, string> = {
    submit: "submitted for approval",
    approve: "approved",
    reject: "rejected",
    pay: "paid",
    cancel: "cancelled",
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [expRes, pcRes] = await Promise.all([
          financeRequests.viewExpense(expenseId),
          financeRequests.listPettyCashFunds({ status: "ACTIVE" }),
        ])

        if (expRes.success && expRes.data) {
          setExpense(expRes.data)
        } else {
          toast.error("Failed to load expense data", { description: expRes.error })
        }

        if (pcRes.success && pcRes.data) {
          setPettyCashFunds(pcRes.data)
        }
      } catch (error) {
        toast.error("Failed to load data")
        router.push("/finance/expenses")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [expenseId, router, toast])

  const handleAction = async (action: string) => {
    setProcessing(true)
    try {
      let response
      switch (action) {
        case "submit":
          response = await financeRequests.submitExpenseForApproval(expenseId)
          break
        case "approve":
          response = await financeRequests.approveExpense(expenseId)
          break
        case "reject":
          response = await financeRequests.rejectExpense(expenseId, { rejection_reason: "Not approved" })
          break
        case "pay":
          const payData: any = {
            payment_method: paymentMethod,
            receipt_number: receiptNumber || undefined,
            cheque_number: chequeNumber || undefined,
            transaction_reference: transactionReference || undefined,
            petty_cash_fund_id: paymentMethod === "PETTY_CASH" ? pettyCashFundId || undefined : undefined,
            notes: payNotes.trim() || undefined,
          }
          response = await financeRequests.markExpenseAsPaid(expenseId, payData)
          break
        case "cancel":
          response = await financeRequests.cancelExpense(expenseId)
          break
      }

      if (response?.success) {
        const message = actionSuccessMessages[action] ?? "updated"
        toast.success(`Expense ${message} successfully`)
        router.push("/finance/expenses")
      } else {
        toast.error(`Failed to ${action} expense`, { description: response?.error })
      }
    } catch (err) {
      toast.error(`Failed to ${action} expense`)
    } finally {
      setProcessing(false)
      setShowAction(null)
    }
  }

  const formatAmount = (amount: string) => `KSh ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  const getStatusConfig = (status: ExpenseStatus) => {
    const configs: Record<ExpenseStatus, { label: string; icon: React.ReactNode; color: string }> = {
      DRAFT: { label: "Draft", icon: <FileText className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" },
      PENDING_APPROVAL: { label: "Pending Approval", icon: <Clock className="w-4 h-4" />, color: "bg-yellow-100 text-yellow-800" },
      APPROVED: { label: "Approved", icon: <CheckCircle className="w-4 h-4" />, color: "bg-blue-100 text-blue-800" },
      PAID: { label: "Paid", icon: <DollarSign className="w-4 h-4" />, color: "bg-green-100 text-green-800" },
      REJECTED: { label: "Rejected", icon: <XCircle className="w-4 h-4" />, color: "bg-red-100 text-red-800" },
      CANCELLED: { label: "Cancelled", icon: <Ban className="w-4 h-4" />, color: "bg-gray-100 text-gray-800" },
    }
    return configs[status] || { label: status, icon: null, color: "bg-gray-100 text-gray-800" }
  }

  const statusConfig = getStatusConfig(expense?.status || "DRAFT")

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading expense...</span>
      </div>
    )
  }

  if (!expense) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Expense not found</div>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Breadcrumb & Back */}
          <div className="mb-8">
            <Link href="/finance/expenses">
              <Button variant="ghost" size="sm" className="group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Expenses
              </Button>
            </Link>
          </div>

          {/* Hero Header */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className="p-5 bg-primary/10 rounded-2xl">
                  <Receipt className="w-12 h-12 text-primary" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">{expense.name}</h1>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="font-mono text-lg text-muted-foreground">{expense.expense_reference}</span>
                    <Badge className={`text-base px-4 py-1 ${statusConfig.color} flex items-center gap-2`}>
                      {statusConfig.icon}
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            {/* Left Column - Core Info */}
            <div className="lg:col-span-2 space-y-8">
              {/* Key Details */}
              <Card className="border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Expense Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Expense Date</p>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Requested By</p>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-muted-foreground" />
                      {expense.requested_by_full_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Department</p>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      {expense.department_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      {expense.category_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Vendor</p>
                    <p className="text-lg font-semibold">{expense.vendor_name || "—"}</p>
                  </div>
                  {expense.is_recurring && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recurring</p>
                      <p className="text-lg font-semibold flex items-center gap-2 mt-1">
                        <RefreshCw className="w-4 h-4 text-purple-600" />
                        {expense.recurrence_frequency?.replace("_", " ")}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Notes */}
              {expense.notes && (
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">{expense.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Financial Summary */}
            <div className="space-y-8">
              <Card className="border shadow-sm bg-gradient-to-br from-primary/5 to-primary/10">
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Base Amount</p>
                    <p className="text-2xl font-bold mt-1">{formatAmount(expense.amount)}</p>
                  </div>
                  {expense.is_taxable && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Tax ({expense.tax_rate}%)</p>
                      <p className="text-xl font-semibold text-orange-600 mt-1">{formatAmount(expense.tax_amount)}</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-primary/20">
                    <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                    <p className="text-4xl font-bold text-primary mt-2">{formatAmount(expense.total_amount)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Audit Trail */}
              {(expense.approved_by_full_name || expense.paid_by_full_name || expense.rejection_reason) && (
                <Card className="border shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Audit Trail</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {expense.approved_by_full_name && (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Approved</p>
                          <p className="text-sm text-muted-foreground">
                            by <span className="font-medium text-foreground">{expense.approved_by_full_name}</span> on{" "}
                            {expense.approved_at ? new Date(expense.approved_at).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                          </p>
                        </div>
                      </div>
                    )}

                    {expense.paid_by_full_name && (
                      <div className="flex items-start gap-3">
                        <DollarSign className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Paid using {expense.payment_method.replace("_", " ")}</p>
                          <p className="text-sm text-muted-foreground">
                            by <span className="font-medium text-foreground">{expense.paid_by_full_name}</span> on{" "}
                            {expense.paid_at ? new Date(expense.paid_at).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                          </p>
                          {(expense.receipt_number || expense.cheque_number || expense.transaction_reference) && (
                            <div className="mt-3 space-y-1 text-sm bg-muted/50 p-3 rounded-lg">
                              {expense.receipt_number && (
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">M-Pesa Receipt:</span>
                                  <span className="font-mono bg-background px-2 py-1 rounded">{expense.receipt_number}</span>
                                </p>
                              )}
                              {expense.cheque_number && (
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">Cheque #:</span>
                                  <span className="font-mono bg-background px-2 py-1 rounded">{expense.cheque_number}</span>
                                </p>
                              )}
                              {expense.transaction_reference && (
                                <p className="flex items-center gap-2">
                                  <span className="font-medium">Transaction Ref:</span>
                                  <span className="font-mono bg-background px-2 py-1 rounded">{expense.transaction_reference}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {expense.rejection_reason && (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold">Rejected</p>
                          <p className="text-sm text-muted-foreground">
                            by <span className="font-medium text-foreground">{expense.rejected_by_full_name || "Unknown"}</span> on{" "}
                            {expense.rejected_at ? new Date(expense.rejected_at).toLocaleDateString("en-KE", { day: "2-digit", month: "long", year: "numeric" }) : "—"}
                          </p>
                          <p className="text-sm italic mt-2 bg-red-50 p-3 rounded-lg border border-red-200">
                            "{expense.rejection_reason}"
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Mark as Paid Section */}
          {expense.status === "APPROVED" && (
            <Card className="mb-10 border-2 shadow-md bg-gradient-to-br from-primary/5 via-transparent to-transparent">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-3">
                  <DollarSign className="w-7 h-7 text-primary" />
                  Mark as Paid
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="payment_method" className="text-base font-medium">Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as ExpensePaymentMethod)}>
                    <SelectTrigger id="payment_method" className="mt-2 h-12 text-base">
                      <SelectValue placeholder="Choose payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Cash</SelectItem>
                      <SelectItem value="CHEQUE">Cheque</SelectItem>
                      <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                      <SelectItem value="MPESA">M-Pesa</SelectItem>
                      <SelectItem value="CARD">Card</SelectItem>
                      <SelectItem value="PETTY_CASH">Petty Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentMethod === "MPESA" && (
                  <div>
                    <Label htmlFor="receipt" className="text-base font-medium">M-Pesa Receipt Number *</Label>
                    <Input
                      id="receipt"
                      value={receiptNumber}
                      onChange={(e) => setReceiptNumber(e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="e.g. LKA123XYZ"
                    />
                  </div>
                )}

                {paymentMethod === "CHEQUE" && (
                  <div>
                    <Label htmlFor="cheque" className="text-base font-medium">Cheque Number *</Label>
                    <Input
                      id="cheque"
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="e.g. 001234"
                    />
                  </div>
                )}

                {["BANK_TRANSFER", "CARD"].includes(paymentMethod) && (
                  <div>
                    <Label htmlFor="reference" className="text-base font-medium">Transaction Reference (Optional)</Label>
                    <Input
                      id="reference"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      className="mt-2 h-12 text-base"
                      placeholder="Bank or card reference"
                    />
                  </div>
                )}

                {paymentMethod === "PETTY_CASH" && (
                  <div>
                    <Label htmlFor="petty_fund" className="text-base font-medium">Petty Cash Fund *</Label>
                    <Select value={pettyCashFundId} onValueChange={setPettyCashFundId}>
                      <SelectTrigger className="mt-2 h-12 text-base">
                        <SelectValue placeholder="Select active fund" />
                      </SelectTrigger>
                      <SelectContent>
                        {pettyCashFunds.map((fund) => (
                          <SelectItem key={fund.id} value={fund.id}>
                            <div className="flex justify-between items-center w-full">
                              <span>{fund.fund_name}</span>
                              <span className="text-sm text-muted-foreground ml-4">
                                Balance: KSh {parseFloat(fund.current_balance).toLocaleString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="pay_notes" className="text-base font-medium">Payment Notes (Optional)</Label>
                  <Textarea
                    id="pay_notes"
                    placeholder="Any additional details about this payment..."
                    value={payNotes}
                    onChange={(e) => setPayNotes(e.target.value)}
                    className="mt-2 min-h-32 text-base"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center md:justify-end gap-4 mb-12">
            {expense.status === "DRAFT" && (
              <Button size="lg" onClick={() => setShowAction("submit")} disabled={processing}>
                <CheckCircle className="w-5 h-5 mr-2" />
                Submit for Approval
              </Button>
            )}

            {expense.status === "PENDING_APPROVAL" && (
              <>
                <Button size="lg" variant="default" onClick={() => setShowAction("approve")} disabled={processing}>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Approve
                </Button>
                <Button size="lg" variant="destructive" onClick={() => setShowAction("reject")} disabled={processing}>
                  <XCircle className="w-5 h-5 mr-2" />
                  Reject
                </Button>
              </>
            )}

            {expense.status === "APPROVED" && (
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowAction("pay")}
                disabled={
                  processing ||
                  !paymentMethod ||
                  (paymentMethod === "MPESA" && !receiptNumber.trim()) ||
                  (paymentMethod === "CHEQUE" && !chequeNumber.trim()) ||
                  (paymentMethod === "PETTY_CASH" && !pettyCashFundId)
                }
              >
                <DollarSign className="w-6 h-6 mr-2" />
                Mark as Paid
              </Button>
            )}

            {["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(expense.status) && (
              <Button size="lg" variant="destructive" onClick={() => setShowAction("cancel")} disabled={processing}>
                <Ban className="w-5 h-5 mr-2" />
                Cancel Expense
              </Button>
            )}
          </div>

          {/* Attachments */}
          {expense.attachments.length > 0 && (
            <Card className="border-2 shadow-lg">
              <CardHeader className="bg-muted/50">
                <CardTitle className="text-2xl flex items-center gap-3">
                  <Paperclip className="w-7 h-7" />
                  Attachments ({expense.attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                  {expense.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col items-center p-8 border-2 border-dashed rounded-2xl hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-md hover:shadow-xl"
                    >
                      <Paperclip className="w-16 h-16 mb-6 text-primary group-hover:scale-110 transition-transform" />
                      <p className="text-base font-semibold text-center truncate w-full px-4">{att.file_name}</p>
                      <p className="text-sm text-muted-foreground mt-2 uppercase tracking-wider">{att.file_type}</p>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Confirmation Dialog */}
        <AlertDialog open={!!showAction} onOpenChange={() => setShowAction(null)}>
          <AlertDialogContent className="max-w-lg">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl flex items-center gap-3">
                {showAction === "pay" && <DollarSign className="w-7 h-7 text-green-600" />}
                {showAction === "approve" && <CheckCircle className="w-7 h-7 text-blue-600" />}
                {showAction === "reject" && <XCircle className="w-7 h-7 text-red-600" />}
                {showAction === "cancel" && <Ban className="w-7 h-7 text-gray-600" />}
                {showAction === "submit" && <FileText className="w-7 h-7 text-primary" />}
                {showAction === "pay" ? "Mark Expense as Paid?" :
                 showAction === "submit" ? "Submit for Approval?" :
                 showAction === "approve" ? "Approve Expense?" :
                 showAction === "reject" ? "Reject Expense?" :
                 showAction === "cancel" ? "Cancel Expense?" : ""}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base space-y-4 pt-4">
                {showAction === "pay" && paymentMethod && (
                  <div className="bg-muted/50 p-5 rounded-lg space-y-3">
                    <p className="font-semibold text-foreground">Payment Details</p>
                    <div className="space-y-2">
                      <p><strong>Method:</strong> {paymentMethod.replace("_", " ")}</p>
                      {paymentMethod === "MPESA" && receiptNumber && <p><strong>Receipt:</strong> <code className="bg-background px-2 py-1 rounded">{receiptNumber}</code></p>}
                      {paymentMethod === "CHEQUE" && chequeNumber && <p><strong>Cheque #:</strong> <code className="bg-background px-2 py-1 rounded">{chequeNumber}</code></p>}
                      {paymentMethod === "PETTY_CASH" && pettyCashFundId && (
                        <p><strong>Fund:</strong> {pettyCashFunds.find(f => f.id === pettyCashFundId)?.fund_name || "Unknown"}</p>
                      )}
                      {payNotes && <p className="italic pt-2 border-t">"{payNotes}"</p>}
                    </div>
                  </div>
                )}
                <p className="font-medium">This action cannot be undone.</p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleAction(showAction!)} disabled={processing} className="px-8">
                {processing ? "Processing..." : "Confirm"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainContent>
    </>
  )
}