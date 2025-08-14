'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, User, Edit, Trash2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { toast } from 'react-hot-toast'

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
  listing?: {
    id: string
    title: string
  }
  rentalListing?: {
    id: string
    title: string
  }
}

interface ReviewSystemProps {
  targetUserId: string
  listingId?: string
  rentalListingId?: string
  showAddReview?: boolean
  className?: string
}

const StarRating = ({ 
  rating, 
  onRatingChange, 
  readonly = false, 
  size = 'default' 
}: { 
  rating: number
  onRatingChange?: (rating: number) => void
  readonly?: boolean
  size?: 'small' | 'default' | 'large'
}) => {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-5 h-5',
    large: 'w-6 h-6'
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          } ${
            !readonly ? 'cursor-pointer hover:text-yellow-400' : ''
          }`}
          onClick={() => !readonly && onRatingChange?.(star)}
        />
      ))}
    </div>
  )
}

export default function ReviewSystem({
  targetUserId,
  listingId,
  rentalListingId,
  showAddReview = true,
  className = ''
}: ReviewSystemProps) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  })
  const [averageRating, setAverageRating] = useState(0)
  const [totalReviews, setTotalReviews] = useState(0)

  useEffect(() => {
    fetchReviews()
  }, [targetUserId, listingId, rentalListingId])

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams({
        targetUserId,
        ...(listingId && { listingId }),
        ...(rentalListingId && { rentalListingId })
      })

      const response = await fetch(`/api/reviews?${params}`)
      const data = await response.json()

      if (response.ok) {
        setReviews(data.reviews)
        setAverageRating(data.averageRating)
        setTotalReviews(data.totalReviews)
      } else {
        toast.error(data.error || 'Failed to fetch reviews')
      }
    } catch (error) {
      toast.error('Failed to fetch reviews')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in to leave a review')
      return
    }

    if (!formData.comment.trim()) {
      toast.error('Please add a comment to your review')
      return
    }

    setSubmitting(true)

    try {
      const url = editingReview ? `/api/reviews/${editingReview}` : '/api/reviews'
      const method = editingReview ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetUserId,
          rating: formData.rating,
          comment: formData.comment,
          ...(listingId && { listingId }),
          ...(rentalListingId && { rentalListingId })
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingReview ? 'Review updated successfully' : 'Review submitted successfully')
        setFormData({ rating: 5, comment: '' })
        setShowForm(false)
        setEditingReview(null)
        fetchReviews()
      } else {
        toast.error(data.error || 'Failed to submit review')
      }
    } catch (error) {
      toast.error('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Review deleted successfully')
        fetchReviews()
      } else {
        toast.error(data.error || 'Failed to delete review')
      }
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const handleEditReview = (review: Review) => {
    setEditingReview(review.id)
    setFormData({
      rating: review.rating,
      comment: review.comment || ''
    })
    setShowForm(true)
  }

  const canUserReview = session?.user?.id && session.user.id !== targetUserId
  const userHasReviewed = reviews.some(review => review.user.id === session?.user?.id)

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span>Reviews & Ratings</span>
            {totalReviews > 0 && (
              <Badge variant="secondary">
                {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalReviews > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div>
                <StarRating rating={averageRating} readonly size="large" />
                <p className="text-sm text-gray-600 mt-1">
                  Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No reviews yet</p>
          )}
        </CardContent>
      </Card>

      {/* Add Review Form */}
      {showAddReview && canUserReview && !userHasReviewed && (
        <Card>
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button onClick={() => setShowForm(true)}>
                Write a Review
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rating
                  </label>
                  <StarRating
                    rating={formData.rating}
                    onRatingChange={(rating) => setFormData(prev => ({ ...prev, rating }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Comment
                  </label>
                  <Textarea
                    value={formData.comment}
                    onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder="Share your experience..."
                    rows={4}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false)
                      setEditingReview(null)
                      setFormData({ rating: 5, comment: '' })
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <Avatar>
                    <AvatarImage src={review.user.image || ''} />
                    <AvatarFallback>
                      {review.user.name?.[0] || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{review.user.name}</span>
                      <StarRating rating={review.rating} readonly size="small" />
                      <span className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mb-2">{review.comment}</p>
                    )}
                    {(review.listing || review.rentalListing) && (
                      <p className="text-sm text-gray-500">
                        Review for: {review.listing?.title || review.rentalListing?.title}
                      </p>
                    )}
                  </div>
                </div>
                {session?.user?.id === review.user.id && (
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditReview(review)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteReview(review.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviews.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No reviews yet. Be the first to leave a review!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}