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
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, ArrowLeft, UserPlus, Camera } from "lucide-react"
import Link from "next/link"
import { usersRequests } from "@/lib/requests/users"
import { schoolRequests, BranchProfile } from "@/lib/requests/schools"
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
import React from "react"

type RoleName = "ADMIN" | "TEACHER" | "CLERK"

export default function CreateStaffPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [branchesLoading, setBranchesLoading] = useState(true)
  const [showConfirm, setShowConfirm] = useState(false)

  const [branches, setBranches] = useState<BranchProfile[]>([])

  const [role, setRole] = useState<RoleName | "">("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [otherName, setOtherName] = useState("")
  const [email, setEmail] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [tscNumber, setTscNumber] = useState("")
  const [photo, setPhoto] = useState<string | null>(null)
  const [appliesToAllBranches, setAppliesToAllBranches] = useState(true)
  const [selectedBranchIds, setSelectedBranchIds] = useState<string[]>([])

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchBranches = async () => {
      setBranchesLoading(true)
      try {
        const response = await schoolRequests.listBranches()
        if (response.success && response.data) {
          setBranches(response.data.filter(b => b.is_active))
        }
      } catch (error) {
        toast.error("Failed to load branches")
      } finally {
        setBranchesLoading(false)
      }
    }
    fetchBranches()
  }, [toast])

  const handlePhotoClick = () => {
    fileInputRef.current?.click()
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setPhoto(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleBranchToggle = (branchId: string, checked: boolean) => {
    if (checked) {
      setSelectedBranchIds(prev => [...prev, branchId])
    } else {
      setSelectedBranchIds(prev => prev.filter(id => id !== branchId))
    }
  }

  const handleCreate = async () => {
    if (!role || !firstName.trim() || !lastName.trim()) {
      toast.error("Role, first name, and last name are required")
      return
    }

    setLoading(true)
    try {
      const data: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        other_name: otherName.trim() || undefined,
        email: email.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        id_number: idNumber.trim() || undefined,
        photo: photo || undefined,
        branch_ids: appliesToAllBranches ? [] : selectedBranchIds,
      }

      if (role === "TEACHER") {
        data.tsc_number = tscNumber.trim() || undefined
      }

      const response = await usersRequests.createUser(role, data)

      if (response.success) {
        toast.success("Staff member created successfully!")
        router.push(`/staff/${response.data?.id}`)
      } else {
        toast.error("Failed to create staff", { description: response.error })
      }
    } catch (err) {
      toast.error("Something went wrong while creating the staff member")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  const selectedBranchesDisplay = appliesToAllBranches
    ? "All Branches"
    : selectedBranchIds.length === 0
      ? "None"
      : branches
          .filter(b => selectedBranchIds.includes(b.id))
          .map(b => b.name)
          .join(", ")

  const fullNamePreview = [firstName, otherName, lastName].filter(Boolean).join(" ").trim() || "—"

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="container mx-auto px-6 py-8 max-w-4xl">
          <div className="mb-8">
            <Link href="/staff">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Staff
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mt-6">Create New Staff Member</h1>
            <p className="text-muted-foreground mt-2">
              Add a new teacher, clerk, or administrator to the system
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <UserPlus className="w-6 h-6 text-primary" />
                Staff Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Photo Upload - Centered & Working */}
              <div className="flex flex-col items-center gap-6 py-8">
                <div 
                  className="relative group cursor-pointer"
                  onClick={handlePhotoClick}
                >
                  <Avatar className="h-44 w-44 ring-8 ring-background shadow-2xl">
                    {photo ? (
                      <AvatarImage src={photo} alt="Preview" />
                    ) : (
                      <AvatarFallback className="text-6xl bg-muted">
                        {firstName || lastName ? (
                          `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase()
                        ) : (
                          <Camera className="w-20 h-20 text-muted-foreground" />
                        )}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="text-center">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={handlePhotoClick}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Choose Photo
                  </Button>
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <p className="text-sm text-muted-foreground mt-3">
                    Square image recommended • Max 5MB
                  </p>
                </div>
              </div>

              {/* Rest of the form unchanged */}
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={role} onValueChange={(v) => setRole(v as RoleName)}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select staff role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Administrator</SelectItem>
                    <SelectItem value="TEACHER">Teacher</SelectItem>
                    <SelectItem value="CLERK">Clerk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="otherName">Other Name</Label>
                  <Input
                    id="otherName"
                    placeholder="Middle name"
                    value={otherName}
                    onChange={(e) => setOtherName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@school.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+254 700 000 000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="idNumber">National ID Number</Label>
                <Input
                  id="idNumber"
                  placeholder="12345678"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="mt-2"
                />
              </div>

              {role === "TEACHER" && (
                <div>
                  <Label htmlFor="tscNumber">TSC Number</Label>
                  <Input
                    id="tscNumber"
                    placeholder="TSC123456"
                    value={tscNumber}
                    onChange={(e) => setTscNumber(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}

              {/* Branch Assignment */}
              <div className="space-y-4">
                <Label>Branch Assignment</Label>
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="all-branches"
                    checked={appliesToAllBranches}
                    onCheckedChange={(checked) => {
                      setAppliesToAllBranches(checked as boolean)
                      if (checked) setSelectedBranchIds([])
                    }}
                  />
                  <label htmlFor="all-branches" className="text-sm font-medium cursor-pointer">
                    Access to all branches (recommended)
                  </label>
                </div>

                {!appliesToAllBranches && (
                  <div className="ml-8 space-y-3 border-l-4 border-muted pl-6 py-4 bg-muted/30 rounded-r-lg">
                    <p className="text-sm text-muted-foreground mb-3">
                      Restrict access to specific branches:
                    </p>
                    {branchesLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading branches...
                      </div>
                    ) : branches.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No active branches found</p>
                    ) : (
                      <div className="space-y-2">
                        {branches.map((branch) => (
                          <div key={branch.id} className="flex items-center space-x-3">
                            <Checkbox
                              id={branch.id}
                              checked={selectedBranchIds.includes(branch.id)}
                              onCheckedChange={(checked) => handleBranchToggle(branch.id, checked as boolean)}
                            />
                            <label htmlFor={branch.id} className="text-sm cursor-pointer">
                              {branch.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4 pt-8">
                <Link href="/staff">
                  <Button variant="outline" disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading || !role || !firstName.trim() || !lastName.trim()}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Staff Member
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
                <AlertDialogTitle>Create New Staff Member?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-4">
                  <div className="flex justify-center mb-6">
                    <Avatar className="h-32 w-32">
                      {photo ? (
                        <AvatarImage src={photo} />
                      ) : (
                        <AvatarFallback className="text-4xl">
                          {firstName[0] || ""}{lastName[0] || ""}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>
                  <p className="text-center font-semibold text-lg">{fullNamePreview}</p>
                  <div className="bg-muted/50 rounded-lg p-5 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="font-medium">Role:</span><span>{role}</span></div>
                    {email && <div className="flex justify-between"><span className="font-medium">Email:</span><span>{email}</span></div>}
                    {phoneNumber && <div className="flex justify-between"><span className="font-medium">Phone:</span><span>{phoneNumber}</span></div>}
                    {idNumber && <div className="flex justify-between"><span className="font-medium">ID Number:</span><span>{idNumber}</span></div>}
                    {role === "TEACHER" && tscNumber && <div className="flex justify-between"><span className="font-medium">TSC Number:</span><span>{tscNumber}</span></div>}
                    <div className="flex justify-between"><span className="font-medium">Branches:</span><span>{selectedBranchesDisplay}</span></div>
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCreate} disabled={loading}>
                  {loading ? "Creating..." : "Yes, Create Staff"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </MainContent>
    </>
  )
}