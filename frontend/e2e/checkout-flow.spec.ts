/**
 * Checkout Flow E2E Tests
 * Tests for complete guest checkout process
 */

import { test, expect } from '@playwright/test';

test.describe('Guest Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Add item to cart first
    await page.goto('/products');
    await page.click('[data-testid="product-card"], .product-card').first();
    await page.click('button:has-text("Add to Cart")');
    await page.goto('/cart');
  });

  test('should complete guest checkout', async ({ page }) => {
    // Proceed to checkout
    await page.click('button:has-text("Checkout"), button:has-text("Proceed")');
    await expect(page).toHaveURL(/.*\/checkout/i);

    // Fill customer information
    await page.fill('input[name="fullName"], input[placeholder*="name" i]', 'Guest User');
    await page.fill('input[type="email"]', 'guest@example.com');
    await page.fill('input[type="tel"], input[name="phone"]', '03001234567');

    // Fill shipping address
    await page.fill('input[name="addressLine1"], input[placeholder*="address" i]', '123 Test Street');
    await page.fill('input[name="city"]', 'Lahore');
    await page.selectOption('select[name="province"]', 'Punjab');
    await page.fill('input[name="postalCode"]', '54000');

    // Select payment method
    await page.click('input[value="cod"], label:has-text("Cash on Delivery")');

    // Upload payment receipt (if required)
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'receipt.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image content'),
      });
    }

    // Accept terms
    await page.check('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="agree"]');

    // Submit order
    await page.click('button[type="submit"]:has-text("Place Order"), button:has-text("Submit")');

    // Should redirect to confirmation page
    await expect(page).toHaveURL(/.*\/order\/.*\/confirmation|\/checkout\/success/i);
    await expect(page.locator('text=/order.*success|thank you/i')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/checkout');

    // Try to submit without filling form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator('text=/required|invalid/i').first()).toBeVisible();
  });

  test('should apply promo code', async ({ page }) => {
    await page.goto('/checkout');

    // Find promo code input
    const promoInput = page.locator('input[placeholder*="promo" i], input[name*="promo" i]');
    if (await promoInput.isVisible()) {
      await promoInput.fill('WELCOME10');
      await page.click('button:has-text("Apply")');
      
      // Verify discount applied
      await expect(page.locator('text=/discount|saved/i')).toBeVisible();
    }
  });
});

