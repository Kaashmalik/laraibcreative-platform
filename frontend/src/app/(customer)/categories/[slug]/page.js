import api from '@/lib/api';
import CategoryPageClient from './CategoryPageClient';
import { SITE_URL } from '@/lib/constants';

/**
 * ISR Configuration
 * Revalidate category pages every 1800 seconds (30 minutes)
 * Categories change less frequently than products
 */
export const revalidate = 1800;

/**
 * Generate static params for category pages at build time
 * Pre-generates pages for active categories
 */
export async function generateStaticParams() {
  try {
    // Fetch all active categories to pre-generate
    const response = await api.categories.getAll();
    const categories = response?.data || response || [];
    
    // Return array of params for static generation
    return categories
      .filter(category => category.slug && category.isActive !== false)
      .map((category) => ({
        slug: category.slug,
      }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    // Return empty array on error - pages will be generated on-demand
    return [];
  }
}

/**
 * Generate dynamic metadata for category pages
 */
export async function generateMetadata({ params }) {
  try {
    const response = await api.categories.getAll();
    const categories = response?.data || response || [];
    const category = categories.find(cat => cat.slug === params.slug);

    if (!category) {
      return {
        title: 'Category Not Found | LaraibCreative',
        description: 'The category you are looking for does not exist.',
        robots: {
          index: false,
          follow: false,
        },
      };
    }

    const categoryName = category.name;
    const description = category.description || 
      `Browse our ${categoryName.toLowerCase()} collection. Premium quality custom stitched suits. Fast delivery across Pakistan.`;

    return {
      title: `${categoryName} Collection | LaraibCreative`,
      description: description.length > 160 
        ? description.substring(0, 157) + '...' 
        : description,
      alternates: {
        canonical: `${SITE_URL}/categories/${params.slug}`,
      },
      openGraph: {
        title: `${categoryName} Collection | LaraibCreative`,
        description,
        url: `${SITE_URL}/categories/${params.slug}`,
        siteName: 'LaraibCreative',
      },
    };
  } catch (error) {
    console.error('Error generating category metadata:', error);
    return {
      title: 'Category | LaraibCreative',
      description: 'Browse our collection of custom stitched ladies suits.',
    };
  }
}

/**
 * Category Page - Server Component Wrapper
 * Fetches data and passes to client component
 */
export default async function CategoryPage({ params }) {
  try {
    // Fetch category by slug
    const categoriesResponse = await api.categories.getAll();
    const categories = categoriesResponse?.data || categoriesResponse || [];
    const category = categories.find(cat => cat.slug === params.slug);

    if (!category) {
      return (
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Category Not Found</h2>
            <p className="text-gray-600 mb-6">The category you're looking for doesn't exist.</p>
            <a href="/products" className="text-pink-600 hover:text-pink-700 font-medium">
              Browse All Products
            </a>
          </div>
        </div>
      );
    }

    // Fetch initial products for this category
    const productsResponse = await api.products.getAll({
      category: category._id || category.id,
      page: 1,
      limit: 12,
      sortBy: 'newest',
    });

    const products = productsResponse?.products || productsResponse?.data?.products || [];
    const totalProducts = productsResponse?.total || productsResponse?.data?.total || products.length;

    return (
      <CategoryPageClient
        category={category}
        initialProducts={products}
        initialTotalProducts={totalProducts}
        slug={params.slug}
      />
    );
  } catch (error) {
    console.error('Error fetching category data:', error);
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Category</h2>
          <p className="text-gray-600 mb-6">Something went wrong. Please try again later.</p>
          <a href="/products" className="text-pink-600 hover:text-pink-700 font-medium">
            Browse All Products
          </a>
        </div>
      </div>
    );
  }
}
