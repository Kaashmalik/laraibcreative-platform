//frontend/src/app/(customer)/blog/[slug]/page.js
"use client";



export default function BlogPostPage({ params }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">Blog Post: {params.slug}</h1>
      <p className="mt-4 text-gray-600">Content coming soon...</p>
    </div>
  );
}
