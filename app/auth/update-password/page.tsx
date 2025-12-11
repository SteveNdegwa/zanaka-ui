"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraduationCap, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { usersRequests } from "@/lib/requests/users"
import { useToast } from "@/src/use-toast"

export default function UpdatePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const validatePassword = (password: string): string[] => {
    const validationErrors: string[] = []

    if (password.length < 8) {
      validationErrors.push("Password must be at least 8 characters long")
    }
    if (!/[A-Z]/.test(password)) {
      validationErrors.push("Password must contain at least one uppercase letter")
    }
    if (!/[a-z]/.test(password)) {
      validationErrors.push("Password must contain at least one lowercase letter")
    }
    if (!/\d/.test(password)) {
      validationErrors.push("Password must contain at least one number")
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      validationErrors.push("Password must contain at least one special character")
    }

    return validationErrors
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors([])

    // Validate passwords
    const validationErrors: string[] = []

    if (!currentPassword) {
      validationErrors.push("Current password is required")
    }

    if (!newPassword) {
      validationErrors.push("New password is required")
    } else {
      validationErrors.push(...validatePassword(newPassword))
    }

    if (newPassword !== confirmPassword) {
      validationErrors.push("New passwords do not match")
    }

    if (currentPassword === newPassword) {
      validationErrors.push("New password must be different from current password")
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)

    try {      
      const payload = {
        current_password: currentPassword,
        new_password: newPassword,
      }
      const res = await usersRequests.changePassword(payload)
      if (res.success) {
        toast.success("Password Updated", {
          description: "Your password has been changed successfully.",
          duration: 5000,
        });
        router.push("/")
      } else {
         toast.error("Password Update Failed", {
          description: res.error || "We could not update your password. Please try again.",
          duration: 5000,
       });
      }
    } catch (err) {
      toast.error("Password Update Failed", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getPasswordStrength = (password: string) => {
    const errors = validatePassword(password)
    if (password.length === 0) return { strength: 0, label: "", color: "" }
    if (errors.length === 0) return { strength: 100, label: "Strong", color: "text-green-600" }
    if (errors.length <= 2) return { strength: 75, label: "Good", color: "text-blue-600" }
    if (errors.length <= 3) return { strength: 50, label: "Fair", color: "text-yellow-600" }
    return { strength: 25, label: "Weak", color: "text-red-600" }
  }

  const passwordStrength = getPasswordStrength(newPassword)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header with theme toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduPortal</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Update Password Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Update Password</CardTitle>
            <CardDescription>You must update your temporary password to continue</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Important Notice */}
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                For security reasons, you must update your temporary password before accessing the system.
              </AlertDescription>
            </Alert>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="current-password" className="text-sm font-medium">
                  Current (Temporary) Password
                </Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showCurrentPassword ? "text" : "password"}
                    placeholder="Enter your temporary password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="bg-input pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="bg-input pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Password strength:</span>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>{passwordStrength.label}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.strength >= 75
                            ? "bg-green-500"
                            : passwordStrength.strength >= 50
                              ? "bg-blue-500"
                              : passwordStrength.strength >= 25
                                ? "bg-yellow-500"
                                : "bg-red-500"
                        }`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="bg-input pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="flex items-center gap-2">
                    {newPassword === confirmPassword ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Passwords match</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">Passwords do not match</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium text-foreground mb-2">Password Requirements:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                </ul>
              </div>

              {/* Error Messages */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Update Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Updating Password..." : "Update Password"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2024 EduPortal. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
