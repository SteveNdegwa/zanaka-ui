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
import { Loader2 } from "lucide-react"
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
import { ArrowLeft, BookOpen, Building } from "lucide-react"
import Link from "next/link"
import { schoolRequests, BranchProfile } from "@/lib/requests/schools"

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
] as const

type GradeLevel = typeof GRADE_LEVELS[number]

export default function CreateClassroomPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  const [branches, setBranches] = useState<BranchProfile[]>([])

  const [branchId, setBranchId] = useState("")
  const [name, setName] = useState("")
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | "">("")
  const [capacity, setCapacity] = useState("")

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      setBranchesLoading(true)
      try {
        const response = await schoolRequests.listBranches()
        if (response.success && response.data) {
          setBranches(response.data.filter(b => b.is_active)) // Only active branches
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

  const selectedBranchName = branches.find(b => b.id === branchId)?.name || ""

  const handleCreate = async () => {
    if (!branchId || !name.trim() || !gradeLevel) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    try {
      const payload = {
        branch_id: branchId,
        name: name.trim(),
        grade_level: gradeLevel,
        capacity: capacity ? parseInt(capacity) : undefined,
      }

      const response = await schoolRequests.createClassroom(payload)

      if (response.success) {
        toast.success("Classroom created successfully!")
        router.push("/classrooms")
      } else {
        toast.error("Failed to create classroom", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong while creating the classroom")
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
            <Link href="/classrooms">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classrooms
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Add New Classroom</h1>
            <p className="text-muted-foreground mt-2">
              Create a new classroom in one of your branches
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                Classroom Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="branch">Branch *</Label>
                {branchesLoading ? (
                  <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading branches...
                  </div>
                ) : (
                  <Select value={branchId} onValueChange={setBranchId}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4" />
                            {branch.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div>
                <Label htmlFor="name">Classroom Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Class 1A, Purple Room, Grade 5 Blue"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="grade">Grade Level *</Label>
                <Select value={gradeLevel} onValueChange={(v) => setGradeLevel(v as GradeLevel)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select grade level" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level.replace("_", " ").toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="capacity">Student Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  placeholder="e.g. 35"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex justify-end gap-4 pt-8">
                <Link href="/classrooms">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || branchesLoading || !branchId || !name.trim() || !gradeLevel}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Create Classroom
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
                <AlertDialogTitle>Create New Classroom?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>Please confirm the classroom details:</p>
                  <div className="bg-muted/50 rounded-lg p-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Branch:</span>
                      <span>{selectedBranchName || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Classroom Name:</span>
                      <span>{name.trim()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Grade Level:</span>
                      <span>{gradeLevel ? gradeLevel.replace("_", " ").toUpperCase() : "—"}</span>
                    </div>
                    {capacity && (
                      <div className="flex justify-between">
                        <span className="font-medium">Capacity:</span>
                        <span>{parseInt(capacity).toLocaleString()} students</span>
                      </div>
                    )}
                  </div>
                  <p className="pt-2">
                    This will create a new classroom under the selected branch.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreate} disabled={loading}>
                  {loading ? "Creating..." : "Yes, Create Classroom"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}