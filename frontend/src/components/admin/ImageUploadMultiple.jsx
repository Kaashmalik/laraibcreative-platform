'use client';


import { useState, useRef, useCallback } from 'react';
import { Upload, X, Star, Move, ZoomIn } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import axios from '@/lib/axios';
import { API_BASE_URL } from '@/lib/constants';
import { toast } from 'react-hot-toast';

/**
 * Multiple Image Upload Component
 * 
 * Features:
 * - Drag and drop upload
 * - Multiple file selection
 * - Image preview with thumbnails
 * - Reorder images by drag and drop
 * - Set primary image
 * - Remove images
 * - Image compression before upload
 * - Upload to Cloudinary
 * - Lightbox preview
 * - Progress indicator
 * 
 * @param {Object} props
 * @param {Array} props.images - Current image URLs
 * @param {string} props.primaryImage - Primary image URL
 * @param {Function} props.onImagesChange - Images change handler
 * @param {Function} props.onPrimaryImageChange - Primary image change handler
 * @param {number} props.maxImages - Maximum number of images (default: 10)
 * @param {string} props.error - Error message
 * @returns {JSX.Element}
 */
export default function ImageUploadMultiple({
  images = [],
  primaryImage = '',
  onImagesChange,
  onPrimaryImageChange,
  maxImages = 10,
  error = ''
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const fileInputRef = useRef(null);
  
  /**
   * Handle file selection
   * Stores File objects for later upload via backend
   */
  const handleFileSelect = useCallback(async (files) => {
    if (!files || files.length === 0) return;
    
    // Check if adding files would exceed max limit
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const newFiles = [];
      const errors = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name} is not a valid image`);
          continue;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          errors.push(`${file.name} exceeds 5MB limit`);
          continue;
        }
        
        // Compress image and store as File object
        const compressedFile = await compressImage(file);
        newFiles.push(compressedFile);
        
        // Update progress
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      // Show errors if any
      if (errors.length > 0) {
        toast.error(errors[0], { duration: 4000 });
      }
      
      if (newFiles.length === 0) {
        setUploading(false);
        setUploadProgress(0);
        return;
      }
      
      // Add new File objects to existing images
      const newImages = [...images, ...newFiles];
      onImagesChange(newImages);
      
      // Set first image as primary if no primary image exists
      if (!primaryImage && newImages.length > 0) {
        // For File objects, create a preview URL
        const previewUrl = URL.createObjectURL(newImages[0]);
        onPrimaryImageChange(previewUrl);
      }
      
      if (newFiles.length > 0) {
        toast.success(`${newFiles.length} image(s) added successfully`);
      }
      
    } catch (error) {
      console.error('Error processing images:', error);
      toast.error('Failed to process some images. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [images, maxImages, primaryImage, onImagesChange, onPrimaryImageChange]);
  
  /**
   * Compress image before upload
   */
  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target.result;
        
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 1920px width/height)
          let width = img.width;
          let height = img.height;
          const maxSize = 1920;
          
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            },
            'image/jpeg',
            0.85 // 85% quality
          );
        };
        
        img.onerror = reject;
      };
      
      reader.onerror = reject;
    });
  };
  
  /**
   * Upload image via backend (handles Cloudinary securely)
   * Uses axios instance which automatically handles auth tokens
   * Includes retry logic for transient failures
   */
  const uploadToCloudinary = async (file, maxRetries = 3) => {
    const formData = new FormData();
    formData.append('file', file);
    
    let lastError = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Use axios instance - it handles token automatically via interceptors
        const response = await axios.post('/upload/single', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          timeout: 60000 // 60 second timeout for uploads
        });
        
        // axios interceptor returns response.data directly
        const url = response.data?.url || response.url || response.secure_url;
        
        if (!url) {
          throw new Error('Upload succeeded but no URL returned');
        }
        
        return url;
      } catch (error) {
        lastError = error;
        console.error(`Upload attempt ${attempt + 1}/${maxRetries} failed:`, error.message);
        
        // Don't retry auth errors
        if (error.response?.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        
        // Don't retry validation errors (400)
        if (error.response?.status === 400) {
          throw new Error(error.response?.data?.message || 'Invalid file. Please check file type and size.');
        }
        
        // Retry on network/server errors
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s
          console.log(`Retrying upload in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    throw new Error(
      lastError?.response?.data?.message || 
      lastError?.message || 
      'Upload failed after multiple attempts. Please try again.'
    );
  };
  
  /**
   * Handle drag and drop
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };
  
  /**
   * Handle file input change
   */
  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFileSelect(files);
    
    // Reset input value so same file can be selected again
    e.target.value = '';
  };
  
  /**
   * Remove image
   */
  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Update primary image if removed
    if (images[index] === primaryImage) {
      onPrimaryImageChange(newImages[0] || '');
    }
  };
  
  /**
   * Set as primary image
   */
  const handleSetPrimary = (imageUrl) => {
    onPrimaryImageChange(imageUrl);
  };
  
  /**
   * Handle image reordering with drag and drop
   */
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOverImage = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    
    onImagesChange(newImages);
    setDraggedIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  /**
   * Open file picker
   */
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${error ? 'border-red-500' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        
        {uploading ? (
          <div className="space-y-3">
            <Spinner size="lg" />
            <p className="text-sm text-gray-600">
              Uploading images... {Math.round(uploadProgress)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">
              Drag and drop images here, or{' '}
              <button
                type="button"
                onClick={openFilePicker}
                className="text-blue-600 font-medium hover:text-blue-700"
              >
                browse
              </button>
            </p>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP up to 5MB ({images.length}/{maxImages} images)
            </p>
          </div>
        )}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => {
            // Handle both File objects and URL strings
            const imageUrl = image instanceof File ? URL.createObjectURL(image) : (typeof image === 'string' ? image : image.url);
            const isPrimary = imageUrl === primaryImage;
            
            return (
              <div
                key={index}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 transition-all cursor-move ${
                  isPrimary
                    ? 'border-yellow-500 ring-2 ring-yellow-200'
                    : 'border-gray-200 hover:border-gray-300'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                {/* Image */}
                <Image
                  src={imageUrl}
                  alt={`Product photo ${index + 1}${isPrimary ? ' (primary image)' : ''}`}
                  fill
                  className="object-cover"
                  quality={75}
                  sizes="200px"
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
                />
              
                {/* Primary Badge */}
                {isPrimary && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="flex items-center gap-1 bg-yellow-500 text-white text-xs font-semibold px-2 py-1 rounded">
                      <Star size={12} className="fill-white" />
                      Primary
                    </div>
                  </div>
                )}
                
                {/* Drag Handle */}
                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/50 text-white p-1 rounded">
                    <Move size={16} />
                  </div>
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {/* Preview */}
                  <button
                    type="button"
                    onClick={() => setPreviewImage(imageUrl)}
                    className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Preview"
                  >
                    <ZoomIn size={18} />
                  </button>
                  
                  {/* Set Primary */}
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(imageUrl)}
                      className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Set as primary"
                    >
                      <Star size={18} />
                    </button>
                  )}
                  
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    title="Remove"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                {/* Image Number */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            );
          })}
          
          {/* Add More Button */}
          {images.length < maxImages && (
            <button
              type="button"
              onClick={openFilePicker}
              disabled={uploading}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center gap-2 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload size={24} />
              <span className="text-xs font-medium">Add More</span>
            </button>
          )}
        </div>
      )}
      
      {/* Image Preview Modal */}
      {previewImage && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewImage(null)}
          title="Image Preview"
          size="large"
        >
          <div className="relative w-full h-[70vh]">
            <Image
              src={previewImage}
              alt="Product image preview - full size view"
              fill
              className="object-contain"
              quality={85}
              sizes="100vw"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
            />
          </div>
          
          <div className="mt-4 flex justify-end gap-3">
            <Button
              variant="outlined"
              onClick={() => {
                handleSetPrimary(previewImage);
                setPreviewImage(null);
              }}
            >
              Set as Primary
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const index = images.indexOf(previewImage);
                handleRemoveImage(index);
                setPreviewImage(null);
              }}
            >
              Delete Image
            </Button>
          </div>
        </Modal>
      )}
      
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Image Upload Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Upload at least 5 high-quality images from different angles</li>
          <li>• The first image (marked with star) will be the primary image</li>
          <li>• Drag and drop images to reorder them</li>
          <li>• Recommended image size: 1200x1200px or higher</li>
          <li>• Supported formats: JPG, PNG, WEBP</li>
          <li>• Maximum file size: 5MB per image</li>
          <li>• Images will be automatically compressed and optimized</li>
        </ul>
      </div>
    </div>
  );
}