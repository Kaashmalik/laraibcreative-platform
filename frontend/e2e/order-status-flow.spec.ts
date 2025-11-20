/**
 * Order Status Flow E2E Tests
 */

import { test, expect } from '@playwright/test';

test.describe('Order Status Flow', () => {
  test('should view order status', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/.*\/$|\/dashboard/i);

    // Navigate to orders
    await page.click('text=Orders, a[href*="orders"]');
    await expect(page).toHaveURL(/.*\/orders/i);

    // Check orders are displayed
    await expect(page.locator('[data-testid="order-card"], .order-card').first()).toBeVisible();
  });

  test('should track order by order number', async ({ page }) => {
    await page.goto('/track-order');

    // Enter order number
    await page.fill('input[placeholder*="order" i], input[name*="order" i]', 'LC-2024-0001');
    await page.click('button:has-text("Track"), button[type="submit"]');

    // Should show order status
    await expect(page.locator('text=/status|timeline/i')).toBeVisible();
  });

  test('should view order details', async ({ page }) => {
    // Login and go to orders
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/orders');
    
    // Click on first order
    await page.click('[data-testid="order-card"], .order-card').first();
    
    // Should show order details
    await expect(page.locator('text=/order.*details|items|total/i')).toBeVisible();
  });
});

