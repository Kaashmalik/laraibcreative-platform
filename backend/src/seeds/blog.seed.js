// ==========================================
// BLOG POSTS SEED DATA
// ==========================================
// Seed script for blog posts
// Run: node src/seeds/blog.seed.js
// ==========================================

require('dotenv').config();
const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');
const Product = require('../models/Product');

// Sample blog posts data
const samplePosts = [
  {
    title: 'Ultimate Guide to Karhai Trends 2025: What\'s Hot in Pakistani Fashion',
    slug: 'ultimate-guide-karhai-trends-2025',
    excerpt: 'Discover the latest karhai trends dominating Pakistani fashion in 2025. From traditional embroidery to modern cuts, learn what makes karhai suits the perfect choice for every occasion.',
    content: `<h2>Introduction to Karhai Trends</h2>
<p>Karhai suits have become the cornerstone of Pakistani fashion, blending traditional craftsmanship with contemporary designs. As we navigate through 2025, the fashion landscape continues to evolve, bringing fresh perspectives to this timeless garment. This comprehensive guide explores the hottest karhai trends that are shaping the fashion industry this year.</p>

<h2>What Makes Karhai Suits Special?</h2>
<p>Karhai suits, named after the traditional cooking pot, represent more than just clothing—they embody cultural heritage and artistic expression. These suits are characterized by their intricate handwork, premium fabrics, and attention to detail that sets them apart from mass-produced alternatives.</p>

<h3>Traditional Craftsmanship Meets Modern Design</h3>
<p>The beauty of karhai suits lies in their ability to seamlessly blend traditional techniques with modern aesthetics. Artisans spend countless hours creating intricate embroidery patterns, while designers incorporate contemporary cuts and silhouettes that appeal to today's fashion-conscious consumers.</p>

<h2>Top Karhai Trends for 2025</h2>

<h3>1. Minimalist Embroidery</h3>
<p>Gone are the days of heavy, overwhelming embroidery. The trend in 2025 leans towards minimalist designs that focus on quality over quantity. Delicate thread work, subtle sequins, and strategic placement of embellishments create an elegant, sophisticated look that's perfect for both formal and casual occasions.</p>

<h3>2. Pastel Color Palettes</h3>
<p>Soft pastels are dominating the karhai scene this year. Shades of mint green, powder pink, lavender, and baby blue offer a refreshing alternative to traditional bold colors. These hues work beautifully for daytime events and create a modern, youthful aesthetic.</p>

<h3>3. Asymmetric Cuts and Modern Silhouettes</h3>
<p>Contemporary designers are experimenting with asymmetric hemlines, high-low cuts, and modern silhouettes that add a fresh twist to traditional karhai suits. These designs appeal to younger generations while maintaining the essence of Pakistani fashion.</p>

<h3>4. Sustainable and Eco-Friendly Fabrics</h3>
<p>With growing environmental consciousness, sustainable fabrics are becoming increasingly popular. Organic cotton, bamboo silk, and recycled materials are being incorporated into karhai designs, appealing to eco-conscious consumers without compromising on style or quality.</p>

<h3>5. Fusion Styles</h3>
<p>Fusion karhai suits that blend Pakistani and Western elements are trending. Think traditional embroidery on modern cuts, or Western-style jackets paired with traditional shalwars. This trend caters to the global Pakistani diaspora and fashion-forward individuals seeking unique style statements.</p>

<h2>Choosing the Right Karhai Suit</h2>

<h3>Consider the Occasion</h3>
<p>Different occasions call for different styles. For weddings and formal events, opt for heavily embroidered pieces in rich colors. For casual gatherings, choose lighter fabrics with minimal embellishments. Understanding the dress code helps you select the perfect karhai suit.</p>

<h3>Fabric Selection</h3>
<p>The fabric you choose significantly impacts both the look and comfort of your karhai suit. Premium options include:</p>
<ul>
<li><strong>Silk:</strong> Luxurious and elegant, perfect for formal occasions</li>
<li><strong>Cotton:</strong> Comfortable and breathable, ideal for everyday wear</li>
<li><strong>Chiffon:</strong> Lightweight and flowy, great for summer events</li>
<li><strong>Velvet:</strong> Rich and warm, perfect for winter celebrations</li>
</ul>

<h3>Fit and Measurements</h3>
<p>Proper fit is crucial for looking your best. At LaraibCreative, we offer custom stitching services that ensure your karhai suit fits perfectly. Our expert tailors take precise measurements and create garments tailored to your body shape, ensuring comfort and style.</p>

<h2>Styling Your Karhai Suit</h2>

<h3>Accessorizing</h3>
<p>The right accessories can elevate your karhai suit from good to great. Consider:</p>
<ul>
<li>Statement jewelry that complements your embroidery</li>
<li>Matching or contrasting dupattas for added elegance</li>
<li>Traditional footwear like khussas or modern heels</li>
<li>Clutches or handbags that match your color scheme</li>
</ul>

<h3>Hair and Makeup</h3>
<p>Complete your look with appropriate hair and makeup. Traditional updos work beautifully with heavily embroidered suits, while loose waves complement modern, minimalist designs. Makeup should enhance your natural features without overwhelming your outfit.</p>

<h2>Where to Find Quality Karhai Suits</h2>
<p>Finding authentic, high-quality karhai suits can be challenging. At LaraibCreative, we specialize in creating custom karhai suits that combine traditional craftsmanship with modern design sensibilities. Our team of skilled artisans and designers work together to bring your vision to life.</p>

<h3>Why Choose Custom Stitching?</h3>
<p>Custom stitching offers numerous advantages:</p>
<ul>
<li>Perfect fit tailored to your measurements</li>
<li>Choice of fabric, color, and design</li>
<li>Quality craftsmanship that lasts</li>
<li>Unique pieces that reflect your personal style</li>
<li>Support for traditional artisans and techniques</li>
</ul>

<h2>Maintaining Your Karhai Suit</h2>

<h3>Care Instructions</h3>
<p>Proper care ensures your karhai suit remains beautiful for years:</p>
<ul>
<li>Dry clean embroidered pieces to preserve thread work</li>
<li>Store in breathable garment bags</li>
<li>Avoid direct sunlight to prevent color fading</li>
<li>Handle with care to protect delicate embellishments</li>
</ul>

<h2>Conclusion</h2>
<p>Karhai trends in 2025 reflect a beautiful balance between tradition and modernity. Whether you prefer minimalist designs or heavily embroidered pieces, there's a karhai suit style for everyone. By understanding current trends, choosing quality fabrics, and investing in proper fit, you can create stunning looks that celebrate Pakistani fashion heritage while embracing contemporary aesthetics.</p>

<p>At LaraibCreative, we're committed to helping you discover and create the perfect karhai suit that reflects your personal style. Explore our collection or work with our designers to create a custom piece that's uniquely yours.</p>`,
    category: 'Karhai Trends',
    tags: ['karhai trends', 'Pakistani fashion', 'traditional wear', 'embroidery', 'custom stitching'],
    featuredImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200',
    featuredImageAlt: 'Beautiful karhai suit with intricate embroidery showcasing 2025 trends',
    status: 'published',
    isFeatured: true,
    seo: {
      metaTitle: 'Karhai Trends 2025: Ultimate Guide to Pakistani Fashion',
      metaDescription: 'Discover the latest karhai trends in Pakistani fashion for 2025. Learn about minimalist embroidery, pastel colors, modern silhouettes, and sustainable fabrics. Expert styling tips included.',
      focusKeyword: 'karhai trends 2025',
      keywords: ['Pakistani fashion', 'karhai suits', 'traditional embroidery', 'custom stitching']
    }
  },
  {
    title: 'Complete Replica Guide: How to Get Designer Looks at Affordable Prices',
    slug: 'complete-replica-guide-designer-looks-affordable',
    excerpt: 'Learn everything about designer replicas in Pakistani fashion. Discover how to achieve high-end looks without breaking the bank, understand quality differences, and make informed purchasing decisions.',
    content: `<h2>Understanding Designer Replicas</h2>
<p>Designer replicas have become increasingly popular in Pakistani fashion, offering consumers the opportunity to enjoy high-end designs at more accessible price points. This comprehensive guide explores everything you need to know about replicas, from understanding quality levels to making smart purchasing decisions.</p>

<h2>What Are Designer Replicas?</h2>
<p>Designer replicas are garments inspired by high-end designer pieces, created with similar aesthetics and design elements but at a fraction of the cost. In Pakistani fashion, replicas often replicate the embroidery patterns, cuts, and overall look of expensive designer suits while using more affordable materials and production methods.</p>

<h3>Replicas vs. Originals</h3>
<p>Understanding the difference between replicas and original designer pieces is crucial:</p>
<ul>
<li><strong>Original Designer Pieces:</strong> Created by established designers, using premium materials, and often featuring unique, copyrighted designs. Prices typically range from PKR 50,000 to several lakhs.</li>
<li><strong>High-Quality Replicas:</strong> Carefully crafted to mimic designer aesthetics using quality materials and skilled craftsmanship. Prices range from PKR 15,000 to 50,000.</li>
<li><strong>Budget Replicas:</strong> Basic interpretations of designer styles using standard materials. Prices typically under PKR 15,000.</li>
</ul>

<h2>Types of Replicas Available</h2>

<h3>1. Exact Replicas</h3>
<p>These replicas aim to match the original design as closely as possible, including embroidery patterns, fabric choices, and overall construction. They're ideal for those who want the designer look without the designer price tag.</p>

<h3>2. Inspired Replicas</h3>
<p>Inspired replicas take design elements from original pieces but add unique twists or modifications. They offer more creative freedom while maintaining the essence of the designer aesthetic.</p>

<h3>3. Custom Replicas</h3>
<p>Custom replicas allow you to work with tailors to create pieces inspired by designer looks but tailored to your specific preferences, measurements, and budget.</p>

<h2>Quality Levels in Replicas</h2>

<h3>Premium Quality Replicas</h3>
<p>Premium replicas use high-quality fabrics, skilled embroidery work, and attention to detail that closely matches original pieces. These are ideal for special occasions where you want to look your best without overspending.</p>

<h3>Standard Quality Replicas</h3>
<p>Standard replicas offer good value for money, using decent fabrics and acceptable craftsmanship. They're perfect for regular wear and events where you want a polished look without premium investment.</p>

<h3>Budget Replicas</h3>
<p>Budget replicas provide the basic look and feel of designer pieces at very affordable prices. While they may not match the quality of originals, they offer accessibility to designer-inspired fashion.</p>

<h2>How to Choose the Right Replica</h2>

<h3>Consider Your Budget</h3>
<p>Determine how much you're willing to spend. Higher budgets allow for better materials and craftsmanship, while tighter budgets require prioritizing which elements matter most to you.</p>

<h3>Assess Quality Indicators</h3>
<p>When evaluating replicas, look for:</p>
<ul>
<li>Fabric quality and feel</li>
<li>Embroidery precision and thread quality</li>
<li>Stitching and construction details</li>
<li>Overall finish and attention to detail</li>
<li>Fit and tailoring quality</li>
</ul>

<h3>Read Reviews and Check Credibility</h3>
<p>Before purchasing, research the seller or tailor. Read customer reviews, check their portfolio, and verify their reputation. Reputable sellers stand behind their work and offer quality guarantees.</p>

<h2>Working with Custom Stitching Services</h2>

<h3>Benefits of Custom Replicas</h3>
<p>Custom stitching services like those offered at LaraibCreative provide several advantages:</p>
<ul>
<li>Perfect fit tailored to your measurements</li>
<li>Choice of materials within your budget</li>
<li>Ability to modify designs to suit your preferences</li>
<li>Quality control throughout the process</li>
<li>Direct communication with artisans</li>
</ul>

<h3>The Custom Replica Process</h3>
<p>Creating a custom replica typically involves:</p>
<ol>
<li><strong>Consultation:</strong> Discuss your vision, budget, and preferences</li>
<li><strong>Design Selection:</strong> Choose or modify a design that inspires you</li>
<li><strong>Material Selection:</strong> Pick fabrics and embellishments within your budget</li>
<li><strong>Measurement:</strong> Get professionally measured for perfect fit</li>
<li><strong>Production:</strong> Skilled artisans create your piece</li>
<li><strong>Fitting and Adjustments:</strong> Ensure perfect fit before final delivery</li>
</ol>

<h2>Ethical Considerations</h2>

<h3>Supporting Local Artisans</h3>
<p>When choosing replicas, consider supporting local tailors and artisans who create quality work. This supports the local economy and preserves traditional craftsmanship skills.</p>

<h3>Understanding Intellectual Property</h3>
<p>While replicas are legal in most contexts, it's important to understand that exact copies of copyrighted designs may raise ethical questions. Inspired designs that add unique elements are generally more acceptable.</p>

<h2>Maintaining Your Replica Pieces</h2>

<h3>Care Instructions</h3>
<p>Proper care extends the life of your replica pieces:</p>
<ul>
<li>Follow fabric-specific care instructions</li>
<li>Store properly to prevent damage</li>
<li>Handle embroidered pieces with care</li>
<li>Consider professional cleaning for delicate items</li>
</ul>

<h2>When to Choose Replicas vs. Originals</h2>

<h3>Choose Replicas When:</h3>
<ul>
<li>Budget is a primary concern</li>
<li>You want variety in your wardrobe</li>
<li>The occasion doesn't justify original prices</li>
<li>You prefer custom fit and modifications</li>
</ul>

<h3>Consider Originals When:</h3>
<ul>
<li>You have the budget for premium pieces</li>
<li>Collecting designer pieces is important to you</li>
<li>You want guaranteed authenticity and resale value</li>
<li>Supporting specific designers matters to you</li>
</ul>

<h2>Finding Quality Replica Services</h2>
<p>At LaraibCreative, we specialize in creating high-quality replicas that capture the essence of designer pieces while remaining accessible. Our team works closely with clients to understand their vision and budget, creating pieces that exceed expectations.</p>

<h2>Conclusion</h2>
<p>Designer replicas offer an excellent way to enjoy high-end fashion aesthetics without the premium price tag. By understanding quality levels, working with reputable tailors, and making informed decisions, you can build a beautiful wardrobe that reflects your style and fits your budget.</p>

<p>Whether you're looking for an exact replica or an inspired design, the key is finding the right balance between quality, price, and your personal preferences. With careful consideration and the right service provider, you can achieve stunning looks that make you feel confident and beautiful.</p>`,
    category: 'Replica Guides',
    tags: ['replica guides', 'designer replicas', 'affordable fashion', 'custom stitching', 'Pakistani fashion'],
    featuredImage: 'https://images.unsplash.com/photo-1610797067348-e4f3c8be5470?w=1200',
    featuredImageAlt: 'Designer replica suit showcasing quality craftsmanship and affordable luxury',
    status: 'published',
    isFeatured: true,
    seo: {
      metaTitle: 'Complete Replica Guide: Designer Looks at Affordable Prices',
      metaDescription: 'Learn everything about designer replicas in Pakistani fashion. Discover quality levels, how to choose the right replica, and work with custom stitching services for perfect results.',
      focusKeyword: 'replica guides',
      keywords: ['designer replicas', 'affordable fashion', 'custom stitching', 'Pakistani fashion']
    }
  },
  {
    title: 'Karhai vs Replica: Understanding the Differences and Making the Right Choice',
    slug: 'karhai-vs-replica-understanding-differences',
    excerpt: 'Explore the key differences between karhai suits and designer replicas. Learn when to choose each option, understand quality indicators, and make informed decisions for your wardrobe.',
    content: `<h2>Introduction</h2>
<p>When building a Pakistani fashion wardrobe, understanding the difference between karhai suits and designer replicas is crucial. Both offer unique benefits, but they serve different purposes and appeal to different preferences. This comprehensive guide helps you navigate these options and make informed decisions.</p>

<h2>Understanding Karhai Suits</h2>

<h3>What Are Karhai Suits?</h3>
<p>Karhai suits are traditional Pakistani garments characterized by intricate handwork, premium fabrics, and artisanal craftsmanship. Named after the traditional cooking pot, these suits represent authentic Pakistani fashion heritage, often featuring elaborate embroidery, traditional patterns, and high-quality materials.</p>

<h3>Characteristics of Karhai Suits</h3>
<ul>
<li><strong>Handcrafted Embroidery:</strong> Intricate thread work done by skilled artisans</li>
<li><strong>Premium Fabrics:</strong> High-quality materials like silk, velvet, and premium cotton</li>
<li><strong>Traditional Patterns:</strong> Designs rooted in Pakistani cultural heritage</li>
<li><strong>Artisanal Quality:</strong> Attention to detail and craftsmanship</li>
<li><strong>Unique Pieces:</strong> Often one-of-a-kind or limited production</li>
</ul>

<h2>Understanding Designer Replicas</h2>

<h3>What Are Designer Replicas?</h3>
<p>Designer replicas are garments inspired by high-end designer pieces, created to mimic the aesthetic and style of expensive originals at more accessible price points. They focus on achieving the "look" of designer pieces while using more affordable materials and production methods.</p>

<h3>Characteristics of Designer Replicas</h3>
<ul>
<li><strong>Design-Inspired:</strong> Based on popular designer aesthetics</li>
<li><strong>Affordable Materials:</strong> Quality fabrics chosen for cost-effectiveness</li>
<li><strong>Modern Cuts:</strong> Contemporary silhouettes and styles</li>
<li><strong>Accessible Pricing:</strong> More budget-friendly than originals</li>
<li><strong>Trend-Focused:</strong> Often reflect current fashion trends</li>
</ul>

<h2>Key Differences</h2>

<h3>1. Origin and Heritage</h3>
<p><strong>Karhai Suits:</strong> Rooted in traditional Pakistani craftsmanship and cultural heritage. They represent authentic local fashion traditions passed down through generations.</p>
<p><strong>Replicas:</strong> Inspired by modern designer pieces, often blending traditional and contemporary elements to create accessible fashion.</p>

<h3>2. Craftsmanship Approach</h3>
<p><strong>Karhai Suits:</strong> Emphasize traditional handwork techniques, with artisans spending significant time on each piece. The focus is on preserving traditional methods and skills.</p>
<p><strong>Replicas:</strong> May combine handwork with machine techniques to achieve similar aesthetics more efficiently and affordably.</p>

<h3>3. Material Quality</h3>
<p><strong>Karhai Suits:</strong> Typically use premium, often natural fabrics like pure silk, velvet, and high-grade cotton. Material quality is a primary consideration.</p>
<p><strong>Replicas:</strong> Use quality materials chosen for balance between appearance and cost-effectiveness. May include synthetic blends for affordability.</p>

<h3>4. Design Philosophy</h3>
<p><strong>Karhai Suits:</strong> Focus on traditional patterns, cultural motifs, and heritage designs. Each piece often tells a story or represents cultural significance.</p>
<p><strong>Replicas:</strong> Prioritize achieving designer aesthetics and current fashion trends. Designs are often more contemporary and trend-driven.</p>

<h3>5. Pricing Structure</h3>
<p><strong>Karhai Suits:</strong> Pricing reflects artisanal work, premium materials, and traditional craftsmanship. Typically range from PKR 20,000 to 100,000+ depending on complexity.</p>
<p><strong>Replicas:</strong> More accessible pricing, typically ranging from PKR 10,000 to 40,000, making designer aesthetics available to broader audiences.</p>

<h2>When to Choose Karhai Suits</h2>

<h3>Ideal For:</h3>
<ul>
<li>Traditional ceremonies and cultural events</li>
<li>When you value authentic craftsmanship and heritage</li>
<li>Special occasions where tradition matters</li>
<li>Collecting pieces with cultural significance</li>
<li>Supporting traditional artisans and techniques</li>
<li>When you want unique, one-of-a-kind pieces</li>
</ul>

<h3>Considerations:</h3>
<ul>
<li>Generally higher investment required</li>
<li>May take longer to create due to handwork</li>
<li>Requires careful maintenance</li>
<li>Best for special occasions rather than everyday wear</li>
</ul>

<h2>When to Choose Designer Replicas</h2>

<h3>Ideal For:</h3>
<ul>
<li>Modern events and contemporary occasions</li>
<li>When you want designer aesthetics at accessible prices</li>
<li>Building a versatile wardrobe with variety</li>
<li>Following current fashion trends</li>
<li>Everyday wear and regular occasions</li>
<li>When budget is a primary consideration</li>
</ul>

<h3>Considerations:</h3>
<ul>
<li>May not have the same cultural significance</li>
<li>Quality can vary significantly between providers</li>
<li>Less unique than custom karhai pieces</li>
<li>May need to research to find quality options</li>
</ul>

<h2>Quality Indicators for Both</h2>

<h3>For Karhai Suits:</h3>
<ul>
<li>Precision in embroidery and thread work</li>
<li>Quality of fabric and material feel</li>
<li>Attention to detail in traditional patterns</li>
<li>Durability of construction</li>
<li>Reputation of the artisan or workshop</li>
</ul>

<h3>For Replicas:</h3>
<ul>
<li>Accuracy in replicating design elements</li>
<li>Fabric quality relative to price point</li>
<li>Construction and stitching quality</li>
<li>Overall finish and attention to detail</li>
<li>Seller or tailor reputation and reviews</li>
</ul>

<h2>Combining Both in Your Wardrobe</h2>

<h3>Building a Balanced Collection</h3>
<p>The best approach often involves having both karhai suits and replicas in your wardrobe:</p>
<ul>
<li><strong>Karhai Suits:</strong> For traditional events, cultural celebrations, and special occasions where heritage matters</li>
<li><strong>Replicas:</strong> For modern events, everyday wear, and occasions where contemporary style is preferred</li>
</ul>

<h3>Investment Strategy</h3>
<p>Consider investing more in a few high-quality karhai pieces for special occasions, while using replicas to build variety and follow trends without breaking the budget.</p>

<h2>Custom Options: Best of Both Worlds</h2>

<h3>Custom Karhai Suits</h3>
<p>At LaraibCreative, we offer custom karhai suits that combine traditional craftsmanship with your personal preferences. This allows you to:</p>
<ul>
<li>Choose traditional patterns and motifs</li>
<li>Select premium fabrics within your budget</li>
<li>Get perfect fit through custom measurements</li>
<li>Work directly with skilled artisans</li>
<li>Create unique pieces that reflect your style</li>
</ul>

<h3>Custom Replicas</h3>
<p>We also create custom replicas that allow you to:</p>
<ul>
<li>Modify designer-inspired designs to your taste</li>
<li>Choose materials based on your budget</li>
<li>Ensure perfect fit and comfort</li>
<li>Add personal touches and modifications</li>
<li>Achieve designer aesthetics affordably</li>
</ul>

<h2>Making Your Decision</h2>

<h3>Questions to Consider</h3>
<ol>
<li>What is the occasion or purpose?</li>
<li>What is your budget range?</li>
<li>Do you value tradition or contemporary style more?</li>
<li>How important is uniqueness to you?</li>
<li>What is your maintenance and care capacity?</li>
<li>How often will you wear the piece?</li>
</ol>

<h2>Conclusion</h2>
<p>Both karhai suits and designer replicas have their place in a well-rounded Pakistani fashion wardrobe. Karhai suits offer authentic heritage, traditional craftsmanship, and cultural significance, while replicas provide accessible designer aesthetics and contemporary style.</p>

<p>The best choice depends on your specific needs, preferences, and circumstances. By understanding the differences, considering quality indicators, and working with reputable providers like LaraibCreative, you can make informed decisions that help you build a wardrobe that reflects your personal style while respecting both tradition and modernity.</p>

<p>Whether you choose karhai suits, replicas, or a combination of both, the key is finding pieces that make you feel confident, beautiful, and true to yourself. With the right knowledge and guidance, you can navigate Pakistani fashion with confidence and style.</p>`,
    category: 'Replica Guides',
    tags: ['karhai trends', 'replica guides', 'Pakistani fashion', 'fashion comparison', 'custom stitching'],
    featuredImage: 'https://images.unsplash.com/photo-1581783342260-e4c7c4149a5a?w=1200',
    featuredImageAlt: 'Comparison of karhai suit and designer replica showcasing differences in style and craftsmanship',
    status: 'published',
    isFeatured: false,
    seo: {
      metaTitle: 'Karhai vs Replica: Understanding Differences and Making Right Choice',
      metaDescription: 'Explore key differences between karhai suits and designer replicas. Learn when to choose each, understand quality indicators, and make informed wardrobe decisions.',
      focusKeyword: 'karhai vs replica',
      keywords: ['karhai trends', 'replica guides', 'Pakistani fashion', 'custom stitching']
    }
  }
];

// Seed function
async function seedBlogPosts() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/laraibcreative');
    console.log('Connected to MongoDB');

    // Get admin user for author
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Clear existing sample posts
    await Blog.deleteMany({ 
      slug: { $in: samplePosts.map(p => p.slug) } 
    });
    console.log('Cleared existing sample blog posts');

    // Create blog posts
    for (const postData of samplePosts) {
      const blog = await Blog.create({
        ...postData,
        author: adminUser._id,
        authorName: adminUser.fullName,
        publishedAt: new Date(),
        readTime: Math.ceil(postData.content.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)
      });
      console.log(`Created blog post: ${blog.title}`);
    }

    console.log('Blog posts seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedBlogPosts();
}

module.exports = { samplePosts, seedBlogPosts };
