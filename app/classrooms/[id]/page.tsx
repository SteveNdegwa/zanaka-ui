"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowLeft, BookOpen, Building, Users, User, Trash2, Eye } from "lucide-react"
import Link from "next/link"
import { schoolRequests, ClassroomProfile } from "@/lib/requests/schools"
import { usersRequests, UserProfile } from "@/lib/requests/users"
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
import { Badge } from "@/components/ui/badge"

export default function ViewClassroomPage() {
  const router = useRouter()
  const params = useParams()
  const classroomId = params.id as string
  const { toast } = useToast()

  const [classroom, setClassroom] = useState<ClassroomProfile | null>(null)
  const [students, setStudents] = useState<UserProfile[]>([])
  const [loadingClassroom, setLoadingClassroom] = useState(true)
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchClassroom = async () => {
      if (!classroomId) return
      setLoadingClassroom(true)
      try {
        const response = await schoolRequests.viewClassroom(classroomId)
        if (response.success && response.data) {
          setClassroom(response.data)
        } else {
          toast.error("Failed to load classroom")
          router.push("/classrooms")
        }
      } catch (err) {
        toast.error("Failed to load classroom")
        router.push("/classrooms")
      } finally {
        setLoadingClassroom(false)
      }
    }
    fetchClassroom()
  }, [classroomId, router, toast])

  useEffect(() => {
    const fetchStudents = async () => {
      if (!classroomId) return
      setLoadingStudents(true)
      try {
        const response = await usersRequests.filterUsers({
          classroom_id: classroomId,
          role_name: "STUDENT",
        })
        if (response.success && response.data) {
          setStudents(response.data)
        }
      } catch (err) {
        toast.error("Failed to load students in this classroom")
      } finally {
        setLoadingStudents(false)
      }
    }
    if (classroomId) {
      fetchStudents()
    }
  }, [classroomId, toast])

  const gradeLevelDisplay = (grade: string) => {
    return grade.replace("_", " ").toUpperCase()
  }

  const hasStudents = students.length > 0

  const handleDelete = async () => {
    if (!classroom) return

    setDeleting(true)
    try {
      const response = await schoolRequests.deleteClassroom(classroomId)

      if (response.success) {
        toast.success("Classroom deleted successfully!")
        router.push("/classrooms")
      } else {
        toast.error("Failed to delete classroom", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong while deleting the classroom")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loadingClassroom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading classroom details...</span>
      </div>
    )
  }

  if (!classroom) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center space-y-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <BookOpen className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Classroom Not Found</h2>
              <p className="text-muted-foreground">
                The classroom you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Link href="/classrooms">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Classrooms
              </Button>
            </Link>
          </CardContent>
        </Card>
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
            <Link href="/classrooms">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Classrooms
              </Button>
            </Link>
          </div>

          {/* Classroom Header */}
          <Card className="mb-10 border-2 shadow-lg">
            <CardContent className="pt-10 pb-12">
              <div className="flex flex-col lg:flex-row lg:items-start md:justify-between gap-10">
                {/* Left: Details */}
                <div className="flex items-start gap-8">
                  <div className="p-6 bg-primary/10 rounded-md">
                    <BookOpen className="w-16 h-16 text-primary" />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-bold text-foreground">{classroom.name}</h1>
                      <p className="text-md text-muted-foreground mt-3 flex items-center gap-2">
                        <Building className="w-6 h-6" />
                        {classroom.branch_name}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                      <div className="flex items-start gap-4">
                        <BookOpen className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Grade Level</p>
                          <p className="text-md font-semibold">{gradeLevelDisplay(classroom.grade_level)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Users className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                          <p className="text-md font-semibold">{classroom.capacity.toLocaleString()} students</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <Users className="w-6 h-6 text-primary mt-1" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Current Students</p>
                          <p className="text-md font-semibold">{students.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-4 md:self-start">
                  <Link href={`/classrooms/${classroom.id}/edit`}>
                    <Button size="lg" variant="outline" className="w-full shadow-md">
                      <User className="w-5 h-5 mr-2" />
                      Edit Classroom
                    </Button>
                  </Link>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Button
                            size="lg"
                            variant="destructive"
                            className="w-full shadow-md"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={deleting || hasStudents}
                          >
                            <Trash2 className="w-5 h-5 mr-2" />
                            Delete Classroom
                          </Button>
                        </div>
                      </TooltipTrigger>
                      {hasStudents && (
                        <TooltipContent>
                          <p>Cannot delete: {students.length} student{students.length > 1 ? "s" : ""} assigned</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Table */}
          <Card className="border-2">
            <CardHeader className="pb-8">
              <CardTitle className="text-md flex items-center gap-4">
                <Users className="w-8 h-8 text-primary" />
                Students in {classroom.name}
                <span className="text-md font-normal text-muted-foreground ml-4">
                  ({students.length} {students.length === 1 ? "student" : "students"})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingStudents ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : students.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-md text-muted-foreground">
                    No students are currently assigned to this classroom.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-md">Student Name</TableHead>
                        <TableHead className="text-md">Reg Number</TableHead>
                        <TableHead className="text-md">Status</TableHead>
                        <TableHead className="text-right text-md">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id} className="h-16">
                          <TableCell className="text-md font-medium">
                            <div className="flex items-center gap-3">
                              <User className="w-5 h-5 text-muted-foreground" />
                              {student.full_name}
                            </div>
                          </TableCell>
                          <TableCell className="text-md">{student.reg_number}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === "ACTIVE" ? "default" : "secondary"}>
                              {student.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/students/${student.id}`)}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Profile
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

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete Classroom?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>
                    You are about to <strong>permanently delete</strong> the classroom{" "}
                    <strong>{classroom.name}</strong>.
                  </p>
                  <p>
                    This will remove the classroom completely from the system.
                    Students will no longer be assigned to it, but their records will remain.
                  </p>
                  <p className="font-bold text-destructive">
                    This action is irreversible and cannot be undone.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {deleting ? "Deleting..." : "Yes, Delete Permanently"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}