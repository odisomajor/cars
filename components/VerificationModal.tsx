'use client'

import { useState } from 'react'
import { X, Mail, Phone, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface VerificationModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'email' | 'phone'
  currentValue?: string
  onSuccess?: () => void
}

export default function VerificationModal({
  isOpen,
  onClose,
  type,
  currentValue,
  onSuccess
}: VerificationModalProps) {
  const [step, setStep] = useState<'input' | 'verify'>('input')
  const [value, setValue] = useState(currentValue || '')
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendCode = async () => {
    if (!value.trim()) {
      setError(`${type === 'email' ? 'Email address' : 'Phone number'} is required`)
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          action: 'send',
          [type]: value
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        setStep('verify')
      } else {
        setError(data.error || 'Failed to send verification code')
      }
    } catch (error) {
      console.error('Error sending verification code:', error)
      setError('Failed to send verification code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      setError('Verification code is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/user/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          action: 'verify',
          code,
          [type]: value
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(data.message)
        onSuccess?.()
        onClose()
      } else {
        setError(data.error || 'Invalid verification code')
      }
    } catch (error) {
      console.error('Error verifying code:', error)
      setError('Failed to verify code')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setStep('input')
    setValue(currentValue || '')
    setCode('')
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {type === 'email' ? (
              <Mail className="w-6 h-6 text-blue-600" />
            ) : (
              <Phone className="w-6 h-6 text-green-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-900">
              Verify {type === 'email' ? 'Email Address' : 'Phone Number'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'input' ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Enter your {type === 'email' ? 'email address' : 'phone number'} to receive a verification code.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {type === 'email' ? 'Email Address' : 'Phone Number'}
                </label>
                <input
                  type={type === 'email' ? 'email' : 'tel'}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === 'email' ? 'your@email.com' : '+1234567890'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleSendCode}
                disabled={isLoading || !value.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Verification Code</span>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <p className="text-gray-600">
                  We've sent a 6-digit verification code to:
                </p>
                <p className="font-medium text-gray-900 mt-1">{value}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
                  disabled={isLoading}
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={handleVerifyCode}
                  disabled={isLoading || code.length !== 6}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify Code</span>
                  )}
                </button>

                <button
                  onClick={() => setStep('input')}
                  className="w-full text-blue-600 hover:text-blue-700 py-2 text-sm"
                  disabled={isLoading}
                >
                  Change {type === 'email' ? 'Email Address' : 'Phone Number'}
                </button>
              </div>

              <div className="text-center">
                <button
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="text-sm text-gray-600 hover:text-gray-800 underline"
                >
                  Didn't receive the code? Resend
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}