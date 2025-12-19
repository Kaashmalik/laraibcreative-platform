'use client';

import Link from 'next/link';
import { Calendar, Clock, User, Eye, ChevronRight } from 'lucide-react';

export default function BlogCard({ post }) {
  return (
    <article className="card-premium group h-full flex flex-col bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      {/* Image */}
      <Link href={`/blog/${post.id}`} className="block relative h-56 overflow-hidden">
        <img
          src={post.image || `https://images.unsplash.com/photo-1610797067348-e4f3c8be5470?w=600&q=80`}
          alt={post.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            // Fallback to high-quality Unsplash image
            e.target.src = "https://images.unsplash.com/photo-1558769132-cb1aea3c9866?w=600&q=80";
            e.target.onerror = null; // Prevent infinite loop
          }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="glass px-3 py-1 rounded-full text-xs font-semibold text-white backdrop-blur-md shadow-sm">
            {post.category}
          </span>
        </div>

        {/* Views Badge */}
        <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
          <div className="glass px-3 py-1 rounded-full flex items-center gap-1.5 text-white backdrop-blur-md">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">
              {post.views.toLocaleString()}
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(post.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readTime} min read
            </span>
          </div>

          <Link href={`/blog/${post.id}`} className="block group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 leading-tight">
              {post.title}
            </h3>
          </Link>

          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 leading-relaxed">
            {post.excerpt}
          </p>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {post.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="text-[10px] uppercase tracking-wider font-semibold bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-1 rounded-md border border-gray-100 dark:border-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-xs font-bold text-primary-600 dark:text-primary-400">
              {post.author.charAt(0)}
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">{post.author}</span>
          </div>

          <Link href={`/blog/${post.id}`} className="text-primary-600 dark:text-primary-400 font-semibold text-sm flex items-center gap-1 group/btn hover:underline">
            Read More
            <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </article>
  );
}