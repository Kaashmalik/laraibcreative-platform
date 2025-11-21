"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, User, Calendar, Tag } from 'lucide-react';
import TableOfContents from '@/components/customer/TableOfContents';
import SocialShareButtons from '@/components/customer/SocialShareButtons';
import { generateBlogMetadata, calculateReadingTime } from '@/lib/seo-config';
import { SITE_URL } from '@/lib/constants';

/**
 * Blog Post Client Component
 * Handles all client-side interactivity
 */
export default function BlogPostClient({ params: serverParams, post: initialPost }) {
  const clientParams = useParams();
  const params = serverParams || clientParams;
  const [post, setPost] = useState(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);

  // Only fetch if post wasn't provided by server component
  useEffect(() => {
    if (!initialPost && params.slug) {
      // This should rarely happen if ISR is working correctly
      // But handle it gracefully for client-side navigation
      setLoading(true);
      // Could fetch here if needed, but ideally server component handles it
      setLoading(false);
    }
  }, [initialPost, params.slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold">Blog Post: {params.slug}</h1>
        <p className="mt-4 text-gray-600">Content coming soon...</p>
      </div>
    );
  }

  // Calculate reading time
  const readingTime = post.readTime || calculateReadingTime(post.content || '').minutes;
  
  // Generate Article structured data using seo-config
  const { structuredData } = generateBlogMetadata(post);
  
  // Get current URL for sharing
  const currentUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : `${SITE_URL}/blog/${post.slug}`;

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="mb-8">
          {/* Category Badge */}
          {post.category && (
            <div className="mb-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                <Tag className="w-4 h-4" />
                {post.category}
              </span>
            </div>
          )}
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{post.title}</h1>
          
          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
            {post.authorName || post.author?.fullName ? (
              <>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.authorName || post.author?.fullName || 'LaraibCreative'}</span>
                </div>
                <span>•</span>
              </>
            ) : null}
            
            {post.publishedAt && (
              <>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <time dateTime={post.publishedAt}>
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </time>
                </div>
                <span>•</span>
              </>
            )}
            
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
            <Image
              src={post.featuredImage}
              alt={post.featuredImageAlt || post.title}
              fill
              className="object-cover"
              priority
              quality={85}
              sizes="(max-width: 1024px) 100vw, 1200px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
            />
          </div>
        )}

        {/* Table of Contents */}
        {post.content && (
          <div className="mb-8">
            <TableOfContents content={post.content} />
          </div>
        )}

        {/* Main Content */}
        <div 
          className="prose prose-lg prose-pink max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Related Products */}
        {post.relatedProducts && post.relatedProducts.length > 0 && (
          <div className="my-12 p-6 bg-pink-50 rounded-lg border border-pink-200">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Related Products</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.relatedProducts.map((product) => (
                <Link
                  key={product._id || product.id}
                  href={`/products/${product.slug || product.id}`}
                  className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow"
                >
                  {product.images && product.images[0] && (
                    <div className="relative w-full h-48 mb-3 rounded overflow-hidden">
                      <Image
                        src={product.images[0]}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <h4 className="font-semibold text-gray-900 mb-1">{product.title}</h4>
                  {product.price && (
                    <p className="text-pink-600 font-bold">PKR {product.price.toLocaleString()}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Social Share Buttons */}
        <SocialShareButtons
          url={currentUrl}
          title={post.title}
          description={post.excerpt || ''}
          image={post.featuredImage}
        />
      </article>
    </>
  );
}

