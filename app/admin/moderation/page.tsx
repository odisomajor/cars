"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import AdminNavigation from "@/components/admin/AdminNavigation"
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  Flag,
  Clock,
  Car,
  MapPin,
  DollarSign
} from "lucide-react"
import Image from "next/image"

interface Listing {
  id: string
  title: string
  price: number
  year: number
  make: string
  model: string
  mileage: number
  location: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'
  createdAt: string
  updatedAt: string
  images: string[]
  user: {
    id: string
    name: string | null
    email: string
    isVerified: boolean
  }
  reports?: Array<{
    id: string
    reason: string
    description: string
    createdAt: string
    reporter: {
      name: string | null
      email: string
    }
  }>
}

interface ModerationStats {
  pending: number
  approved: number
  rejected: number
  flagged: number
  totalReports: number
}

export default function ListingModeration() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [listings, setListings] = useState<Listing[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.push("/")
      toast.error("Access denied. Admin privileges required.")
    }
  }, [user, authLoading, router])

  // Fetch moderation data
  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchModerationData()
    }
  }, [user])

  const fetchModerationData = async () => {
    try {
      const [listingsResponse, statsResponse] = await Promise.all([
        fetch("/api/admin/listings/moderation"),
        fetch("/api/admin/listings/moderation/stats")
      ])

      if (listingsResponse.ok) {
        const listingsData = await listingsResponse.json()
        setListings(listingsData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      toast.error("Failed to load moderation data")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (listingId: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/moderate`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, reason }),
      })

      if (response.ok) {
        setListings(listings.map(l => 
          l.id === listingId ? { ...l, status } : l
        ))
        toast.success(`Listing ${status.toLowerCase()} successfully`)
        setShowRejectModal(false)
        setRejectReason("")
        setSelectedListing(null)
      } else {
        toast.error("Failed to update listing status")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
    setShowDropdown(null)
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/listings/${listingId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setListings(listings.filter(l => l.id !== listingId))
        toast.success("Listing deleted successfully")
      } else {
        toast.error("Failed to delete listing")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
    setShowDropdown(null)
  }

  const handleResolveReports = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/reports/resolve`, {
        method: "PATCH",
      })

      if (response.ok) {
        setListings(listings.map(l => 
          l.id === listingId ? { ...l, reports: [] } : l
        ))
        toast.success("Reports resolved successfully")
      } else {
        toast.error("Failed to resolve reports")
      }
    } catch (error) {
      toast.error("Something went wrong")
    }
    setShowDropdown(null)
  }

  // Filter listings
  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "ALL" || listing.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'APPROVED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      case 'FLAGGED': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />
      case 'APPROVED': return <CheckCircle className="w-4 h-4" />
      case 'REJECTED': return <XCircle className="w-4 h-4" />
      case 'FLAGGED': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Listing Moderation</h1>
          <p className="text-gray-600 mt-2">Review and moderate car listings</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Flagged</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.flagged}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Flag className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Reports</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings Management */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Listings</h2>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search listings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                  />
                </div>
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="FLAGGED">Flagged</option>
                </select>
              </div>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredListings.map((listing) => (
                <div key={listing.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative h-48">
                    {listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Car className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 left-2">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        getStatusColor(listing.status)
                      }`}>
                        {getStatusIcon(listing.status)}
                        <span className="ml-1">{listing.status}</span>
                      </span>
                    </div>

                    {/* Reports Badge */}
                    {listing.reports && listing.reports.length > 0 && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          <Flag className="w-3 h-3 mr-1" />
                          {listing.reports.length}
                        </span>
                      </div>
                    )}

                    {/* Actions Dropdown */}
                    <div className="absolute bottom-2 right-2">
                      <div className="relative">
                        <button
                          onClick={() => setShowDropdown(showDropdown === listing.id ? null : listing.id)}
                          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                        {showDropdown === listing.id && (
                          <div className="absolute right-0 bottom-full mb-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button
                                onClick={() => window.open(`/listings/${listing.id}`, '_blank')}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Listing
                              </button>
                              {listing.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(listing.id, 'APPROVED')}
                                    className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedListing(listing)
                                      setShowRejectModal(true)
                                      setShowDropdown(null)
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {listing.reports && listing.reports.length > 0 && (
                                <button
                                  onClick={() => handleResolveReports(listing.id)}
                                  className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 w-full text-left"
                                >
                                  <Flag className="w-4 h-4 mr-2" />
                                  Resolve Reports
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Listing
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 truncate">{listing.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Car className="w-4 h-4 mr-1" />
                        <span>{listing.year} {listing.make} {listing.model}</span>
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>${listing.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{listing.location}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>By: {listing.user.name || listing.user.email}</span>
                        <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredListings.length === 0 && (
              <div className="text-center py-12">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Listing</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this listing:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectReason("")
                  setSelectedListing(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusChange(selectedListing.id, 'REJECTED', rejectReason)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject Listing
              </button>
            </div>
          </div>
        </div>
      )
      </div>
    </div>
  )
}