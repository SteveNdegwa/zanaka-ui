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
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, ArrowLeft, DollarSign, Building } from "lucide-react"
import Link from "next/link"
import { financeRequests, FeeItemCategory, CreateFeeItemRequest } from "@/lib/requests/finances"
import { schoolRequests, BranchProfile } from "@/lib/requests/schools"
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

export default function CreateFeeItemPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  const [branches, setBranches] = useState<BranchProfile[]>([])

  const [name, setName] = useState("")
  const [defaultAmount, setDefaultAmount] = useState("")
  const [category, setCategory] = useState<FeeItemCategory | "">("")
  const [description, setDescription] = useState("")
  const [appliesToAllBranches, setAppliesToAllBranches] = useState(true)
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([])

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      setBranchesLoading(true)
      try {
        const response = await schoolRequests.listBranches()
        if (response.success && response.data) {
          setBranches(response.data.filter(b => b.is_active))
        } else {
          toast.error("Failed to load branches")
        }
      } catch (error) {
        toast.error("Failed to load branches")
      } finally {
        setBranchesLoading(false)
      }
    }
    fetchBranches()
  }, [toast])

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    if (checked) {
      setSelectedBranchIds(prev => [...prev, branchId])
    } else {
      setSelectedBranchIds(prev => prev.filter(id => id !== branchId))
    }
  }

  const handleCreate = async () => {
    if (!name.trim() || !defaultAmount || !category) {
      toast.error("Name, amount, and category are required")
      return
    }

    const amount = parseFloat(defaultAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount")
      return
    }

    setLoading(true)
    try {
      const data: CreateFeeItemRequest = {
        name: name.trim(),
        default_amount: amount,
        category: category as FeeItemCategory,
        description: description.trim() || undefined,
        branch_ids: appliesToAllBranches ? undefined : selectedBranchIds.length > 0 ? selectedBranchIds : [],
      }

      const response = await financeRequests.createFeeItem(data)

      if (response.success && response.data) {
        toast.success("Fee item created successfully!")
        router.push(`/finance/fee-items/${response.data.id}`)
      } else {
        toast.error("Failed to create fee item", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong while creating the fee item")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  const selectedBranchesDisplay = appliesToAllBranches
    ? "All Branches"
    : selectedBranchIds.length === 0
      ? "None"
      : branches
          .filter(b => selectedBranchIds.includes(b.id))
          .map(b => b.name)
          .join(", ")

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href="/finances/fee-items">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Fee Items
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Create New Fee Item</h1>
            <p className="text-muted-foreground mt-2">
              Define a new fee that can be applied to students
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <DollarSign className="w-6 h-6 text-primary" />
                Fee Item Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Fee Item Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Tuition Fee, Transport Fee, Lunch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="amount">Default Amount (KSh) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 25000"
                    value={defaultAmount}
                    onChange={(e) => setDefaultAmount(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as FeeItemCategory)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(FeeItemCategory).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Provide additional details about this fee..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <Label>Branch Application</Label>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="all-branches"
                    checked={appliesToAllBranches}
                    onCheckedChange={(checked) => {
                      setAppliesToAllBranches(checked as boolean)
                      if (checked) setSelectedBranchIds([])
                    }}
                  />
                  <label htmlFor="all-branches" className="text-sm font-medium cursor-pointer">
                    Applies to all branches
                  </label>
                </div>

                {!appliesToAllBranches && (
                  <div className="ml-8 space-y-3 border-l-4 border-muted pl-6 py-4 bg-muted/30 rounded-r-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      Select specific branches this fee applies to:
                    </p>
                    {branchesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading branches...
                      </div>
                    ) : branches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active branches found</p>
                    ) : (
                      <div className="space-y-2">
                        {branches.map((branch) => (
                          <div key={branch.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={branch.id}
                              checked={selectedBranchIds.includes(branch.id)}
                              onCheckedChange={(checked) => handleBranchToggle(branch.id, checked as boolean)}
                            />
                            <label htmlFor={branch.id} className="text-sm cursor-pointer">
                              {branch.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-8">
                <Link href="/finances/fee-items">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || !name.trim() || !defaultAmount || !category}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-4 h-4 mr-2" />
                      Create Fee Item
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Dialog */}
          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create New Fee Item?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>Please confirm the fee item details:</p>
                  <div className="bg-muted/50 rounded-lg p-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{name.trim()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Default Amount:</span>
                      <span>KSh {parseFloat(defaultAmount || "0").toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Category:</span>
                      <span>{category ? category.replace("_", " ") : "—"}</span>
                    </div>
                    {description.trim() && (
                      <div className="flex justify-between">
                        <span className="font-medium">Description:</span>
                        <span>{description.trim()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="font-medium">Branches:</span>
                      <span>{selectedBranchesDisplay}</span>
                    </div>
                  </div>
                  <p className="pt-2">
                    This will create a new fee item that can be used in invoices.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreate} disabled={loading}>
                  {loading ? "Creating..." : "Yes, Create Fee Item"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}