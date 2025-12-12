# 📦 Product Seeding Guide - LaraibCreative

## Step-by-Step Instructions

---

## Step 1: Prepare Your Product Images

### Option A: Use Local Images (Recommended)
1. Create/use folder: `backend/seed-images/`
2. Add your product images with simple names:
   ```
   seed-images/
   ├── maroon-bridal-1.jpg
   ├── maroon-bridal-2.jpg
   ├── pink-bridal-1.jpg
   ├── maria-b-lawn-1.jpg
   └── ... etc
   ```
3. Image naming tips:
   - Use lowercase, no spaces (use dashes)
   - Name format: `product-name-number.jpg`
   - Supported: `.jpg`, `.jpeg`, `.png`, `.webp`

### Option B: Use URLs (Quick test)
- Use direct image URLs in the CSV instead of filenames
- Example: `https://example.com/image.jpg`

---

## Step 2: Edit the CSV File

Open `backend/seed-data/products.csv` in Excel or any text editor.

### CSV Columns Explained:

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `title` | ✅ Yes | Product name (min 5 chars) | "Maroon Velvet Bridal Lehnga" |
| `sku` | ✅ Yes | Unique product code | LC-BR-001 |
| `category` | ✅ Yes | Category slug (see list below) | bridal-collection |
| `type` | No | Product type | ready-made, replica, karhai, hand-karhai |
| `fabricType` | ✅ Yes | Fabric material | Lawn, Chiffon, Silk, Velvet, etc. |
| `fabricWeight` | No | Fabric weight | Light, Medium, Heavy |
| `basePrice` | ✅ Yes | Price in PKR | 25000 |
| `stitchingCharge` | No | Custom stitching cost | 5000 |
| `discountPercent` | No | Discount (0-100) | 10 |
| `occasion` | No | When to wear | Bridal, Party Wear, Casual, Formal |
| `description` | ✅ Yes | Product description (min 20 chars) | "Beautiful bridal suit..." |
| `images` | ✅ Yes | Image filenames separated by \| | img1.jpg\|img2.jpg |
| `featured` | No | Show on homepage? | true, false |
| `availability` | No | Stock status | in-stock, custom-only, out-of-stock |

---

## Step 3: Available Categories

Use these exact **slug** values in the `category` column:

| Category Name | Slug (use this) |
|---------------|-----------------|
| Ready-Made Suits | `ready-made-suits` |
| Brand Replicas | `brand-replicas` |
| Hand Karhai Collection | `hand-karhai-collection` |
| Unstitched Fabric | `unstitched-fabric` |
| Bridal Collection | `bridal-collection` |
| Party & Formal Wear | `party-formal-wear` |
| Casual & Everyday | `casual-everyday` |

---

## Step 4: Available Fabric Types

Use these exact values in the `fabricType` column:

```
Lawn, Chiffon, Silk, Cotton, Velvet, Organza, Georgette, 
Jacquard, Linen, Khaddar, Karandi, Cambric, Marina, Net, 
Banarsi, Raw Silk, Jamawar, Other
```

---

## Step 5: Run the Seed Script

Open terminal in `backend` folder and run:

```bash
# Make sure you're in the backend folder
cd backend

# Run the seed script
node src/seeds/bulkProductSeed.js
```

### What happens:
1. ✅ Connects to MongoDB
2. ✅ Reads your CSV file
3. ✅ Uploads images to Cloudinary (if local files)
4. ✅ Creates products in database
5. ✅ Shows success/failure count

---

## 📋 Example CSV Row

```csv
"Maroon Velvet Bridal Lehnga",LC-BR-001,bridal-collection,ready-made,Velvet,Heavy,45000,8000,0,Bridal,"Exquisite maroon velvet bridal lehnga with intricate gold zardozi embroidery.",maroon-bridal-1.jpg|maroon-bridal-2.jpg,true,custom-only
```

---

## 🔧 Troubleshooting

### "Category not found"
- Check the category slug matches exactly (see Step 3)
- Run `node src/seeds/categories.seed.js` first if no categories exist

### "Image not found"
- Check image filename matches exactly (case-sensitive)
- Ensure image is in `backend/seed-images/` folder

### "Validation error"
- Check `title` is at least 5 characters
- Check `description` is at least 20 characters
- Check `basePrice` is a number > 0
- Check `fabricType` is from the allowed list

---

## 🚀 Quick Commands

```bash
# View existing categories
node -e "require('dotenv').config(); require('mongoose').connect(process.env.MONGODB_URI).then(async()=>{const c=await require('./src/models/Category').find({isActive:true}).select('name slug');console.table(c.map(x=>({name:x.name,slug:x.slug})));process.exit(0);})"

# Clear all products (careful!)
node -e "require('dotenv').config(); require('mongoose').connect(process.env.MONGODB_URI).then(async()=>{const r=await require('./src/models/Product').deleteMany({});console.log('Deleted:',r.deletedCount);process.exit(0);})"

# Count products
node -e "require('dotenv').config(); require('mongoose').connect(process.env.MONGODB_URI).then(async()=>{const c=await require('./src/models/Product').countDocuments();console.log('Products:',c);process.exit(0);})"
```

---

## 📁 Folder Structure

```
backend/
├── seed-data/
│   ├── products.csv      ← Your product data (edit this)
│   └── README.md         ← This guide
├── seed-images/
│   ├── maroon-bridal-1.jpg
│   ├── maroon-bridal-2.jpg
│   └── ... (your images)
└── src/seeds/
    └── bulkProductSeed.js  ← The seed script
```

---

## ✅ Checklist Before Running

- [ ] Images are in `backend/seed-images/` folder
- [ ] CSV file is saved as `products.csv` (not template)
- [ ] Category slugs are correct
- [ ] Fabric types are from allowed list
- [ ] Prices are numbers (no commas or currency symbols)
- [ ] Backend server is stopped (optional but recommended)

---

## 🎉 After Seeding

1. Start your backend: `npm run dev`
2. Start your frontend: `npm run dev` (in frontend folder)
3. Visit: `http://localhost:3000/admin/products`
4. Your products should appear!
