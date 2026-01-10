// ==========================================
// DYNAMIC SITEMAP GENERATION
// ==========================================
// Generates sitemap.xml for SEO optimization
// ==========================================

import api from '@/lib/api';

// Force dynamic rendering to prevent build-time timeout
export const dynamic = 'force-dynamic';

// ==========================================
// DYNAMIC SITEMAP GENERATION
// ==========================================
// Generates sitemap.xml for SEO optimization
// ==========================================

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.studio';
  const currentDate = new Date().toISOString();

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/custom-order`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/size-guide`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // Fetch all products
  let productRoutes = [];
  try {
    const productsResponse = await api.products.getAll({ limit: 1000 });
    const products = productsResponse.products || productsResponse.data?.products || [];
    
    productRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug || product._id}`,
      lastModified: product.updatedAt || currentDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  // Fetch all blog posts
  let blogRoutes = [];
  try {
    const blogResponse = await api.blog.getAll({ limit: 1000 });
    const posts = blogResponse.posts || blogResponse.data?.posts || [];

    blogRoutes = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: post.updatedAt || currentDate,
      changeFrequency: 'monthly',
      priority: 0.7,
    }));
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
  }

  // Category routes
  const categoryRoutes = [
    'bridal-wear',
    'party-wear',
    'casual',
    'formal-wear',
    'designer-replicas',
  ].map((category) => ({
    url: `${baseUrl}/products?category=${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...blogRoutes];
}

