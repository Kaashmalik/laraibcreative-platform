"use client";

import { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, User, ChevronRight, Tag } from 'lucide-react';
import BlogCard from '@/components/customer/BlogCard';

export default function BlogClient() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('latest');

  const categories = [
    'All Posts',
    'Karhai Trends',
    'Replica Guides',
    'Stitching Tips',
    'Fabric Guide',
    'Styling Ideas',
    'Bridal Fashion',
    'Seasonal Trends',
    'Behind The Scenes'
  ];

  const popularTags = [
    'Custom Stitching',
    'Bridal',
    'Party Wear',
    'Lawn',
    'Silk',
    'Measurements',
    'Fashion Trends',
    'DIY'
  ];

  // Sample featured post
  const featuredPost = {
    id: 1,
    title: 'Complete Guide to Taking Your Measurements at Home',
    excerpt: 'Learn how to take accurate body measurements for perfect custom stitching. Step-by-step guide with images and video tutorial.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c9866?w=800',
    author: 'Laraib',
    date: '2025-10-10',
    readTime: 8,
    category: 'Stitching Tips',
    tags: ['Measurements', 'DIY', 'Custom Stitching'],
    views: 2547
  };

  // Sample posts
  const samplePosts = [
    {
      id: 2,
      title: 'Top 5 Fabrics for Summer Suits in Pakistan',
      excerpt: 'Discover the best breathable fabrics perfect for Pakistani summers. Complete guide to Lawn, Cotton, and more.',
      image: 'https://images.unsplash.com/photo-1581783342260-e4c7c4149a5a?w=600',
      author: 'Laraib',
      date: '2025-10-08',
      readTime: 6,
      category: 'Fabric Guide',
      tags: ['Lawn', 'Summer', 'Fabric Guide'],
      views: 1832
    },
    {
      id: 3,
      title: 'How to Choose the Perfect Bridal Outfit',
      excerpt: 'Expert tips on selecting your dream bridal suit. From fabric selection to color coordination and embroidery choices.',
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
      author: 'Laraib',
      date: '2025-10-05',
      readTime: 10,
      category: 'Bridal Fashion',
      tags: ['Bridal', 'Wedding', 'Custom Stitching'],
      views: 3241
    },
    {
      id: 4,
      title: 'Difference Between Lawn, Chiffon, and Silk',
      excerpt: 'Understanding fabric types and their characteristics. Make informed decisions for your custom stitching orders.',
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
      author: 'Laraib',
      date: '2025-10-02',
      readTime: 7,
      category: 'Fabric Guide',
      tags: ['Lawn', 'Silk', 'Chiffon', 'Fabric Guide'],
      views: 2156
    },
    {
      id: 5,
      title: '10 Trending Suit Designs for 2025',
      excerpt: 'Stay ahead of fashion with the latest trending designs. From minimalist to heavily embroidered masterpieces.',
      image: 'https://images.unsplash.com/photo-1610797067348-e4f3c8be5470?w=600',
      author: 'Laraib',
      date: '2025-09-28',
      readTime: 9,
      category: 'Seasonal Trends',
      tags: ['Fashion Trends', '2025 Trends', 'Design Ideas'],
      views: 4523
    },
    {
      id: 6,
      title: 'Behind the Scenes: Our Stitching Process',
      excerpt: 'Take a peek into how we transform your vision into reality. From measurement to final quality check.',
      image: 'https://images.unsplash.com/photo-1581783342260-e4c7c4149a5a?w=600',
      author: 'Laraib',
      date: '2025-09-25',
      readTime: 5,
      category: 'Behind The Scenes',
      tags: ['Behind The Scenes', 'Process', 'Quality'],
      views: 1687
    },
    {
      id: 7,
      title: 'How to Care for Your Designer Suits',
      excerpt: 'Essential tips to maintain the beauty and longevity of your custom stitched outfits. Washing, storing, and more.',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600',
      author: 'Laraib',
      date: '2025-09-22',
      readTime: 6,
      category: 'Styling Ideas',
      tags: ['Care Guide', 'Maintenance', 'Tips'],
      views: 1234
    },
    {
      id: 8,
      title: 'Custom Stitching vs Ready-Made: What\'s Better?',
      excerpt: 'Comprehensive comparison to help you make the right choice. Pros, cons, and when to choose each option.',
      image: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600',
      author: 'Laraib',
      date: '2025-09-18',
      readTime: 8,
      category: 'Stitching Tips',
      tags: ['Custom Stitching', 'Comparison', 'Buying Guide'],
      views: 2987
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(samplePosts);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort posts
  const filteredPosts = posts
    .filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
                             post.category.toLowerCase().replace(' ', '-') === selectedCategory;
      const matchesTag = selectedTag === 'all' || 
                        post.tags.some(tag => tag.toLowerCase().replace(' ', '-') === selectedTag);
      return matchesSearch && matchesCategory && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'latest') return new Date(b.date) - new Date(a.date);
      if (sortBy === 'popular') return b.views - a.views;
      if (sortBy === 'oldest') return new Date(a.date) - new Date(b.date);
      return 0;
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Fashion Hub & Stitching Insights
            </h1>
            <p className="text-xl text-pink-100 max-w-2xl mx-auto">
              Expert tips, style guides, and everything you need to know about custom stitching
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-0.5 w-12 bg-pink-600"></div>
            <span className="text-sm font-semibold text-pink-600 uppercase tracking-wide">
              Featured Post
            </span>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-full">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                    {featuredPost.category}
                  </span>
                </div>
              </div>
              
              <div className="p-8 flex flex-col justify-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4 hover:text-pink-600 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 mb-6 line-clamp-3">
                  {featuredPost.excerpt}
                </p>
                
                <div className="flex items-center gap-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{featuredPost.readTime} min read</span>
                  </div>
                </div>
                
                <button className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 w-fit group">
                  Read Full Article
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div className="lg:w-48">
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="latest">Latest First</option>
                  <option value="popular">Most Popular</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
            {categories.map((category) => {
              const slug = category.toLowerCase().replace(' ', '-');
              const isActive = selectedCategory === slug || (category === 'All Posts' && selectedCategory === 'all');
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === 'All Posts' ? 'all' : slug)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-pink-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-pink-50 border border-gray-200'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>

          {/* Popular Tags */}
          <div className="flex items-start gap-3">
            <Tag className="w-5 h-5 text-gray-400 mt-2 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedTag('all')}
                className={`text-sm px-3 py-1 rounded-full transition-all ${
                  selectedTag === 'all'
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Tags
              </button>
              {popularTags.map(tag => {
                const slug = tag.toLowerCase().replace(' ', '-');
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(slug)}
                    className={`text-sm px-3 py-1 rounded-full transition-all ${
                      selectedTag === slug
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredPosts.length}</span> articles
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-pink-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedTag('all');
              }}
              className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Load More */}
        {!loading && filteredPosts.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-white text-pink-600 border-2 border-pink-600 px-8 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium">
              Load More Articles
            </button>
          </div>
        )}

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-3xl font-bold mb-4">Stay Updated!</h3>
          <p className="text-pink-100 mb-6 max-w-2xl mx-auto">
            Get the latest fashion tips, stitching guides, and exclusive offers delivered to your inbox
          </p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <button className="bg-white text-pink-600 px-6 py-3 rounded-lg hover:bg-pink-50 transition-colors font-medium whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
