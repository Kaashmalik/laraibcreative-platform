/**
 * Product Browse and Cart Flow E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Product Browse and Cart Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products');
  });

  test('should browse products', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"], .product-card, article');
    
    // Check products are displayed
    const products = page.locator('[data-testid="product-card"], .product-card, article').first();
    await expect(products).toBeVisible();
  });

  test('should filter products by category', async ({ page }) => {
    // Click on a category filter
    await page.click('text=Suits, button:has-text("Category")');
    
    // Wait for filtered results
    await page.waitForTimeout(1000);
    
    // Verify products are filtered
    const products = page.locator('[data-testid="product-card"], .product-card');
    await expect(products.first()).toBeVisible();
  });

  test('should search products', async ({ page }) => {
    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first();
    await searchInput.fill('suit');
    await searchInput.press('Enter');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify search results
    const products = page.locator('[data-testid="product-card"], .product-card');
    await expect(products.first()).toBeVisible();
  });

  test('should add product to cart', async ({ page }) => {
    // Click on first product
    await page.click('[data-testid="product-card"], .product-card, article').first();
    
    // Wait for product detail page
    await page.waitForURL(/.*\/products\/.*/);
    
    // Click add to cart
    await page.click('button:has-text("Add to Cart"), button:has-text("Add")');
    
    // Verify cart badge updates
    const cartBadge = page.locator('[data-testid="cart-badge"], .cart-badge');
    await expect(cartBadge).toContainText('1');
  });

  test('should view cart', async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.click('[data-testid="product-card"]').first();
    await page.click('button:has-text("Add to Cart")');
    
    // Navigate to cart
    await page.click('[aria-label*="cart" i], .cart-icon');
    await expect(page).toHaveURL(/.*\/cart/i);
    
    // Verify cart items
    await expect(page.locator('text=/item|product/i')).toBeVisible();
  });

  test('should update cart quantity', async ({ page }) => {
    // Add item and go to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]').first();
    await page.click('button:has-text("Add to Cart")');
    await page.click('[aria-label*="cart" i]');
    
    // Increase quantity
    await page.click('button:has-text("+"), [aria-label*="increase" i]');
    
    // Verify quantity updated
    await expect(page.locator('input[type="number"][value="2"]')).toBeVisible();
  });

  test('should remove item from cart', async ({ page }) => {
    // Add item and go to cart
    await page.goto('/products');
    await page.click('[data-testid="product-card"]').first();
    await page.click('button:has-text("Add to Cart")');
    await page.click('[aria-label*="cart" i]');
    
    // Remove item
    await page.click('button[aria-label*="remove" i], button:has-text("Remove")');
    
    // Confirm removal if dialog appears
    const confirmButton = page.locator('button:has-text("Remove"), button:has-text("Confirm")');
    if (await confirmButton.isVisible()) {
      await confirmButton.click();
    }
    
    // Verify cart is empty or item removed
    await expect(page.locator('text=/empty|no items/i')).toBeVisible({ timeout: 5000 });
  });
});

