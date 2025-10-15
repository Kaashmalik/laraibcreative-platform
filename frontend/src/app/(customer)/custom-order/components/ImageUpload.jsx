import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

/**
 * Image Upload Component - Step 2
 * 
 * Multi-file image upload with:
 * - Drag and drop support
 * - Multiple file selection
 * - Image preview
 * - File validation (type, size, count)
 * - Remove functionality
 * 
 * @param {array} images - Array of uploaded images
 * @param {function} onChange - Handler for image changes
 * @param {string} serviceType - Selected service type
 * @param {object} errors - Validation errors
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_IMAGES = 2;
const MAX_IMAGES = 6;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function ImageUpload({ images, onChange, serviceType, errors }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  /**
   * Validate file before adding
   */
  const validateFile = (file) => {
    // Check file type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG, JPEG, PNG, and WEBP images are allowed';
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  /**
   * Process and add files
   */
  const handleFiles = (fileList) => {
    setUploadError('');

    const files = Array.from(fileList);
    
    // Check total count
    if (images.length + files.length > MAX_IMAGES) {
      setUploadError(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        // Create preview URL
        const preview = URL.createObjectURL(file);
        validFiles.push({
          file,
          preview,
          name: file.name,
          size: file.size,
        });
      }
    });

    if (errors.length > 0) {
      setUploadError(errors.join('; '));
    }

    if (validFiles.length > 0) {
      onChange([...images, ...validFiles]);
    }
  };

  /**
   * Handle file input change
   */
  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  /**
   * Handle drag over
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  /**
   * Handle drag leave
   */
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  /**
   * Handle drop
   */
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  /**
   * Remove image
   */
  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
    
    // Revoke URL to free memory
    if (images[index].preview) {
      URL.revokeObjectURL(images[index].preview);
    }
  };

  /**
   * Trigger file input click
   */
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Skip this step if service type is fully custom
  if (serviceType === 'fully-custom') {
    return (
      <div className="text-center py-12">
        <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Reference Images Not Required
        </h3>
        <p className="text-gray-600 max-w-md mx-auto">
          Since you've chosen fully custom design, you don't need to upload reference images. 
          Click "Continue" to proceed to fabric selection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Upload Reference Images
        </h2>
        <p className="text-gray-600">
          Upload {MIN_IMAGES}-{MAX_IMAGES} clear photos of the design you want us to replicate
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-purple-500 bg-purple-50 scale-102' 
            : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
          }
          ${images.length >= MAX_IMAGES ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileInput}
          disabled={images.length >= MAX_IMAGES}
          className="hidden"
        />

        <div className="text-center">
          {/* Upload Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            <Upload className="w-8 h-8 text-purple-600" />
          </div>

          {/* Upload Text */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragging ? 'Drop images here' : 'Drag & drop images here'}
          </h3>
          <p className="text-gray-600 mb-4">
            or click to browse from your device
          </p>

          {/* Upload Info */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              JPG, PNG, WEBP • Max 5MB • {images.length}/{MAX_IMAGES} uploaded
            </span>
          </div>
        </div>
      </div>

      {/* Upload Error */}
      {uploadError && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm">{uploadError}</p>
        </div>
      )}

      {/* Validation Error */}
      {errors.referenceImages && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{errors.referenceImages}</p>
        </div>
      )}

      {/* Image Previews Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">
              Uploaded Images ({images.length})
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChange([]);
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative group aspect-square rounded-xl overflow-hidden border-2 border-gray-200 hover:border-purple-400 transition-all duration-200"
              >
                {/* Image Preview */}
                <img
                  src={image.preview}
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 bg-red-600 hover:bg-red-700 rounded-full text-white shadow-lg transform hover:scale-110"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Image Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-white text-xs font-medium truncate">
                    {image.name}
                  </p>
                  <p className="text-white text-xs opacity-80">
                    {formatFileSize(image.size)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-purple-600" />
          Tips for Best Results
        </h4>
        <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">✓</span>
            <span>Clear, well-lit photos</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">✓</span>
            <span>Multiple angles (front, back, side)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">✓</span>
            <span>Close-ups of embroidery/details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-600 mt-0.5">✓</span>
            <span>Full outfit visible in photos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}