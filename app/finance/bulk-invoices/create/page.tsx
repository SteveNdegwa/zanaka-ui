"use client"
import { useEffect, useState } from "react"
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
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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
} from "@/components/ui/alert-dialog"
import { useToast } from "@/src/use-toast"
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  Users,
  FileText,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"
import Link from "next/link"
import { financeRequests } from "@/lib/requests/finances"
import { usersRequests, UserProfile } from "@/lib/requests/users"
import { schoolRequests } from "@/lib/requests/schools"

interface BranchProfile {
  id: string
  name: string
}

interface ClassroomProfile {
  id: string
  name: string
  grade_level: string
  branch_id: string
}

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
  "baby_class",
  "pp_1",
  "pp_2",
  "grade_1",
  "grade_2",
  "grade_3",
  "grade_4",
  "grade_5",
  "grade_6",
  "grade_7",
  "grade_8",
  "grade_9",
]

const TERMS = ["TERM_1", "TERM_2", "TERM_3"]

// Dynamic year selector: current year ± 5 years
const currentYear = new Date().getFullYear()
const ACADEMIC_YEARS = Array.from({ length: 11 }, (_, i) => (currentYear - 5 + i).toString())

export default function BulkCreateInvoicePage() {
  const router = useRouter()
  const { toast } = useToast()

  // Step control
  const [step, setStep] = useState<1 | 2>(1)

  // Filters (Step 1)
  const [branchFilter, setBranchFilter] = useState<string>("all")
  const [gradeFilter, setGradeFilter] = useState<string>("all")
  const [classFilter, setClassFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("ACTIVE")
  const [mealsFilter, setMealsFilter] = useState<"all" | "yes" | "no">("all")
  const [transportFilter, setTransportFilter] = useState<"all" | "yes" | "no">("all")

  // Data
  const [students, setStudents] = useState<UserProfile[]>([])
  const [filteredStudents, setFilteredStudents] = useState<UserProfile[]>([])
  const [branches, setBranches] = useState<BranchProfile[]>([])
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([])
  const [feeItems, setFeeItems] = useState<FeeItem[]>([])

  // Selection
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())

  // Invoice form (Step 2)
  const [dueDate, setDueDate] = useState<string>("")
  const [priority, setPriority] = useState<number>(1)
  const [description, setDescription] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [items, setItems] = useState<InvoiceItemDraft[]>([])

  const [currentItem, setCurrentItem] = useState<InvoiceItemDraft>({
    key: "",
    type: "manual",
    unit_price: "",
    quantity: 1,
    amount: "0.00",
  })

  const [lastOverrideStatus, setLastOverrideStatus] = useState<"none" | "found" | "not_found">("none")
  const [tableLoading, setTableLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)
  const [creating, setCreating] = useState(false)

  // Fetch Students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await usersRequests.filterUsers({ role_name: "STUDENT" })
        if (response.success && response.data) {
          setStudents(response.data)
          setFilteredStudents(response.data)
        } else {
          toast.error("Failed to load students", {
            description: response.error || "Please try again later.",
          })
        }
      } catch (error) {
        toast.error("Failed to load students", {
          description: "Something went wrong. Please try again.",
        })
      } finally {
        setTableLoading(false)
      }
    }
    fetchStudents()
  }, [toast])

  // Fetch Branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await schoolRequests.listBranches()
        if (response.success && response.data) {
          setBranches(response.data)
        }
      } catch (error) {
        toast.error("Failed to load branches")
      }
    }
    fetchBranches()
  }, [toast])

  // Fetch Classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await schoolRequests.listClassrooms()
        if (response.success && response.data) {
          setClassrooms(response.data)
        }
      } catch (error) {
        toast.error("Failed to load classrooms")
      }
    }
    fetchClassrooms()
  }, [toast])

  // Fetch Fee Items
  useEffect(() => {
    const fetchFeeItems = async () => {
      try {
        const response = await financeRequests.listFeeItems()
        if (response.success && response.data) {
          setFeeItems(response.data.filter((f: FeeItem) => f.is_active))
        }
      } catch (error) {
        toast.error("Failed to load fee items")
      }
    }
    fetchFeeItems()
  }, [toast])

  // Client-side filtering for classrooms
  const filteredClassrooms = classrooms.filter((classroom) => {
    return (
      (branchFilter === "all" || classroom.branch_id === branchFilter) &&
      (gradeFilter === "all" || classroom.grade_level === gradeFilter)
    )
  })

  // Filter students based on all filters
  useEffect(() => {
    const filtered = students.filter((student) => {
      const matchesBranch = branchFilter === "all" || student.branches.some(b => b.id === branchFilter)
      const matchesGrade = gradeFilter === "all" || student.grade_level === gradeFilter
      const matchesClass = classFilter === "all" || student.classroom_id === classFilter
      const matchesStatus = statusFilter === "all" || student.status.toUpperCase() === statusFilter.toUpperCase()
      const matchesMeals =
        mealsFilter === "all" ||
        (mealsFilter === "yes" ? student.subscribed_to_meals : !student.subscribed_to_meals)
      const matchesTransport =
        transportFilter === "all" ||
        (transportFilter === "yes" ? student.subscribed_to_transport : !student.subscribed_to_transport)

      return matchesBranch && matchesGrade && matchesClass && matchesStatus && matchesMeals && matchesTransport
    })
    setFilteredStudents(filtered)
  }, [branchFilter, gradeFilter, classFilter, statusFilter, mealsFilter, transportFilter, students])

  // Fee item override logic
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

    if (hasAllOverrideFields) {
      if (overrideFound && lastOverrideStatus !== "found") {
        toast.success("Grade-level override applied!", {
          description: `Using KSh ${price.toLocaleString()}`,
          icon: <CheckCircle2 className="w-5 h-5" />,
        })
        setLastOverrideStatus("found")
      } else if (!overrideFound && lastOverrideStatus !== "not_found") {
        toast.warning("No override found", {
          description: `Using default KSh ${parseFloat(fee.default_amount).toLocaleString()}`,
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

  // Manual amount calculation
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
      toast.error("Please complete all required fields")
      return
    }

    setItems(prev => [...prev, {
      ...currentItem,
      key: Date.now().toString(),
      unit_price: currentItem.unit_price.replace(/[,\s]/g, ""),
    }])

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

  const totalPerStudent = items.reduce((sum, i) => sum + parseFloat(i.amount || "0"), 0)
  const totalAmount = totalPerStudent * selectedStudents.size

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    setSelectedStudents(new Set(filteredStudents.map(s => s.id)))
  }

  const clearSelection = () => {
    setSelectedStudents(new Set())
  }

  const handleBulkCreate = async () => {
    if (selectedStudents.size === 0 || items.length === 0 || !dueDate) {
      toast.error("Please select students and add at least one item")
      return
    }

    setCreating(true)
    try {
      const payload = {
        student_ids: Array.from(selectedStudents),
        due_date: dueDate,
        priority,
        description: description || undefined,
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

      const response = await financeRequests.bulkCreateInvoices(payload)

      if (response.success) {
        toast.success(`Successfully created ${response.data!.created_count} invoices!`, {
          description: `Bulk reference: ${response.data!.bulk_reference}`,
        })
        router.push(`/finance/bulk-invoices/${response.data!.bulk_invoice_id}`)
      } else {
        toast.error("Failed to create bulk invoices", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong")
    } finally {
      setCreating(false)
      setShowConfirm(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const STATUS_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      ACTIVE: { label: "Active", variant: "default" },
      SUSPENDED: { label: "Suspended", variant: "destructive" },
      GRADUATED: { label: "Graduated", variant: "outline" },
      TRANSFERRED: { label: "Transferred", variant: "secondary" },
    }
    const config = STATUS_CONFIG[status] || { label: status, variant: "secondary" }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="mb-8">
            <Link href="/finance/invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Invoices
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-4">Create Bulk Invoice</h1>
            <p className="text-muted-foreground mt-2">
              {step === 1
                ? "Step 1: Select students to invoice"
                : "Step 2: Define invoice items and confirm"}
            </p>
          </div>

          {step === 1 ? (
            <div className="space-y-6">
              {/* Filters */}
              <Card>
                <CardHeader>
                  <CardTitle>Filter Students</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label>Branch</Label>
                    <Select value={branchFilter} onValueChange={(v) => {
                      setBranchFilter(v)
                      setClassFilter("all")
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Branches" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Branches</SelectItem>
                        {branches.map(b => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Grade</Label>
                    <Select value={gradeFilter} onValueChange={(v) => {
                      setGradeFilter(v)
                      setClassFilter("all")
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Grades" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem>
                        {GRADE_LEVELS.map(g => (
                          <SelectItem key={g} value={g}>
                            {g.replace("_", " ").toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Class</Label>
                    <Select
                      value={classFilter}
                      onValueChange={setClassFilter}
                      disabled={branchFilter === "all" || gradeFilter === "all" || filteredClassrooms.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          branchFilter === "all" || gradeFilter === "all"
                            ? "Select branch & grade first"
                            : filteredClassrooms.length === 0
                              ? "No classrooms available"
                              : "All Classes"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Classes</SelectItem>
                        {filteredClassrooms.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="SUSPENDED">Suspended</SelectItem>
                        <SelectItem value="GRADUATED">Graduated</SelectItem>
                        <SelectItem value="TRANSFERRED">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Meals</Label>
                    <Select value={mealsFilter} onValueChange={(value) => setMealsFilter(value as "all" | "yes" | "no")}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Subscribed</SelectItem>
                        <SelectItem value="no">Not Subscribed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Transport</Label>
                    <Select value={transportFilter} onValueChange={(value) => setTransportFilter(value as "all" | "yes" | "no")}>
                      <SelectTrigger>
                        <SelectValue placeholder="All" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Subscribed</SelectItem>
                        <SelectItem value="no">Not Subscribed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Student Table */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    Select Students ({filteredStudents.length})
                    {selectedStudents.size > 0 && (
                      <Badge variant="secondary" className="ml-3">
                        {selectedStudents.size} selected
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAll} disabled={filteredStudents.length === 0}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearSelection} disabled={selectedStudents.size === 0}>
                      Clear
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Reg No</TableHead>
                        <TableHead>Grade</TableHead>
                        <TableHead>Class</TableHead>
                        <TableHead>Branch</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Meals</TableHead>
                        <TableHead>Transport</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tableLoading ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12">
                            <div className="flex justify-center">
                              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : filteredStudents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                            No students match your filters
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStudents.map(student => (
                          <TableRow key={student.id}>
                            <TableCell>
                              <Checkbox
                                checked={selectedStudents.has(student.id)}
                                onCheckedChange={() => toggleStudent(student.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{student.full_name}</TableCell>
                            <TableCell>{student.reg_number}</TableCell>
                            <TableCell>{student.grade_level?.replace("_", " ").toUpperCase()}</TableCell>
                            <TableCell>{student.classroom_name}</TableCell>
                            <TableCell>{student.branches[0]?.name || "—"}</TableCell>
                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                            <TableCell>
                              <Badge variant={student.subscribed_to_meals ? "default" : "secondary"}>
                                {student.subscribed_to_meals ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={student.subscribed_to_transport ? "default" : "secondary"}>
                                {student.subscribed_to_transport ? "Yes" : "No"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  size="lg"
                  onClick={() => setStep(2)}
                  disabled={selectedStudents.size === 0}
                >
                  Continue to Invoice Details
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Student Selection
                </Button>
                <div className="text-sm text-muted-foreground">
                  {selectedStudents.size} student{selectedStudents.size !== 1 ? "s" : ""} selected
                </div>
              </div>

              {/* Bulk Invoice Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Bulk Invoice Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="description">Description (Title)</Label>
                    <Input
                      id="description"
                      placeholder="e.g. Term 1 2025 Tuition Fees"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      A clear title for this bulk invoice — will appear in lists and reports
                    </p>
                  </div>

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

                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Common notes for all invoices..."
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Add Invoice Item */}
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
                              {TERMS.map(t => (
                                <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>
                              ))}
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
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                              {ACADEMIC_YEARS.map(year => (
                                <SelectItem key={year} value={year}>
                                  {year}
                                </SelectItem>
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
                            Total Per Student
                          </TableCell>
                          <TableCell className="text-right text-xl">
                            KSh {totalPerStudent.toLocaleString()}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Final Summary & Create */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Final Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Students Selected</span>
                      <span className="font-bold">{selectedStudents.size}</span>
                    </div>
                    {description && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Description</span>
                        <span className="font-medium max-w-md text-right">{description}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">{items.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per Student</span>
                      <span className="font-bold">KSh {totalPerStudent.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-2xl">
                      <span className="font-medium">Total Amount</span>
                      <span className="font-bold text-primary">KSh {totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full"
                    disabled={selectedStudents.size === 0 || items.length === 0 || !dueDate || creating}
                    onClick={() => setShowConfirm(true)}
                  >
                    <FileText className="w-5 h-5 mr-2" />
                    Create {selectedStudents.size} Invoices
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Bulk Invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                  You are about to create <strong>{selectedStudents.size}</strong> invoices
                  with a total amount of <strong>KSh {totalAmount.toLocaleString()}</strong>.
                  {description && (
                    <>
                      <br /><br />
                      <em>"{description}"</em>
                    </>
                  )}
                  <br /><br />
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleBulkCreate} disabled={creating}>
                  {creating ? "Creating..." : "Yes, Create Invoices"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}