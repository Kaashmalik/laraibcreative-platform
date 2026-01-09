export const dynamic = 'force-dynamic';
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Eye, FileText, Search, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Toast from '@/components/ui/Toast';
import RichTextEditor from '@/components/admin/RichTextEditor';
import api from '@/lib/api';
import { generateSlug } from '@/lib/utils';
import { calculateReadingTime } from '@/lib/seo-config';

const BLOG_CATEGORIES = [
  'Karhai Trends',
  'Replica Guides',
  'Stitching Tips & Tricks',
  'Fabric Guide',
  'Styling Ideas',
  'Bridal Fashion Trends',
  'Seasonal Collections',
  'Behind the Scenes',
  'Customer Stories',
  'Fashion News',
  'Care Instructions',
  'Design Inspiration'
];

export default function NewBlogPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    featuredImage: '',
    featuredImageAlt: '',
    tags: [],
    status: 'draft',
    isFeatured: false,
    seo: {
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      keywords: []
    },
    relatedProducts: [],
    relatedPosts: []
  });
  const [tagInput, setTagInput] = useState('');
  const [readingTime, setReadingTime] = useState(0);

  // Auto-generate slug from title
  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData(prev => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
      seo: {
        ...prev.seo,
        metaTitle: prev.seo.metaTitle || title.substring(0, 60)
      }
    }));
  };

  // Auto-generate excerpt from content
  const handleContentChange = (content) => {
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const readingTimeCalc = calculateReadingTime(content);
    setReadingTime(readingTimeCalc.minutes);
    
    setFormData(prev => ({
      ...prev,
      content,
      excerpt: prev.excerpt || content.replace(/<[^>]*>/g, '').substring(0, 300),
      seo: {
        ...prev.seo,
        metaDescription: prev.seo.metaDescription || content.replace(/<[^>]*>/g, '').substring(0, 160)
      }
    }));
  };

  // Add tag
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  // Remove tag
  const handleRemoveTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Add SEO keyword
  const handleAddKeyword = () => {
    const keyword = formData.seo.focusKeyword?.trim();
    if (keyword && !formData.seo.keywords.includes(keyword) && formData.seo.keywords.length < 5) {
      setFormData(prev => ({
        ...prev,
        seo: {
          ...prev.seo,
          keywords: [...prev.seo.keywords, keyword]
        }
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e, publish = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      const blogData = {
        ...formData,
        status: publish ? 'published' : formData.status,
        publishedAt: publish ? new Date() : undefined,
        readTime: readingTime || calculateReadingTime(formData.content).minutes
      };

      const response = await api.blog.create(blogData);
      
      if (response?.success || response?.data) {
        setToast({
          type: 'success',
          message: publish ? 'Blog post published successfully!' : 'Blog post saved as draft!'
        });
        
        setTimeout(() => {
          router.push('/admin/content/blog');
        }, 1500);
      } else {
        throw new Error(response?.message || 'Failed to save blog post');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      setToast({
        type: 'error',
        message: error.response?.data?.message || error.message || 'Failed to save blog post'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/content/blog">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Create New Blog Post</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={(e) => handleSubmit(e, true)}
            disabled={loading}
          >
            <FileText className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <Input
              label="Title *"
              value={formData.title}
              onChange={handleTitleChange}
              placeholder="Enter blog post title"
              required
            />

            <Input
              label="Slug *"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="url-friendly-slug"
              required
            />

            <Textarea
              label="Excerpt *"
              value={formData.excerpt}
              onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
              placeholder="Short description (150-300 characters)"
              rows={3}
              required
            />

            <Select
              label="Category *"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              required
            >
              <option value="">Select a category</option>
              {BLOG_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tag and press Enter"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-pink-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Featured Image</h2>
          
          <div className="space-y-4">
            <Input
              label="Image URL *"
              value={formData.featuredImage}
              onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
              placeholder="https://example.com/image.jpg"
              required
            />

            <Input
              label="Alt Text"
              value={formData.featuredImageAlt}
              onChange={(e) => setFormData(prev => ({ ...prev, featuredImageAlt: e.target.value }))}
              placeholder="Descriptive alt text for SEO"
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Content *</h2>
            {readingTime > 0 && (
              <span className="text-sm text-gray-600">
                Reading time: ~{readingTime} minutes
              </span>
            )}
          </div>
          
          <RichTextEditor
            value={formData.content}
            onChange={handleContentChange}
            placeholder="Write your blog post content here..."
            height={500}
          />
        </div>

        {/* SEO Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            SEO Settings
          </h2>
          
          <div className="space-y-4">
            <Input
              label="Meta Title"
              value={formData.seo.metaTitle}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                seo: { ...prev.seo, metaTitle: e.target.value }
              }))}
              placeholder="SEO optimized title (50-60 characters)"
              maxLength={60}
              helpText={`${formData.seo.metaTitle.length}/60 characters`}
            />

            <Textarea
              label="Meta Description"
              value={formData.seo.metaDescription}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                seo: { ...prev.seo, metaDescription: e.target.value }
              }))}
              placeholder="SEO description (120-160 characters)"
              rows={3}
              maxLength={160}
              helpText={`${formData.seo.metaDescription.length}/160 characters`}
            />

            <Input
              label="Focus Keyword"
              value={formData.seo.focusKeyword}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                seo: { ...prev.seo, focusKeyword: e.target.value }
              }))}
              placeholder="Primary keyword for this post"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Keywords (max 5)
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={formData.seo.focusKeyword || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, focusKeyword: e.target.value }
                  }))}
                  placeholder="Enter keyword"
                />
                <Button
                  type="button"
                  onClick={handleAddKeyword}
                  variant="outline"
                  disabled={formData.seo.keywords.length >= 5}
                >
                  Add Keyword
                </Button>
              </div>
              {formData.seo.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.seo.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          seo: {
                            ...prev.seo,
                            keywords: prev.seo.keywords.filter((_, i) => i !== idx)
                          }
                        }))}
                        className="hover:text-blue-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Publishing Options */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Publishing Options</h2>
          
          <div className="space-y-4">
            <Checkbox
              label="Feature this post"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
            />
          </div>
        </div>
      </form>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}