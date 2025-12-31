"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, DollarSign, Building, Edit, Trash2, Plus, Search, Eye } from "lucide-react"
import Link from "next/link"
import { financeRequests, FeeItem, FeeItemCategory, GradeLevel, Term, Invoice, InvoiceStatus } from "@/lib/requests/finances"
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
import { Checkbox } from "@/components/ui/checkbox"

export default function ViewFeeItemPage() {
  const router = useRouter()
  const params = useParams()
  const feeItemId = params.id as string
  const { toast } = useToast()

  const [feeItem, setFeeItem] = useState<FeeItem | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [invoicesLoading, setInvoicesLoading] = useState(true)
  const [deletingFeeItem, setDeletingFeeItem] = useState(false)
  const [showDeleteFeeItemConfirm, setShowDeleteFeeItemConfirm] = useState(false)

  // Grade override form states
  const [showAddOverride, setShowAddOverride] = useState(false)
  const [editingOverrideId, setEditingOverrideId] = useState<string | null>(null)
  const [overrideGrade, setOverrideGrade] = useState<GradeLevel | "">("")
  const [overrideTerm, setOverrideTerm] = useState<Term | "">("")
  const [overrideYear, setOverrideYear] = useState("")
  const [overrideAmount, setOverrideAmount] = useState("")
  const [overrideMandatory, setOverrideMandatory] = useState(true)
  const [savingOverride, setSavingOverride] = useState(false)
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false)
  const [overrideAction, setOverrideAction] = useState<"create" | "update">("create")
  const [deleteOverrideId, setDeleteOverrideId] = useState<string | null>(null)
  const [showDeleteOverrideConfirm, setShowDeleteOverrideConfirm] = useState(false)
  const [deletingOverride, setDeletingOverride] = useState(false)

  // Filters for overrides
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [termFilter, setTermFilter] = useState<string>("all")
  const [yearFilter, setYearFilter] = useState("")

  // Filters for invoices
  const [invoiceSearch, setInvoiceSearch] = useState("")
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>("all")

  useEffect(() => {
    const fetchFeeItem = async () => {
      if (!feeItemId) return
      setLoading(true)
      try {
        const response = await financeRequests.viewFeeItem(feeItemId)
        if (response.success && response.data) {
          setFeeItem(response.data)
        } else {
          toast.error("Failed to load fee item")
          router.push("/finance/fee-items")
        }
      } catch (error) {
        toast.error("Failed to load fee item")
        router.push("/finance/fee-items")
      } finally {
        setLoading(false)
      }
    }
    fetchFeeItem()
  }, [feeItemId, router, toast])

  // Fetch invoices that use this fee item
  useEffect(() => {
    const fetchInvoices = async () => {
      if (!feeItemId) return
      setInvoicesLoading(true)
      try {
        // Replace with actual endpoint if available
        const response = await financeRequests.listInvoices({ fee_item_id: feeItemId})
        if (response.success && response.data) {
          setInvoices(response.data)
        }
      } catch (error) {
        toast.error("Failed to load related invoices")
      } finally {
        setInvoicesLoading(false)
      }
    }
    if (feeItemId) fetchInvoices()
  }, [feeItemId, toast])

  const getCategoryBadge = (category: FeeItemCategory) => {
    const colors: Record<FeeItemCategory, string> = {
      [FeeItemCategory.TUITION]: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      [FeeItemCategory.BOARDING]: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      [FeeItemCategory.TRANSPORT]: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      [FeeItemCategory.MEALS]: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      [FeeItemCategory.UNIFORM]: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      [FeeItemCategory.ACTIVITY]: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      [FeeItemCategory.MEDICAL]: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      [FeeItemCategory.EXAM]: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      [FeeItemCategory.OTHER]: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    }
    return (
      <Badge className={colors[category] || "bg-gray-100 text-gray-800"}>
        {category.replace("_", " ")}
      </Badge>
    )
  }

  const formatAmount = (amount: string | number) => `KSh ${parseFloat(String(amount)).toLocaleString()}`
  const formatDate = (date: string) => new Date(date).toLocaleDateString()

  const getBranchDisplay = (item: FeeItem) => {
    if (item.applies_to_all_branches) return "All Branches"
    return item.branches.length === 0 ? "None" : item.branches.map(b => b.name).join(", ")
  }

  const getInvoiceStatusBadge = (status: InvoiceStatus) => {
    const config: Record<InvoiceStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      DRAFT: { label: "Draft", variant: "default" },
      PAID: { label: "Paid", variant: "default" },
      PARTIALLY_PAID: { label: "Partially Paid", variant: "secondary" },
      PENDING: { label: "Pending", variant: "outline" },
      OVERDUE: { label: "Overdue", variant: "destructive" },
      CANCELLED: { label: "Cancelled", variant: "secondary" },
    }
    const cfg = config[status] || { label: status, variant: "outline" }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const handleDeleteFeeItem = async () => {
    setDeletingFeeItem(true)
    try {
      await financeRequests.deactivateFeeItem(feeItemId)
      toast.success("Fee item deactivated successfully!")
      router.push("/finance/fee-items")
    } catch (err) {
      toast.error("Failed to delete fee item")
    } finally {
      setDeletingFeeItem(false)
      setShowDeleteFeeItemConfirm(false)
    }
  }

  const startAddOverride = () => {
    setOverrideAction("create")
    setOverrideGrade("")
    setOverrideTerm("")
    setOverrideYear("")
    setOverrideAmount("")
    setOverrideMandatory(true)
    setShowAddOverride(true)
  }

  const startEditOverride = (override: any) => {
    setOverrideAction("update")
    setEditingOverrideId(override.id)
    setOverrideGrade(override.grade_level)
    setOverrideTerm(override.term)
    setOverrideYear(override.academic_year)
    setOverrideAmount(override.amount)
    setOverrideMandatory(override.is_mandatory)
    setShowAddOverride(true)
  }

  const handleSaveOverride = async () => {
    if (!overrideGrade || !overrideTerm || !overrideYear || !overrideAmount) {
      toast.error("All fields are required")
      return
    }
    const amount = parseFloat(overrideAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount")
      return
    }
    setSavingOverride(true)
    try {
      if (overrideAction === "create") {
        await financeRequests.createGradeLevelFee(feeItemId, {
          grade_level: overrideGrade,
          term: overrideTerm,
          academic_year: overrideYear,
          amount,
          is_mandatory: overrideMandatory,
        })
        toast.success("Grade-level override created!")
      } else {
        await financeRequests.updateGradeLevelFee(editingOverrideId!, {
          grade_level: overrideGrade,
          term: overrideTerm,
          academic_year: overrideYear,
          amount,
          is_mandatory: overrideMandatory,
        })
        toast.success("Grade-level override updated!")
      }
      // Refresh fee item
      const response = await financeRequests.viewFeeItem(feeItemId)
      if (response.success && response.data) {
        setFeeItem(response.data)
      }
      setShowAddOverride(false)
      setShowOverrideConfirm(false)
    } catch (err) {
      toast.error(`Failed to ${overrideAction === "create" ? "create" : "update"} override`)
    } finally {
      setSavingOverride(false)
    }
  }

  const handleDeleteOverride = async () => {
    if (!deleteOverrideId) return
    setDeletingOverride(true)
    try {
      await financeRequests.deleteGradeLevelFee(deleteOverrideId)
      toast.success("Grade-level override deleted!")
      const response = await financeRequests.viewFeeItem(feeItemId)
      if (response.success && response.data) {
        setFeeItem(response.data)
      }
    } catch (err) {
      toast.error("Failed to delete override")
    } finally {
      setDeletingOverride(false)
      setShowDeleteOverrideConfirm(false)
      setDeleteOverrideId(null)
    }
  }

  // Filter grade-level overrides
  const filteredOverrides = feeItem?.grade_level_fees.filter((override) => {
    if (gradeFilter !== "all" && override.grade_level !== gradeFilter) return false
    if (termFilter !== "all" && override.term !== termFilter) return false
    if (yearFilter && !override.academic_year.includes(yearFilter)) return false
    return true
  }) || []

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_reference.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      invoice.student_full_name.toLowerCase().includes(invoiceSearch.toLowerCase())

    const matchesStatus =
      invoiceStatusFilter === "all" || invoice.status === invoiceStatusFilter

    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading fee item...</span>
      </div>
    )
  }

  if (!feeItem) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Fee item not found</div>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/finance/fee-items">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fee Items
              </Button>
            </Link>
          </div>

          {/* Fee Item Header */}
          <Card className="mb-10 border-2 shadow-md">
            <CardContent className="pt-10 pb-12">
              <div className="flex flex-col lg:flex-row md:items-start md:justify-between gap-10">
                <div className="flex items-start gap-8">
                  <div className="p-6 bg-primary/10 rounded-md">
                    <DollarSign className="w-16 h-16 text-primary" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{feeItem.name}</h1>
                      {feeItem.description && (
                        <p className="text-md text-muted-foreground mt-3">{feeItem.description}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="flex items-start gap-4">
                        <DollarSign className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Default Amount</p>
                          <p className="text-md font-semibold">{formatAmount(feeItem.default_amount)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-6 h-6" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Category</p>
                          <div className="mt-1">{getCategoryBadge(feeItem.category as FeeItemCategory)}</div>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Building className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Branches</p>
                          <p className="text-md font-semibold">{getBranchDisplay(feeItem)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-4 md:self-start">
                  <Link href={`/finance/fee-items/${feeItem.id}/edit`}>
                    <Button size="lg" variant="outline" className="w-full shadow-md">
                      <Edit className="w-5 h-5 mr-2" />
                      Edit Fee Item
                    </Button>
                  </Link>

                  <Button
                    size="lg"
                    variant="destructive"
                    className="w-full shadow-md"
                    onClick={() => setShowDeleteFeeItemConfirm(true)}
                    disabled={deletingFeeItem}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Fee Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grade-Level Overrides */}
          <Card className="border-2 mb-10">
            <CardHeader>
              <div className="flex flex-col gap-6">
                <div className="flex flex-row items-center justify-between">
                  <CardTitle className="text-md">
                    Grade-Level Overrides ({filteredOverrides.length})
                  </CardTitle>
                  <Button onClick={startAddOverride}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Override
                  </Button>
                </div>

                {/* Override Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Grades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Grades</SelectItem>
                      {Object.values(GradeLevel).map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.replace("_", " ").toUpperCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={termFilter} onValueChange={setTermFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Terms</SelectItem>
                      {Object.values(Term).map((term) => (
                        <SelectItem key={term} value={term}>
                          {term.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Filter by year..."
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredOverrides.length === 0 ? (
                <div className="text-center py-16">
                  <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-md text-muted-foreground">
                    {feeItem.grade_level_fees.length === 0
                      ? "No grade-level overrides defined. Default amount applies to all grades."
                      : "No overrides match your filters."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade Level</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Academic Year</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Mandatory</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOverrides.map((override) => (
                        <TableRow key={override.id}>
                          <TableCell className="font-medium">
                            {override.grade_level.replace("_", " ").toUpperCase()}
                          </TableCell>
                          <TableCell>{override.term.replace("_", " ")}</TableCell>
                          <TableCell>{override.academic_year}</TableCell>
                          <TableCell className="font-medium">{formatAmount(override.amount)}</TableCell>
                          <TableCell>
                            <Badge variant={override.is_mandatory ? "default" : "secondary"}>
                              {override.is_mandatory ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEditOverride(override)}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => {
                                setDeleteOverrideId(override.id)
                                setShowDeleteOverrideConfirm(true)
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoices Using This Fee Item */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-md">
                Invoices Using This Fee Item ({filteredInvoices.length})
              </CardTitle>
              <div className="mt-6 flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search by invoice number or student name..."
                      value={invoiceSearch}
                      onChange={(e) => setInvoiceSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={invoiceStatusFilter} onValueChange={setInvoiceStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PAID">Paid</SelectItem>
                    <SelectItem value="PARTIAL">Partially Paid</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="OVERDUE">Overdue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-16">
                  <DollarSign className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-md text-muted-foreground">
                    No invoices have been created using this fee item yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Date Issued</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-mono font-medium">
                            {invoice.invoice_reference}
                          </TableCell>
                          <TableCell className="font-medium">
                            {invoice.student_full_name}
                          </TableCell>
                          <TableCell>{formatDate(invoice.created_at)}</TableCell>
                          <TableCell>{formatDate(invoice.due_date!)}</TableCell>
                          <TableCell className="font-semibold">
                            {formatAmount(invoice.total_amount)}
                          </TableCell>
                          <TableCell>{getInvoiceStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/finance/invoices/${invoice.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Add/Edit Override Form Dialog */}
          <AlertDialog open={showAddOverride} onOpenChange={setShowAddOverride}>
            <AlertDialogContent className="max-w-xl">
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {overrideAction === "create" ? "Add" : "Edit"} Grade-Level Override
                </AlertDialogTitle>
              </AlertDialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="grade">Grade Level *</Label>
                    <Select value={overrideGrade} onValueChange={(v) => setOverrideGrade(v as GradeLevel)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(GradeLevel).map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="term">Term *</Label>
                    <Select value={overrideTerm} onValueChange={(v) => setOverrideTerm(v as Term)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select term" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Term).map((term) => (
                          <SelectItem key={term} value={term}>
                            {term.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="year">Academic Year *</Label>
                    <Input
                      id="year"
                      placeholder="e.g. 2025"
                      value={overrideYear}
                      onChange={(e) => setOverrideYear(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="amount">Amount (KSh) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 30000"
                      value={overrideAmount}
                      onChange={(e) => setOverrideAmount(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="mandatory"
                    checked={overrideMandatory}
                    onCheckedChange={(checked) => setOverrideMandatory(checked as boolean)}
                  />
                  <label htmlFor="mandatory" className="text-sm font-medium cursor-pointer">
                    Mandatory fee (cannot be waived)
                  </label>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => setShowOverrideConfirm(true)}
                  disabled={savingOverride || !overrideGrade || !overrideTerm || !overrideYear || !overrideAmount}
                >
                  {savingOverride ? "Saving..." : overrideAction === "create" ? "Create Override" : "Save Changes"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Override Save Confirmation */}
          <AlertDialog open={showOverrideConfirm} onOpenChange={setShowOverrideConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {overrideAction === "create" ? "Create" : "Update"} Grade-Level Override?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>Confirm the override details:</p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Grade:</span>
                      <span>{overrideGrade ? overrideGrade.replace("_", " ").toUpperCase() : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Term:</span>
                      <span>{overrideTerm ? overrideTerm.replace("_", " ") : "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Year:</span>
                      <span>{overrideYear || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Amount:</span>
                      <span>KSh {parseFloat(overrideAmount || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Mandatory:</span>
                      <span>{overrideMandatory ? "Yes" : "No"}</span>
                    </div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSaveOverride} disabled={savingOverride}>
                  {savingOverride ? "Saving..." : "Yes, Save"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Fee Item Confirmation */}
          <AlertDialog open={showDeleteFeeItemConfirm} onOpenChange={setShowDeleteFeeItemConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete Fee Item?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    You are about to <strong>permanently delete</strong> the fee item{" "}
                    <strong>{feeItem.name}</strong>.
                  </p>
                  <p>
                    This will deactivate it and all grade-level overrides.
                  </p>
                  <p className="font-bold text-destructive">
                    Existing invoices using this fee will remain unaffected.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteFeeItem}
                  disabled={deletingFeeItem}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deletingFeeItem ? "Deleting..." : "Yes, Delete Fee Item"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Delete Override Confirmation */}
          <AlertDialog open={showDeleteOverrideConfirm} onOpenChange={setShowDeleteOverrideConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Grade-Level Override?</AlertDialogTitle>
                <AlertDialogDescription>
                  This override will be permanently removed. Existing invoices are not affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteOverride}
                  disabled={deletingOverride}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deletingOverride ? "Deleting..." : "Yes, Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}