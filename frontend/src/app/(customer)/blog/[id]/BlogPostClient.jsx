'use client';

import Link from 'next/link';
import { Calendar, Clock, User, ChevronLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { getRelatedPosts } from '@/lib/blogData';
import BlogCard from '@/components/customer/BlogCard';

export default function BlogPostClient({ post }) {
    const relatedPosts = getRelatedPosts(post.category, post.id);

    const handleShare = (platform) => {
        // Basic share functionality
        const url = window.location.href;
        const text = `Read this article: ${post.title}`;

        let shareUrl = '';
        if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        if (platform === 'linkedin') shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(post.title)}`;

        if (shareUrl) window.open(shareUrl, '_blank');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 pb-20">
            {/* Hero Header */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

                <div className="absolute inset-0 flex flex-col justify-end container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
                    <Link
                        href="/blog"
                        className="text-white/80 hover:text-white flex items-center gap-2 mb-8 transition-colors w-fit"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Blog
                    </Link>

                    <div className="max-w-4xl">
                        <span className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold mb-6 inline-block">
                            {post.category}
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm md:text-base">
                            <div className="flex items-center gap-2">
                                <User className="w-5 h-5" />
                                <span>{post.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>{new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                <span>{post.readTime} min read</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="grid lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12 border border-gray-100 dark:border-gray-700">
                        <article className="prose prose-lg dark:prose-invert max-w-none prose-pink prose-headings:font-playfair prose-headings:font-bold prose-img:rounded-xl">
                            <div dangerouslySetInnerHTML={{ __html: post.content }} />
                        </article>

                        {/* Tags */}
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-12 pt-8">
                            <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                                Tags
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span
                                        key={tag}
                                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-medium"
                                    >
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Share */}
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8 flex items-center justify-between">
                            <span className="font-semibold text-gray-900 dark:text-white">Share this article</span>
                            <div className="flex gap-4">
                                <button onClick={() => handleShare('facebook')} className="p-2 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleShare('twitter')} className="p-2 bg-sky-100 text-sky-500 rounded-full hover:bg-sky-200 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleShare('linkedin')} className="p-2 bg-indigo-100 text-indigo-600 rounded-full hover:bg-indigo-200 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Related Posts */}
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                                Related Articles
                            </h3>
                            <div className="space-y-6">
                                {relatedPosts.length > 0 ? (
                                    relatedPosts.map(related => (
                                        <BlogCard key={related.id} post={related} />
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm">No related articles found.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
