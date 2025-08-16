'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { AdminNavigation } from '@/components/admin/AdminNavigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'
import { 
  Building2, 
  Calendar, 
  Car, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Download, 
  Eye, 
  FileText, 
  Filter, 
  MapPin, 
  Phone, 
  RefreshCw, 
  Search, 
  Shield, 
  ShieldCheck, 
  Star, 
  User, 
  Users, 
  XCircle,
  AlertTriangle,
  Mail,
  Globe,
  Camera
} from 'lucide-react'

interface RentalCompany {
  id: string
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  website?: string
  description: string
  logo?: string
  isVerified: boolean
  verificationStatus: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  verificationDate?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    name: string
    email: string
    phone: string
    image?: string
  }
  documents: {
    id: string
    type: 'BUSINESS_LICENSE' | 'TAX_CERTIFICATE' | 'INSURANCE_CERTIFICATE' | 'ID_DOCUMENT' | 'OTHER'
    name: string
    url: string
    uploadedAt: string
    verified: boolean
  }[]
  stats: {
    totalVehicles: number
    activeListings: number
    totalBookings: number
    completedBookings: number
    averageRating: number
    totalReviews: number
    monthlyRevenue: number
    joinedDate: string
  }
}

interface CompanyStats {
  total: number
  pending: number
  underReview: number
  approved: number
  rejected: number
  suspended: number
  totalRevenue: number
  monthlyRevenue: number
}

const VERIFICATION_STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-gray-100 text-gray-800'
}

const DOCUMENT_TYPES = {
  BUSINESS_LICENSE: 'Business License',
  TAX_CERTIFICATE: 'Tax Certificate',
  INSURANCE_CERTIFICATE: 'Insurance Certificate',
  ID_DOCUMENT: 'ID Document',
  OTHER: 'Other Document'
}

export default function RentalCompanyVerification() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [companies, setCompanies] = useState<RentalCompany[]>([])
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [selectedCompany, setSelectedCompany] = useState<RentalCompany | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'ADMIN')) {
      router.push('/')
      toast.error('Access denied. Admin privileges required.')
    }
  }, [user, authLoading, router])

  // Fetch company data
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchCompanyData()
    }
  }, [user])

  const fetchCompanyData = async () => {
    try {
      setLoading(true)
      const [companiesRes, statsRes] = await Promise.all([
        fetch('/api/admin/rental-companies'),
        fetch('/api/admin/rental-companies/stats')
      ])

      if (companiesRes.ok && statsRes.ok) {
        const companiesData = await companiesRes.json()
        const statsData = await statsRes.json()
        setCompanies(companiesData.companies)
        setStats(statsData.stats)
      } else {
        toast.error('Failed to load company data')
      }
    } catch (error) {
      console.error('Error fetching company data:', error)
      toast.error('Failed to load company data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerificationAction = async (companyId: string, action: 'approve' | 'reject' | 'suspend', reason?: string) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/admin/rental-companies/${companyId}/verification`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })

      if (response.ok) {
        const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'suspended'
        toast.success(`Company ${actionText} successfully`)
        fetchCompanyData()
        setShowDetailsModal(false)
        setShowRejectModal(false)
        setRejectionReason('')
      } else {
        toast.error(`Failed to ${action} company`)
      }
    } catch (error) {
      console.error(`Error ${action}ing company:`, error)
      toast.error(`Failed to ${action} company`)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDocumentVerification = async (companyId: string, documentId: string, verified: boolean) => {
    try {
      const response = await fetch(`/api/admin/rental-companies/${companyId}/documents/${documentId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified })
      })

      if (response.ok) {
        toast.success(`Document ${verified ? 'verified' : 'unverified'} successfully`)
        fetchCompanyData()
        // Update the selected company data
        if (selectedCompany) {
          const updatedCompany = companies.find(c => c.id === companyId)
          if (updatedCompany) {
            setSelectedCompany(updatedCompany)
          }
        }
      } else {
        toast.error('Failed to update document verification')
      }
    } catch (error) {
      console.error('Error updating document verification:', error)
      toast.error('Failed to update document verification')
    }
  }

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'ALL' || company.verificationStatus === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Rental Company Verification</h1>
            <p className="text-gray-600 mt-2">Review and verify rental company applications</p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Total</p>
                      <p className="text-xl font-bold">{stats.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Pending</p>
                      <p className="text-xl font-bold">{stats.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Under Review</p>
                      <p className="text-xl font-bold">{stats.underReview}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Approved</p>
                      <p className="text-xl font-bold">{stats.approved}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Rejected</p>
                      <p className="text-xl font-bold">{stats.rejected}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Suspended</p>
                      <p className="text-xl font-bold">{stats.suspended}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Total Revenue</p>
                      <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-600">Monthly</p>
                      <p className="text-lg font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                    <SelectItem value="SUSPENDED">Suspended</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button onClick={fetchCompanyData} variant="outline">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Companies Table */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Companies ({filteredCompanies.length})</CardTitle>
              <CardDescription>Review and manage rental company verifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Company</th>
                      <th className="text-left p-4 font-medium">Owner</th>
                      <th className="text-left p-4 font-medium">Location</th>
                      <th className="text-left p-4 font-medium">Stats</th>
                      <th className="text-left p-4 font-medium">Documents</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-left p-4 font-medium">Joined</th>
                      <th className="text-left p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => {
                      const verifiedDocs = company.documents.filter(doc => doc.verified).length
                      const totalDocs = company.documents.length
                      
                      return (
                        <tr key={company.id} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div className="flex items-center">
                              {company.logo && (
                                <img 
                                  src={company.logo} 
                                  alt={company.name}
                                  className="w-10 h-10 rounded-lg mr-3 object-cover"
                                />
                              )}
                              <div>
                                <div className="flex items-center">
                                  <p className="font-medium">{company.name}</p>
                                  {company.isVerified && (
                                    <ShieldCheck className="w-4 h-4 ml-2 text-green-600" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-500">{company.email}</p>
                                {company.website && (
                                  <div className="flex items-center mt-1">
                                    <Globe className="w-3 h-3 mr-1 text-gray-400" />
                                    <a 
                                      href={company.website} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline"
                                    >
                                      Website
                                    </a>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              {company.owner.image && (
                                <img 
                                  src={company.owner.image} 
                                  alt={company.owner.name}
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                              )}
                              <div>
                                <p className="font-medium">{company.owner.name}</p>
                                <p className="text-sm text-gray-500">{company.owner.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                              <div>
                                <p className="text-sm">{company.city}</p>
                                <p className="text-xs text-gray-500">{company.country}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="text-sm">
                              <div className="flex items-center mb-1">
                                <Car className="w-3 h-3 mr-1 text-gray-400" />
                                <span>{company.stats.totalVehicles} vehicles</span>
                              </div>
                              <div className="flex items-center mb-1">
                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                <span>{company.stats.totalBookings} bookings</span>
                              </div>
                              <div className="flex items-center">
                                <Star className="w-3 h-3 mr-1 text-yellow-400" />
                                <span>{company.stats.averageRating.toFixed(1)} ({company.stats.totalReviews})</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center">
                              <FileText className="w-4 h-4 mr-1 text-gray-400" />
                              <span className="text-sm">
                                {verifiedDocs}/{totalDocs} verified
                              </span>
                              {verifiedDocs === totalDocs && totalDocs > 0 && (
                                <CheckCircle className="w-4 h-4 ml-1 text-green-600" />
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={VERIFICATION_STATUS_COLORS[company.verificationStatus]}>
                              {company.verificationStatus.replace('_', ' ')}
                            </Badge>
                            {company.rejectionReason && (
                              <p className="text-xs text-red-600 mt-1">Rejected: {company.rejectionReason}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="text-sm">{formatDate(company.createdAt)}</p>
                          </td>
                          <td className="p-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedCompany(company)
                                setShowDetailsModal(true)
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                
                {filteredCompanies.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No companies found matching your criteria.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Company Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedCompany?.name}
              {selectedCompany?.isVerified && (
                <ShieldCheck className="w-5 h-5 ml-2 text-green-600" />
              )}
            </DialogTitle>
            <DialogDescription>
              Review company details and verification documents
            </DialogDescription>
          </DialogHeader>
          
          {selectedCompany && (
            <div className="space-y-6">
              {/* Company Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Company Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      {selectedCompany.logo && (
                        <img 
                          src={selectedCompany.logo} 
                          alt={selectedCompany.name}
                          className="w-16 h-16 rounded-lg mr-4 object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h5 className="font-medium text-lg">{selectedCompany.name}</h5>
                        <p className="text-gray-600 text-sm mt-1">{selectedCompany.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedCompany.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedCompany.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{selectedCompany.address}, {selectedCompany.city}, {selectedCompany.country}</span>
                      </div>
                      {selectedCompany.website && (
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          <a 
                            href={selectedCompany.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {selectedCompany.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Owner Information</h4>
                  <div className="flex items-start">
                    {selectedCompany.owner.image && (
                      <img 
                        src={selectedCompany.owner.image} 
                        alt={selectedCompany.owner.name}
                        className="w-12 h-12 rounded-full mr-3"
                      />
                    )}
                    <div>
                      <h5 className="font-medium">{selectedCompany.owner.name}</h5>
                      <div className="space-y-1 text-sm text-gray-600 mt-2">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-2" />
                          <span>{selectedCompany.owner.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-2" />
                          <span>{selectedCompany.owner.phone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Business Stats */}
              <div>
                <h4 className="font-semibold mb-3">Business Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Car className="w-5 h-5 text-blue-600 mr-2" />
                      <div>
                        <p className="text-sm text-blue-600">Vehicles</p>
                        <p className="font-bold text-blue-800">{selectedCompany.stats.totalVehicles}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm text-green-600">Bookings</p>
                        <p className="font-bold text-green-800">{selectedCompany.stats.totalBookings}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-600 mr-2" />
                      <div>
                        <p className="text-sm text-yellow-600">Rating</p>
                        <p className="font-bold text-yellow-800">{selectedCompany.stats.averageRating.toFixed(1)}/5</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="flex items-center">
                      <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
                      <div>
                        <p className="text-sm text-purple-600">Revenue</p>
                        <p className="font-bold text-purple-800">{formatCurrency(selectedCompany.stats.monthlyRevenue)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Verification Documents */}
              <div>
                <h4 className="font-semibold mb-3">Verification Documents</h4>
                <div className="space-y-3">
                  {selectedCompany.documents.map((document) => (
                    <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center">
                        <FileText className="w-5 h-5 mr-3 text-gray-400" />
                        <div>
                          <p className="font-medium">{DOCUMENT_TYPES[document.type]}</p>
                          <p className="text-sm text-gray-500">{document.name}</p>
                          <p className="text-xs text-gray-400">Uploaded {formatDate(document.uploadedAt)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(document.url, '_blank')}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        
                        {document.verified ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentVerification(selectedCompany.id, document.id, false)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Unverify
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDocumentVerification(selectedCompany.id, document.id, true)}
                            className="text-green-600 border-green-600 hover:bg-green-50"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verify
                          </Button>
                        )}
                        
                        {document.verified && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {selectedCompany.documents.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No documents uploaded yet.
                    </div>
                  )}
                </div>
              </div>
              
              {/* Current Status */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Current Status</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Badge className={VERIFICATION_STATUS_COLORS[selectedCompany.verificationStatus]}>
                      {selectedCompany.verificationStatus.replace('_', ' ')}
                    </Badge>
                    {selectedCompany.verificationDate && (
                      <p className="text-sm text-gray-600 mt-1">
                        Last updated: {formatDate(selectedCompany.verificationDate)}
                      </p>
                    )}
                    {selectedCompany.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1">
                        Rejection reason: {selectedCompany.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {selectedCompany && (
              <>
                {selectedCompany.verificationStatus === 'PENDING' && (
                  <Button 
                    onClick={() => handleVerificationAction(selectedCompany.id, 'approve')}
                    disabled={actionLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Start Review
                  </Button>
                )}
                
                {selectedCompany.verificationStatus === 'UNDER_REVIEW' && (
                  <>
                    <Button 
                      onClick={() => handleVerificationAction(selectedCompany.id, 'approve')}
                      disabled={actionLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve Company
                    </Button>
                    <Button 
                      onClick={() => setShowRejectModal(true)}
                      disabled={actionLoading}
                      variant="destructive"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Company
                    </Button>
                  </>
                )}
                
                {selectedCompany.verificationStatus === 'APPROVED' && (
                  <>
                    <Button 
                      onClick={() => handleVerificationAction(selectedCompany.id, 'suspend', 'Suspended by admin')}
                      disabled={actionLoading}
                      variant="outline"
                      className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Suspend Company
                    </Button>
                  </>
                )}
                
                {selectedCompany.verificationStatus === 'SUSPENDED' && (
                  <Button 
                    onClick={() => handleVerificationAction(selectedCompany.id, 'approve')}
                    disabled={actionLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Reactivate Company
                  </Button>
                )}
              </>
            )}
            
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Company Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Company</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedCompany?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rejection Reason</label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rejection reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOMPLETE_DOCUMENTS">Incomplete Documents</SelectItem>
                  <SelectItem value="INVALID_DOCUMENTS">Invalid Documents</SelectItem>
                  <SelectItem value="BUSINESS_NOT_VERIFIED">Business Not Verified</SelectItem>
                  <SelectItem value="POLICY_VIOLATION">Policy Violation</SelectItem>
                  <SelectItem value="INSUFFICIENT_INFORMATION">Insufficient Information</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              onClick={() => selectedCompany && handleVerificationAction(selectedCompany.id, 'reject', rejectionReason)}
              disabled={actionLoading || !rejectionReason.trim()}
              variant="destructive"
            >
              {actionLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject Company
            </Button>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}