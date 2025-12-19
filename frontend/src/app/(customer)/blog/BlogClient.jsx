"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, Calendar, Clock, User, ChevronRight, Tag } from 'lucide-react';
import BlogCard from '@/components/customer/BlogCard';

import { blogPosts } from '@/lib/blogData';

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

  // Use the first post from data as featured
  const featuredPost = blogPosts[0];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPosts(blogPosts);
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
      {/* Premium Hero Section */}
      <div className="relative py-24 lg:py-32 overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block mb-4 px-4 py-1.5 rounded-full border border-primary-200 bg-primary-50 text-primary-700 text-sm font-medium tracking-wide">
              ✨ Fashion Hub & Stitching Insights
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight">
              <span className="block text-gray-900 dark:text-white mb-2">Discover the</span>
              <span className="gradient-text-animate">Art of Elegance</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
              Expert tips, style guides, and everything you need to know about custom stitching and Pakistani fashion trends.
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

          <div className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl border border-gray-100 dark:border-gray-700">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative h-64 md:h-full overflow-hidden min-h-[300px]">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1558769132-cb1aea3c9866?w=800&q=80";
                    e.target.onerror = null;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                <div className="absolute top-4 left-4">
                  <span className="glass px-4 py-1.5 rounded-full text-white text-sm font-medium backdrop-blur-md border border-white/20">
                    {featuredPost.category}
                  </span>
                </div>
              </div>

              <div className="p-8 lg:p-12 flex flex-col justify-center relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 dark:bg-primary-900/20 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

                <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-500" />
                    <span className="font-medium">{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>{new Date(featuredPost.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary-500" />
                    <span>{featuredPost.readTime} min read</span>
                  </div>
                </div>

                <Link href={`/blog/${featuredPost.id}`} className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-semibold group/btn">
                  Read Full Article
                  <span className="bg-primary-50 dark:bg-primary-900/30 p-2 rounded-full transition-all group-hover/btn:translate-x-1 group-hover/btn:bg-primary-100 dark:group-hover/btn:bg-primary-900/50">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </Link>
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
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all ${isActive
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
                className={`text-sm px-3 py-1 rounded-full transition-all ${selectedTag === 'all'
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
                    className={`text-sm px-3 py-1 rounded-full transition-all ${selectedTag === slug
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
