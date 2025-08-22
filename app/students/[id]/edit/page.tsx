"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { MainContent } from "@/components/main-content"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react"

// Mock student data - in real app this would come from API
const initialStudentData = {
  id: 1,
  name: "Alice Johnson",
  email: "alice.johnson@email.com",
  phone: "+1 234-567-8901",
  grade: "10th Grade",
  class: "A",
  status: "Active",
  studentId: "STU-2024-001",
  dateOfBirth: "2008-03-15",
  gender: "Female",
  nationality: "American",
  address: "123 Oak Street, Springfield, IL 62701",
  enrollmentDate: "2023-09-01",
  branch: "Main Campus",
  medicalInfo: "No known allergies",
  emergencyContact: "+1 234-567-8903",
  guardians: [
    {
      name: "Mary Johnson",
      relationship: "Mother",
      phone: "+1 234-567-8901",
      email: "mary.johnson@email.com",
      occupation: "Teacher",
    },
    {
      name: "Robert Johnson",
      relationship: "Father",
      phone: "+1 234-567-8902",
      email: "robert.johnson@email.com",
      occupation: "Engineer",
    },
  ],
}

export default function EditStudentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState(initialStudentData)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleGuardianChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      guardians: prev.guardians.map((guardian, i) => (i === index ? { ...guardian, [field]: value } : guardian)),
    }))
  }

  const addGuardian = () => {
    setFormData((prev) => ({
      ...prev,
      guardians: [
        ...prev.guardians,
        {
          name: "",
          relationship: "",
          phone: "",
          email: "",
          occupation: "",
        },
      ],
    }))
  }

  const removeGuardian = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      guardians: prev.guardians.filter((_, i) => i !== index),
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    router.push(`/students/${params.id}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />

      <MainContent>
        <DashboardHeader />

        <main className="container mx-auto px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={() => router.push(`/students/${params.id}`)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Profile
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Edit Student</h1>
                  <p className="text-muted-foreground">Update student information</p>
                </div>
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>

            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={formData.studentId}
                        onChange={(e) => handleInputChange("studentId", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="gender">Gender</Label>
                      <Select value={formData.gender} onValueChange={(value) => handleInputChange("gender", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="nationality">Nationality</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality}
                        onChange={(e) => handleInputChange("nationality", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange("emergencyContact", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="medicalInfo">Medical Information</Label>
                    <Textarea
                      id="medicalInfo"
                      value={formData.medicalInfo}
                      onChange={(e) => handleInputChange("medicalInfo", e.target.value)}
                      rows={3}
                      placeholder="Any medical conditions, allergies, or special requirements"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Academic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="branch">Branch</Label>
                      <Select value={formData.branch} onValueChange={(value) => handleInputChange("branch", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Main Campus">Main Campus</SelectItem>
                          <SelectItem value="North Branch">North Branch</SelectItem>
                          <SelectItem value="South Branch">South Branch</SelectItem>
                          <SelectItem value="East Branch">East Branch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="grade">Grade</Label>
                      <Select value={formData.grade} onValueChange={(value) => handleInputChange("grade", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9th Grade">9th Grade</SelectItem>
                          <SelectItem value="10th Grade">10th Grade</SelectItem>
                          <SelectItem value="11th Grade">11th Grade</SelectItem>
                          <SelectItem value="12th Grade">12th Grade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="class">Class</Label>
                      <Select value={formData.class} onValueChange={(value) => handleInputChange("class", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                          <SelectItem value="D">D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="enrollmentDate">Enrollment Date</Label>
                      <Input
                        id="enrollmentDate"
                        type="date"
                        value={formData.enrollmentDate}
                        onChange={(e) => handleInputChange("enrollmentDate", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Suspended">Suspended</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guardian Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Guardian Information</CardTitle>
                    <Button variant="outline" size="sm" onClick={addGuardian}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Guardian
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {formData.guardians.map((guardian, index) => (
                    <div key={index} className="space-y-4">
                      {index > 0 && <Separator />}
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Guardian {index + 1}</h4>
                        {formData.guardians.length > 1 && (
                          <Button variant="ghost" size="sm" onClick={() => removeGuardian(index)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`guardian-name-${index}`}>Name</Label>
                          <Input
                            id={`guardian-name-${index}`}
                            value={guardian.name}
                            onChange={(e) => handleGuardianChange(index, "name", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`guardian-relationship-${index}`}>Relationship</Label>
                          <Select
                            value={guardian.relationship}
                            onValueChange={(value) => handleGuardianChange(index, "relationship", value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Father">Father</SelectItem>
                              <SelectItem value="Mother">Mother</SelectItem>
                              <SelectItem value="Guardian">Guardian</SelectItem>
                              <SelectItem value="Grandparent">Grandparent</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`guardian-phone-${index}`}>Phone</Label>
                          <Input
                            id={`guardian-phone-${index}`}
                            value={guardian.phone}
                            onChange={(e) => handleGuardianChange(index, "phone", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`guardian-email-${index}`}>Email</Label>
                          <Input
                            id={`guardian-email-${index}`}
                            type="email"
                            value={guardian.email}
                            onChange={(e) => handleGuardianChange(index, "email", e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <Label htmlFor={`guardian-occupation-${index}`}>Occupation</Label>
                          <Input
                            id={`guardian-occupation-${index}`}
                            value={guardian.occupation}
                            onChange={(e) => handleGuardianChange(index, "occupation", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </MainContent>
    </div>
  )
}
