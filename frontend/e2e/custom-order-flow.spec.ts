/**
 * Custom Order Flow E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Custom Order Flow', () => {
  test('should complete custom order wizard', async ({ page }) => {
    await page.goto('/custom-order');

    // Step 1: Service Type Selection
    await page.click('input[value="fully-custom"], label:has-text("Fully Custom")');
    await page.fill('textarea[name="designIdea"], textarea[placeholder*="design" i]', 
      'I want a beautiful suit with intricate embroidery');
    await page.click('button:has-text("Continue"), button:has-text("Next")');

    // Step 2: Image Upload (if required)
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      await fileInput.setInputFiles({
        name: 'reference.jpg',
        mimeType: 'image/jpeg',
        buffer: Buffer.from('fake image content'),
      });
      await page.click('button:has-text("Continue")');
    }

    // Step 3: Fabric Selection
    await page.click('input[value="lc-provides"], label:has-text("We Provide")');
    await page.click('[data-testid="fabric-option"], .fabric-card').first();
    await page.click('button:has-text("Continue")');

    // Step 4: Measurements
    await page.fill('input[name="shirtLength"]', '28');
    await page.fill('input[name="shoulderWidth"]', '16');
    await page.fill('input[name="bust"]', '36');
    await page.fill('input[name="waist"]', '30');
    await page.click('button:has-text("Continue")');

    // Step 5: Order Summary
    await page.fill('input[name="fullName"]', 'Test User');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="tel"]', '03001234567');
    await page.check('input[type="checkbox"][name*="terms"]');
    
    // Submit order
    await page.click('button:has-text("Submit Order"), button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=/success|order.*placed/i')).toBeVisible();
  });

  test('should save draft and restore', async ({ page }) => {
    await page.goto('/custom-order');

    // Fill some fields
    await page.click('input[value="fully-custom"]');
    await page.fill('textarea[name="designIdea"]', 'Test design idea');

    // Save draft
    await page.click('button:has-text("Save Draft")');

    // Reload page
    await page.reload();

    // Should restore draft
    await expect(page.locator('textarea[name="designIdea"]')).toHaveValue('Test design idea');
  });
});

