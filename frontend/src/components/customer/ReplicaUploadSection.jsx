'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, FileImage } from 'lucide-react';

/**
 * Replica Brand Upload Section
 * Multi-file upload for brand replica images
 */
export default function ReplicaUploadSection({ onFilesChange, maxFiles = 5 }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const newFiles = Array.from(files).slice(0, maxFiles - uploadedFiles.length);
    const fileObjects = newFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
    }));
    
    setUploadedFiles((prev) => {
      const updated = [...prev, ...fileObjects];
      if (onFilesChange) {
        onFilesChange(updated);
      }
      return updated;
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles((prev) => {
      const newFiles = prev.filter((_, i) => i !== index);
      // Clean up object URL to prevent memory leaks
      if (prev[index]?.preview) {
        URL.revokeObjectURL(prev[index].preview);
      }
      if (onFilesChange) {
        onFilesChange(newFiles);
      }
      return newFiles;
    });
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Upload Brand Reference Images
        </h3>
        <p className="text-sm text-gray-600">
          Upload images of the brand design you want to replicate. Maximum {maxFiles} images.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? 'border-pink-600 bg-pink-50'
            : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
            <Upload className="w-8 h-8 text-pink-600" />
          </div>
          <div>
            <p className="text-gray-700 font-medium">
              Click to upload or drag and drop
            </p>
            <p className="text-sm text-gray-500 mt-1">
              PNG, JPG, GIF up to 10MB each
            </p>
          </div>
        </motion.div>
      </div>

      {/* Uploaded Files Preview */}
      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {uploadedFiles.map((fileObj, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative group"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={fileObj.preview}
                  alt={fileObj.name}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-600 mt-1 truncate" title={fileObj.name}>
                {fileObj.name}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* File Count */}
      {uploadedFiles.length > 0 && (
        <p className="text-sm text-gray-500 text-center">
          {uploadedFiles.length} of {maxFiles} images uploaded
        </p>
      )}
    </div>
  );
}

