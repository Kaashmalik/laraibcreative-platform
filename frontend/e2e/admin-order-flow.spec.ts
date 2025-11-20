/**
 * Admin Order Management E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Admin Order Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/admin/login');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/.*\/admin/i);
  });

  test('should view all orders', async ({ page }) => {
    await page.goto('/admin/orders');

    // Verify orders are displayed
    await expect(page.locator('[data-testid="order-card"], .order-card').first()).toBeVisible();
  });

  test('should update order status', async ({ page }) => {
    await page.goto('/admin/orders');

    // Click on first order
    await page.click('[data-testid="order-card"], .order-card').first();
    
    // Verify payment first
    const verifyButton = page.locator('button:has-text("Verify Payment")');
    if (await verifyButton.isVisible()) {
      await verifyButton.click();
      await page.click('button:has-text("Approve"), input[value="verified"]');
      await page.fill('textarea[name*="note" i]', 'Payment verified');
      await page.click('button:has-text("Verify"), button[type="submit"]');
    }

    // Update status
    await page.click('button:has-text("Update Status")');
    await page.selectOption('select[name="status"]', 'in-progress');
    await page.fill('textarea[name*="note" i]', 'Order processing started');
    await page.click('button:has-text("Update"), button[type="submit"]');

    // Verify status updated
    await expect(page.locator('text=/in-progress|processing/i')).toBeVisible();
  });

  test('should filter orders', async ({ page }) => {
    await page.goto('/admin/orders');

    // Filter by status
    await page.click('button:has-text("Filter"), select[name="status"]');
    await page.selectOption('select[name="status"]', 'pending-payment');

    // Verify filtered results
    await page.waitForTimeout(1000);
    const orders = page.locator('[data-testid="order-card"], .order-card');
    await expect(orders.first()).toBeVisible();
  });

  test('should download invoice', async ({ page }) => {
    await page.goto('/admin/orders');

    // Click on first order
    await page.click('[data-testid="order-card"], .order-card').first();
    
    // Click download invoice
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Invoice"), a:has-text("Download")');
    const download = await downloadPromise;

    // Verify PDF downloaded
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});

