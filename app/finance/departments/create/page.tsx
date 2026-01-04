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
import { Loader2, ArrowLeft, Users } from "lucide-react"
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

export default function CreateDepartmentPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Department name is required")
      return
    }

    setLoading(true)
    try {
      const response = await financeRequests.createDepartment({
        name: name.trim(),
        budget_allocated: budget ? parseFloat(budget) : undefined,
      })
      if (response.success){
        toast.success("Department created successfully!")
        router.push("/finance/departments")
      }
      else{
        toast.error("Failed to create department", {description: response.error})
      }
    } catch (err) {
      toast.error("Failed to create department")
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
            <Link href="/finance/departments">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Departments
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Add New Department</h1>
            <p className="text-muted-foreground mt-2">Create a new department</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                Department Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Department Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Administration"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="budget">Yearly Budget Allocation (KSh)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/finance/departments">
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
                    "Create Department"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Create Department?</AlertDialogTitle>
                <AlertDialogDescription>
                  <p className="font-medium">{name.trim()}</p>
                  {budget && <p className="mt-2">Budget: KSh {parseFloat(budget).toLocaleString()}</p>}
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