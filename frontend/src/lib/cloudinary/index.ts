/**
 * Cloudinary Service
 * For public images: Products, Categories, Banners
 * 
 * Features:
 * - Auto format (WebP, AVIF)
 * - Responsive images
 * - CDN optimized
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'pad'
  quality?: 'auto' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  gravity?: 'auto' | 'face' | 'center'
  blur?: number
  placeholder?: boolean
}

/**
 * Generate optimized Cloudinary URL
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  if (!CLOUD_NAME) {
    console.warn('NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME not set')
    return publicId
  }

  // If it's already a full URL, extract public ID
  if (publicId.startsWith('http')) {
    const match = publicId.match(/\/upload\/(?:v\d+\/)?(.+)$/)
    if (match) publicId = match[1]
    else return publicId // Return as-is if not Cloudinary URL
  }

  const transforms: string[] = []

  if (options.width) transforms.push(`w_${options.width}`)
  if (options.height) transforms.push(`h_${options.height}`)
  if (options.crop) transforms.push(`c_${options.crop}`)
  if (options.gravity) transforms.push(`g_${options.gravity}`)
  if (options.quality) transforms.push(`q_${options.quality}`)
  if (options.format) transforms.push(`f_${options.format}`)
  if (options.blur) transforms.push(`e_blur:${options.blur}`)

  // Default optimizations
  if (!options.quality) transforms.push('q_auto')
  if (!options.format) transforms.push('f_auto')

  const transformString = transforms.length > 0 ? transforms.join(',') + '/' : ''

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformString}${publicId}`
}

/**
 * Get responsive image srcSet
 */
export function getCloudinarySrcSet(
  publicId: string,
  widths: number[] = [320, 640, 768, 1024, 1280]
): string {
  return widths
    .map(w => `${getCloudinaryUrl(publicId, { width: w })} ${w}w`)
    .join(', ')
}

/**
 * Get blur placeholder for lazy loading
 */
export function getBlurPlaceholder(publicId: string): string {
  return getCloudinaryUrl(publicId, {
    width: 20,
    quality: 30,
    blur: 1000,
    format: 'webp'
  })
}

// Preset configurations for different use cases
export const cloudinaryPresets = {
  // Product thumbnail (grid view)
  thumbnail: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 400,
    height: 500,
    crop: 'fill',
    gravity: 'auto'
  }),

  // Product main image
  productMain: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 800,
    height: 1000,
    crop: 'fit'
  }),

  // Product gallery zoom
  productZoom: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 1600,
    height: 2000,
    crop: 'fit',
    quality: 90
  }),

  // Category banner
  categoryBanner: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 1200,
    height: 400,
    crop: 'fill',
    gravity: 'auto'
  }),

  // Hero banner
  heroBanner: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 1920,
    height: 800,
    crop: 'fill'
  }),

  // Avatar/profile
  avatar: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 200,
    height: 200,
    crop: 'fill',
    gravity: 'face'
  }),

  // OG Image (social sharing)
  ogImage: (publicId: string) => getCloudinaryUrl(publicId, {
    width: 1200,
    height: 630,
    crop: 'fill'
  })
}

/**
 * Upload image to Cloudinary (server-side only)
 */
export async function uploadToCloudinary(
  file: Buffer | string,
  options: {
    folder?: string
    public_id?: string
    resource_type?: 'image' | 'video' | 'raw'
  } = {}
): Promise<{ public_id: string; secure_url: string; width: number; height: number }> {
  const cloudinary = await import('cloudinary')
  
  cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: options.folder || 'laraibcreative',
      public_id: options.public_id,
      resource_type: options.resource_type || 'image',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    }

    if (typeof file === 'string') {
      cloudinary.v2.uploader.upload(file, uploadOptions, (error, result) => {
        if (error) reject(error)
        else resolve(result as any)
      })
    } else {
      cloudinary.v2.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error)
        else resolve(result as any)
      }).end(file)
    }
  })
}
