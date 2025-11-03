"use client";

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';

export default function NewBlogPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Save blog post
    router.push('/admin/content/blog');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create New Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <Input
          label="Title"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
        <Textarea
          label="Content"
          value={formData.content}
          onChange={(e) => setFormData({...formData, content: e.target.value})}
          rows={10}
          required
        />
        <div className="flex gap-4">
          <Button type="submit">Publish</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}