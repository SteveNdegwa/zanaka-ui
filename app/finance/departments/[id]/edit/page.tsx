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
import { Loader2, ArrowLeft, Users } from "lucide-react"
import Link from "next/link"
import { financeRequests, Department } from "@/lib/requests/finances"
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

export default function EditDepartmentPage() {
  const router = useRouter()
  const params = useParams()
  const deptId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [department, setDepartment] = useState<Department | null>(null)

  const [name, setName] = useState("")
  const [budget, setBudget] = useState("")

  useEffect(() => {
    const fetchDepartment = async () => {
      setLoading(true)
      try {
        const response = await financeRequests.viewDepartment(deptId)
        if (response.success && response.data) {
          const d = response.data
          setDepartment(d)
          setName(d.name)
          setBudget(d.budget_allocated)
        }
      } catch (error) {
        toast.error("Failed to load department")
        router.push("/finance/departments")
      } finally {
        setLoading(false)
      }
    }
    fetchDepartment()
  }, [deptId, router, toast])

  const handleUpdate = async () => {
    if (!name.trim()) {
      toast.error("Department name is required")
      return
    }

    setSaving(true)
    try {
      await financeRequests.updateDepartment(deptId, {
        name: name.trim(),
        budget_allocated: budget ? parseFloat(budget) : undefined,
      })
      toast.success("Department updated successfully!")
      router.push(`/finance/departments/${deptId}`)
    } catch (err) {
      toast.error("Failed to update department")
    } finally {
      setSaving(false)
      setShowConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading department...</span>
      </div>
    )
  }

  if (!department) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Department not found</div>
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
            <Link href={`/finance/departments/${deptId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Department
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Edit Department</h1>
            <p className="text-muted-foreground mt-2">Update department details</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                {department.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="name">Department Name *</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="budget">Yearly Budget Allocation (KSh)</Label>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href={`/finance/departments/${deptId}`}>
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
                  {budget && <p className="mt-2">Budget: KSh {parseFloat(budget).toLocaleString()}</p>}
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