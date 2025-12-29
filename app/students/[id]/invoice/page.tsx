"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/src/use-toast"
import {
  ArrowLeft,
  Plus,
  Trash2,
  FileText,
  DollarSign,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"

import { financeRequests } from "@/lib/requests/finances"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/components/ui/alert-dialog"

interface FeeItem {
  id: string
  name: string
  default_amount: string
  category: string
  is_active: boolean
  grade_level_fees: GradeLevelFee[]
}

interface GradeLevelFee {
  id: string
  grade_level: string
  term: string
  academic_year: string
  amount: string
  is_mandatory: boolean
}

interface InvoiceItemDraft {
  key: string
  type: "manual" | "fee_item"
  description?: string
  fee_item_id?: string
  fee_item_name?: string
  grade_level?: string
  term?: string
  academic_year?: string
  unit_price: string
  quantity: number
  amount: string
}

const GRADE_LEVELS = [
  "baby_class", "pp_1", "pp_2", "grade_1", "grade_2", "grade_3",
  "grade_4", "grade_5", "grade_6", "grade_7", "grade_8", "grade_9"
]

const CURRENT_YEAR = new Date().getFullYear()
const ACADEMIC_YEARS = [`${CURRENT_YEAR}`, `${CURRENT_YEAR + 1}`]

export default function CreateInvoicePage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params?.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [feeItems, setFeeItems] = useState<FeeItem[]>([])

  const [dueDate, setDueDate] = useState<string>("")
  const [priority, setPriority] = useState<number>(1)
  const [notes, setNotes] = useState<string>("")

  const [items, setItems] = useState<InvoiceItemDraft[]>([])

  const [currentItem, setCurrentItem] = useState<InvoiceItemDraft>({
    key: "",
    type: "manual",
    unit_price: "",
    quantity: 1,
    amount: "0.00",
  })

  // Track last override status to avoid duplicate toasts
  const [lastOverrideStatus, setLastOverrideStatus] = useState<"none" | "found" | "not_found">("none")

  const [showConfirm, setShowConfirm] = useState(false)

  // Fetch fee items
  useEffect(() => {
    const fetchFeeItems = async () => {
      setLoading(true)
      const response = await financeRequests.listFeeItems()
      if (response.success && response.data) {
        setFeeItems(response.data.filter((f: FeeItem) => f.is_active))
      } else {
        toast.error("Failed to load fee items", { description: response.error })
      }
      setLoading(false)
    }
    fetchFeeItems()
  }, [toast])

  // Handle fee item selection and override logic
  useEffect(() => {
    if (currentItem.type !== "fee_item" || !currentItem.fee_item_id) {
      setLastOverrideStatus("none")
      return
    }

    const fee = feeItems.find(f => f.id === currentItem.fee_item_id)
    if (!fee) return

    let price = parseFloat(fee.default_amount)
    let overrideFound = false

    const hasAllOverrideFields =
      currentItem.grade_level &&
      currentItem.term &&
      currentItem.academic_year

    if (hasAllOverrideFields) {
      const override = fee.grade_level_fees.find(
        g =>
          g.grade_level === currentItem.grade_level &&
          g.term === currentItem.term &&
          g.academic_year === currentItem.academic_year
      )

      if (override) {
        price = parseFloat(override.amount)
        overrideFound = true
      }
    }

    const qty = currentItem.quantity || 1
    const amount = (price * qty).toFixed(2)

    // Show toasts only on change
    if (hasAllOverrideFields) {
      if (overrideFound && lastOverrideStatus !== "found") {
        toast.success("Grade-level override applied!", {
          description: `Using KSh ${price.toLocaleString()} instead of default`,
          icon: <CheckCircle2 className="w-5 h-5" />,
        })
        setLastOverrideStatus("found")
      } else if (!overrideFound && lastOverrideStatus !== "not_found") {
        toast.warning("No override found", {
          description: `Using default amount KSh ${parseFloat(fee.default_amount).toLocaleString()}`,
          icon: <AlertTriangle className="w-5 h-5" />,
        })
        setLastOverrideStatus("not_found")
      }
    } else {
      setLastOverrideStatus("none")
    }

    setCurrentItem(prev => ({
      ...prev,
      fee_item_name: fee.name,
      unit_price: price.toFixed(2),
      amount,
    }))
  }, [
    currentItem.type,
    currentItem.fee_item_id,
    currentItem.grade_level,
    currentItem.term,
    currentItem.academic_year,
    currentItem.quantity,
    feeItems,
    lastOverrideStatus,
    toast,
  ])

  // Manual entry amount calculation
  useEffect(() => {
    if (currentItem.type !== "manual") return

    const cleaned = currentItem.unit_price.replace(/[,\s]/g, "")
    const price = parseFloat(cleaned) || 0
    const qty = currentItem.quantity || 1
    const amount = (price * qty).toFixed(2)

    if (amount !== currentItem.amount) {
      setCurrentItem(prev => ({ ...prev, amount }))
    }
  }, [currentItem.unit_price, currentItem.quantity, currentItem.type])

  const addItem = () => {
    const isManualInvalid = currentItem.type === "manual" && (!currentItem.description?.trim() || !currentItem.unit_price)
    const isFeeItemInvalid = currentItem.type === "fee_item" && !currentItem.fee_item_id

    if (isManualInvalid || isFeeItemInvalid) {
      toast.error("Please complete all required fields for the item")
      return
    }

    const cleanedPrice = currentItem.unit_price.replace(/[,\s]/g, "")

    setItems(prev => [...prev, {
      ...currentItem,
      unit_price: cleanedPrice,
      key: Date.now().toString(),
    }])

    // Reset form and override status
    setCurrentItem({
      key: "",
      type: "manual",
      unit_price: "",
      quantity: 1,
      amount: "0.00",
    })
    setLastOverrideStatus("none")
  }

  const removeItem = (key: string) => {
    setItems(prev => prev.filter(i => i.key !== key))
  }

  const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0).toFixed(2)

  const hasErrors = !studentId || !dueDate || items.length === 0

  const handleSubmit = async () => {
    if (hasErrors) {
      toast.error("Please complete all required fields")
      return
    }

    setShowConfirm(false)

    const payload = {
      due_date: dueDate,
      priority,
      notes: notes || undefined,
      invoice_items: items.map(i => ({
        fee_item_id: i.type === "fee_item" ? i.fee_item_id : null,
        description: i.description?.trim() || i.fee_item_name || "",
        unit_price: i.unit_price,
        quantity: i.quantity,
        grade_level: i.grade_level,
        term: i.term,
        academic_year: i.academic_year,
      })),
    }

    const response = await financeRequests.createInvoice(studentId!, payload)

    if (response.success) {
      toast.success("Invoice created successfully")
      router.push(`/students/${studentId}`)
    } else {
      toast.error("Failed to create invoice", { description: response.error || "Unknown error" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading fee items...</p>
      </div>
    )
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
              <h2 className="text-2xl font-semibold text-foreground">
                Invalid Student ID
              </h2>
              <p className="text-muted-foreground">
                We couldn't find the student you're trying to invoice.
                Please check the link or go back to the students list.
              </p>
            </div>
            <Link href="/students" className="w-full max-w-xs">
              <Button size="lg" className="w-full">
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
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Link href={`/students/${studentId}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Student Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Invoice Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="dueDate">Due Date *</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={e => setDueDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div>
                      <Label>Priority (1 = Highest)</Label>
                      <div className="flex items-center space-x-4 mt-2">
                        <Slider
                          value={[priority]}
                          onValueChange={(value: number[]) => setPriority(value[0])}
                          min={1}
                          max={10}
                          step={1}
                          className="flex-1"
                        />
                        <Badge variant="secondary" className="w-12 text-center">
                          {priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional notes for this invoice..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Item Form */}
              <Card>
                <CardHeader>
                  <CardTitle>Add Invoice Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Entry Mode</Label>
                    <Select
                      value={currentItem.type}
                      onValueChange={v => setCurrentItem({
                        ...currentItem,
                        type: v as "manual" | "fee_item",
                        unit_price: "",
                        amount: "0.00",
                        fee_item_id: undefined,
                        grade_level: undefined,
                        term: undefined,
                        academic_year: undefined,
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Entry</SelectItem>
                        <SelectItem value="fee_item">From Fee Catalog</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {currentItem.type === "fee_item" ? (
                    <>
                      <div>
                        <Label>Fee Item *</Label>
                        <Select
                          value={currentItem.fee_item_id || ""}
                          onValueChange={v => setCurrentItem({ ...currentItem, fee_item_id: v })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a fee item" />
                          </SelectTrigger>
                          <SelectContent>
                            {feeItems.map(f => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.name} — Default: KSh {parseFloat(f.default_amount).toLocaleString()}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Grade Level</Label>
                          <Select
                            value={currentItem.grade_level || ""}
                            onValueChange={v => setCurrentItem({ ...currentItem, grade_level: v || undefined })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                            <SelectContent>
                              {GRADE_LEVELS.map(g => (
                                <SelectItem key={g} value={g}>
                                  {g.replace("_", " ").toUpperCase()}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Term</Label>
                          <Select
                            value={currentItem.term || ""}
                            onValueChange={v => setCurrentItem({ ...currentItem, term: v || undefined })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TERM_1">Term 1</SelectItem>
                              <SelectItem value="TERM_2">Term 2</SelectItem>
                              <SelectItem value="TERM_3">Term 3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Academic Year</Label>
                          <Select
                            value={currentItem.academic_year || ""}
                            onValueChange={v => setCurrentItem({ ...currentItem, academic_year: v || undefined })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Optional" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACADEMIC_YEARS.map(y => (
                                <SelectItem key={y} value={y}>{y}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {currentItem.grade_level && currentItem.term && currentItem.academic_year && (
                        <div className="flex items-center gap-2 text-sm">
                          {lastOverrideStatus === "found" ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">Grade-level override applied</span>
                            </>
                          ) : lastOverrideStatus === "not_found" ? (
                            <>
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                              <span className="text-amber-600">No override found — using default amount</span>
                            </>
                          ) : null}
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <Label>Description *</Label>
                      <Input
                        placeholder="e.g. Extra Tuition, Transport Fee"
                        value={currentItem.description || ""}
                        onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Unit Price (KSh) *</Label>
                      <Input
                        type="text"
                        value={currentItem.unit_price}
                        onChange={e => {
                          const value = e.target.value
                          if (value === '' || /^[\d,.\s]*$/.test(value)) {
                            setCurrentItem({ ...currentItem, unit_price: value })
                          }
                        }}
                        disabled={currentItem.type === "fee_item"}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={currentItem.quantity}
                        onChange={e => setCurrentItem({ ...currentItem, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="w-full">
                        <Label>Amount</Label>
                        <div className="flex items-center h-10 px-3 border rounded-md bg-muted font-medium">
                          KSh {currentItem.amount}
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button onClick={addItem} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item to Invoice
                  </Button>
                </CardContent>
              </Card>

              {/* Items Table */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Invoice Items <Badge variant="secondary">{items.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-center text-muted-foreground py-12">
                      No items added yet. Use the form above to add items.
                    </p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Unit Price</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="w-12"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {items.map(item => (
                          <TableRow key={item.key}>
                            <TableCell>
                              <div>
                                {item.description || item.fee_item_name}
                              </div>
                              {item.grade_level && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  {item.grade_level.replace("_", " ").toUpperCase()} • {item.term} • {item.academic_year}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>KSh {parseFloat(item.unit_price).toLocaleString()}</TableCell>
                            <TableCell className="text-right font-medium">
                              KSh {parseFloat(item.amount).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeItem(item.key)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="font-bold bg-muted/50">
                          <TableCell colSpan={3} className="text-right">
                            Total Amount
                          </TableCell>
                          <TableCell className="text-right text-xl">
                            KSh {totalAmount}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Invoice Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex justify-between text-2xl">
                      <span className="text-muted-foreground">Total</span>
                      <span className="font-bold">KSh {totalAmount}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Due Date</span>
                      <span>{dueDate || "Not set"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority</span>
                      <Badge variant={priority <= 3 ? "destructive" : "secondary"}>
                        {priority}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="lg"
                    className="w-full"
                    disabled={hasErrors}
                    onClick={() => setShowConfirm(true)}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Create Invoice
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm Invoice Creation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to create this invoice? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleSubmit}>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainContent>
    </>
  )
}
