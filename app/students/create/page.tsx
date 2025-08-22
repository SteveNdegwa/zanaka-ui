"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Upload, User, Phone, GraduationCap, Users, FileText, Save, X } from "lucide-react"
import Link from "next/link"

// Mock data for dropdowns
const branches = [
  { id: "main", name: "Main Campus", code: "MAIN" },
  { id: "north", name: "North Campus", code: "NORTH" },
  { id: "south", name: "South Campus", code: "SOUTH" },
  { id: "tech", name: "Tech Campus", code: "TECH" },
]

const classes = [
  { id: "math-101", name: "Mathematics 101", grade: "9", teacher: "Ms. Johnson" },
  { id: "eng-102", name: "English Literature", grade: "10", teacher: "Mr. Smith" },
  { id: "sci-201", name: "Physics Advanced", grade: "11", teacher: "Dr. Wilson" },
  { id: "hist-301", name: "World History", grade: "12", teacher: "Ms. Davis" },
]

const guardianRelationships = ["Father", "Mother", "Guardian", "Grandfather", "Grandmother", "Uncle", "Aunt", "Other"]

export default function CreateStudentPage() {
  const router = useRouter()
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const [guardians, setGuardians] = useState([
    { name: "", relationship: "", phone: "", email: "", address: "", occupation: "" },
  ])

  const addGuardian = () => {
    setGuardians([...guardians, { name: "", relationship: "", phone: "", email: "", address: "", occupation: "" }])
  }

  const removeGuardian = (index: number) => {
    if (guardians.length > 1) {
      setGuardians(guardians.filter((_, i) => i !== index))
    }
  }

  const updateGuardian = (index: number, field: string, value: string) => {
    const updated = guardians.map((guardian, i) => (i === index ? { ...guardian, [field]: value } : guardian))
    setGuardians(updated)
  }

  const toggleClass = (classId: string) => {
    setSelectedClasses((prev) => (prev.includes(classId) ? prev.filter((id) => id !== classId) : [...prev, classId]))
  }

  const handleCancel = () => {
    router.push("/students")
  }

  return (
    <>
      <Sidebar />
      <DashboardHeader />
      <MainContent>
        <div className="space-y-6 pt-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/students">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Students
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Student</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Create a comprehensive student profile</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Student
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="Enter first name" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Enter last name" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                      <Input id="dateOfBirth" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input id="studentId" placeholder="Auto-generated" disabled />
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input id="nationality" placeholder="Enter nationality" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="w-5 h-5 mr-2" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Enter phone number" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="Enter email address" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Home Address *</Label>
                    <Textarea id="address" placeholder="Enter complete home address" rows={3} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" placeholder="Enter city" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" placeholder="Enter state" />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input id="zipCode" placeholder="Enter ZIP code" />
                    </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="branch">Branch *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name} ({branch.code})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade Level *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select grade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="k">Kindergarten</SelectItem>
                          <SelectItem value="1">Grade 1</SelectItem>
                          <SelectItem value="2">Grade 2</SelectItem>
                          <SelectItem value="3">Grade 3</SelectItem>
                          <SelectItem value="4">Grade 4</SelectItem>
                          <SelectItem value="5">Grade 5</SelectItem>
                          <SelectItem value="6">Grade 6</SelectItem>
                          <SelectItem value="7">Grade 7</SelectItem>
                          <SelectItem value="8">Grade 8</SelectItem>
                          <SelectItem value="9">Grade 9</SelectItem>
                          <SelectItem value="10">Grade 10</SelectItem>
                          <SelectItem value="11">Grade 11</SelectItem>
                          <SelectItem value="12">Grade 12</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admissionDate">Admission Date *</Label>
                      <Input id="admissionDate" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024-2025">2024-2025</SelectItem>
                          <SelectItem value="2025-2026">2025-2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Enrolled Classes</Label>
                    <div className="mt-2 space-y-2">
                      {classes.map((classItem) => (
                        <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={selectedClasses.includes(classItem.id)}
                              onChange={() => toggleClass(classItem.id)}
                              className="rounded"
                            />
                            <div>
                              <p className="font-medium">{classItem.name}</p>
                              <p className="text-sm text-gray-500">
                                Grade {classItem.grade} • {classItem.teacher}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guardian Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Guardian Information
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={addGuardian}>
                      <User className="w-4 h-4 mr-2" />
                      Add Guardian
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {guardians.map((guardian, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Guardian {index + 1}</h4>
                        {guardians.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeGuardian(index)}>
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={guardian.name}
                            onChange={(e) => updateGuardian(index, "name", e.target.value)}
                            placeholder="Enter guardian name"
                          />
                        </div>
                        <div>
                          <Label>Relationship *</Label>
                          <Select
                            value={guardian.relationship}
                            onValueChange={(value) => updateGuardian(index, "relationship", value)}
                          >
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
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Phone Number *</Label>
                          <Input
                            value={guardian.phone}
                            onChange={(e) => updateGuardian(index, "phone", e.target.value)}
                            placeholder="Enter phone number"
                          />
                        </div>
                        <div>
                          <Label>Email Address</Label>
                          <Input
                            value={guardian.email}
                            onChange={(e) => updateGuardian(index, "email", e.target.value)}
                            placeholder="Enter email address"
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Occupation</Label>
                        <Input
                          value={guardian.occupation}
                          onChange={(e) => updateGuardian(index, "occupation", e.target.value)}
                          placeholder="Enter occupation"
                        />
                      </div>
                    </div>
                  ))}
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
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContact">Emergency Contact</Label>
                    <Input id="emergencyContact" placeholder="Emergency contact name and phone" />
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea id="notes" placeholder="Any additional information about the student" rows={3} />
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
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-gray-500 text-center">Recommended: Square image, max 2MB</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Student Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="status">Enrollment Status</Label>
                    <Select defaultValue="active">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="graduated">Graduated</SelectItem>
                        <SelectItem value="transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="transportMode">Transportation</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school-bus">School Bus</SelectItem>
                        <SelectItem value="private-transport">Private Transport</SelectItem>
                        <SelectItem value="walking">Walking</SelectItem>
                        <SelectItem value="public-transport">Public Transport</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="lunchProgram">Lunch Program</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lunch option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="school-lunch">School Lunch</SelectItem>
                        <SelectItem value="home-lunch">Home Lunch</SelectItem>
                        <SelectItem value="free-lunch">Free Lunch Program</SelectItem>
                        <SelectItem value="reduced-lunch">Reduced Price Lunch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Classes Summary */}
              {selectedClasses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Selected Classes ({selectedClasses.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedClasses.map((classId) => {
                        const classItem = classes.find((c) => c.id === classId)
                        return classItem ? (
                          <Badge key={classId} variant="outline" className="w-full justify-start">
                            {classItem.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </MainContent>
    </>
  )
}
