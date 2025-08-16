"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { toast } from "react-hot-toast"
import AdminNavigation from "@/components/admin/AdminNavigation"
import AdminOverviewDashboard from "@/components/admin/AdminOverviewDashboard"

interface User {
  id: string
  name: string | null
  email: string
  role: string
  isVerified: boolean
  createdAt: string
  _count: {
    listings: number
    favorites: number
    rentalBookings: number
  }
}

interface AdminStats {
  totalUsers: number
  totalListings: number
  totalBookings: number
  totalFavorites: number
  usersByRole: {
    BUYER: number
    SELLER: number
    RENTAL_COMPANY: number
    ADMIN: number
  }
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  useEffect(() => {
    if (status !== "loading" && (!session?.user || session.user.role !== "ADMIN")) {
      router.push("/")
      toast.error("Access denied. Admin privileges required.")
    }
  }, [session, status, router])

  useEffect(() => {
    if (status !== "loading") {
      setLoading(false)
    }
  }, [status])

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNavigation />
      
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Comprehensive overview of your car dealership platform</p>
          </div>

          {/* Enhanced Admin Overview Dashboard */}
          <AdminOverviewDashboard />
        </div>
      </div>
    </div>
  )
}