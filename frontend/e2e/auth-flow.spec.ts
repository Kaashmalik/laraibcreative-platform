/**
 * Authentication Flow E2E Tests
 * Tests for user registration and login
 */

import { test, expect } from '@playwright/test';

test.describe('User Registration and Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register a new user', async ({ page }) => {
    // Navigate to registration
    await page.click('text=Sign Up');
    await expect(page).toHaveURL(/.*register|signup/i);

    // Fill registration form
    await page.fill('input[name="fullName"], input[placeholder*="name" i]', 'Test User');
    await page.fill('input[type="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[type="tel"], input[name="phone"]', '03001234567');
    await page.fill('input[type="password"]', 'SecurePass123!');
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Register")');

    // Should redirect to home or dashboard
    await expect(page).toHaveURL(/.*\/$|\/dashboard|\/profile/i);
  });

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/i);

    // Fill login form
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit form
    await page.click('button[type="submit"], button:has-text("Login")');

    // Should redirect after login
    await expect(page).toHaveURL(/.*\/$|\/dashboard|\/profile/i);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/invalid|incorrect|error/i')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first (assuming user is logged in)
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL(/.*\/$|\/dashboard/i);

    // Logout
    await page.click('button:has-text("Logout"), [aria-label*="logout" i]');
    
    // Should redirect to home
    await expect(page).toHaveURL('/');
  });
});

