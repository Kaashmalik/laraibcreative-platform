"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Blog Posts</h1>
        <Link href="/admin/content/blog/new">
          <Button>Create New Post</Button>
        </Link>
      </div>
      <p className="text-gray-600">Manage blog posts</p>
    </div>
  );
}