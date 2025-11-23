"use client";

export const dynamic = 'force-dynamic';

import { useParams, useRouter } from 'next/navigation';

export default function EditBlogPage() {
  const params = useParams();
  const router = useRouter();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post #{params.id}</h1>
      <p className="text-gray-600">Edit blog post content</p>
    </div>
  );
}