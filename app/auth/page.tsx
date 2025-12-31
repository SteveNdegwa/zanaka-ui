"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraduationCap, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { authRequests } from "@/lib/requests/auth"
import { useUserProfileStore } from "@/store/store"
import { useToast } from "@/src/use-toast"

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const setUserProfileData = useUserProfileStore((state) => state.setUserProfile)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        credential: identifier,
        password: password,
      }

      const res = await authRequests.login(payload)

      if (res.success && res.data) {
        const next = searchParams.get("next") || "/"

        /**
         * identity_status === "ACTIVE"
         *  -> User is fully authenticated, no 2FA required
         *
         * identity_status !== "ACTIVE"
         *  -> 2FA is enabled, OTP verification required
         */
        if (res.data.identity_status === "ACTIVE") {
          setUserProfileData(res.data.user_profile)

          toast.success("Login successful!", {
            description: "You have successfully logged in.",
            duration: 5000,
          })

          router.push(next)
        } else {
          toast.success("OTP verification required", {
            description: "A one-time password has been sent to your email. Please verify to continue.",
            duration: 5000,
          })

          router.push(next ? `/auth/otp?next=${encodeURIComponent(next)}` : "/auth/otp")
        }
      } else {
        toast.error("Login failed", {
          description: res.error || "Unable to login.",
        })
      }
    } catch (err) {
      toast.error("Login failed", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
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

        {/* Login Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your school management portal
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Identifier */}
              <div className="space-y-2">
                <Label htmlFor="identifier">Username / Registration Number</Label>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="Enter username or registration number"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="bg-input"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Login Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              {/* Forgot Password */}
              <div className="text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot your password?
                </Link>
              </div>
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
