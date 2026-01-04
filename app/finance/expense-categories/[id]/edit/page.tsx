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
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft, Tag } from "lucide-react"
import Link from "next/link"
import { financeRequests, ExpenseCategory } from "@/lib/requests/finances"
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

export default function UpdateExpenseCategoryPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [category, setCategory] = useState<ExpenseCategory | null>(null)

  const [name, setName] = useState("")
  const [monthlyBudget, setMonthlyBudget] = useState("")
  const [annualBudget, setAnnualBudget] = useState("")
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [hasBudget, setHasBudget] = useState(false)

  useEffect(() => {
    const fetchCategory = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.viewExpenseCategory(categoryId)
        if (response.success && response.data) {
          const c = response.data
          setCategory(c)
          setName(c.name)
          setHasBudget(c.has_budget)
          setMonthlyBudget(c.monthly_budget || "")
          setAnnualBudget(c.annual_budget || "")
          setRequiresApproval(c.requires_approval)
        }
      } catch (error) {
        toast.error("Failed to load category")
        router.push("/finance/expense-categories")
      } finally {
        setLoading(false)
      }
    }
    fetchCategory()
  }, [categoryId, router, toast])

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }

    setSaving(true)
    try {
      const response = await financeRequests.updateExpenseCategory(categoryId, {
        name: name.trim(),
        has_budget: hasBudget,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        annual_budget: annualBudget ? parseFloat(annualBudget) : null,
        requires_approval: requiresApproval,
      })
      if (response.success){
        toast.success("Expense category updated successfully!")
        router.push(`/finance/expense-categories/${categoryId}`)
      }
      else{
        toast.error("Failed to update category", {description: response.error})
      }
    } catch (err) {
      toast.error("Failed to update category")
    } finally {
      setSaving(false)
      setShowConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading category...</span>
      </div>
    )
  }

  if (!category) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Category not found</div>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href={`/finance/expense-categories/${categoryId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Category
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Edit Expense Category</h1>
            <p className="text-muted-foreground mt-2">Update category details</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-primary" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="has_budget">Has Budget</Label>
                <Switch
                  id="has_budget"
                  checked={hasBudget}
                  onCheckedChange={setHasBudget}
                />
              </div>

              {hasBudget && (
                <>
                  <div>
                    <Label htmlFor="monthly">Monthly Budget (KSh)</Label>
                    <Input
                      id="monthly"
                      type="number"
                      min="0"
                      step="0.01"
                      value={monthlyBudget}
                      onChange={(e) => setMonthlyBudget(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="annual">Annual Budget (KSh)</Label>
                    <Input
                      id="annual"
                      type="number"
                      min="0"
                      step="0.01"
                      value={annualBudget}
                      onChange={(e) => setAnnualBudget(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="approval">Requires Approval</Label>
                <Switch
                  id="approval"
                  checked={requiresApproval}
                  onCheckedChange={setRequiresApproval}
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/finance/expense-categories/${categoryId}`}>
                  <Button variant="outline" disabled={saving}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={saving || !name.trim()}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save Changes?</AlertDialogTitle>
                <AlertDialogDescription>
                  <p className="font-medium">{name.trim()}</p>
                  {hasBudget && (
                    <div className="mt-2 space-y-1">
                      {monthlyBudget && <p>Monthly Budget: KSh {parseFloat(monthlyBudget).toLocaleString()}</p>}
                      {annualBudget && <p>Annual Budget: KSh {parseFloat(annualBudget).toLocaleString()}</p>}
                    </div>
                  )}
                  <p className="mt-2">Requires Approval: {requiresApproval ? "Yes" : "No"}</p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleUpdate} disabled={saving}>
                  {saving ? "Saving..." : "Yes, Save"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}