/**
 * Customer Photo Gallery Component
 * UGC gallery showing real customer photos
 */

'use client';


import { useState } from 'react';
import Image from 'next/image';
import { Heart, Upload, X } from 'lucide-react';
import type { Product } from '@/types/product';

interface CustomerPhoto {
  _id: string;
  images: Array<{ url: string; thumbnailUrl?: string }>;
  customerName: string;
  review?: {
    rating: number;
    comment?: string;
  };
  isFeatured: boolean;
  likes: number;
}

interface CustomerPhotoGalleryProps {
  productId: string;
  product?: Product;
  photos?: CustomerPhoto[];
  showUpload?: boolean;
}

export default function CustomerPhotoGallery({
  productId,
  product,
  photos = [],
  showUpload = false
}: CustomerPhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<CustomerPhoto | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  if (photos.length === 0 && !showUpload) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            See how it looks on real customers
          </h2>
          <p className="text-gray-600">
            Real photos from our happy customers
          </p>
        </div>
        {showUpload && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Upload className="w-5 h-5" />
            Share Your Photo
          </button>
        )}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <PhotoCard
            key={photo._id}
            photo={photo}
            onClick={() => setSelectedPhoto(photo)}
          />
        ))}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <PhotoUploadModal
          productId={productId}
          product={product}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            // Refresh photos
          }}
        />
      )}
    </section>
  );
}

/**
 * Photo Card Component
 */
function PhotoCard({
  photo,
  onClick
}: {
  photo: CustomerPhoto;
  onClick: () => void;
}) {
  const [liked, setLiked] = useState(false);

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={photo.images[0]?.url || '/images/placeholder.png'}
          alt={`${photo.customerName}'s photo`}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {photo.isFeatured && (
          <div className="absolute top-2 left-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-semibold">
            Featured
          </div>
        )}
        <div className="absolute bottom-2 right-2 flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLiked(!liked);
            }}
            className={`hover:scale-110 transition-transform ${
              liked ? 'text-pink-400' : ''
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
          </button>
          <span>{photo.likes + (liked ? 1 : 0)}</span>
        </div>
      </div>
      {photo.review && (
        <div className="mt-2">
          <div className="flex items-center gap-1 text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <span key={i}>{i < photo.review!.rating ? '★' : '☆'}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Photo Modal Component
 */
function PhotoModal({
  photo,
  onClose
}: {
  photo: CustomerPhoto;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
      <div className="relative max-w-4xl w-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="relative aspect-[3/4] bg-gray-900 rounded-lg overflow-hidden">
          <Image
            src={photo.images[0]?.url || '/images/placeholder.png'}
            alt={`${photo.customerName}'s photo`}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
        {photo.review && (
          <div className="mt-4 text-white">
            <p className="font-semibold">{photo.customerName}</p>
            {photo.review.comment && (
              <p className="text-gray-300 mt-2">{photo.review.comment}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Photo Upload Modal Component
 */
function PhotoUploadModal({
  productId: _productId,
  product: _product,
  onClose,
  onSuccess
}: {
  productId: string;
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [consent, setConsent] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!consent) {
      alert('Please give consent to share your photo');
      return;
    }

    if (files.length === 0) {
      alert('Please select at least one photo');
      return;
    }

    setUploading(true);
    try {
      // TODO: Implement photo upload API
      // await api.customerPhotos.upload({
      //   productId,
      //   images: files,
      //   review,
      //   consent
      // });
      alert('Photo uploaded successfully! It will be reviewed before publishing.');
      onSuccess();
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Share Your Photo</h2>
          
          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Photos
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              className="w-full"
            />
          </div>

          {/* Review */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => setReview({ ...review, rating })}
                  className={`text-2xl ${
                    rating <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3"
              rows={3}
              placeholder="Share your experience..."
            />
          </div>

          {/* Consent */}
          <div className="mb-6">
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-gray-700">
                I consent to share my photo on the website and social media. 
                I understand that my photo will be reviewed before publishing.
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !consent}
              className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

