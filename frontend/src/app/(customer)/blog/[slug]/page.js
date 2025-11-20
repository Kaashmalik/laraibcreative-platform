import { generateBlogMetadata } from '@/lib/seo-config';
import { SITE_URL } from '@/lib/constants';
import api from '@/lib/api';
import BlogPostClient from './BlogPostClient';

/**
 * ISR Configuration
 * Revalidate blog posts every 86400 seconds (24 hours)
 * Blog content changes less frequently, so longer revalidation period
 */
export const revalidate = 86400;

/**
 * Generate static params for blog posts at build time
 * Pre-generates pages for published blog posts
 */
export async function generateStaticParams() {
  try {
    // Fetch all published blog posts to pre-generate
    const response = await api.blog.getAll({ 
      limit: 100, // Get up to 100 blog posts
      page: 1 
    });
    
    const posts = response?.data?.blogs || response?.blogs || response || [];
    
    // Return array of params for static generation
    return posts
      .filter(post => post.slug && post.status === 'published')
      .map((post) => ({
        slug: post.slug,
      }));
  } catch (error) {
    console.error('Error generating static params for blog posts:', error);
    // Return empty array on error - pages will be generated on-demand
    return [];
  }
}

/**
 * Generate dynamic metadata for blog post pages
 * Next.js 14 App Router - Server Component
 */
export async function generateMetadata({ params }) {
  try {
    // Fetch blog post data
    const response = await api.blog.getBySlug(params.slug);
    const post = response?.data?.blog || response?.blog || response;

    if (!post) {
      return {
        title: 'Blog Post | LaraibCreative',
        description: 'Read our latest fashion tips, stitching guides, and style inspiration on the LaraibCreative blog.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const postTitle = post.seoTitle || post.title;
    const postDescription = post.seoDescription || 
      post.excerpt || 
      post.content?.substring(0, 160) || 
      `Read ${postTitle} on LaraibCreative. Expert fashion tips and stitching guides for Pakistani fashion.`;
    
    const postUrl = `${SITE_URL}/blog/${params.slug}`;
    const postImage = post.featuredImage || `${SITE_URL}/images/blog-default.jpg`;

    // Ensure title is 50-60 characters
    const title = postTitle.length > 55 
      ? `${postTitle.substring(0, 52)}...` 
      : postTitle;
    
    // Ensure description is 150-160 characters
    const description = postDescription.length > 160
      ? postDescription.substring(0, 157) + '...'
      : postDescription;

    return {
      title: `${title} | LaraibCreative`,
      description,
      keywords: [
        ...(post.tags || []),
        'fashion blog',
        'Pakistan fashion',
        'clothing guide',
        'style tips',
        'fashion trends',
        'custom stitching',
        'Pakistani fashion blog'
      ].join(', '),
      authors: [{ name: post.author || 'LaraibCreative' }],
      creator: 'LaraibCreative',
      publisher: 'LaraibCreative',
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      alternates: {
        canonical: postUrl,
      },
      openGraph: {
        type: 'article',
        title: `${title} | LaraibCreative`,
        description,
        url: postUrl,
        siteName: 'LaraibCreative',
        locale: 'en_PK',
        images: [
          {
            url: postImage,
            width: 1200,
            height: 630,
            alt: postTitle,
          }
        ],
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt || post.publishedAt,
        authors: [post.author || 'LaraibCreative'],
        section: post.category,
        tags: post.tags || [],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${title} | LaraibCreative`,
        description,
        images: [postImage],
        creator: '@laraibcreative',
        site: '@laraibcreative',
      },
    };
  } catch (error) {
    console.error('Error generating blog metadata:', error);
    return {
      title: 'Blog | LaraibCreative',
      description: 'Read our latest fashion tips, stitching guides, and style inspiration.',
    };
  }
}

/**
 * Blog Post Page - Server Component Wrapper
 * Fetches data and passes to client component
 */
export default async function BlogPostPage({ params }) {
  try {
    // Fetch blog post data
    const response = await api.blog.getBySlug(params.slug);
    const post = response?.data?.blog || response?.blog || response;

    if (!post) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Blog Post Not Found</h2>
            <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
            <a href="/blog" className="text-pink-600 hover:text-pink-700 font-medium">
              Browse All Blog Posts
            </a>
          </div>
        </div>
      );
    }

    return <BlogPostClient params={params} post={post} />;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Blog Post</h2>
          <p className="text-gray-600 mb-6">Something went wrong. Please try again later.</p>
          <a href="/blog" className="text-pink-600 hover:text-pink-700 font-medium">
            Browse All Blog Posts
          </a>
        </div>
      </div>
    );
  }
}
