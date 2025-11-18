'use client';

import { useEffect } from 'react';

/**
 * SEO Component for dynamic meta tags in client components
 * Use this component in pages that need custom SEO
 * Note: For server components, use metadata exports instead
 */
export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  structuredData,
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://laraibcreative.studio';
  const fullTitle = title ? `${title} | LaraibCreative` : 'LaraibCreative - Custom Ladies Suits Stitching Online';
  const fullDescription = description || 'Transform your vision into beautiful reality. Expert custom stitched ladies suits, bridal wear, party suits with perfect measurements. Fast delivery across Pakistan.';
  const ogImage = image || `${siteUrl}/images/og-default.jpg`;
  const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : siteUrl);

  useEffect(() => {
    // Update document title
    if (typeof document !== 'undefined') {
      document.title = fullTitle;
    }

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      if (typeof document === 'undefined') return;
      
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update meta tags
    updateMetaTag('title', fullTitle);
    updateMetaTag('description', fullDescription);
    if (keywords) {
      updateMetaTag('keywords', Array.isArray(keywords) ? keywords.join(', ') : keywords);
    }

    // Robots
    if (noindex) {
      updateMetaTag('robots', 'noindex, nofollow');
    }

    // Open Graph
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', fullDescription, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', 'LaraibCreative', true);
    updateMetaTag('og:locale', 'en_PK', true);

    // Twitter
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', canonicalUrl);
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', fullDescription);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:creator', '@laraibcreative');

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Structured Data
    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(structuredData);
    }
  }, [fullTitle, fullDescription, keywords, ogImage, canonicalUrl, type, noindex, structuredData]);

  // This component doesn't render anything
  return null;
}

