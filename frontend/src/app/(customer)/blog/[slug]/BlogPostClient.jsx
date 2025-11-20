"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

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

  // JSON-LD Structured Data for Blog Post
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || '',
    image: post.featuredImage,
    author: {
      '@type': 'Person',
      name: post.author || 'LaraibCreative'
    },
    publisher: {
      '@type': 'Organization',
      name: 'LaraibCreative',
      logo: {
        '@type': 'ImageObject',
        url: 'https://laraibcreative.studio/images/logo.png'
      }
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': typeof window !== 'undefined' ? window.location.href : ''
    },
    keywords: (post.tags || []).join(', '),
    articleBody: post.content
  };

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
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <span>By {post.author}</span>
            <span>•</span>
            <time dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString()}
            </time>
            {post.readTime && (
              <>
                <span>•</span>
                <span>{post.readTime} min read</span>
              </>
            )}
          </div>
        </header>

        {post.featuredImage && (
          <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
              quality={80}
              sizes="(max-width: 1024px) 100vw, 1200px"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPg=="
            />
          </div>
        )}

        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </>
  );
}

