'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'
import { 
  Mail, 
  Phone, 
  CheckCircle, 
  XCircle, 
  Send, 
  Loader2,
  AlertCircle,
  Shield
} from 'lucide-react'

interface VerificationStatus {
  emailVerified: boolean
  phoneVerified: boolean
  phone?: string
}

export default function VerificationPage() {
  const { user, isAuthenticated, isLoading } = useAuth(true)
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingEmail, setSendingEmail] = useState(false)
  const [sendingSMS, setSendingSMS] = useState(false)
  const [emailCode, setEmailCode] = useState('')
  const [smsCode, setSmsCode] = useState('')
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingSMS, setVerifyingSMS] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchVerificationStatus()
    }
  }, [isAuthenticated, user])

  const fetchVerificationStatus = async () => {
    try {
      const response = await fetch('/api/user/verification')
      if (response.ok) {
        const data = await response.json()
        setVerificationStatus(data)
      } else {
        setMessage({ type: 'error', text: 'Failed to load verification status' })
      }
    } catch (error) {
      console.error('Error fetching verification status:', error)
      setMessage({ type: 'error', text: 'Failed to load verification status' })
    } finally {
      setLoading(false)
    }
  }

  const sendEmailVerification = async () => {
    setSendingEmail(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/user/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'email' }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Verification email sent! Please check your inbox.' })
        setEmailSent(true)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send verification email' })
      }
    } catch (error) {
      console.error('Error sending email verification:', error)
      setMessage({ type: 'error', text: 'Failed to send verification email' })
    } finally {
      setSendingEmail(false)
    }
  }

  const sendSMSVerification = async () => {
    setSendingSMS(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/user/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'phone' }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Verification code sent to your phone!' })
        setSmsSent(true)
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to send SMS verification' })
      }
    } catch (error) {
      console.error('Error sending SMS verification:', error)
      setMessage({ type: 'error', text: 'Failed to send SMS verification' })
    } finally {
      setSendingSMS(false)
    }
  }

  const verifyEmail = async () => {
    if (!emailCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter the verification code' })
      return
    }

    setVerifyingEmail(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: emailCode }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Email verified successfully!' })
        setVerificationStatus(prev => prev ? { ...prev, emailVerified: true } : null)
        setEmailCode('')
        setEmailSent(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid verification code' })
      }
    } catch (error) {
      console.error('Error verifying email:', error)
      setMessage({ type: 'error', text: 'Failed to verify email' })
    } finally {
      setVerifyingEmail(false)
    }
  }

  const verifySMS = async () => {
    if (!smsCode.trim() || smsCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit code' })
      return
    }

    setVerifyingSMS(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/auth/verify-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: smsCode }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Phone number verified successfully!' })
        setVerificationStatus(prev => prev ? { ...prev, phoneVerified: true } : null)
        setSmsCode('')
        setSmsSent(false)
      } else {
        setMessage({ type: 'error', text: data.error || 'Invalid verification code' })
      }
    } catch (error) {
      console.error('Error verifying SMS:', error)
      setMessage({ type: 'error', text: 'Failed to verify phone number' })
    } finally {
      setVerifyingSMS(false)
    }
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const isFullyVerified = verificationStatus?.emailVerified && verificationStatus?.phoneVerified

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                isFullyVerified ? 'bg-green-100' : 'bg-yellow-100'
              }`}>
                {isFullyVerified ? (
                  <Shield className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Account Verification
                </h1>
                <p className="text-gray-600 mt-1">
                  {isFullyVerified 
                    ? 'Your account is fully verified and secure!' 
                    : 'Complete your account verification to unlock all features'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center space-x-2">
              {message.type === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Email Verification */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Email Verification</h2>
                </div>
                {verificationStatus?.emailVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Email Address:</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
              
              {verificationStatus?.emailVerified ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Email verified</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Click the button below to send a verification email to your inbox.
                  </p>
                  
                  {!emailSent ? (
                    <button
                      onClick={sendEmailVerification}
                      disabled={sendingEmail}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {sendingEmail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{sendingEmail ? 'Sending...' : 'Send Verification Email'}</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          Verification email sent! Check your inbox and enter the code below.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Verification Code
                        </label>
                        <input
                          type="text"
                          value={emailCode}
                          onChange={(e) => setEmailCode(e.target.value)}
                          placeholder="Enter verification code"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={verifyEmail}
                          disabled={verifyingEmail || !emailCode.trim()}
                          className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {verifyingEmail ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>{verifyingEmail ? 'Verifying...' : 'Verify Email'}</span>
                        </button>
                        
                        <button
                          onClick={sendEmailVerification}
                          disabled={sendingEmail}
                          className="px-4 py-2 text-blue-600 hover:text-blue-700 border border-blue-300 hover:border-blue-400 rounded-lg transition-colors"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Phone Verification */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Phone className="w-6 h-6 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Phone Verification</h2>
                </div>
                {verificationStatus?.phoneVerified ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600" />
                )}
              </div>
            </div>
            <div className="p-6">
              {verificationStatus?.phone ? (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-2">Phone Number:</p>
                  <p className="font-medium text-gray-900">{verificationStatus.phone}</p>
                </div>
              ) : (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    No phone number on file. Please add a phone number in your profile first.
                  </p>
                </div>
              )}
              
              {verificationStatus?.phoneVerified ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Phone number verified</span>
                </div>
              ) : verificationStatus?.phone ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Click the button below to send a 6-digit verification code to your phone.
                  </p>
                  
                  {!smsSent ? (
                    <button
                      onClick={sendSMSVerification}
                      disabled={sendingSMS}
                      className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      {sendingSMS ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>{sendingSMS ? 'Sending...' : 'Send SMS Code'}</span>
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">
                          Verification code sent to your phone! Enter the 6-digit code below.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          6-Digit Code
                        </label>
                        <input
                          type="text"
                          value={smsCode}
                          onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="123456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-center text-lg font-mono"
                          maxLength={6}
                        />
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={verifySMS}
                          disabled={verifyingSMS || smsCode.length !== 6}
                          className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          {verifyingSMS ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          <span>{verifyingSMS ? 'Verifying...' : 'Verify Phone'}</span>
                        </button>
                        
                        <button
                          onClick={sendSMSVerification}
                          disabled={sendingSMS}
                          className="px-4 py-2 text-green-600 hover:text-green-700 border border-green-300 hover:border-green-400 rounded-lg transition-colors"
                        >
                          Resend
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <a
                    href="/profile"
                    className="inline-flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Add Phone Number</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Verification Benefits</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Enhanced Security</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Protect your account with two-factor authentication and secure communications.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Trusted Seller Badge</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Display a verified badge on your listings to build buyer confidence.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Priority Support</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get faster response times and priority assistance from our support team.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-medium text-gray-900">Full Platform Access</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Unlock all features including rental bookings and advanced listing options.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}