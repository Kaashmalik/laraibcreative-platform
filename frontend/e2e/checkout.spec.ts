/**
 * Checkout E2E Tests - Phase 8
 * Using Playwright
 */

import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Go to shop page
    await page.goto('/shop')
  })

  test('should add product to cart', async ({ page }) => {
    // Find first product card
    const productCard = page.locator('[data-testid="product-card"]').first()
    
    // Hover to reveal add to cart button
    await productCard.hover()
    
    // Click add to cart
    await productCard.locator('[data-testid="add-to-cart"]').click()
    
    // Cart drawer should open
    await expect(page.locator('[data-testid="cart-drawer"]')).toBeVisible()
    
    // Should show 1 item
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')
  })

  test('should update cart quantity', async ({ page }) => {
    // Add product first
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.hover()
    await productCard.locator('[data-testid="add-to-cart"]').click()
    
    // Increase quantity
    await page.locator('[data-testid="increase-qty"]').click()
    
    // Should show 2
    await expect(page.locator('[data-testid="item-quantity"]')).toHaveText('2')
  })

  test('should navigate to checkout', async ({ page }) => {
    // Add product
    const productCard = page.locator('[data-testid="product-card"]').first()
    await productCard.hover()
    await productCard.locator('[data-testid="add-to-cart"]').click()
    
    // Click checkout button
    await page.locator('[data-testid="checkout-btn"]').click()
    
    // Should be on checkout page
    await expect(page).toHaveURL(/\/checkout/)
  })

  test('should complete shipping form', async ({ page }) => {
    // Navigate directly with item in cart (mocked)
    await page.goto('/checkout')
    
    // Fill shipping form
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="phone"]', '03001234567')
    await page.fill('[name="full_name"]', 'Test User')
    await page.fill('[name="address_line1"]', 'House 123, Street 4')
    await page.selectOption('[name="city"]', 'Karachi')
    
    // Submit
    await page.click('[data-testid="continue-btn"]')
    
    // Should advance to payment step
    await expect(page.locator('text=Payment Method')).toBeVisible()
  })

  test('should select payment method', async ({ page }) => {
    await page.goto('/checkout')
    
    // Fill and submit shipping
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="phone"]', '03001234567')
    await page.fill('[name="full_name"]', 'Test User')
    await page.fill('[name="address_line1"]', 'House 123, Street 4')
    await page.selectOption('[name="city"]', 'Karachi')
    await page.click('[data-testid="continue-btn"]')
    
    // Select COD
    await page.click('[data-testid="payment-cod"]')
    
    // Continue
    await page.click('[data-testid="continue-btn"]')
    
    // Should show review page
    await expect(page.locator('text=Review Your Order')).toBeVisible()
  })

  test('should apply discount code', async ({ page }) => {
    await page.goto('/checkout')
    
    // Navigate to payment step
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="phone"]', '03001234567')
    await page.fill('[name="full_name"]', 'Test User')
    await page.fill('[name="address_line1"]', 'House 123')
    await page.selectOption('[name="city"]', 'Karachi')
    await page.click('[data-testid="continue-btn"]')
    
    // Enter discount code
    await page.fill('[data-testid="discount-input"]', 'WELCOME10')
    await page.click('[data-testid="apply-discount"]')
    
    // Should show discount applied (or error if invalid)
    await expect(
      page.locator('[data-testid="discount-applied"]').or(page.locator('[data-testid="discount-error"]'))
    ).toBeVisible()
  })
})

test.describe('Product Page', () => {
  test('should display product details', async ({ page }) => {
    // Go to a product page
    await page.goto('/products/test-product')
    
    // Should show product title
    await expect(page.locator('h1')).toBeVisible()
    
    // Should show price
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible()
    
    // Should show add to cart button
    await expect(page.locator('[data-testid="add-to-cart"]')).toBeVisible()
  })

  test('should toggle wishlist', async ({ page }) => {
    await page.goto('/products/test-product')
    
    // Click wishlist button
    const wishlistBtn = page.locator('[data-testid="wishlist-btn"]')
    await wishlistBtn.click()
    
    // Should be added (button state changes)
    await expect(wishlistBtn).toHaveAttribute('data-wishlisted', 'true')
    
    // Click again to remove
    await wishlistBtn.click()
    await expect(wishlistBtn).toHaveAttribute('data-wishlisted', 'false')
  })

  test('should select variant', async ({ page }) => {
    await page.goto('/products/test-product')
    
    // Click a size variant
    const sizeBtn = page.locator('[data-testid="variant-size"]').first()
    await sizeBtn.click()
    
    // Should be selected
    await expect(sizeBtn).toHaveClass(/selected/)
  })
})

test.describe('Authentication', () => {
  test('should redirect unauthenticated users from account page', async ({ page }) => {
    await page.goto('/account')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/auth\/login/)
  })

  test('should show login form', async ({ page }) => {
    await page.goto('/auth/login')
    
    // Should show email and password fields
    await expect(page.locator('[name="email"]')).toBeVisible()
    await expect(page.locator('[name="password"]')).toBeVisible()
    await expect(page.locator('[data-testid="login-btn"]')).toBeVisible()
  })

  test('should show signup form', async ({ page }) => {
    await page.goto('/auth/signup')
    
    await expect(page.locator('[name="email"]')).toBeVisible()
    await expect(page.locator('[name="password"]')).toBeVisible()
    await expect(page.locator('[name="full_name"]')).toBeVisible()
  })
})
