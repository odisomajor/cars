'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import {
  Users,
  Search,
  MoreVertical,
  ShieldCheck,
  ShieldX,
  Trash2,
  UserPlus,
  Download,
  Filter,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import AdminNavigation from '@/components/admin/AdminNavigation'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: 'BUYER' | 'SELLER' | 'RENTAL_COMPANY' | 'ADMIN'
  isVerified: boolean
  phone: string | null
  location: string | null
  createdAt: string
  lastLoginAt: string | null
  _count: {
    listings: number
    favorites: number
    rentalBookings: number
  }
}

interface UserStats {
  totalUsers: number
  verifiedUsers: number
  newUsersThisMonth: number
  activeUsers: number
  usersByRole: {
    BUYER: number
    SELLER: number
    RENTAL_COMPANY: number
    ADMIN: number
  }
}

export default function UserManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [verificationFilter, setVerificationFilter] = useState('ALL')
  const [showDropdown, setShowDropdown] = useState<string | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(20)

  // Redirect if not admin
  useEffect(() => {
    if (status !== 'loading' && (!session?.user || session.user.role !== 'ADMIN')) {
      router.push('/')
      toast.error('Access denied. Admin privileges required.')
    }
  }, [session, status, router])

  // Fetch users and stats
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchUsersData()
    }
  }, [session])

  const fetchUsersData = async () => {
    try {
      const [usersResponse, statsResponse] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/users/stats')
      ])

      if (usersResponse.ok) {
        const usersData = await usersResponse.json()
        setUsers(usersData)
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }
    } catch (error) {
      toast.error('Failed to load user data')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId: string, isVerified: boolean) => {
    try {
      const response = await fetch('/api/admin/users/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, isVerified }),
      })

      if (response.ok) {
        toast.success(`User ${isVerified ? 'verified' : 'unverified'} successfully`)
        fetchUsersData()
      } else {
        toast.error('Failed to update user verification')
      }
    } catch (error) {
      toast.error('Failed to update user verification')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('User deleted successfully')
        fetchUsersData()
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      toast.error('Failed to delete user')
    }
  }

  const handleBulkAction = async (action: 'verify' | 'unverify' | 'delete') => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first')
      return
    }

    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to delete ${selectedUsers.length} users?`
      : `Are you sure you want to ${action} ${selectedUsers.length} users?`
    
    if (!confirm(confirmMessage)) return

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userIds: selectedUsers, action }),
      })

      if (response.ok) {
        toast.success(`Bulk ${action} completed successfully`)
        setSelectedUsers([])
        fetchUsersData()
      } else {
        toast.error(`Failed to ${action} users`)
      }
    } catch (error) {
      toast.error(`Failed to ${action} users`)
    }
  }

  const handleExportUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/export')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Users exported successfully')
      } else {
        toast.error('Failed to export users')
      }
    } catch (error) {
      toast.error('Failed to export users')
    }
  }

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesVerification = verificationFilter === 'ALL' || 
                               (verificationFilter === 'VERIFIED' && user.isVerified) ||
                               (verificationFilter === 'UNVERIFIED' && !user.isVerified)
    
    return matchesSearch && matchesRole && matchesVerification
  }).sort((a, b) => {
    const aValue = a[sortBy as keyof User]
    const bValue = b[sortBy as keyof User]
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage)

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id))
    }
  }

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN': return 'bg-red-100 text-red-800'
      case 'SELLER': return 'bg-blue-100 text-blue-800'
      case 'RENTAL_COMPANY': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user management...</p>
        </div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">Manage users, verify accounts, and monitor user activity</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleExportUsers}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Users
                </button>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Verified</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.verifiedUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserPlus className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">New This Month</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.newUsersThisMonth}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                    />
                  </div>
                  
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="BUYER">Buyer</option>
                    <option value="SELLER">Seller</option>
                    <option value="RENTAL_COMPANY">Rental Company</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  
                  <select
                    value={verificationFilter}
                    onChange={(e) => setVerificationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="ALL">All Status</option>
                    <option value="VERIFIED">Verified</option>
                    <option value="UNVERIFIED">Unverified</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {filteredUsers.length} of {users.length} users
                  </span>
                  
                  {selectedUsers.length > 0 && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAction('verify')}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Verify ({selectedUsers.length})
                      </button>
                      <button
                        onClick={() => handleBulkAction('unverify')}
                        className="px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                      >
                        Unverify ({selectedUsers.length})
                      </button>
                      <button
                        onClick={() => handleBulkAction('delete')}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete ({selectedUsers.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.image ? (
                              <Image
                                src={user.image}
                                alt={user.name || 'User'}
                                width={40}
                                height={40}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <Users className="h-5 w-5 text-gray-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || 'No name'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email}
                            </div>
                            {user.phone && (
                              <div className="text-sm text-gray-500 flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {user.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {user.isVerified ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500 mr-1" />
                          )}
                          <span className={`text-sm ${user.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="space-y-1">
                          <div>{user._count.listings} listings</div>
                          <div>{user._count.favorites} favorites</div>
                          <div>{user._count.rentalBookings} bookings</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {formatDate(user.createdAt)}
                        </div>
                        {user.lastLoginAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            Last: {formatDate(user.lastLoginAt)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative">
                          <button
                            onClick={() => setShowDropdown(showDropdown === user.id ? null : user.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {showDropdown === user.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    handleVerifyUser(user.id, !user.isVerified)
                                    setShowDropdown(null)
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  {user.isVerified ? (
                                    <ShieldX className="h-4 w-4 mr-2" />
                                  ) : (
                                    <ShieldCheck className="h-4 w-4 mr-2" />
                                  )}
                                  {user.isVerified ? 'Unverify' : 'Verify'}
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteUser(user.id)
                                    setShowDropdown(null)
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete User
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(startIndex + usersPerPage, filteredUsers.length)}</span> of{' '}
                      <span className="font-medium">{filteredUsers.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === currentPage
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {paginatedUsers.length === 0 && (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}