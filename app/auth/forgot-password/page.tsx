"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraduationCap, ArrowLeft, CheckCircle } from "lucide-react"
import Link from "next/link"
import { usersRequests } from "@/lib/requests/users"
import { useToast } from "@/src/use-toast"

export default function ForgotPasswordPage() {
  const [credential, setCredential] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {      
      const payload = {credential: credential}
      const res = await usersRequests.forgotPassword(payload)
      if (res.success) {
           toast.success("New Password Sent", {
          description: "A new temporary password has been sent to your email.",
          duration: 5000,
        });
        setIsSuccess(true)
      } else {
        toast.error("Failed to Send Password", {
          description: res.error || "We couldn't send a new password. Please try again in a few minutes.",
          duration: 5000,
        });
      }
    } catch (err) {
     toast.error("Failed to Send Password", {
        description: "Something went wrong. Please try again.",
        duration: 5000,
      });
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackToLogin = () => {
    router.push("/auth")
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">EduPortal</h1>
            </div>
            <ThemeToggle />
          </div>

          {/* Success Card */}
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold">New Password Sent</CardTitle>
              <CardDescription>
                Check your email for the new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleBackToLogin} className="w-full">
                Back to Login
              </Button>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            © 2024 EduPortal
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">EduPortal</h1>
          </div>
          <ThemeToggle />
        </div>

        {/* Forgot Password Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold mb-4">Reset Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleResetPassword} className="space-y-9">
              <div className="space-y-2">
                <Label htmlFor="username">Username / Reg Number</Label>
                <Input
                  id="credential"
                  type="text"
                  placeholder="Username or reg number"
                  value={credential}
                  onChange={(e) => setCredential(e.target.value)}
                  required
                  className="bg-input"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Processing..." : "Send New Password"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          © 2024 EduPortal
        </div>
      </div>
    </div>
  )
}
