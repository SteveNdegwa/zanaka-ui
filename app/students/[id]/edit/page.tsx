"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Upload,
  User,
  Phone,
  GraduationCap,
  Users,
  FileText,
  Save,
  X,
  Plus,
  Search,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { BranchProfile, ClassroomProfile, schoolRequests } from "@/lib/requests/schools"
import { useToast } from "@/src/use-toast"
import { UpdateUserRequest, usersRequests } from "@/lib/requests/users"

const guardianRelationships = ["Father", "Mother", "Guardian", "Grandfather", "Grandmother", "Uncle", "Aunt", "Other"]

const counties = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
  "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kericho", "Kiambu",
  "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale",
  "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit",
  "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi", "Nakuru",
  "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu",
  "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi", "Trans-Nzoia",
  "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
].sort()

interface Guardian {
  id: string
  name: string
  idNumber: string
  phone: string
  email: string
}

interface SelectedGuardian {
  guardianId: string
  guardianName: string
  relationship: string
  receiveReports: boolean
  primaryGuardian: boolean
}

interface NewGuardian {
  firstName: string
  lastName: string
  surname: string
  idNumber: string
  phone: string
  email: string
  occupation: string
}

export default function UpdateStudentPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params?.id as string
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isButtonLoading, setIsButtonLoading] = useState(false)

  // Personal & contact
  const [firstName, setFirstName] = useState<string>("")
  const [lastName, setLastName] = useState<string>("")
  const [surname, setSurname] = useState<string>("")
  const [dob, setDob] = useState<string>("")
  const [gender, setGender] = useState<string>("")
  const [town, setTown] = useState<string>("")
  const [county, setCounty] = useState<string>("")
  const [address, setAddress] = useState<string>("")

  // Academic
  const [academicYear, setAcademicYear] = useState<string>("")
  const [admissionDate, setAdmissionDate] = useState<string>("")
  const [enrollmentStatus, setEnrollmentStatus] = useState<string>("active")
  const [prevEnrollmentStatus, setPrevEnrollmentStatus] = useState<string>("active")
  const [studentType, setStudentType] = useState<"day_scholar" | "boarder">("day_scholar")
  const [subscribedMeals, setSubscribedMeals] = useState(true)
  const [subscribedTransport, setSubscribedTransport] = useState(true)

  // Additional info
  const [medicalInformation, setMedicalInformation] = useState<string>("")
  const [additionalInformation, setAdditionalInformation] = useState<string>("")

  // Branch / Grade / Classroom
  const [branches, setBranches] = useState<BranchProfile[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("")
  const [prevBranch, setPrevBranch] = useState<string>("")
  const [selectedGrade, setSelectedGrade] = useState<string>("")
  const [prevGrade, setPrevGrade] = useState<string>("")
  const [selectedClassroom, setSelectedClassroom] = useState<string>("")
  const [prevClassroom, setPrevClassroom] = useState<string>("")
  const [availableClassrooms, setAvailableClassrooms] = useState<ClassroomProfile[]>([])

  // Classroom movement
  const [movementType, setMovementType] = useState<string>("")
  const [movementReason, setMovementReason] = useState<string>("")

  // Guardians
  const [existingGuardians, setExistingGuardians] = useState<Guardian[]>([])
  const [selectedGuardians, setSelectedGuardians] = useState<SelectedGuardian[]>([])

  // Guardian dialog
  const [isAddGuardianDialogOpen, setIsAddGuardianDialogOpen] = useState(false)
  const [guardianSearchQuery, setGuardianSearchQuery] = useState("")
  const [selectedGuardianId, setSelectedGuardianId] = useState("")
  const [selectedRelationship, setSelectedRelationship] = useState("")
  const [primaryGuardian, setPrimaryGuardian] = useState<boolean>(false)
  const [receiveReports, setReceiveReports] = useState<boolean>(false)
  const [isCreatingNewGuardian, setIsCreatingNewGuardian] = useState(false)

  // New guardian form
  const [newGuardian, setNewGuardian] = useState<NewGuardian>({
    firstName: "",
    lastName: "",
    surname: "",
    idNumber: "",
    phone: "",
    email: "",
    occupation: "",
  })

  // Profile photo
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()
  const academicYears = [`${currentYear}`, `${currentYear + 1}`]

  // Validation logic
  const isActiveStudent = enrollmentStatus === "active"

  const errors = {
    firstName: !firstName.trim(),
    lastName: !lastName.trim(),
    surname: !surname.trim(),
    dob: !dob,
    gender: !gender,
    town: !town.trim(),
    county: !county,
    address: !address.trim(),
    guardians: selectedGuardians.length === 0,
    studentType: !studentType,
    // Active student academic requirements
    branch: isActiveStudent && !selectedBranch,
    grade: isActiveStudent && !selectedGrade,
    classroom: isActiveStudent && !selectedClassroom,
    admissionDate: !admissionDate,
  }

  const isClassroomChanged = selectedClassroom !== prevClassroom
  const isClassroomRemoved = prevClassroom && !selectedClassroom
  const isDeactivating = prevEnrollmentStatus === "active" && enrollmentStatus !== "active"
  const requiresMovementInfo = isClassroomChanged || isClassroomRemoved || isDeactivating
  const isMovementInvalid = requiresMovementInfo && (!movementType || movementReason.trim() === "")

  const hasErrors = Object.values(errors).some(Boolean) || (requiresMovementInfo && isMovementInvalid)

  // Reset movement info when no longer needed
  useEffect(() => {
    if (selectedClassroom === prevClassroom && enrollmentStatus === "active") {
      setMovementType("")
      setMovementReason("")
    }
  }, [selectedClassroom, prevClassroom, enrollmentStatus])

  // Auto-suggest movement type when deactivating
  useEffect(() => {
    if (isDeactivating) {
      if (enrollmentStatus === "graduated") {
        setMovementType("GRADUATION")
      } else if (enrollmentStatus === "transferred") {
        setMovementType("TRANSFER_OUT")
      } else {
        setMovementType("WITHDRAWAL")
      }
    }
  }, [enrollmentStatus, isDeactivating])

  // Handle enrollment status change
  useEffect(() => {
    if (enrollmentStatus !== "active") {
      setSelectedClassroom("")
      setSelectedGrade("")
      setAvailableClassrooms([])
    }
  }, [enrollmentStatus])

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return
      const response = await usersRequests.getUser(studentId)
      if (response.success && response.data) {
        const student = response.data
        setFirstName(student.first_name || "")
        setLastName(student.last_name || "")
        setSurname(student.other_name || "")
        setDob(student.date_of_birth || "")
        setGender(student.gender?.toLowerCase() || "")
        setTown(student.town_of_residence || "")
        setCounty(student.county_of_residence || "")
        setAddress(student.address || "")
        setEnrollmentStatus(student.status?.toLowerCase() || "active")
        setPrevEnrollmentStatus(student.status?.toLowerCase() || "active")
        setMedicalInformation(student.medical_info || "")
        setAdditionalInformation(student.additional_info || "")
        setStudentType((student.student_type?.toLowerCase() as "day_scholar" | "boarder") || "day_scholar")
        setSubscribedMeals(student.subscribed_to_meals ?? true)
        setSubscribedTransport(student.subscribed_to_transport ?? true)
        setAdmissionDate(student.admission_date || "")
        setAcademicYear(student.academic_year || "")

        if (student.photo) {
          setProfilePreview(student.photo)
        }

        if (student.classroom_id) {
          setSelectedClassroom(student.classroom_id)
          setPrevClassroom(student.classroom_id)
          setSelectedGrade(student.grade_level || "")
          setPrevGrade(student.grade_level || "")
        }

        if (student.branches && student.branches.length > 0) {
          const branchId = student.branches[0].id || ""
          setSelectedBranch(branchId)
          setPrevBranch(branchId)
        }

        if (student.guardians && student.guardians.length > 0) {
          const guardiansList = student.guardians.map((g: any) => ({
            guardianId: g.guardian_id,
            guardianName: g.guardian_name,
            relationship: g.relationship.toLowerCase(),
            receiveReports: g.can_receive_reports,
            primaryGuardian: g.is_primary,
          }))
          setSelectedGuardians(guardiansList)
        }
      } else {
        toast.error("Failed to load student", {
          description: response.error || "Unable to fetch student data",
        })
        router.push("/students")
      }
      setLoading(false)
    }
    fetchStudentData()
  }, [studentId])

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      const response = await schoolRequests.listBranches()
      if (response.success && response.data) {
        setBranches(response.data)
      }
    }
    fetchBranches()
  }, [])

  // Load classrooms
  useEffect(() => {
    if (selectedBranch && selectedGrade && enrollmentStatus === "active") {
      const loadClassrooms = async () => {
        const response = await schoolRequests.listClassrooms({
          branch_id: selectedBranch,
          grade_level: selectedGrade,
        })
        if (response.success && response.data) {
          setAvailableClassrooms(response.data)
          if (response.data.length === 0) {
            setSelectedClassroom("")
          }
        } else {
          setAvailableClassrooms([])
          setSelectedClassroom("")
        }
      }
      loadClassrooms()
    } else {
      setAvailableClassrooms([])
      setSelectedClassroom("")
    }
  }, [selectedBranch, selectedGrade, enrollmentStatus])

  // Load guardians
  useEffect(() => {
    const loadGuardians = async () => {
      const payload = { role_name: "GUARDIAN" }
      const response = await usersRequests.filterUsers(payload)
      if (response.success && response.data) {
        const guardiansList = response.data.map((guardian: any) => ({
          id: guardian.id,
          name: `${guardian.first_name} ${guardian.last_name} ${guardian.other_name || ""}`.trim(),
          idNumber: guardian.id_number || "",
          phone: guardian.phone_number || "",
          email: guardian.email || "",
        }))
        setExistingGuardians(guardiansList)
      }
    }
    loadGuardians()
  }, [])

  const filteredGuardians = existingGuardians.filter(
    (guardian) =>
      guardian.name.toLowerCase().includes(guardianSearchQuery.toLowerCase()) ||
      guardian.id.toLowerCase().includes(guardianSearchQuery.toLowerCase()) ||
      guardian.phone.includes(guardianSearchQuery)
  )

  const addExistingGuardian = () => {
    if (!selectedGuardianId || !selectedRelationship) return
    const guardian = existingGuardians.find((g) => g.id === selectedGuardianId)
    if (!guardian) return
    if (selectedGuardians.some((g) => g.guardianId === selectedGuardianId)) {
      toast.error("Add guardian failed", { description: "This guardian is already added" })
      return
    }
    setSelectedGuardians([
      ...selectedGuardians,
      {
        guardianId: guardian.id,
        guardianName: guardian.name,
        relationship: selectedRelationship,
        receiveReports: receiveReports,
        primaryGuardian: primaryGuardian,
      },
    ])
    setReceiveReports(false)
    setPrimaryGuardian(false)
    setSelectedGuardianId("")
    setSelectedRelationship("")
    setGuardianSearchQuery("")
    setIsAddGuardianDialogOpen(false)
  }

  const createAndAddGuardian = async () => {
    if (!newGuardian.firstName || !newGuardian.lastName || !newGuardian.phone || !selectedRelationship) {
      toast.error("Create guardian failed", {
        description: "Please fill in required fields: Names, Phone, and Relationship",
      })
      return
    }
    const payload = {
      first_name: newGuardian.firstName,
      last_name: newGuardian.lastName,
      other_name: newGuardian.surname,
      id_number: newGuardian.idNumber,
      email: newGuardian.email,
      phone_number: newGuardian.phone,
      occupation: newGuardian.occupation,
    }
    try {
      const res = await usersRequests.createUser("guardian", payload)
      if (res.success && res.data) {
        const newGuardianData = {
          id: res.data.id,
          name: `${newGuardian.firstName} ${newGuardian.lastName} ${newGuardian.surname || ""}`.trim(),
          idNumber: newGuardian.idNumber,
          phone: newGuardian.phone,
          email: newGuardian.email,
        }
        setExistingGuardians([...existingGuardians, newGuardianData])
        setSelectedGuardians([
          ...selectedGuardians,
          {
            guardianId: res.data.id,
            guardianName: newGuardianData.name,
            relationship: selectedRelationship,
            receiveReports: receiveReports,
            primaryGuardian: primaryGuardian,
          },
        ])
        toast.success("Guardian created successfully")
      } else {
        toast.error("Create guardian failed", { description: res.error || "Unable to create guardian." })
      }
    } catch (err) {
      toast.error("Create guardian failed", { description: "Something went wrong. Please try again." })
    }
    setNewGuardian({ firstName: "", lastName: "", surname: "", idNumber: "", phone: "", email: "", occupation: "" })
    setSelectedRelationship("")
    setReceiveReports(false)
    setPrimaryGuardian(false)
    setIsCreatingNewGuardian(false)
    setIsAddGuardianDialogOpen(false)
  }

  const removeGuardian = (guardianId: string) => {
    setSelectedGuardians(selectedGuardians.filter((g) => g.guardianId !== guardianId))
  }

  const handleCancel = () => {
    router.push("/students")
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (hasErrors) {
      toast.error("Validation Error", { description: "Please fill in all required fields." })
      return
    }

    setIsButtonLoading(true)
    let photoBase64: string | undefined
    if (profilePhoto) {
      photoBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(profilePhoto)
      })
    }

    const payload: UpdateUserRequest = {
      first_name: firstName,
      last_name: lastName,
      other_name: surname,
      date_of_birth: dob,
      gender: gender.toUpperCase(),
      town_of_residence: town,
      county_of_residence: county,
      address,
      academic_year: academicYear,
      admission_date: admissionDate,
      branch_ids: selectedBranch ? [selectedBranch] : prevBranch ? [prevBranch] : [],
      classroom_id: selectedClassroom || null,
      medical_info: medicalInformation,
      additional_info: additionalInformation,
      student_type: studentType.toUpperCase(),
      status: enrollmentStatus.toUpperCase(),
      subscribed_to_transport: subscribedTransport,
      subscribed_to_meals: subscribedMeals,
      guardians: selectedGuardians.map((g) => ({
        guardian_id: g.guardianId,
        relationship: g.relationship.toUpperCase(),
        is_primary: g.primaryGuardian,
        can_receive_reports: g.receiveReports,
      })),
      ...(photoBase64 ? { photo: photoBase64 } : {}),
      ...(requiresMovementInfo
        ? {
            classroom_movement_type: movementType,
            classroom_movement_reason: movementReason.trim(),
          }
        : {}),
    }

    try {
      const res = await usersRequests.updateUser(studentId, payload)
      if (res.success) {
        toast.success("Update student successful!", {
          description: "Student updated successfully.",
          duration: 5000,
        })
        router.push("/students")
      } else {
        toast.error("Update student failed!", { description: res.error || "Unable to update student." })
      }
    } catch (err) {
      toast.error("Update student failed!", { description: "Something went wrong. Please try again." })
    } finally {
      setIsButtonLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-lg">Loading student profile...</span>
      </div>
    )
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/students">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Students
                </Button>
              </Link>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isButtonLoading || hasErrors}
                onClick={handleSave}
              >
                <Save className="w-4 h-4 mr-2" />
                {isButtonLoading ? "Updating student..." : "Update Student"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      {errors.firstName && <p className="text-sm text-red-600 mt-1">First name is required</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                      {errors.lastName && <p className="text-sm text-red-600 mt-1">Last name is required</p>}
                    </div>
                    <div>
                      <Label htmlFor="surname">Surname *</Label>
                      <Input id="surname" value={surname} onChange={(e) => setSurname(e.target.value)} />
                      {errors.surname && <p className="text-sm text-red-600 mt-1">Surname is required</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input id="dateOfBirth" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
                      {errors.dob && <p className="text-sm text-red-600 mt-1">Date of birth is required</p>}
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender *</Label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.gender && <p className="text-sm text-red-600 mt-1">Gender is required</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="town">Town *</Label>
                      <Input id="town" value={town} onChange={(e) => setTown(e.target.value)} />
                      {errors.town && <p className="text-sm text-red-600 mt-1">Town is required</p>}
                    </div>
                    <div>
                      <Label htmlFor="county">County *</Label>
                      <Select value={county} onValueChange={setCounty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select county" />
                        </SelectTrigger>
                        <SelectContent>
                          {counties.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.county && <p className="text-sm text-red-600 mt-1">County is required</p>}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Home Address *</Label>
                    <Textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows={3} />
                    {errors.address && <p className="text-sm text-red-600 mt-1">Address is required</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2" />
                    Academic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="branch">Branch {isActiveStudent && "*"}</Label>
                      <Select
                        value={selectedBranch}
                        onValueChange={setSelectedBranch}
                        disabled={enrollmentStatus !== "active"}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              enrollmentStatus !== "active" ? "Not applicable (inactive student)" : "Select branch"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.branch && <p className="text-sm text-red-600 mt-1">Branch is required for active students</p>}
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade Level {isActiveStudent && "*"}</Label>
                      <Select
                        value={selectedGrade}
                        onValueChange={setSelectedGrade}
                        disabled={enrollmentStatus !== "active"}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              enrollmentStatus !== "active" ? "Not applicable (inactive student)" : "Select grade"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baby_class">Baby Class</SelectItem>
                          <SelectItem value="pp_1">PP 1</SelectItem>
                          <SelectItem value="pp_2">PP 2</SelectItem>
                          <SelectItem value="grade_1">Grade 1</SelectItem>
                          <SelectItem value="grade_2">Grade 2</SelectItem>
                          <SelectItem value="grade_3">Grade 3</SelectItem>
                          <SelectItem value="grade_4">Grade 4</SelectItem>
                          <SelectItem value="grade_5">Grade 5</SelectItem>
                          <SelectItem value="grade_6">Grade 6</SelectItem>
                          <SelectItem value="grade_7">Grade 7</SelectItem>
                          <SelectItem value="grade_8">Grade 8</SelectItem>
                          <SelectItem value="grade_9">Grade 9</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.grade && <p className="text-sm text-red-600 mt-1">Grade is required for active students</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="classroom">Classroom {isActiveStudent && "*"}</Label>
                      <Select
                        value={selectedClassroom}
                        onValueChange={setSelectedClassroom}
                        disabled={
                          enrollmentStatus !== "active" ||
                          !selectedBranch ||
                          !selectedGrade ||
                          availableClassrooms.length === 0
                        }
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              enrollmentStatus !== "active"
                                ? "Not applicable (inactive student)"
                                : !selectedBranch || !selectedGrade
                                ? "Select branch & grade first"
                                : availableClassrooms.length === 0
                                ? "No classrooms available"
                                : "Select classroom"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableClassrooms.map((classroom) => (
                            <SelectItem key={classroom.id} value={classroom.id}>
                              {classroom.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.classroom && <p className="text-sm text-red-600 mt-1">Classroom is required for active students</p>}
                    </div>
                    {prevClassroom && enrollmentStatus === "active" && (
                      <div className="flex items-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedClassroom("")
                            setSelectedGrade("")
                            setAvailableClassrooms([])
                          }}
                          className="mb-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove from Class
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select value={academicYear} onValueChange={setAcademicYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          {academicYears.map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="admissionDate">Admission Date *</Label>
                      <Input
                        id="admissionDate"
                        type="date"
                        value={admissionDate}
                        onChange={(e) => setAdmissionDate(e.target.value)}
                      />
                      {errors.admissionDate && <p className="text-sm text-red-600 mt-1">Admission date is required</p>}
                    </div>
                  </div>

                  {requiresMovementInfo && (
                    <div className="col-span-full space-y-4 pt-6 border-t">
                      <h4 className="font-medium text-lg">Classroom Movement Details (Required)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                          <Label htmlFor="movementType">
                            Movement Type <span className="text-red-500">*</span>
                          </Label>
                          <Select value={movementType} onValueChange={setMovementType}>
                            <SelectTrigger id="movementType">
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PROMOTION">Promotion</SelectItem>
                              <SelectItem value="STREAM_CHANGE">Stream Change</SelectItem>
                              <SelectItem value="REPEAT">Repeat</SelectItem>
                              <SelectItem value="TRANSFER_OUT">Transfer Out</SelectItem>
                              <SelectItem value="GRADUATION">Graduation</SelectItem>
                              <SelectItem value="WITHDRAWAL">Withdrawal</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="movementReason">
                            Additional Reason / Notes <span className="text-red-500">*</span>
                          </Label>
                          <Textarea
                            id="movementReason"
                            placeholder="Provide details about this change..."
                            value={movementReason}
                            onChange={(e) => setMovementReason(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      {isMovementInvalid && (
                        <p className="text-sm text-red-600">
                          Both movement type and reason are required.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guardian Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Guardian Information *
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsAddGuardianDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Guardian
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {errors.guardians && <p className="text-sm text-red-600 mb-3">At least one guardian is required</p>}
                  {selectedGuardians.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No guardians added yet</p>
                      <p className="text-sm">Click "Add Guardian" to select or create a guardian</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedGuardians.map((guardian) => (
                        <div
                          key={guardian.guardianId}
                          className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                            </div>
                            <div>
                              <p className="font-medium">{guardian.guardianName}</p>
                              <p className="text-sm text-gray-500 capitalize">{guardian.relationship}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => removeGuardian(guardian.guardianId)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Additional Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Additional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="medicalInfo">Medical Information</Label>
                    <Textarea
                      id="medicalInfo"
                      placeholder="Any medical conditions, allergies, or special requirements"
                      value={medicalInformation}
                      onChange={(e) => setMedicalInformation(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information about the student"
                      value={additionalInformation}
                      onChange={(e) => setAdditionalInformation(e.target.value)}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Profile Photo */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Photo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center space-y-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("Image too large", { description: "Maximum allowed size is 2MB" })
                          return
                        }
                        setProfilePhoto(file)
                        setProfilePreview(URL.createObjectURL(file))
                      }}
                    />
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                      {profilePreview ? (
                        <img src={profilePreview} alt="Profile preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-gray-500 text-center">Recommended: Square image, max 2MB</p>
                  </div>
                </CardContent>
              </Card>

              {/* Student Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="studentType">Student Type *</Label>
                    <Select value={studentType} onValueChange={(value) => setStudentType(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="day_scholar">Day Scholar</SelectItem>
                        <SelectItem value="boarder">Boarding</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.studentType && <p className="text-sm text-red-600 mt-1">Student type is required</p>}
                  </div>
                  <div>
                    <Label htmlFor="status">Enrollment Status</Label>
                    <Select value={enrollmentStatus} onValueChange={setEnrollmentStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                        <SelectItem value="transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {studentType === "day_scholar" && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="subscribedTransport"
                          checked={subscribedTransport}
                          onCheckedChange={(checked) => setSubscribedTransport(!!checked)}
                        />
                        <Label htmlFor="subscribedTransport" className="text-sm font-normal cursor-pointer">
                          Subscribed to Transport
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="subscribedMeals"
                          checked={subscribedMeals}
                          onCheckedChange={(checked) => setSubscribedMeals(!!checked)}
                        />
                        <Label htmlFor="subscribedMeals" className="text-sm font-normal cursor-pointer">
                          Subscribed to Meals
                        </Label>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainContent>

      {/* Add Guardian Dialog */}
      <Dialog open={isAddGuardianDialogOpen} onOpenChange={setIsAddGuardianDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Guardian</DialogTitle>
            <DialogDescription>Search for an existing guardian or create a new one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
                      {!isCreatingNewGuardian ? (
                        <>
            {/* Search Existing Guardian */}
            <div>
              <Label>Search Guardian</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by name, ID, or phone..."
                  value={guardianSearchQuery}
                  onChange={(e) => setGuardianSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          
            {/* Guardian Selection */}
            {guardianSearchQuery && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {filteredGuardians.length > 0 ? (
                  filteredGuardians.map((guardian) => (
                    <div
                      key={guardian.id}
                      onClick={() => setSelectedGuardianId(guardian.id)}
                      className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-b last:border-b-0 ${
                        selectedGuardianId === guardian.id ? "bg-blue-50 dark:bg-blue-900" : ""
                      }`}
                    >
                      <p className="font-medium">{guardian.name}</p>
                      <p className="text-sm text-gray-500">
                        {guardian.phone} • {guardian.email}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-500">No guardians found</div>
                )}
              </div>
            )}
          
            {selectedGuardianId && (
              <div className="space-y-3 mt-3">
                {/* Relationship */}
                <div>
                  <Label>Relationship *</Label>
                  <Select value={selectedRelationship} onValueChange={setSelectedRelationship}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      {guardianRelationships.map((rel) => (
                        <SelectItem key={rel} value={rel.toLowerCase()}>
                          {rel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
          
                {/* Checkboxes */}
                <div className="flex flex-col space-y-2 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={primaryGuardian}
                      onChange={(e) => setPrimaryGuardian(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Primary Guardian</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={receiveReports}
                      onChange={(e) => setReceiveReports(e.target.checked)}
                      className="form-checkbox h-4 w-4 text-blue-600"
                    />
                    <span className="ml-2 text-sm">Receive Reports</span>
                  </label>
                </div>
              </div>
            )}
          
            {/* Create New Guardian */}
            <div className="flex items-center justify-center py-2">
              <Button
                variant="link"
                onClick={() => setIsCreatingNewGuardian(true)}
                className="text-blue-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Guardian Instead
              </Button>
            </div>
          </>
          
                      ) : (
                        <>
                          {/* Create New Guardian Form */}
                       <div className="space-y-4 max-h-[80vh] overflow-y-auto p-4">
            {/* ID Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">ID Number</Label>
                <Input
                  value={newGuardian.idNumber || ""}
                  onChange={(e) => setNewGuardian({ ...newGuardian, idNumber: e.target.value })}
                  placeholder="12345678"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          
            {/* Names */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newGuardian.firstName}
                  onChange={(e) => setNewGuardian({ ...newGuardian, firstName: e.target.value })}
                  placeholder="John"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newGuardian.lastName}
                  onChange={(e) => setNewGuardian({ ...newGuardian, lastName: e.target.value })}
                  placeholder="Doe"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Other Name</Label>
                <Input
                  value={newGuardian.surname}
                  onChange={(e) => setNewGuardian({ ...newGuardian, surname: e.target.value })}
                  placeholder="Middle (optional)"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          
            {/* Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={newGuardian.phone}
                  onChange={(e) => setNewGuardian({ ...newGuardian, phone: e.target.value })}
                  placeholder="+254 712 345 678"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email Address</Label>
                <Input
                  value={newGuardian.email}
                  onChange={(e) => setNewGuardian({ ...newGuardian, email: e.target.value })}
                  placeholder="guardian@example.com"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          
            {/* Occupation & Relationship */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Occupation</Label>
                <Input
                  value={newGuardian.occupation}
                  onChange={(e) => setNewGuardian({ ...newGuardian, occupation: e.target.value })}
                  placeholder="Teacher"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">
                  Relationship <span className="text-red-500">*</span>
                </Label>
                <Select value={selectedRelationship} onValueChange={setSelectedRelationship}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {guardianRelationships.map((rel) => (
                      <SelectItem key={rel} value={rel.toLowerCase()}>
                        {rel}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          
            {/* Checkboxes */}
            <div className="flex flex-wrap gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="primary"
                  checked={primaryGuardian}
                  onCheckedChange={(checked) => setPrimaryGuardian(Boolean(checked))}
                />
                <Label htmlFor="primary" className="text-sm font-normal cursor-pointer">
                  Primary Guardian
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="reports"
                  checked={receiveReports}
                  onCheckedChange={(checked) => setReceiveReports(Boolean(checked))}
                />
                <Label htmlFor="reports" className="text-sm font-normal cursor-pointer">
                  Receive Reports
                </Label>
              </div>
            </div>
          </div>
          
          
                          <div className="flex items-center justify-center py-2">
                            <Button
                              variant="link"
                              onClick={() => {
                                setIsCreatingNewGuardian(false)
                                setNewGuardian({ firstName: "", lastName: "", surname: "",  idNumber: "", phone: "", email: "", occupation: "" })
                              }}
                              className="text-blue-600"
                            >
                              <Search className="w-4 h-4 mr-2" />
                              Search Existing Guardians Instead
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddGuardianDialogOpen(false)
                setIsCreatingNewGuardian(false)
                setSelectedGuardianId("")
                setSelectedRelationship("")
                setGuardianSearchQuery("")
                setNewGuardian({ firstName: "", lastName: "", surname: "", idNumber: "", phone: "", email: "", occupation: "" })
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={isCreatingNewGuardian ? createAndAddGuardian : addExistingGuardian}
              disabled={
                isCreatingNewGuardian
                  ? !newGuardian.firstName || !newGuardian.lastName || !newGuardian.phone || !selectedRelationship
                  : !selectedGuardianId || !selectedRelationship
              }
            >
              {isCreatingNewGuardian ? "Create & Add Guardian" : "Add Guardian"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}