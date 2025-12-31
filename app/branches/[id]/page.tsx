"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ArrowLeft, Building, MapPin, Phone, Mail, User, Users, School, Calendar, BookOpen, Trash2 } from "lucide-react"
import Link from "next/link"
import { schoolRequests, BranchProfile, ClassroomProfile } from "@/lib/requests/schools"
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

export default function ViewBranchPage() {
  const router = useRouter()
  const params = useParams()
  const branchId = params.id as string
  const { toast } = useToast()

  const [branch, setBranch] = useState<BranchProfile | null>(null)
  const [classrooms, setClassrooms] = useState<ClassroomProfile[]>([])
  const [loadingBranch, setLoadingBranch] = useState(true)
  const [loadingClassrooms, setLoadingClassrooms] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchBranch = async () => {
      if (!branchId) return
      setLoadingBranch(true)
      try {
        const response = await schoolRequests.viewBranch(branchId)
        if (response.success && response.data) {
          setBranch(response.data)
        } else {
          toast.error("Failed to load branch", { description: response.error })
          router.push("/branches")
        }
      } catch (err) {
        toast.error("Failed to load branch")
        router.push("/branches")
      } finally {
        setLoadingBranch(false)
      }
    }
    fetchBranch()
  }, [branchId, router, toast])

  useEffect(() => {
    const fetchClassrooms = async () => {
      if (!branchId) return
      setLoadingClassrooms(true)
      try {
        const response = await schoolRequests.listClassrooms({ branch_id: branchId })
        if (response.success && response.data) {
          setClassrooms(response.data)
        }
      } catch (err) {
        toast.error("Failed to load classrooms for this branch")
      } finally {
        setLoadingClassrooms(false)
      }
    }
    if (branchId) {
      fetchClassrooms()
    }
  }, [branchId, toast])

  const handleDelete = async () => {
    if (!branch) return

    setDeleting(true)
    try {
      const response = await schoolRequests.deleteBranch(branchId)

      if (response.success) {
        toast.success("Branch deleted permanently!")
        router.push("/branches")
      } else {
        toast.error("Failed to delete branch", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong while deleting the branch")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const loading = loadingBranch || loadingClassrooms

  if (loadingBranch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading branch details...</span>
      </div>
    )
  }

  if (!branch) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center space-y-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <Building className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">Branch Not Found</h2>
              <p className="text-muted-foreground">
                The branch you're looking for doesn't exist or has been removed.
              </p>
            </div>
            <Link href="/branches">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Branches
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
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Back Button */}
          <div className="mb-6">
            <Link href="/branches">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Branches
              </Button>
            </Link>
          </div>

          {/* Branch Header */}
          <Card className="mb-8 border-2">
            <CardContent className="pt-8">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                <div className="flex items-start gap-6">
                  <div className="p-5 bg-primary/10 rounded-xl">
                    <Building className="w-12 h-12 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-4 mb-4">
                      <h1 className="text-4xl font-bold">{branch.name}</h1>
                    </div>
                    <div className="flex items-center gap-2 text-lg text-muted-foreground mb-6">
                      <School className="w-5 h-5" />
                      <span>{branch.school_name}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
                      {branch.location && (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Location</p>
                            <p className="text-muted-foreground">{branch.location}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium">Student Capacity</p>
                          <p className="text-muted-foreground">{branch.capacity.toLocaleString()} students</p>
                        </div>
                      </div>

                      {branch.principal_name ? (
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Principal</p>
                            <p className="text-muted-foreground">{branch.principal_name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Principal</p>
                            <p className="text-muted-foreground italic">Not assigned</p>
                          </div>
                        </div>
                      )}

                      {branch.established_date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-medium">Established</p>
                            <p className="text-muted-foreground">
                              {new Date(branch.established_date).toLocaleDateString("en-KE", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                  <Link href={`/branches/${branch.id}/edit`}>
                    <Button size="lg" variant="outline" className="w-full shadow-md">
                      <User className="w-5 h-5 mr-2" />
                      Edit Branch
                    </Button>
                  </Link>

                  <Button
                    size="lg"
                    variant="destructive"
                    className="w-full shadow-md"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting}
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Branch
                  </Button>
                </div>
              </div>

              <Separator className="my-10" />

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Phone
                  </h3>
                  {branch.contact_phone ? (
                    <p className="text-md">{branch.contact_phone}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Not provided</p>
                  )}
                </div>

                <div>
                  <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Contact Email
                  </h3>
                  {branch.contact_email ? (
                    <p className="text-md">{branch.contact_email}</p>
                  ) : (
                    <p className="text-muted-foreground italic">Not provided</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Classrooms Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-primary" />
                Classrooms in {branch.name} ({classrooms.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingClassrooms ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : classrooms.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">
                  No classrooms have been created for this branch yet.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Classroom Name</TableHead>
                        <TableHead>Grade Level</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classrooms.map((classroom) => (
                        <TableRow key={classroom.id}>
                          <TableCell className="font-medium">{classroom.name}</TableCell>
                          <TableCell>
                            {classroom.grade_level.replace("_", " ").toUpperCase()}
                          </TableCell>
                          <TableCell>{classroom.capacity.toLocaleString()} students</TableCell>
                          <TableCell>
                            <Badge variant={classroom.is_active ? "default" : "secondary"}>
                              {classroom.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Permanent Delete Confirmation Dialog */}
          <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Permanently Delete Branch?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <p>
                    You are about to <strong>permanently delete</strong> the branch{" "}
                    <strong>{branch.name}</strong>.
                  </p>
                  <p>
                    This will remove the branch and all its classrooms completely from the system.
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