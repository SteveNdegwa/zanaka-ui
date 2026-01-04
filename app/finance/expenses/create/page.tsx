"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft, Receipt, Calendar, DollarSign, Tag, Building2, User, FileText, RefreshCw } from "lucide-react"
import Link from "next/link"
import { financeRequests } from "@/lib/requests/finances"
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

export default function CreateExpensePage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)

  // Form fields
  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [expenseDate, setExpenseDate] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [vendorId, setVendorId] = useState<string | null>(null) // null means no vendor

  // Tax & Recurring
  const [isTaxable, setIsTaxable] = useState(false)
  const [taxRate, setTaxRate] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState("")

  // Notes
  const [notes, setNotes] = useState("")

  // Select options
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        const [vRes, cRes, dRes] = await Promise.all([
          financeRequests.listVendors(),
          financeRequests.listExpenseCategories(),
          financeRequests.listDepartments(),
        ])

        if (vRes.success && Array.isArray(vRes.data)) {
          setVendors(vRes.data.map((v: any) => ({ id: v.id, name: v.name })))
        }
        if (cRes.success && Array.isArray(cRes.data)) {
          setCategories(cRes.data.map((c: any) => ({ id: c.id, name: c.name })))
        }
        if (dRes.success && Array.isArray(dRes.data)) {
          setDepartments(dRes.data.map((d: any) => ({ id: d.id, name: d.name })))
        }
      } catch (err) {
        console.error("Failed to load dropdown data:", err)
        toast.error("Failed to load vendors, categories, or departments")
      } finally {
        setDataLoading(false)
      }
    }
    fetchData()
  }, [toast])

  const handleCreate = async () => {
    if (!name.trim() || !amount || !expenseDate || !categoryId || !departmentId) {
      toast.error("Please fill all required fields")
      return
    }

    setLoading(true)
    try {
      const response = await financeRequests.createExpense({
        name: name.trim(),
        amount: parseFloat(amount),
        expense_date: expenseDate,
        category_id: categoryId,
        department_id: departmentId,
        vendor_id: vendorId || null,
        notes: notes.trim() || undefined,
        is_taxable: isTaxable,
        tax_rate: isTaxable ? parseFloat(taxRate || "0") : 0,
        is_recurring: isRecurring,
        recurrence_frequency: isRecurring ? recurrenceFrequency || null : null,
      })

      if (response.success) {
        toast.success("Expense recorded successfully!")
        router.push(`/finance/expenses/${response.data?.id}`)
      } else {
        toast.error("Failed to create expense", { description: response.error })
      }
    } catch (err) {
      toast.error("Failed to create expense")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/finance/expenses">
              <Button variant="ghost" size="sm" className="group mb-4">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Expenses
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Receipt className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Record New Expense</h1>
                <p className="text-muted-foreground mt-1">Enter expense details and documentation</p>
              </div>
            </div>
          </div>

          <Card className="border-2 shadow-lg overflow-hidden">
            <CardHeader className="bg-muted/50 border-b">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Receipt className="w-6 h-6 text-primary" />
                Expense Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              {/* Description */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  Description *
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Office supplies purchase"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>

              {/* Amount & Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="amount" className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    Amount (KSh) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="date" className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Expense Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="category" className="text-sm font-medium flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    Category *
                  </Label>
                  <Select value={categoryId} onValueChange={setCategoryId} disabled={dataLoading}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={dataLoading ? "Loading categories..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="department" className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Department *
                  </Label>
                  <Select value={departmentId} onValueChange={setDepartmentId} disabled={dataLoading}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder={dataLoading ? "Loading departments..." : "Select department"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vendor – With "No Vendor" option using a non-empty value */}
              <div>
                <Label htmlFor="vendor" className="text-sm font-medium flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  Vendor (Optional)
                </Label>
                <Select value={vendorId ?? "none"} onValueChange={(value) => setVendorId(value === "none" ? null : value)} disabled={dataLoading}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder={dataLoading ? "Loading vendors..." : "Select vendor (optional)"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Vendor</SelectItem>
                    {vendors.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tax Section */}
              <div className="p-5 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="taxable" className="text-base font-medium">Is Taxable</Label>
                  <Switch
                    id="taxable"
                    checked={isTaxable}
                    onCheckedChange={setIsTaxable}
                    className="bg-muted data-[state=checked]:bg-primary"
                  />
                </div>
                {isTaxable && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="tax_rate" className="text-sm font-medium">Tax Rate (%)</Label>
                    <Input
                      id="tax_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 16"
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                )}
              </div>

              {/* Recurring Section */}
              <div className="p-5 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between mb-4">
                  <Label htmlFor="recurring" className="text-base font-medium flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Is Recurring
                  </Label>
                  <Switch
                    id="recurring"
                    checked={isRecurring}
                    onCheckedChange={setIsRecurring}
                    className="bg-muted data-[state=checked]:bg-primary"
                  />
                </div>
                {isRecurring && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label htmlFor="frequency" className="text-sm font-medium">Recurrence Frequency</Label>
                    <Select value={recurrenceFrequency} onValueChange={setRecurrenceFrequency}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MONTHLY">Monthly</SelectItem>
                        <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                        <SelectItem value="ANNUALLY">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional details or comments..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 min-h-32"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <Link href="/finance/expenses">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || dataLoading || !name.trim() || !amount || !expenseDate || !categoryId || !departmentId}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Receipt className="w-4 h-4 mr-2" />
                      Record Expense
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent className="max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2 text-xl">
                  <Receipt className="w-6 h-6 text-primary" />
                  Record Expense?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3 pt-4">
                  <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                    <p className="font-semibold text-foreground text-base">{name}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Amount:</span>
                        <p className="font-medium text-foreground">KSh {amount ? parseFloat(amount).toLocaleString() : "0"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Date:</span>
                        <p className="font-medium text-foreground">{expenseDate || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <p className="font-medium text-foreground">{categories.find(c => c.id === categoryId)?.name || "—"}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Department:</span>
                        <p className="font-medium text-foreground">{departments.find(d => d.id === departmentId)?.name || "—"}</p>
                      </div>
                    </div>
                    {vendorId && (
                      <div className="pt-2 border-t border-muted">
                        <span className="text-muted-foreground text-sm">Vendor:</span>
                        <p className="font-medium text-foreground">{vendors.find(v => v.id === vendorId)?.name || "—"}</p>
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreate} disabled={loading}>
                  {loading ? "Creating..." : "Yes, Record"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}