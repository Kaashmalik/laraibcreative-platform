/**
 * TiDB Categories Service
 */
import { tidb } from './connection'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  parent_id: string | null
  display_order: number
  is_active: boolean
  is_featured: boolean
  product_count?: number
  children?: Category[]
}

export async function getCategories(): Promise<Category[]> {
  return tidb.execute<Category>(`
    SELECT c.*, (
      SELECT COUNT(*) FROM products p 
      WHERE p.category_id = c.id AND p.is_active = true
    ) as product_count
    FROM categories c
    WHERE c.is_active = true
    ORDER BY c.display_order, c.name
  `)
}

export async function getCategoriesTree(): Promise<Category[]> {
  const categories = await getCategories()
  
  const categoryMap = new Map<string, Category>()
  const roots: Category[] = []

  // First pass: create map
  categories.forEach(cat => {
    categoryMap.set(cat.id, { ...cat, children: [] })
  })

  // Second pass: build tree
  categories.forEach(cat => {
    const category = categoryMap.get(cat.id)!
    if (cat.parent_id && categoryMap.has(cat.parent_id)) {
      categoryMap.get(cat.parent_id)!.children!.push(category)
    } else {
      roots.push(category)
    }
  })

  return roots
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  return tidb.queryOne<Category>(`
    SELECT c.*, (
      SELECT COUNT(*) FROM products p 
      WHERE p.category_id = c.id AND p.is_active = true
    ) as product_count
    FROM categories c WHERE c.slug = ? AND c.is_active = true
  `, [slug])
}

export async function getFeaturedCategories(limit = 6): Promise<Category[]> {
  return tidb.execute<Category>(`
    SELECT * FROM categories 
    WHERE is_featured = true AND is_active = true
    ORDER BY display_order LIMIT ?
  `, [limit])
}
