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
import { useToast } from "@/src/use-toast"
import {
  ArrowLeft,
  CreditCard,
  PhoneIncoming,
  Building2,
  Wallet,
  ScrollText,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"

import { financeRequests } from "@/lib/requests/finances"
import { PaymentMethod, InvoiceStatus } from "@/lib/requests/finances"

interface InvoiceOption {
  id: string
  invoice_reference: string
  balance: string
  due_date: string | null
}

export default function CreatePaymentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params?.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [fetchingInvoices, setFetchingInvoices] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  const [invoices, setInvoices] = useState<InvoiceOption[]>([])

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("")
  const [amount, setAmount] = useState("")
  const [priorityInvoiceId, setPriorityInvoiceId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")

  // M-Pesa fields
  const [mpesaReceiptNumber, setMpesaReceiptNumber] = useState("")
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState("")
  const [mpesaTransactionDate, setMpesaTransactionDate] = useState("")

  // Bank fields
  const [bankReference, setBankReference] = useState("")
  const [bankName, setBankName] = useState("")

  useEffect(() => {
    const fetchInvoices = async () => {
      setFetchingInvoices(true)
      const response = await financeRequests.listInvoices({
        student_id: studentId,
        status__in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIALLY_PAID, InvoiceStatus.OVERDUE],
      })

      if (response.success && response.data) {
        const options = response.data
          .filter((inv: any) => parseFloat(inv.balance) > 0)
          .map((inv: any) => ({
            id: inv.id,
            invoice_reference: inv.invoice_reference,
            balance: inv.balance,
            due_date: inv.due_date,
          }))
          .sort((a, b) => a.invoice_reference.localeCompare(b.invoice_reference))

        setInvoices(options)
      } else {
        toast.error("Could not load open invoices")
      }
      setFetchingInvoices(false)
    }

    if (studentId) fetchInvoices()
  }, [studentId, toast])

  const hasErrors =
    !paymentMethod ||
    !amount ||
    parseFloat(amount) <= 0 ||
    (paymentMethod === PaymentMethod.MPESA &&
      (!mpesaReceiptNumber || !mpesaPhoneNumber || !mpesaTransactionDate)) ||
    (paymentMethod === PaymentMethod.BANK && (!bankReference || !bankName))

  const handleSubmit = async () => {
    if (hasErrors) {
      toast.error("Please complete all required fields")
      return
    }

    setLoading(true)

    const payload: any = {
      payment_method: paymentMethod,
      amount: parseFloat(amount),
      notes: notes || undefined,
      priority_invoice_id: priorityInvoiceId || null,
    }

    if (paymentMethod === PaymentMethod.MPESA) {
      payload.mpesa_receipt_number = mpesaReceiptNumber.trim()
      payload.mpesa_phone_number = mpesaPhoneNumber.trim()
      payload.mpesa_transaction_date = mpesaTransactionDate
    } else if (paymentMethod === PaymentMethod.BANK) {
      payload.bank_reference = bankReference.trim()
      payload.bank_name = bankName.trim()
    }

    const response = await financeRequests.createPayment(studentId!, payload)

    if (response.success) {
      toast.success("Payment recorded successfully")
      router.push(`/students/${studentId}`)
    } else {
      toast.error("Failed to record payment", { description: response.error || "Please try again" })
    }

    setLoading(false)
    setShowConfirm(false)
  }

  if (!studentId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center space-y-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Invalid Student</h2>
              <p className="text-muted-foreground">Student not found.</p>
            </div>
            <Link href="/students">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Students
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
        <div className="container mx-auto px-6 py-10 max-w-5xl">
          <div className="mb-8">
            <Link href={`/students/${studentId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Student Profile
              </Button>
            </Link>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-3 text-xl font-bold">
                <CreditCard className="w-10 h-10 text-primary" />
                Record New Payment
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-8 space-y-10">
              {/* Priority Invoice */}
              <div className="space-y-3">
                <Label htmlFor="priorityInvoice" className="text-base font-medium">
                  Priority Invoice <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Select value={priorityInvoiceId || ""} onValueChange={(v) => setPriorityInvoiceId(v || null)}>
                  <SelectTrigger id="priorityInvoice" className="w-full">
                    <SelectValue placeholder="Auto-allocate (recommended)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Auto-allocate (recommended)</SelectItem>
                    {fetchingInvoices ? (
                      <SelectItem value="loading" disabled>
                        Loading invoices...
                      </SelectItem>
                    ) : invoices.length === 0 ? (
                      <SelectItem value="no-invoices" disabled>
                        No open invoices
                      </SelectItem>
                    ) : (
                      invoices.map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          <div className="flex items-center justify-between w-full pr-2">
                            <span className="font-medium">{inv.invoice_reference}</span>
                            <span className="text-sm text-muted-foreground">
                              Balance: KSh {parseFloat(inv.balance).toLocaleString()}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  If selected, this payment will be applied to the chosen invoice first before auto-allocation.
                </p>
              </div>

              {/* Payment Method & Amount */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="method" className="text-base font-medium">
                    Payment Method <span className="text-red-600">*</span>
                  </Label>
                  <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                    <SelectTrigger id="method" className="w-full h-12">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={PaymentMethod.MPESA}>
                        <div className="flex items-center gap-3">
                          <PhoneIncoming className="w-5 h-5" />
                          <span className="font-medium">M-Pesa</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={PaymentMethod.BANK}>
                        <div className="flex items-center gap-3">
                          <Building2 className="w-5 h-5" />
                          <span className="font-medium">Bank Transfer</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={PaymentMethod.CASH}>
                        <div className="flex items-center gap-3">
                          <Wallet className="w-5 h-5" />
                          <span className="font-medium">Cash</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={PaymentMethod.CHEQUE}>
                        <div className="flex items-center gap-3">
                          <ScrollText className="w-5 h-5" />
                          <span className="font-medium">Cheque</span>
                        </div>
                      </SelectItem>
                      <SelectItem value={PaymentMethod.CARD}>
                        <div className="flex items-center gap-3">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-medium">Card</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="amount" className="text-base font-medium">
                    Amount (KSh) <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-12 text-lg"
                  />
                </div>
              </div>

              {/* Conditional M-Pesa Fields */}
              {paymentMethod === PaymentMethod.MPESA && (
                <div className="p-6 bg-muted/40 rounded-xl border">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <PhoneIncoming className="w-5 h-5 text-primary" />
                    M-Pesa Transaction Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="receipt">Receipt Number <span className="text-red-600">*</span></Label>
                      <Input
                        id="receipt"
                        placeholder="e.g. PQR9STUVWX"
                        value={mpesaReceiptNumber}
                        onChange={(e) => setMpesaReceiptNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number <span className="text-red-600">*</span></Label>
                      <Input
                        id="phone"
                        placeholder="07XX XXX XXX"
                        value={mpesaPhoneNumber}
                        onChange={(e) => setMpesaPhoneNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date">Transaction Date <span className="text-red-600">*</span></Label>
                      <Input
                        id="date"
                        type="date"
                        value={mpesaTransactionDate}
                        onChange={(e) => setMpesaTransactionDate(e.target.value)}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Bank Fields */}
              {paymentMethod === PaymentMethod.BANK && (
                <div className="p-6 bg-muted/40 rounded-xl border">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-primary" />
                    Bank Transfer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bankRef">Bank Reference <span className="text-red-600">*</span></Label>
                      <Input
                        id="bankRef"
                        placeholder="e.g. REF123456"
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bankName">Bank Name <span className="text-red-600">*</span></Label>
                      <Input
                        id="bankName"
                        placeholder="e.g. KCB, Equity Bank"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-3">
                <Label htmlFor="notes" className="text-base font-medium">
                  Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional information about this payment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end pt-6 border-t">
                <Button
                  size="lg"
                  onClick={() => setShowConfirm(true)}
                  disabled={hasErrors || loading}
                  className="min-w-64 text-lg h-12 px-8 font-medium shadow-lg hover:shadow-xl transition-shadow"
                >
                  {loading ? "Recording Payment..." : "Record Payment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainContent>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to record this payment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmit} disabled={loading}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
