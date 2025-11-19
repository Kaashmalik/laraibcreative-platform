import React, { useState } from 'react';
import { Upload, X, ImageIcon, AlertCircle } from 'lucide-react';

/**
 * ImageUpload Component
 * Handles image upload with drag & drop functionality
 * 
 * @param {Array} images - Array of uploaded image objects
 * @param {Function} onImagesChange - Callback when images change
 * @param {number} maxImages - Maximum number of images allowed (default: 5)
 */
const ImageUpload = ({ images, onImagesChange, maxImages = 5 }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const validateFile = (file) => {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return 'Please upload only JPG, PNG, or WebP images';
    }

    // Check file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    return null;
  };

  const handleFiles = (files) => {
    setError('');

    // Check if adding files would exceed limit
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    const filesToAdd = Array.from(files).slice(0, remainingSlots);
    const validFiles = [];

    for (const file of filesToAdd) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      validFiles.push(file);
    }

    const newImages = validFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    onImagesChange([...images, ...newImages]);
  };

  const removeImage = (id) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove && imageToRemove.preview) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter((img) => img.id !== id));
    setError('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            Upload Design Images
          </h2>
          <p className="text-sm text-gray-600">
            Share your design inspiration or reference images
          </p>
        </div>
        <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {images.length}/{maxImages}
        </span>
      </div>

      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center 
          transition-all duration-300
          ${
            dragActive
              ? 'border-pink-500 bg-pink-50 scale-105'
              : images.length >= maxImages
              ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
              : 'border-gray-300 hover:border-pink-400 hover:bg-pink-50/30'
          }
        `}
      >
        <Upload
          className={`
            w-12 h-12 mx-auto mb-4 transition-colors duration-300
            ${dragActive ? 'text-pink-600' : 'text-gray-400'}
          `}
        />
        <p className="text-gray-700 font-medium mb-2">
          {dragActive
            ? 'Drop your images here'
            : 'Drag and drop your images here'}
        </p>
        <p className="text-sm text-gray-500 mb-4">or</p>
        
        <label
          className={`
            inline-flex items-center gap-2 px-6 py-3 
            bg-gradient-to-r from-pink-500 to-purple-600 
            text-white rounded-lg font-medium cursor-pointer 
            hover:shadow-lg transition-all duration-300
            ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          `}
        >
          <ImageIcon size={18} />
          <span>Browse Files</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
            disabled={images.length >= maxImages}
          />
        </label>
        
        <p className="text-xs text-gray-400 mt-4">
          PNG, JPG, WebP up to 10MB • Maximum {maxImages} images
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Uploaded Images
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group animate-scale-in"
              >
                <div className="aspect-square rounded-lg border-2 border-gray-200 overflow-hidden bg-gray-100">
                  <img
                    src={image.preview}
                    alt={image.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                </div>
                
                {/* Remove Button */}
                <button
                  onClick={() => removeImage(image.id)}
                  className="
                    absolute top-2 right-2 p-1.5 
                    bg-red-500 text-white rounded-full 
                    opacity-0 group-hover:opacity-100 
                    transition-opacity duration-200
                    hover:bg-red-600 shadow-lg
                  "
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>

                {/* File Info Overlay */}
                <div className="
                  absolute bottom-0 left-0 right-0 
                  bg-gradient-to-t from-black/70 to-transparent 
                  p-2 opacity-0 group-hover:opacity-100 
                  transition-opacity duration-200
                ">
                  <p className="text-xs text-white truncate">
                    {image.name}
                  </p>
                  <p className="text-xs text-gray-300">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;