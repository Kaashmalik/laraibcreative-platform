# Image Size Recommendations

## Overview
Optimal image dimensions and file sizes for different use cases in the LaraibCreative e-commerce platform.

---

## Image Types & Recommendations

### 1. Product Images

#### Primary Product Image (Detail Page)
- **Dimensions**: 1200x1200px (1:1 aspect ratio)
- **File Size**: < 200KB (WebP), < 300KB (JPEG)
- **Quality**: 80
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Main product image on product detail page

#### Product Card Images (Listing)
- **Dimensions**: 600x800px (3:4 aspect ratio)
- **File Size**: < 80KB (WebP), < 120KB (JPEG)
- **Quality**: 75
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Product grid/list views

#### Product Thumbnails
- **Dimensions**: 300x300px (1:1 aspect ratio)
- **File Size**: < 30KB (WebP), < 50KB (JPEG)
- **Quality**: 60
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Cart, search results, mini cart

#### Additional Product Images
- **Dimensions**: 1200x1200px (1:1 aspect ratio)
- **File Size**: < 200KB (WebP), < 300KB (JPEG)
- **Quality**: 80
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Product gallery, lightbox

---

### 2. Hero & Banner Images

#### Hero Section Image
- **Dimensions**: 1920x800px (2.4:1 aspect ratio)
- **File Size**: < 150KB (WebP), < 250KB (JPEG)
- **Quality**: 75
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Homepage hero section

#### Banner Images
- **Dimensions**: 1920x600px (3.2:1 aspect ratio)
- **File Size**: < 120KB (WebP), < 200KB (JPEG)
- **Quality**: 75
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Promotional banners, category headers

---

### 3. Category Images

#### Category Card Image
- **Dimensions**: 800x1000px (4:5 aspect ratio)
- **File Size**: < 100KB (WebP), < 150KB (JPEG)
- **Quality**: 75
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Category grid/list views

---

### 4. User-Generated Content

#### Review Images
- **Dimensions**: 800x800px (1:1 aspect ratio)
- **File Size**: < 100KB (WebP), < 150KB (JPEG)
- **Quality**: 75
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Customer review photos

#### Testimonial Avatars
- **Dimensions**: 200x200px (1:1 aspect ratio)
- **File Size**: < 15KB (WebP), < 25KB (JPEG)
- **Quality**: 60
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Customer avatars in testimonials

---

### 5. Admin & UI Images

#### Admin Product Thumbnails
- **Dimensions**: 256x256px (1:1 aspect ratio)
- **File Size**: < 20KB (WebP), < 30KB (JPEG)
- **Quality**: 60
- **Format**: WebP (with JPEG fallback)
- **Use Case**: Admin product tables

#### Logo
- **Dimensions**: 200x200px (1:1 aspect ratio) or SVG
- **File Size**: < 10KB (SVG preferred)
- **Quality**: N/A (vector)
- **Format**: SVG (preferred) or WebP
- **Use Case**: Site logo, favicon

#### Icons
- **Dimensions**: 24x24px to 64x64px
- **File Size**: < 5KB each
- **Format**: SVG (preferred) or PNG
- **Use Case**: UI icons, social media icons

---

## Responsive Image Sizes

### Breakpoints
- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

### Size Recommendations by Breakpoint

#### Product Cards
- **Mobile**: 100vw (full width)
- **Tablet**: 50vw (2 columns)
- **Desktop**: 33vw (3 columns)

#### Product Detail
- **Mobile**: 100vw (full width)
- **Tablet**: 100vw (full width)
- **Desktop**: 50vw (half width)

#### Hero Images
- **Mobile**: 100vw (full width)
- **Tablet**: 50vw (half width)
- **Desktop**: 40vw (40% width)

---

## File Size Targets

### Maximum File Sizes (WebP)
- **Thumbnails**: < 30KB
- **Product Cards**: < 80KB
- **Product Detail**: < 200KB
- **Hero Images**: < 150KB
- **Banners**: < 120KB

### Maximum File Sizes (JPEG - Fallback)
- **Thumbnails**: < 50KB
- **Product Cards**: < 120KB
- **Product Detail**: < 300KB
- **Hero Images**: < 250KB
- **Banners**: < 200KB

---

## Quality Settings by Use Case

```javascript
const QUALITY_SETTINGS = {
  thumbnail: 60,      // Small thumbnails (cart, search)
  card: 75,           // Product cards
  detail: 80,         // Product detail pages
  hero: 75,           // Hero images
  zoom: 100,          // Lightbox/zoom (only)
  logo: 75            // Logos
};
```

---

## Format Priority

1. **AVIF** (best compression, modern browsers)
2. **WebP** (good compression, wide support)
3. **JPEG** (fallback for older browsers)
4. **PNG** (only for images requiring transparency)

---

## Aspect Ratios

### Product Images
- **Primary**: 1:1 (square)
- **Cards**: 3:4 (portrait)
- **Gallery**: 1:1 or 3:4

### Hero/Banner
- **Hero**: 2.4:1 (wide)
- **Banner**: 3.2:1 (very wide)

### Category
- **Category Cards**: 4:5 (portrait)

---

## Optimization Checklist

### Before Upload
- [ ] Resize to recommended dimensions
- [ ] Compress to target file size
- [ ] Convert to WebP format
- [ ] Generate AVIF version (optional)
- [ ] Create blur placeholder
- [ ] Optimize metadata

### In Code
- [ ] Use Next.js Image component
- [ ] Set appropriate quality (60-80)
- [ ] Add sizes prop for responsive images
- [ ] Use priority for above-the-fold images
- [ ] Add blur placeholder
- [ ] Include proper alt text

---

## Tools & Resources

### Image Optimization Tools
- **Sharp** (Node.js): Image processing library
- **ImageOptim** (Mac): GUI tool for optimization
- **TinyPNG**: Online compression tool
- **Squoosh**: Google's image compression tool
- **Cloudinary**: CDN with automatic optimization

### Conversion Scripts
- `scripts/convert-to-webp.js`: Convert images to WebP
- `scripts/generate-blur.js`: Generate blur placeholders

---

## Cloudinary Optimization

If using Cloudinary, add these transformations:

```
w_1200,h_1200,c_limit,q_80,f_webp
```

Parameters:
- `w_1200`: Width 1200px
- `h_1200`: Height 1200px
- `c_limit`: Crop to limit (maintains aspect ratio)
- `q_80`: Quality 80
- `f_webp`: Format WebP

---

## Performance Targets

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5s
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FID (First Input Delay)**: < 100ms

### Image Loading
- **Above-the-fold**: Load immediately (priority)
- **Below-the-fold**: Lazy load
- **Blur placeholder**: Show during load

---

## Example Implementation

```javascript
// Product Card Image
<Image
  src={product.image}
  alt={product.title}
  width={600}
  height={800}
  quality={75}
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  placeholder="blur"
  blurDataURL="..."
/>

// Product Detail Image
<Image
  src={product.primaryImage}
  alt={product.title}
  fill
  quality={80}
  sizes="(max-width: 1024px) 100vw, 50vw"
  priority
  placeholder="blur"
  blurDataURL="..."
/>
```

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0

