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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, BookOpen, Building, Trash2 } from "lucide-react"
import Link from "next/link"
import { schoolRequests, ClassroomProfile, BranchProfile } from "@/lib/requests/schools"
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

export default function EditClassroomPage() {
  const router = useRouter()
  const params = useParams()
  const classroomId = params.id as string
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)

  const [classroom, setClassroom] = useState<ClassroomProfile | null>(null)
  const [branch, setBranch] = useState<BranchProfile | null>(null)

  const [name, setName] = useState("")
  const [gradeLevel, setGradeLevel] = useState<GradeLevel | "">("")
  const [capacity, setCapacity] = useState("")

  // Fetch classroom and its branch
  useEffect(() => {
    const fetchClassroom = async () => {
      if (!classroomId) return
      setLoading(true)
      try {
        const response = await schoolRequests.viewClassroom(classroomId)
        if (response.success && response.data) {
          const c = response.data
          setClassroom(c)
          setName(c.name)
          setGradeLevel(c.grade_level as GradeLevel)
          setCapacity(c.capacity.toString())

          // Fetch branch name for display
          const branchResponse = await schoolRequests.viewBranch(c.branch_id)
          if (branchResponse.success && branchResponse.data) {
            setBranch(branchResponse.data)
          }
        } else {
          toast.error("Failed to load classroom")
          router.push("/classrooms")
        }
      } catch (err) {
        toast.error("Failed to load classroom")
        router.push("/classrooms")
      } finally {
        setLoading(false)
      }
    }
    fetchClassroom()
  }, [classroomId, router, toast])

  const handleSave = async () => {
    if (!name.trim() || !gradeLevel) {
      toast.error("Classroom name and grade level are required")
      return
    }

    setSaving(true)
    try {
      const payload = {
        name: name.trim(),
        grade_level: gradeLevel,
        capacity: capacity ? parseInt(capacity) : undefined,
      }

      const response = await schoolRequests.updateClassroom(classroomId, payload)

      if (response.success) {
        toast.success("Classroom updated successfully!")
        router.push(`/classrooms/${classroomId}`)
      } else {
        toast.error("Failed to update classroom", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong while updating the classroom")
    } finally {
      setSaving(false)
      setShowSaveConfirm(false)
    }
  }

  const gradeLevelDisplay = (grade: GradeLevel) => {
    return grade.replace("_", " ").toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading classroom details...</span>
      </div>
    )
  }

  if (!classroom) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-xl text-muted-foreground">Classroom not found</div>
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
            <Link href={`/classrooms/${classroomId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classroom
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Edit Classroom</h1>
            <p className="text-muted-foreground mt-2">
              Update details for {classroom.name}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                Classroom Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Branch (Read-only) */}
              <div>
                <Label>Branch</Label>
                <div className="mt-2 flex items-center gap-3 text-lg">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{branch?.name || classroom.branch_name}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Classrooms belong to a branch and cannot be moved.
                </p>
              </div>

              <div>
                <Label htmlFor="name">Classroom Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Class 1A, Purple Room"
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
                        {gradeLevelDisplay(level)}
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
                <div className="flex gap-4">
                  <Link href={`/classrooms/${classroomId}`}>
                    <Button variant="outline" disabled={saving}>
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    onClick={() => setShowSaveConfirm(true)}
                    disabled={saving || !name.trim() || !gradeLevel}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Confirmation Dialog */}
          <AlertDialog open={showSaveConfirm} onOpenChange={setShowSaveConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Save Changes?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>You are about to update the classroom details:</p>
                  <div className="bg-muted/50 rounded-lg p-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Classroom Name:</span>
                      <span>{name.trim()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Grade Level:</span>
                      <span>{gradeLevel ? gradeLevelDisplay(gradeLevel) : "—"}</span>
                    </div>
                    {capacity && (
                      <div className="flex justify-between">
                        <span className="font-medium">Capacity:</span>
                        <span>{parseInt(capacity).toLocaleString()} students</span>
                      </div>
                    )}
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Yes, Save Changes"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}