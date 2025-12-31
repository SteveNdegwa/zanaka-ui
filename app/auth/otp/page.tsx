"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { GraduationCap, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { authRequests } from "@/lib/requests/auth"
import { useUserProfileStore } from "@/store/store"
import { useToast } from "@/src/use-toast"

export default function OTPPage() {
  const [otp, setOtp] = useState(["", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const setUserProfileData = useUserProfileStore((state) => state.setUserProfile)

  // Timer for resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendTimer])

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Prevent multiple characters

    const newOtp = [...otp]
    newOtp[index] = value

    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").slice(0, 4)
    const newOtp = pastedData.split("").concat(Array(4).fill("")).slice(0, 4)
    setOtp(newOtp)

    const lastFilledIndex = newOtp.findIndex((digit) => !digit)
    const focusIndex = lastFilledIndex === -1 ? 3 : Math.max(0, lastFilledIndex - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.some((digit) => !digit)) return

    setIsLoading(true)

    try {
      const payload = { code: otp.join("") }
      const res = await authRequests.verifyLoginOTP(payload)

      if (res.success && res.data) {
        const userProfile = res.data.user_profile
        setUserProfileData(userProfile)

        toast.success("Login successful!", {
          description: "OTP verified successfully.",
          duration: 5000,
        })

        const next = searchParams.get("next") || "/"
        const needsPasswordReset = userProfile?.force_pass_reset

        if (needsPasswordReset) {
          router.push("/auth/update-password")
        } else {
          router.push(next)
        }
      } else {
        toast.error("OTP verification error!", {
          description: res.error || "Unable to verify OTP.",
        })
      }
    } catch (err) {
      toast.error("OTP verification error!", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setResendLoading(true)

    try {
      const res = await authRequests.resendLoginOTP()
      if (res.success) {
        toast.success("OTP Sent", {
          description: "A new OTP has been sent to your email. Please check and verify.",
          duration: 5000,
        })
      } else {
        toast.error("Failed to Resend OTP", {
          description: res.error || "We couldn't send a new OTP. Please try again.",
          duration: 5000,
        })
      }
    } catch (err) {
      toast.error("Failed to Resend OTP", {
        description: "Something went wrong. Please try again.",
      })
    } finally {
      setResendLoading(false)
      setCanResend(false)
      setResendTimer(60)
      setOtp(["", "", "", ""])
      inputRefs.current[0]?.focus()
    }
  }

  const isOtpComplete = otp.every((digit) => digit !== "")

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

        {/* OTP Verification Card */}
        <Card className="border-border shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Verify Your Identity</CardTitle>
            <CardDescription>
              Enter the 4-digit verification code sent to your registered contact method
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              {/* OTP Input Fields */}
              <div className="flex justify-center gap-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-14 h-14 text-center text-2xl font-bold border-2 border-border rounded-lg bg-input focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {/* Verify Button */}
              <Button type="submit" className="w-full" disabled={!isOtpComplete || isLoading}>
                {isLoading ? "Verifying..." : "Verify Code"}
              </Button>

              {/* Resend Code */}
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">{"Didn't receive the code?"}</p>
                {canResend ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleResendCode}
                    disabled={resendLoading}
                    className="text-primary hover:text-primary/80"
                  >
                    {resendLoading ? "Sending..." : "Resend Code"}
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">Resend code in {resendTimer}s</p>
                )}
              </div>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
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
