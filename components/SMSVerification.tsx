"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "react-hot-toast"
import { Phone, Shield, CheckCircle } from "lucide-react"

interface SMSVerificationProps {
  phone?: string
  phoneVerified?: Date | null
  onVerificationComplete?: () => void
}

export default function SMSVerification({ 
  phone, 
  phoneVerified, 
  onVerificationComplete 
}: SMSVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState(phone || "")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [countdown, setCountdown] = useState(0)

  const startCountdown = () => {
    setCountdown(60)
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleSendCode = async () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter your phone number")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/auth/send-sms-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: phoneNumber }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Verification code sent to your phone!")
        setIsCodeSent(true)
        setPhoneNumber(data.phone) // Use formatted phone number
        startCountdown()
      } else {
        toast.error(data.error || "Failed to send verification code")
      }
    } catch (error) {
      console.error("Send SMS error:", error)
      toast.error("Failed to send verification code")
    } finally {
      setIsSending(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      toast.error("Please enter the 6-digit verification code")
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch("/api/auth/verify-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: verificationCode }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Phone number verified successfully!")
        setIsCodeSent(false)
        setVerificationCode("")
        onVerificationComplete?.()
      } else {
        toast.error(data.error || "Invalid verification code")
      }
    } catch (error) {
      console.error("SMS verification error:", error)
      toast.error("Failed to verify code")
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendCode = () => {
    setVerificationCode("")
    handleSendCode()
  }

  if (phoneVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Phone Verification
          </CardTitle>
          <CardDescription>
            Your phone number is verified and secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">{phone}</span>
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Verified on {new Date(phoneVerified).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone number to enhance account security and enable SMS notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isCodeSent ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                placeholder="e.g., +254712345678 or 0712345678"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your Kenyan phone number. We support Safaricom, Airtel, and Telkom networks.
              </p>
            </div>
            <Button 
              onClick={handleSendCode} 
              disabled={isSending || !phoneNumber.trim()}
              className="w-full"
            >
              {isSending ? "Sending..." : "Send Verification Code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                We've sent a 6-digit verification code to <strong>{phoneNumber}</strong>
              </p>
              <p className="text-xs text-blue-600 mt-1">
                The code will expire in 10 minutes.
              </p>
            </div>
            
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Verification Code
              </label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyCode} 
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1"
              >
                {isVerifying ? "Verifying..." : "Verify Code"}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleResendCode}
                disabled={countdown > 0 || isSending}
                className="flex-1"
              >
                {countdown > 0 ? `Resend (${countdown}s)` : "Resend Code"}
              </Button>
            </div>
            
            <Button 
              variant="ghost" 
              onClick={() => {
                setIsCodeSent(false)
                setVerificationCode("")
                setCountdown(0)
              }}
              className="w-full text-sm"
            >
              Change Phone Number
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}