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
import { useToast } from "@/src/use-toast"
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react"
import Link from "next/link"
import { schoolRequests } from "@/lib/requests/schools"
import { usersRequests, UserProfile } from "@/lib/requests/users"
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

export default function CreateBranchPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [principals, setPrincipals] = useState<UserProfile[]>([])

  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [principalId, setPrincipalId] = useState<string | undefined>(undefined)
  const [capacity, setCapacity] = useState("")

  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    const fetchPrincipals = async () => {
      try {
        const response = await usersRequests.filterUsers({
          role_name: "ADMIN",
        })
        if (response.success && response.data) {
          setPrincipals(response.data)
        }
      } catch (error) {
        toast.error("Failed to load potential principals")
      }
    }
    fetchPrincipals()
  }, [toast])

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Branch name is required")
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: name.trim(),
        location: location.trim() || undefined,
        contact_email: contactEmail.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        principal_id: principalId || undefined,
        capacity: capacity ? parseInt(capacity) : undefined,
      }

      const response = await schoolRequests.createBranch(payload)

      if (response.success) {
        toast.success("Branch created successfully!")
        router.push("/branches")
      } else {
        toast.error("Failed to create branch", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong while creating the branch")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  const principalName = principals.find(p => p.id === principalId)?.full_name || "None"

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href="/branches">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Branches
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Add New Branch</h1>
            <p className="text-muted-foreground mt-2">
              Create a new branch for your school
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="w-6 h-6 text-primary" />
                Branch Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Main Campus, Westlands Branch"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="capacity">Student Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="0"
                    placeholder="e.g. 800"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location / Address</Label>
                <div className="relative mt-2">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g. Ngong Road, Nairobi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="phone">Contact Phone</Label>
                  <div className="relative mt-2">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="+254 700 000 000"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Contact Email</Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="branch@example.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="principal">Branch Principal (Optional)</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Select value={principalId} onValueChange={setPrincipalId}>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select a principal" />
                    </SelectTrigger>
                    <SelectContent>
                      {principals.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.full_name} ({user.reg_number})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6">
                <Link href="/branches">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || !name.trim()}
                >
                  {loading ? (
                    <>Creating...</>
                  ) : (
                    <>
                      <Building className="w-4 h-4 mr-2" />
                      Create Branch
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Create New Branch?</AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>Please confirm the details for the new branch:</p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Branch Name:</span>
                    <span>{name.trim()}</span>
                  </div>
                  {location.trim() && (
                    <div className="flex justify-between">
                      <span className="font-medium">Location:</span>
                      <span>{location.trim()}</span>
                    </div>
                  )}
                  {contactPhone.trim() && (
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{contactPhone.trim()}</span>
                    </div>
                  )}
                  {contactEmail.trim() && (
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{contactEmail.trim()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="font-medium">Principal:</span>
                    <span>{principalName}</span>
                  </div>
                  {capacity && (
                    <div className="flex justify-between">
                      <span className="font-medium">Capacity:</span>
                      <span>{parseInt(capacity).toLocaleString()} students</span>
                    </div>
                  )}
                </div>
                <p className="pt-2">
                  This action will create a new branch under your school.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleCreate} disabled={loading}>
                {loading ? "Creating..." : "Yes, Create Branch"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </MainContent>
    </>
  )
}