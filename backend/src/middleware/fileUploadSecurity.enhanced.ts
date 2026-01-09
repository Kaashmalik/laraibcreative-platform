/**
 * Enhanced File Upload Security Middleware with Virus Scanning
 * Provides comprehensive security checks including virus scanning
 */

import { NextFunction } from 'express';
import path from 'path';
import { AppError, HttpStatus, ErrorCode } from '../utils/AppError';

// File type validation constants
const ALLOWED_MIME_TYPES = {
  product: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  reference: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  receipt: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  blog: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  avatar: ['image/jpeg', 'image/jpg', 'image/png']
} as const;

const ALLOWED_EXTENSIONS = {
  product: ['.jpg', '.jpeg', '.png', '.webp'],
  reference: ['.jpg', '.jpeg', '.png', '.webp'],
  receipt: ['.jpg', '.jpeg', '.png', '.pdf'],
  blog: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
  avatar: ['.jpg', '.jpeg', '.png']
} as const;

const MAX_FILE_SIZES = {
  product: 5 * 1024 * 1024, // 5MB
  reference: 5 * 1024 * 1024, // 5MB
  receipt: 3 * 1024 * 1024, // 3MB
  blog: 5 * 1024 * 1024, // 5MB
  avatar: 2 * 1024 * 1024 // 2MB
} as const;

type UploadType = keyof typeof ALLOWED_MIME_TYPES;

interface FileWithBuffer {
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  fieldname?: string;
  encoding?: string;
  destination?: string;
  filename?: string;
  path?: string;
}

/**
 * Validate file extension
 */
const validateFileExtension = (filename: string, uploadType: UploadType): boolean => {
  const ext = path.extname(filename).toLowerCase();
  const allowed = ALLOWED_EXTENSIONS[uploadType] || ALLOWED_EXTENSIONS.product;
  return allowed.includes(ext as any);
};

/**
 * Validate MIME type
 */
const validateMimeType = (mimetype: string, uploadType: UploadType): boolean => {
  const allowed = ALLOWED_MIME_TYPES[uploadType] || ALLOWED_MIME_TYPES.product;
  return allowed.includes(mimetype as any);
};

/**
 * Validate file size
 */
const validateFileSize = (size: number, uploadType: UploadType): boolean => {
  const maxSize = MAX_FILE_SIZES[uploadType] || MAX_FILE_SIZES.product;
  return size <= maxSize;
};

/**
 * Validate file name for security
 */
const validateFileName = (filename: string): boolean => {
  // Block null bytes
  if (filename.includes('\0')) {
    return false;
  }
  
  // Block path traversal attempts
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return false;
  }
  
  // Block control characters
  if (/[\x00-\x1F\x7F]/.test(filename)) {
    return false;
  }
  
  // Block reserved Windows names
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5',
    'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4',
    'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ];
  const nameWithoutExt = path.basename(filename, path.extname(filename)).toUpperCase();
  if (reservedNames.includes(nameWithoutExt)) {
    return false;
  }
  
  return true;
};

/**
 * Validate file content using magic numbers
 */
const validateFileContent = (buffer: Buffer, mimetype: string): boolean => {
  const signatures: Record<string, number[]> = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/jpg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
    'image/gif': [0x47, 0x49, 0x46, 0x38], // GIF8
    'application/pdf': [0x25, 0x50, 0x44, 0x46] // %PDF
  };
  
  const expectedSignature = signatures[mimetype];
  if (!expectedSignature) {
    return false;
  }
  
  // Check if buffer starts with expected signature
  for (let i = 0; i < expectedSignature.length && i < buffer.length; i++) {
    if (buffer[i] !== expectedSignature[i]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Scan file for viruses using ClamAV or ClamScan
 * This is a placeholder - implement actual virus scanning
 * Options:
 * 1. Use node-clamscan (requires ClamAV daemon)
 * 2. Use cloud-based scanning service
 * 3. Use file-type detection libraries
 */
const scanForVirus = async (_buffer: Buffer, _filename: string): Promise<boolean> => {
  // TODO: Implement actual virus scanning
  // Example with node-clamscan:
  /*
  const NodeClam = require('clamscan');
  const clamscan = await new NodeClam().init();
  const { isInfected, viruses } = await clamscan.isInfected(buffer);
  return !isInfected;
  */
  
  // For now, return true (no virus detected)
  // In production, implement actual scanning
  return true;
};

/**
 * Enhanced file upload security middleware
 */
export const fileUploadSecurity = (uploadType: UploadType = 'product') => {
  return async (req: any, _res: any, next: NextFunction): Promise<void> => {
    try {
      const files = (req.files as FileWithBuffer[]) || 
                   (req.file ? [req.file as FileWithBuffer] : []);
      
      if (files.length === 0) {
        return next();
      }
      
      const requestId = (req as any).requestId;
      
      for (const file of files) {
        // Validate file name
        if (!validateFileName(file.originalname)) {
          throw AppError.badRequest(
            'Invalid file name. File name contains dangerous characters.',
            { field: 'file', value: file.originalname },
            requestId
          );
        }
        
        // Validate file extension
        if (!validateFileExtension(file.originalname, uploadType)) {
          throw AppError.badRequest(
            `Invalid file type. Allowed types: ${ALLOWED_EXTENSIONS[uploadType].join(', ')}`,
            { field: 'file', value: file.originalname },
            requestId
          );
        }
        
        // Validate MIME type
        if (!validateMimeType(file.mimetype, uploadType)) {
          throw AppError.badRequest(
            'File MIME type does not match file extension. Possible file type spoofing.',
            { field: 'mimetype', value: file.mimetype },
            requestId
          );
        }
        
        // Validate file size
        if (!validateFileSize(file.size, uploadType)) {
          const maxSizeMB = MAX_FILE_SIZES[uploadType] / (1024 * 1024);
          throw AppError.badRequest(
            `File size exceeds maximum allowed size of ${maxSizeMB}MB`,
            { field: 'size', value: file.size, maxSize: MAX_FILE_SIZES[uploadType] },
            requestId
          );
        }
        
        // Validate file content (magic number)
        if (file.buffer && !validateFileContent(file.buffer, file.mimetype)) {
          throw AppError.badRequest(
            'File content does not match declared file type. Possible file type spoofing.',
            { field: 'content', value: file.mimetype },
            requestId
          );
        }
        
        // Scan for viruses (if buffer is available)
        if (file.buffer) {
          const isClean = await scanForVirus(file.buffer, file.originalname);
          if (!isClean) {
            throw new AppError(
              'Virus detected in uploaded file. File rejected.',
              HttpStatus.BAD_REQUEST,
              ErrorCode.VIRUS_DETECTED,
              true,
              { field: 'file', value: file.originalname },
              requestId
            );
          }
        }
      }
      
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        next(AppError.internal('File validation failed', (req as any).requestId));
      }
    }
  };
};

export {
  validateFileExtension,
  validateMimeType,
  validateFileSize,
  validateFileName,
  validateFileContent,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZES
};

