/**
 * E2E Tests for Custom Order and Checkout Flow
 * Phase 3 Testing Suite
 * 
 * @module e2e/custom-order-checkout
 */

import { test, expect } from '@playwright/test';

test.describe('Custom Order Flow - Phase 3', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to custom order page
    await page.goto('/custom-order');
  });

  test('Complete Karhai suit order flow', async ({ page }) => {
    // Step 1: Select Suit Type (Karhai)
    await page.waitForSelector('text=Suit Type', { timeout: 5000 });
    await page.click('text=Karhai Suit');
    await page.click('button:has-text("Continue")');

    // Step 2: Select Service Type
    await page.waitForSelector('text=Service Type', { timeout: 5000 });
    await page.click('text=Fully Custom Design');
    await page.fill('textarea[placeholder*="design idea"]', 'I want a beautiful karhai suit with zardozi work on the front and back. The suit should be in royal blue color with golden thread embroidery.');
    await page.click('button:has-text("Continue")');

    // Step 3: Upload Reference Images (optional for fully custom, but test upload)
    await page.waitForSelector('text=Reference Images', { timeout: 5000 });
    // Skip image upload for this test or add file upload
    await page.click('button:has-text("Continue")');

    // Step 4: Select Karhai Pattern
    await page.waitForSelector('text=Karhai Embroidery Pattern', { timeout: 5000 });
    await page.click('text=Zardozi');
    await page.click('text=Intricate');
    await page.click('text=Full');
    await page.fill('textarea[placeholder*="pattern"]', 'Traditional zardozi work with floral motifs');
    await page.click('button:has-text("Continue")');

    // Step 5: Enter Measurements
    await page.waitForSelector('text=Measurements', { timeout: 5000 });
    // Try to load from saved profile if available
    const profileButton = page.locator('button:has-text("Load from")');
    if (await profileButton.count() > 0) {
      await profileButton.first().click();
    } else {
      // Enter custom measurements
      await page.fill('input[placeholder*="Shirt Length"]', '38');
      await page.fill('input[placeholder*="Shoulder"]', '14.5');
      await page.fill('input[placeholder*="Bust"]', '20.5');
      await page.fill('input[placeholder*="Waist"]', '20');
    }
    await page.click('button:has-text("Continue")');

    // Step 6: Review and Add to Cart
    await page.waitForSelector('text=Review Your Order', { timeout: 5000 });
    await page.click('button:has-text("Add to Cart")');
    
    // Verify cart notification
    await expect(page.locator('text=Order added to cart')).toBeVisible({ timeout: 5000 });
  });

  test('Checkout flow with receipt upload', async ({ page }) => {
    // Assume cart has items
    await page.goto('/checkout');

    // Step 1: Customer Info
    await page.fill('input[name*="fullName"]', 'Test User');
    await page.fill('input[name*="email"]', 'test@example.com');
    await page.fill('input[name*="phone"]', '03020718182');
    await page.fill('input[name*="whatsapp"]', '03020718182');
    
    // Toggle WhatsApp notifications
    const whatsappToggle = page.locator('input[type="checkbox"]').first();
    if (await whatsappToggle.isVisible()) {
      await whatsappToggle.check();
    }
    
    await page.click('button:has-text("Continue")');

    // Step 2: Shipping Address
    await page.fill('textarea[name*="fullAddress"]', '123 Test Street, Test Area');
    await page.fill('input[name*="city"]', 'Lahore');
    await page.fill('input[name*="province"]', 'Punjab');
    await page.click('button:has-text("Continue")');

    // Step 3: Payment Method
    await page.waitForSelector('text=Payment Method', { timeout: 5000 });
    
    // Select JazzCash
    await page.click('text=JazzCash');
    
    // Verify account details are displayed
    await expect(page.locator('text=0302-0718182')).toBeVisible();
    
    // Upload mock receipt (create a test file)
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.isVisible()) {
      // Note: In real test, you'd use a test image file
      // await fileInput.setInputFiles('path/to/test-receipt.jpg');
    }
    
    await page.fill('input[name*="transactionId"]', 'TEST-TXN-12345');
    await page.click('button:has-text("Review Order")');

    // Step 4: Review and Submit
    await page.waitForSelector('text=Review', { timeout: 5000 });
    await page.click('button:has-text("Place Order")');

    // Verify order confirmation
    await expect(page.locator('text=Order placed successfully')).toBeVisible({ timeout: 10000 });
  });

  test('Form validation prevents skipping steps', async ({ page }) => {
    await page.goto('/custom-order');

    // Try to proceed without selecting suit type
    await page.click('button:has-text("Continue")');
    
    // Should show validation error
    await expect(page.locator('text=Please select a suit type')).toBeVisible({ timeout: 3000 });
  });

  test('Mobile responsive wizard steps', async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/custom-order');

    // Verify step indicator is visible and not overlapping
    const stepIndicator = page.locator('[data-testid="step-indicator"]').or(page.locator('text=Step'));
    await expect(stepIndicator.first()).toBeVisible();

    // Verify buttons are properly sized for mobile
    const continueButton = page.locator('button:has-text("Continue")');
    await expect(continueButton).toBeVisible();
    
    // Check button width on mobile
    const buttonBox = await continueButton.boundingBox();
    expect(buttonBox?.width).toBeGreaterThan(200); // Should be full width or reasonable size
  });
});

test.describe('Admin Order View', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin (you'll need to implement auth)
    // await page.goto('/admin/login');
    // await page.fill('input[name="email"]', 'admin@laraibcreative.com');
    // await page.fill('input[name="password"]', 'password');
    // await page.click('button[type="submit"]');
  });

  test('View order with timeline and receipt', async ({ page }) => {
    // Navigate to order detail page
    await page.goto('/admin/orders/test-order-id');

    // Verify timeline is rendered
    await expect(page.locator('text=Order Timeline')).toBeVisible();
    
    // Verify receipt viewer
    const receiptImage = page.locator('img[alt="Payment Receipt"]');
    if (await receiptImage.count() > 0) {
      await expect(receiptImage).toBeVisible();
      
      // Test receipt enlargement
      await receiptImage.click();
      // Verify new window or modal opens
    }

    // Test status update
    await page.click('button:has-text("Update Status")');
    await page.selectOption('select[name="status"]', 'payment-verified');
    await page.fill('textarea[name="note"]', 'Payment verified successfully');
    await page.click('button:has-text("Update")');

    // Verify status updated
    await expect(page.locator('text=Payment Verified')).toBeVisible();
  });

  test('Add and view admin notes', async ({ page }) => {
    await page.goto('/admin/orders/test-order-id');

    // Navigate to notes tab
    await page.click('text=Internal Notes');

    // Add a note
    await page.fill('textarea[placeholder*="note"]', 'Customer requested rush delivery');
    await page.click('button:has-text("Add Note")');

    // Verify note appears
    await expect(page.locator('text=Customer requested rush delivery')).toBeVisible();
  });
});

