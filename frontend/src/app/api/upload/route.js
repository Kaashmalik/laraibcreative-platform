import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'laraibcreative/products';
    const transformation = formData.get('transformation') || 'quality_auto:good';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const uploadOptions = {
      folder,
      resource_type: 'auto',
      format: 'webp', // Convert to WebP for better performance
      quality: 'auto:good',
      fetch_format: 'auto',
    };

    // Add transformations if specified
    if (transformation) {
      uploadOptions.transformation = transformation;
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const publicId = `${timestamp}_${randomString}`;

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          ...uploadOptions,
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(buffer);
    });

    // Return Cloudinary response
    return NextResponse.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        filename: result.original_filename,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        resourceType: result.resource_type,
        folder: result.folder,
        createdAt: result.created_at,
      }
    });

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    
    // Return detailed error in development
    const errorDetails = process.env.NODE_ENV === 'development' ? error.message : undefined;
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Upload failed',
        details: errorDetails 
      },
      { status: 500 }
    );
  }
}

// Handle DELETE for removing images
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const publicId = searchParams.get('publicId');

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID is required' },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return NextResponse.json({
        success: true,
        message: 'Image deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to delete image' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Cloudinary delete error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Delete failed',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}