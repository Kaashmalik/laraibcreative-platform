import { getBlogPostById } from '@/lib/blogData';
import BlogPostClient from './BlogPostClient';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }) {
    const post = getBlogPostById(params.id);

    if (!post) {
        return {
            title: 'Post Not Found | LaraibCreative',
        };
    }

    return {
        title: `${post.title} | LaraibCreative Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
        },
    };
}

export default function BlogPostPage({ params }) {
    const post = getBlogPostById(params.id);

    if (!post) {
        notFound();
    }

    return <BlogPostClient post={post} />;
}
