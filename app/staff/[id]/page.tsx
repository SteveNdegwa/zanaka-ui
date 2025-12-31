"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Loader2, ArrowLeft, Mail, Phone, IdCard, Building, Calendar, Shield, Trash2, Edit } from "lucide-react"
import Link from "next/link"
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

export default function ViewStaffPage() {
  const router = useRouter()
  const params = useParams()
  const staffId = params.id as string
  const { toast } = useToast()

  const [staff, setStaff] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchStaff = async () => {
      if (!staffId) return
      setLoading(true)
      try {
        const response = await usersRequests.getUser(staffId)
        if (response.success && response.data) {
          setStaff(response.data)
        } else {
          toast.error("Failed to load staff member")
          router.push("/staff")
        }
      } catch (error) {
        toast.error("Failed to load staff member")
        router.push("/staff")
      } finally {
        setLoading(false)
      }
    }
    fetchStaff()
  }, [staffId, router, toast])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await usersRequests.deleteUser(staffId)
      toast.success("Staff member deleted permanently")
      router.push("/staff")
    } catch (err) {
      toast.error("Failed to delete staff member")
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const getRoleBadge = (role: string) => {
    const config: Record<string, { label: string; variant: "default" | "secondary" | "outline"; icon?: any }> = {
      ADMIN: { label: "Administrator", variant: "default", icon: Shield },
      TEACHER: { label: "Teacher", variant: "secondary" },
      CLERK: { label: "Clerk", variant: "outline" },
    }
    const cfg = config[role] || { label: role, variant: "outline" }
    const Icon = cfg.icon
    return (
      <Badge variant={cfg.variant} className="text-sm px-4 py-1.5 font-medium">
        {Icon && <Icon className="w-4 h-4 mr-2" />}
        {cfg.label}
      </Badge>
    )
  }

  const getStatusBadge = (user: UserProfile) => {
    const statusLabel = user.status ? user.status.replace("_", " ") : (user.is_active ? "Active" : "Inactive")
    let variant: "default" | "secondary" | "destructive" = "default"

    if (["Suspended", "Terminated", "Retired"].includes(statusLabel)) {
      variant = "destructive"
    } else if (["On Leave", "Inactive"].includes(statusLabel)) {
      variant = "secondary"
    }

    return <Badge variant={variant} className="text-sm px-4 py-1.5 font-medium">{statusLabel}</Badge>
  }

  const getBranchDisplay = (user: UserProfile) => {
    if (user.branches.length === 0) {
      return <span className="text-primary font-semibold">All Branches (System-wide Access)</span>
    }
    return user.branches.map(b => b.name).join(", ") || "—"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="ml-4 text-lg font-medium">Loading staff profile...</span>
      </div>
    )
  }

  if (!staff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground font-medium">Staff member not found</div>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-10 max-w-7xl">
          {/* Back Navigation */}
          <div className="mb-10">
            <Link href="/staff">
            <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Staff List
                </Button>
            </Link>
          </div>

          {/* Hero Profile Section */}
          <Card className="border-0 shadow-xl overflow-hidden mb-12">
            <div className="bg-gradient-to-br from-primary/10 via-background to-background">
              <CardContent className="pt-16 pb-20 px-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-16">
                  {/* Avatar & Info */}
                  <div className="flex items-center gap-10">
                    <Avatar className="h-48 w-48 ring-8 ring-background shadow-md">
                      {staff.photo ? (
                        <AvatarImage src={staff.photo} alt={staff.full_name} />
                      ) : (
                        <AvatarFallback className="text-xl font-light bg-gradient-to-br from-primary/20 to-primary/10">
                          {staff.full_name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="space-y-8">
                      <div>
                        <h1 className="text-xl font-bold text-foreground tracking-tight">{staff.full_name}</h1>
                        <p className="text-md text-muted-foreground mt-3">Staff Member</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-6">
                        {getRoleBadge(staff.role_name)}
                        {getStatusBadge(staff)}
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="w-5 h-5 mr-2" />
                          <span className="text-md">Joined {formatDate(staff.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-5 min-w-[220px]">
                    <Link href={`/staff/${staff.id}/edit`} className="w-full">
                      <Button size="lg" className="w-full shadow-md hover:shadow-lg transition-shadow">
                        <Edit className="w-5 h-5 mr-3" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Button
                      size="lg"
                      variant="destructive"
                      className="w-full shadow-md hover:shadow-lg transition-shadow"
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={deleting}
                    >
                      <Trash2 className="w-5 h-5 mr-3" />
                      Delete Staff
                    </Button>
                  </div>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Contact Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-5">
                <CardTitle className="text-md flex items-center gap-3">
                  <Mail className="w-6 h-6 text-primary" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email Address</p>
                  <p className="text-md font-medium mt-1">{staff.email || <span className="text-muted-foreground italic">Not provided</span>}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p className="text-md font-medium mt-1">{staff.phone_number || <span className="text-muted-foreground italic">Not provided</span>}</p>
                </div>
              </CardContent>
            </Card>

            {/* Identification Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-5">
                <CardTitle className="text-md flex items-center gap-3">
                  <IdCard className="w-6 h-6 text-primary" />
                  Identification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registration Number</p>
                  <p className="text-md font-mono font-bold mt-1">{staff.reg_number}</p>
                </div>

                <Separator />

                 <div>
                  <p className="text-sm font-medium text-muted-foreground">ID Number</p>
                  <p className="text-md font-mono font-bold mt-1">{staff.id_number}</p>
                </div>
                
                {staff.role_name === "TEACHER" && staff.tsc_number && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">TSC Number</p>
                      <p className="text-md font-mono font-bold mt-1">{staff.tsc_number}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Branch Access Card */}
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-5">
                <CardTitle className="text-md flex items-center gap-3">
                  <Building className="w-6 h-6 text-primary" />
                  Branch Access
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-md font-semibold mb-3">{getBranchDisplay(staff)}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {staff.branches.length === 0
                    ? "This staff member has full access to all branches across the school."
                    : "Access is restricted to the assigned branch(es) listed above."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainContent>

      {/* Permanent Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Permanently Delete Staff Member?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 text-base leading-relaxed">
              <p>
                You are about to <span className="font-bold text-destructive">permanently delete</span>{" "}
                <span className="font-bold">{staff.full_name}</span>.
              </p>
              <p>
                <strong>This action cannot be undone.</strong> All associated data, records, and access will be permanently removed from the system.
              </p>
              <p className="font-bold text-destructive text-md">
                This is a final and irreversible action.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel className="px-6 py-3">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="px-6 py-3 bg-destructive hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Yes, Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}