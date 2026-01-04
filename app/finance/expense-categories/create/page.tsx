"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
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

export default function CreateExpenseCategoryPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [name, setName] = useState("")
  const [monthlyBudget, setMonthlyBudget] = useState("")
  const [annualBudget, setAnnualBudget] = useState("")
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [hasBudget, setHasBudget] = useState(false)

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Category name is required")
      return
    }

    setLoading(true)
    try {
      const response = await financeRequests.createExpenseCategory({
        name: name.trim(),
        has_budget: hasBudget,
        monthly_budget: monthlyBudget ? parseFloat(monthlyBudget) : null,
        annual_budget: annualBudget ? parseFloat(annualBudget) : null,
        requires_approval: requiresApproval,
      })
      if (response.success){
        toast.success("Expense category created successfully!")
        router.push(`/finance/expense-categories/${response.data?.id}`)
      }
      else{
        toast.error("Failed to create category", {description: response.error})
      }
    } catch (err) {
      toast.error("Failed to create category")
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
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href="/finance/expense-categories">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Categories
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Add New Expense Category</h1>
            <p className="text-muted-foreground mt-2">Create a new expense classification</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Tag className="w-6 h-6 text-primary" />
                Category Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Stationery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
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
                      placeholder="0.00"
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
                      placeholder="0.00"
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
                <Link href="/finance/expense-categories">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Category"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Expense Category?</AlertDialogTitle>
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
                <AlertDialogAction onClick={handleCreate} disabled={loading}>
                  {loading ? "Creating..." : "Yes, Create"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}