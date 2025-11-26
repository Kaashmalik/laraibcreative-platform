/**
 * Supabase Storage Service
 * For private/user files: Reviews, Order attachments, Receipts
 * 
 * Features:
 * - RLS protected
 * - Auth integrated
 * - Private buckets
 */

import { createClient } from './client'

export interface UploadOptions {
  bucket: StorageBucket
  path: string
  file: File | Blob
  contentType?: string
  upsert?: boolean
}

export type StorageBucket = 
  | 'review-images'      // Customer review photos
  | 'order-attachments'  // Custom design references
  | 'payment-receipts'   // Bank transfer proofs
  | 'profile-images'     // User avatars
  | 'custom-designs'     // Custom order designs

/**
 * Upload file to Supabase Storage
 */
export async function uploadFile(options: UploadOptions): Promise<{
  path: string
  publicUrl: string | null
}> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(options.bucket)
    .upload(options.path, options.file, {
      contentType: options.contentType,
      upsert: options.upsert ?? false,
    })

  if (error) throw error

  // Get public URL if bucket is public
  const { data: urlData } = supabase.storage
    .from(options.bucket)
    .getPublicUrl(data.path)

  return {
    path: data.path,
    publicUrl: urlData.publicUrl
  }
}

/**
 * Upload review image
 */
export async function uploadReviewImage(
  reviewId: string,
  file: File,
  index: number
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${reviewId}/${index}.${ext}`

  const result = await uploadFile({
    bucket: 'review-images',
    path,
    file,
    contentType: file.type,
  })

  return result.publicUrl || result.path
}

/**
 * Upload order attachment (custom design reference)
 */
export async function uploadOrderAttachment(
  orderId: string,
  file: File,
  type: 'design' | 'measurement' | 'reference'
): Promise<string> {
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const path = `${orderId}/${type}-${timestamp}.${ext}`

  const result = await uploadFile({
    bucket: 'order-attachments',
    path,
    file,
    contentType: file.type,
  })

  return result.path
}

/**
 * Upload payment receipt (bank transfer proof)
 */
export async function uploadPaymentReceipt(
  orderId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const timestamp = Date.now()
  const path = `${orderId}/receipt-${timestamp}.${ext}`

  const result = await uploadFile({
    bucket: 'payment-receipts',
    path,
    file,
    contentType: file.type,
  })

  return result.path
}

/**
 * Upload profile image
 */
export async function uploadProfileImage(
  userId: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${userId}/avatar.${ext}`

  const result = await uploadFile({
    bucket: 'profile-images',
    path,
    file,
    contentType: file.type,
    upsert: true, // Replace existing avatar
  })

  return result.publicUrl || result.path
}

/**
 * Get signed URL for private file
 */
export async function getSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn = 3600 // 1 hour
): Promise<string> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn)

  if (error) throw error
  return data.signedUrl
}

/**
 * Delete file from storage
 */
export async function deleteFile(
  bucket: StorageBucket,
  paths: string | string[]
): Promise<void> {
  const supabase = createClient()
  const pathArray = Array.isArray(paths) ? paths : [paths]

  const { error } = await supabase.storage
    .from(bucket)
    .remove(pathArray)

  if (error) throw error
}

/**
 * List files in a folder
 */
export async function listFiles(
  bucket: StorageBucket,
  folder: string
): Promise<{ name: string; size: number; created_at: string }[]> {
  const supabase = createClient()

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder)

  if (error) throw error
  return data.map(file => ({
    name: file.name,
    size: file.metadata?.size || 0,
    created_at: file.created_at
  }))
}
