'use client'

import { useState, useEffect } from 'react'
import { Shield, ShieldCheck, Star, Users, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CompanyStats {
  user: {
    id: string
    name: string | null
    role: string
    isCompanyVerified: boolean
    companyName: string | null
  }
  ratings: {
    average: number
    total: number
    distribution: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
    verificationScore: number
  }
}

interface CompanyVerificationBadgeProps {
  userId: string
  showDetails?: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const StarRating = ({ rating, size = 'small' }: { rating: number; size?: 'small' | 'medium' }) => {
  const sizeClasses = {
    small: 'w-3 h-3',
    medium: 'w-4 h-4'
  }

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

const VerificationLevel = ({ score }: { score: number }) => {
  if (score >= 90) {
    return {
      level: 'Premium',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      textColor: 'text-white',
      icon: <Award className="w-3 h-3" />
    }
  } else if (score >= 70) {
    return {
      level: 'Verified',
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      textColor: 'text-white',
      icon: <ShieldCheck className="w-3 h-3" />
    }
  } else if (score >= 50) {
    return {
      level: 'Trusted',
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      textColor: 'text-white',
      icon: <Shield className="w-3 h-3" />
    }
  } else {
    return {
      level: 'New',
      color: 'bg-gray-500',
      textColor: 'text-white',
      icon: <Users className="w-3 h-3" />
    }
  }
}

export default function CompanyVerificationBadge({
  userId,
  showDetails = false,
  size = 'medium',
  className = ''
}: CompanyVerificationBadgeProps) {
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCompanyStats()
  }, [userId])

  const fetchCompanyStats = async () => {
    try {
      const response = await fetch(`/api/users/${userId}/ratings`)
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      } else {
        setError(data.error || 'Failed to fetch company stats')
      }
    } catch (error) {
      setError('Failed to fetch company stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Skeleton className="h-6 w-20" />
        {showDetails && (
          <>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-12" />
          </>
        )}
      </div>
    )
  }

  if (error || !stats) {
    return null
  }

  const verification = VerificationLevel({ score: stats.ratings.verificationScore })
  const { user, ratings } = stats

  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-1',
    large: 'text-base px-4 py-2'
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge 
          className={`${verification.color} ${verification.textColor} ${sizeClasses[size]} flex items-center gap-1`}
        >
          {verification.icon}
          {verification.level}
        </Badge>
        {ratings.total > 0 && (
          <div className="flex items-center gap-1">
            <StarRating rating={ratings.average} size={size === 'large' ? 'medium' : 'small'} />
            <span className={`${size === 'small' ? 'text-xs' : 'text-sm'} text-gray-600`}>
              {ratings.average.toFixed(1)} ({ratings.total})
            </span>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className={`${className}`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">
                {user.companyName || user.name}
              </h3>
              <p className="text-sm text-gray-600 capitalize">
                {user.role.toLowerCase().replace('_', ' ')}
              </p>
            </div>
            <Badge 
              className={`${verification.color} ${verification.textColor} flex items-center gap-1`}
            >
              {verification.icon}
              {verification.level}
            </Badge>
          </div>

          {/* Rating Summary */}
          {ratings.total > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold">{ratings.average.toFixed(1)}</div>
                <div>
                  <StarRating rating={ratings.average} size="medium" />
                  <p className="text-xs text-gray-600">
                    {ratings.total} review{ratings.total !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Rating Distribution */}
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratings.distribution[star as keyof typeof ratings.distribution]
                  const percentage = ratings.total > 0 ? (count / ratings.total) * 100 : 0
                  
                  return (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3">{star}</span>
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-right">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">No reviews yet</p>
          )}

          {/* Verification Features */}
          <div className="pt-2 border-t">
            <div className="flex flex-wrap gap-2">
              {user.isCompanyVerified && (
                <Badge variant="outline" className="text-xs">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Admin Verified
                </Badge>
              )}
              {ratings.verificationScore >= 70 && (
                <Badge variant="outline" className="text-xs">
                  <Award className="w-3 h-3 mr-1" />
                  Top Rated
                </Badge>
              )}
              {ratings.total >= 10 && (
                <Badge variant="outline" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  Experienced
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}