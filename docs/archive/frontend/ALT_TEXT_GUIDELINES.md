# Alt Text Guidelines for Fashion/Tailoring Images

## Overview
This document provides comprehensive guidelines for writing effective, accessible, and SEO-friendly alt text for images in the LaraibCreative e-commerce platform.

---

## Core Principles

### 1. **Be Descriptive, Not Generic**
❌ **Bad**: `alt="image"`, `alt="photo"`, `alt="product"`  
✅ **Good**: `alt="Red velvet bridal suit with gold embroidery"`

### 2. **Include Context**
❌ **Bad**: `alt="Suit"`  
✅ **Good**: `alt="Elegant red velvet bridal suit with intricate gold embroidery - front view"`

### 3. **Be Specific About Product Details**
Include relevant information:
- Product type (suit, lehenga, shalwar kameez)
- Color
- Fabric type (velvet, chiffon, silk, lawn)
- Occasion (bridal, party wear, casual)
- Special features (embroidery, embellishments)

### 4. **Keep It Concise**
- Aim for 5-15 words
- Focus on the most important details
- Avoid redundancy

### 5. **Consider User Context**
- What would a user want to know about this image?
- How does this image help them make a purchase decision?
- What makes this image unique?

---

## Guidelines by Image Type

### Product Images

#### Primary Product Image
**Format**: `[Product Title] - [Fabric Type] [Product Type] [for Occasion]`

**Examples**:
- `alt="Elegant Red Velvet Bridal Suit - Premium velvet fabric with gold embroidery"`
- `alt="Royal Blue Party Wear Suit - Chiffon fabric with sequin work"`
- `alt="Casual Lawn Summer Suit - Lightweight lawn fabric in floral print"`

#### Additional Product Images
**Format**: `[Product Title] - [View/Angle] [Details]`

**Examples**:
- `alt="Elegant Red Velvet Bridal Suit - Back view showing detailed embroidery"`
- `alt="Royal Blue Party Wear Suit - Close-up of sequin embellishments"`
- `alt="Casual Lawn Summer Suit - Side view showing fit and drape"`

#### Product Thumbnails
**Format**: `[Product Title] - Product thumbnail`

**Example**:
- `alt="Elegant Red Velvet Bridal Suit - Product thumbnail"`

### Category Images

**Format**: `[Category Name] category - Browse [Count] products`

**Examples**:
- `alt="Bridal Wear category - Browse 45 elegant bridal suits"`
- `alt="Party Wear category - Browse 32 stunning party outfits"`
- `alt="Casual Wear category - Browse 28 comfortable everyday suits"`

### Customer Review Images

**Format**: `Customer review photo [Number] from [Customer Name]'s review`

**Examples**:
- `alt="Customer review photo 1 from Sarah Ahmed's review"`
- `alt="Customer review photo showing product fit and quality"`

### Logo and Brand Images

**Format**: `[Brand Name] Logo`

**Examples**:
- `alt="LaraibCreative Logo"`
- `alt="LaraibCreative - Custom Stitching Services"`

### Blog Post Images

**Format**: `[Image Description] - [Blog Post Title]`

**Examples**:
- `alt="Fashion tips for wedding season - How to Choose the Perfect Bridal Suit"`
- `alt="Fabric comparison chart - Understanding Different Fabric Types"`

### Admin/Upload Images

**Format**: `[Image Type] [Number] [Context]`

**Examples**:
- `alt="Product photo 1 (primary image)"`
- `alt="Product image preview - full size view"`
- `alt="Payment receipt for order LC-2025-001"`

---

## Dynamic Alt Text Patterns

### Product Cards
```javascript
alt={`${product.title} - ${product.fabric?.type || 'Premium fabric'} ladies suit${product.occasion ? ` for ${product.occasion}` : ''}`}
```

### Product Detail Pages
```javascript
alt={`${product.title || product.name} - Image ${index + 1}`}
```

### Search Results
```javascript
alt={`${product.title} - ${product.category || 'Product'} from LaraibCreative`}
```

### Cart Items
```javascript
alt={`${item.product?.name ? `${item.product.name} - Product image` : 'Product image in cart'}`}
```

---

## Common Mistakes to Avoid

### ❌ Don't:
1. Use "image of" or "picture of" (screen readers already announce it's an image)
2. Include file extensions (`.jpg`, `.png`)
3. Repeat information already in surrounding text
4. Use decorative images with empty alt text (use `alt=""` for decorative images)
5. Use placeholder text like "placeholder" or "coming soon"
6. Include marketing language or promotional text
7. Make alt text too long (over 125 characters)

### ✅ Do:
1. Describe what's actually in the image
2. Include relevant product details (color, fabric, style)
3. Be specific about the view/angle if it's not the primary image
4. Use natural, conversational language
5. Include context that helps users make decisions
6. Test with screen readers to ensure clarity

---

## Special Cases

### Decorative Images
For purely decorative images that don't add information:
```javascript
alt=""
```

### Complex Images (Infographics, Charts)
Provide a longer description:
```javascript
alt="Fabric comparison chart showing characteristics of velvet, chiffon, silk, and lawn fabrics including durability, comfort, and price range"
```

### Images with Text
If the image contains important text, include it in the alt text:
```javascript
alt="Special offer banner: 20% off on all bridal wear this month"
```

### Before/After Images
```javascript
alt="Before and after: Custom stitched suit showing perfect fit and measurements"
```

---

## SEO Considerations

### Keywords
- Include relevant keywords naturally
- Don't keyword stuff
- Focus on user experience first, SEO second

### Examples:
- ✅ `alt="Bridal suit with gold embroidery - Premium velvet fabric"`
- ❌ `alt="bridal suit wedding dress pakistani fashion velvet embroidery gold premium custom stitching"`

---

## Testing Checklist

Before deploying, verify:
- [ ] All images have alt text (or empty alt for decorative images)
- [ ] Alt text is descriptive and specific
- [ ] No generic terms like "image", "photo", "picture"
- [ ] Alt text includes relevant product details
- [ ] Alt text is concise (5-15 words)
- [ ] Alt text makes sense out of context
- [ ] Tested with screen reader
- [ ] No duplicate alt text across similar images

---

## Examples by Component

### ProductCard Component
```javascript
<Image
  src={product.primaryImage}
  alt={`${product.title} - ${product.fabric?.type || 'Premium fabric'} ladies suit${product.occasion ? ` for ${product.occasion}` : ''}`}
  fill
/>
```

### ProductDetailClient Component
```javascript
<Image
  src={product.primaryImage}
  alt={product.title || product.name}
  fill
/>

{/* Additional images */}
<Image
  src={img}
  alt={`${product.title || product.name} - Image ${idx + 1}`}
  fill
/>
```

### ReviewCard Component
```javascript
<Image
  src={image}
  alt={`Customer review photo ${index + 1} from ${review.customer?.fullName || 'customer'}'s review`}
  fill
/>
```

---

## Resources

- [WebAIM: Alternative Text](https://webaim.org/techniques/alttext/)
- [W3C: Images Tutorial](https://www.w3.org/WAI/tutorials/images/)
- [MDN: Image Alt Text Best Practices](https://developer.mozilla.org/en-US/docs/Learn/Accessibility/Images)

---

**Last Updated**: 2025-01-XX  
**Version**: 1.0.0

