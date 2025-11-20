/**
 * Admin Product Management E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/.*\/admin/i);
  });

  test('should create new product', async ({ page }) => {
    await page.goto('/admin/products/new');

    // Fill product form
    await page.fill('input[name="title"]', 'New Test Product');
    await page.fill('input[name="designCode"]', `LC-2024-${Date.now()}`);
    await page.fill('textarea[name="description"]', 'Test product description');
    await page.fill('input[name="basePrice"]', '5000');
    await page.fill('input[name="stockQuantity"]', '10');

    // Upload image
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'product.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image content'),
      });
    }

    // Submit form
    await page.click('button[type="submit"]:has-text("Create"), button:has-text("Save")');

    // Should redirect to products list
    await expect(page).toHaveURL(/.*\/admin\/products/i);
    await expect(page.locator('text=New Test Product')).toBeVisible();
  });

  test('should edit product', async ({ page }) => {
    await page.goto('/admin/products');

    // Click edit on first product
    await page.click('[data-testid="edit-product"], button:has-text("Edit")').first();
    
    // Update title
    await page.fill('input[name="title"]', 'Updated Product Title');
    
    // Save
    await page.click('button[type="submit"]:has-text("Update"), button:has-text("Save")');

    // Verify update
    await expect(page.locator('text=Updated Product Title')).toBeVisible();
  });

  test('should delete product', async ({ page }) => {
    await page.goto('/admin/products');

    // Click delete on first product
    await page.click('[data-testid="delete-product"], button:has-text("Delete")').first();
    
    // Confirm deletion
    await page.click('button:has-text("Confirm"), button:has-text("Delete")');

    // Verify product removed
    await expect(page.locator('text=/deleted|removed/i')).toBeVisible({ timeout: 5000 });
  });
});

