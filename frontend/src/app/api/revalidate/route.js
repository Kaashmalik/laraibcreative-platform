import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

/**
 * On-Demand Revalidation API Route
 * 
 * This endpoint allows you to manually trigger revalidation of ISR pages
 * after content updates (e.g., product updates, blog posts, etc.)
 * 
 * Security: In production, protect this endpoint with a secret token
 * 
 * Usage:
 * POST /api/revalidate?path=/products/123&secret=YOUR_SECRET_TOKEN
 * POST /api/revalidate?tag=products&secret=YOUR_SECRET_TOKEN
 * 
 * @param {Request} request - Next.js request object
 * @returns {NextResponse} JSON response
 */
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const path = searchParams.get('path');
    const tag = searchParams.get('tag');
    const type = searchParams.get('type'); // 'product', 'blog', 'category', 'homepage'

    // Verify secret token (in production, use environment variable)
    if (secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { 
          error: 'Invalid secret token',
          message: 'Unauthorized access to revalidation endpoint'
        },
        { status: 401 }
      );
    }

    // Validate that either path or tag is provided
    if (!path && !tag && !type) {
      return NextResponse.json(
        { 
          error: 'Missing required parameter',
          message: 'Either "path", "tag", or "type" must be provided'
        },
        { status: 400 }
      );
    }

    // Revalidate by type (convenience method)
    if (type) {
      switch (type) {
        case 'product':
          revalidatePath('/products', 'page');
          revalidateTag('products');
          return NextResponse.json({
            revalidated: true,
            message: 'All product pages revalidated',
            type: 'product'
          });

        case 'blog':
          revalidatePath('/blog', 'page');
          revalidateTag('blog');
          return NextResponse.json({
            revalidated: true,
            message: 'All blog pages revalidated',
            type: 'blog'
          });

        case 'category':
          revalidatePath('/categories', 'page');
          revalidateTag('categories');
          return NextResponse.json({
            revalidated: true,
            message: 'All category pages revalidated',
            type: 'category'
          });

        case 'homepage':
          revalidatePath('/');
          revalidateTag('homepage');
          return NextResponse.json({
            revalidated: true,
            message: 'Homepage revalidated',
            type: 'homepage'
          });

        default:
          return NextResponse.json(
            { 
              error: 'Invalid type',
              message: 'Type must be one of: product, blog, category, homepage'
            },
            { status: 400 }
          );
      }
    }

    // Revalidate by specific path
    if (path) {
      revalidatePath(path);
      return NextResponse.json({
        revalidated: true,
        path,
        now: Date.now()
      });
    }

    // Revalidate by tag
    if (tag) {
      revalidateTag(tag);
      return NextResponse.json({
        revalidated: true,
        tag,
        now: Date.now()
      });
    }

  } catch (error) {
    console.error('Error revalidating:', error);
    return NextResponse.json(
      { 
        error: 'Revalidation failed',
        message: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for health check
 */
export async function GET() {
  return NextResponse.json({
    message: 'Revalidation endpoint is active',
    usage: {
      method: 'POST',
      params: {
        secret: 'REVALIDATION_SECRET (required)',
        path: 'Specific path to revalidate (optional)',
        tag: 'Cache tag to revalidate (optional)',
        type: 'Type to revalidate: product, blog, category, homepage (optional)'
      }
    },
    examples: [
      'POST /api/revalidate?type=product&secret=YOUR_SECRET',
      'POST /api/revalidate?path=/products/123&secret=YOUR_SECRET',
      'POST /api/revalidate?tag=products&secret=YOUR_SECRET'
    ]
  });
}

