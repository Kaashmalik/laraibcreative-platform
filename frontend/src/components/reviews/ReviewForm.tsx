'use client'

/**
 * Review Form Component - Phase 7
 * For submitting product reviews
 */

import { useState } from 'react'
import { Star, Upload, X, Loader2 } from 'lucide-react'
import useAuth from '@/hooks/useAuth'
import { uploadReviewImage } from '@/lib/supabase/storage'
import { cn } from '@/lib/utils'

interface ReviewFormProps {
  productId: string
  productTitle: string
  orderId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function ReviewForm({ productId, productTitle, orderId, onSuccess, onCancel }: ReviewFormProps) {
  const { user } = useAuth()
  
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    if (images.length + files.length > 5) {
      setError('Maximum 5 images allowed')
      return
    }

    setUploading(true)
    setError('')

    try {
      const tempId = `temp-${productId}-${Date.now()}`
      const uploadPromises = Array.from(files).map((file, index) => 
        uploadReviewImage(tempId, file, images.length + index)
      )
      
      const results = await Promise.all(uploadPromises)
      const newUrls = results.filter(url => url !== null) as string[]
      
      setImages(prev => [...prev, ...newUrls])
    } catch (err) {
      setError('Failed to upload images')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      setError('Please select a rating')
      return
    }
    
    if (content.trim().length < 10) {
      setError('Review must be at least 10 characters')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          customer_id: user?.id,
          customer_name: user?.fullName || 'Anonymous',
          customer_email: user?.email || '',
          rating,
          title: title.trim() || null,
          content: content.trim(),
          images,
          order_id: orderId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      onSuccess?.()
    } catch (err) {
      setError('Failed to submit review. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-800 mb-1">
          Write a Review
        </h3>
        <p className="text-sm text-neutral-500">
          Share your experience with {productTitle}
        </p>
      </div>

      {/* Rating */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Rating *
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-1 focus:outline-none"
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-colors',
                  (hoveredRating || rating) >= star
                    ? 'text-primary-gold fill-current'
                    : 'text-neutral-300'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Review Title (Optional)
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          maxLength={100}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent"
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1">
          Your Review *
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell others about your experience..."
          rows={4}
          minLength={10}
          maxLength={1000}
          className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-gold focus:border-transparent resize-none"
        />
        <p className="text-xs text-neutral-500 mt-1">
          {content.length}/1000 characters
        </p>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          Add Photos (Optional)
        </label>
        
        <div className="flex flex-wrap gap-3">
          {images.map((url, index) => (
            <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          
          {images.length < 5 && (
            <label className="w-20 h-20 border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-gold transition-colors">
              {uploading ? (
                <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
              ) : (
                <>
                  <Upload className="w-6 h-6 text-neutral-400" />
                  <span className="text-xs text-neutral-500 mt-1">Add</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          Up to 5 images, max 5MB each
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="flex-1 py-3 bg-primary-gold text-white rounded-xl font-semibold hover:bg-primary-gold-dark disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>

      <p className="text-xs text-neutral-500 text-center">
        Your review will be visible after moderation. You&apos;ll earn 50 loyalty points for approved reviews!
      </p>
    </form>
  )
}

export default ReviewForm
