'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { 
  User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Trash2,
  Globe, Building, FileText, Star, Shield, AlertCircle, CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import VerificationModal from '@/components/VerificationModal'

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  emailVerified: Date | null
  phoneVerified: boolean
  createdAt: Date
  profile: {
    firstName: string | null
    lastName: string | null
    phone: string | null
    bio: string | null
    location: string | null
    address: string | null
    city: string | null
    state: string | null
    zipCode: string | null
    country: string | null
    dateOfBirth: Date | null
    gender: string | null
    website: string | null
    companyName: string | null
    businessLicense: string | null
  } | null
  _count: {
    listings: number
    rentalListings: number
    favorites: number
    reviews: number
  }
  averageRating: number
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth(true) // Require authentication
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    bio: '',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    dateOfBirth: '',
    gender: '',
    website: '',
    companyName: '',
    businessLicense: ''
  })
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean
    type: 'email' | 'phone'
  }>({ isOpen: false, type: 'email' })

  // Fetch profile data
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfileData()
    }
  }, [isAuthenticated, user])

  const fetchProfileData = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
        // Initialize form data
        setFormData({
          firstName: data.profile?.firstName || '',
          lastName: data.profile?.lastName || '',
          phone: data.profile?.phone || '',
          bio: data.profile?.bio || '',
          location: data.profile?.location || '',
          address: data.profile?.address || '',
          city: data.profile?.city || '',
          state: data.profile?.state || '',
          zipCode: data.profile?.zipCode || '',
          country: data.profile?.country || '',
          dateOfBirth: data.profile?.dateOfBirth ? new Date(data.profile.dateOfBirth).toISOString().split('T')[0] : '',
          gender: data.profile?.gender || '',
          website: data.profile?.website || '',
          companyName: data.profile?.companyName || '',
          businessLicense: data.profile?.businessLicense || ''
        })
      } else {
        toast.error('Failed to load profile data')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return
    
    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', avatarFile)
      
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        toast.success('Avatar updated successfully!')
        setAvatarFile(null)
        setAvatarPreview(null)
        // Refresh the page to show updated avatar
        window.location.reload()
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to upload avatar')
      }
    } catch (error) {
      toast.error('Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleAvatarRemove = async () => {
    try {
      const response = await fetch('/api/user/avatar', {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Avatar removed successfully!')
        window.location.reload()
      } else {
        toast.error('Failed to remove avatar')
      }
    } catch (error) {
      toast.error('Failed to remove avatar')
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString() : null
        }),
      })

      if (response.ok) {
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        await fetchProfileData() // Refresh profile data
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('An error occurred while updating profile')
    }
  }

  const handleCancel = () => {
    if (profileData) {
      setFormData({
        firstName: profileData.profile?.firstName || '',
        lastName: profileData.profile?.lastName || '',
        phone: profileData.profile?.phone || '',
        bio: profileData.profile?.bio || '',
        location: profileData.profile?.location || '',
        address: profileData.profile?.address || '',
        city: profileData.profile?.city || '',
        state: profileData.profile?.state || '',
        zipCode: profileData.profile?.zipCode || '',
        country: profileData.profile?.country || '',
        dateOfBirth: profileData.profile?.dateOfBirth ? new Date(profileData.profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profileData.profile?.gender || '',
        website: profileData.profile?.website || '',
        companyName: profileData.profile?.companyName || '',
        businessLicense: profileData.profile?.businessLicense || ''
      })
    }
    setIsEditing(false)
  }

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user || !profileData) {
    return null // useAuth hook will redirect to sign-in
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : user.image ? (
                      <Image
                        src={user.image}
                        alt={user.name || 'User'}
                        width={80}
                        height={80}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-primary-600" />
                    )}
                  </div>
                  
                  {/* Avatar Upload Controls */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex space-x-1">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Change avatar"
                      >
                        <Camera className="w-4 h-4 text-gray-700" />
                      </button>
                      {(user.image || avatarPreview) && (
                        <button
                          onClick={handleAvatarRemove}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                          title="Remove avatar"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>
                
                {/* Avatar Upload Actions */}
                {avatarFile && (
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? 'Uploading...' : 'Upload'}
                    </button>
                    <button
                      onClick={() => {
                        setAvatarFile(null)
                        setAvatarPreview(null)
                      }}
                      className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {profileData.profile?.firstName && profileData.profile?.lastName 
                      ? `${profileData.profile.firstName} ${profileData.profile.lastName}`
                      : profileData.name || 'User Profile'
                    }
                  </h1>
                  <p className="text-gray-500">{profileData.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="inline-block px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full">
                      {profileData.role?.toLowerCase().replace('_', ' ')}
                    </span>
                    {profileData.emailVerified && profileData.phoneVerified ? (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        <Shield className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>Unverified</span>
                      </span>
                    )}
                    {profileData.averageRating > 0 && (
                      <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{profileData.averageRating.toFixed(1)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {(!profileData.emailVerified || !profileData.phoneVerified) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Account Verification Required</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {!profileData.emailVerified && !profileData.phoneVerified
                    ? 'Please verify your email and phone number to unlock all features.'
                    : !profileData.emailVerified
                    ? 'Please verify your email address to unlock all features.'
                    : 'Please verify your phone number to unlock all features.'
                  }
                </p>
                <a
                  href="/verification"
                  className="inline-flex items-center space-x-1 text-sm text-yellow-800 hover:text-yellow-900 font-medium mt-2"
                >
                  <span>Complete Verification</span>
                  <CheckCircle className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Profile Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.firstName || 'Not provided'}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.lastName || 'Not provided'}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-900">{profileData.email}</p>
                    {profileData.emailVerified ? (
                      <CheckCircle className="w-4 h-4 text-green-600" title="Email verified" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" title="Email not verified" />
                    )}
                  </div>
                  {!profileData.emailVerified && (
                    <button
                      onClick={() => setVerificationModal({ isOpen: true, type: 'email' })}
                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                    >
                      Verify Email
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-gray-900">{profileData.profile?.phone || 'Not provided'}</p>
                      {profileData.profile?.phone && (
                        profileData.phoneVerified ? (
                          <CheckCircle className="w-4 h-4 text-green-600" title="Phone verified" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-yellow-600" title="Phone not verified" />
                        )
                      )}
                    </div>
                    {profileData.profile?.phone && !profileData.phoneVerified && (
                      <button
                        onClick={() => setVerificationModal({ isOpen: true, type: 'phone' })}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                      >
                        Verify Phone
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date of Birth
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.profile?.dateOfBirth 
                      ? new Date(profileData.profile.dateOfBirth).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })
                      : 'Not provided'
                    }
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="text-gray-900">
                    {profileData.profile?.gender 
                      ? profileData.profile.gender.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
                      : 'Not provided'
                    }
                  </p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="City, State"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.location || 'Not provided'}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Street address"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.address || 'Not provided'}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.city || 'Not provided'}</p>
                )}
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.state || 'Not provided'}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.zipCode || 'Not provided'}</p>
                )}
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.country || 'Not provided'}</p>
                )}
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="w-4 h-4 inline mr-2" />
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                ) : (
                  <p className="text-gray-900">
                    {profileData.profile?.website ? (
                      <a 
                        href={profileData.profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 underline"
                      >
                        {profileData.profile.website}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building className="w-4 h-4 inline mr-2" />
                  Company Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.companyName || 'Not provided'}</p>
                )}
              </div>

              {/* Business License */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Business License
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="businessLicense"
                    value={formData.businessLicense}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="License number or ID"
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.businessLicense || 'Not provided'}</p>
                )}
              </div>

              {/* Member Since */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Member Since
                </label>
                <p className="text-gray-900">
                  {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'Unknown'}
                </p>
              </div>

              {/* Bio */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-gray-900">{profileData.profile?.bio || 'No bio provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Statistics */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sale Listings</h3>
            <p className="text-3xl font-bold text-primary-600">{profileData._count.listings}</p>
            <p className="text-sm text-gray-500">Cars for sale</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rental Listings</h3>
            <p className="text-3xl font-bold text-green-600">{profileData._count.rentalListings}</p>
            <p className="text-sm text-gray-500">Cars for rent</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Saved Cars</h3>
            <p className="text-3xl font-bold text-blue-600">{profileData._count.favorites}</p>
            <p className="text-sm text-gray-500">Favorites</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reviews</h3>
            <div className="flex items-center space-x-2">
              <p className="text-3xl font-bold text-yellow-600">{profileData._count.reviews}</p>
              {profileData.averageRating > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-lg font-semibold text-gray-900">{profileData.averageRating.toFixed(1)}</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-500">Received</p>
          </div>
        </div>
      </div>

      {/* Verification Modal */}
      <VerificationModal
        isOpen={verificationModal.isOpen}
        onClose={() => setVerificationModal({ isOpen: false, type: 'email' })}
        type={verificationModal.type}
        currentValue={verificationModal.type === 'email' ? profileData?.email : profileData?.profile?.phone}
        onSuccess={() => {
          // Refresh profile data after successful verification
          fetchProfileData()
        }}
      />
    </div>
  )
}