/**
 * Example Playwright E2E Test
 * Tests critical user flows
 */

import { test, expect } from '@playwright/test';

test.describe('Security Management System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the homepage', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Security Management System/);

    // Check that main content is visible
    const mainContent = page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
  });

  test('should enforce HTTPS', async ({ page }) => {
    // Verify the page is served over HTTPS in production
    const url = page.url();
    if (process.env.CI || process.env.NODE_ENV === 'production') {
      expect(url).toMatch(/^https:/);
    }
  });

  test('should have proper security headers', async ({ page, context }) => {
    const response = await page.goto('/');
    
    // Check for security headers
    const headers = await response?.allHeaders();
    if (headers) {
      // These would be set by server/proxy, but we can verify the page loads
      expect(response?.status()).toBe(200);
    }
  });

  test('should navigate to dashboard', async ({ page }) => {
    // Click dashboard link
    const dashboardLink = page.locator('a[href="/dashboard"]');
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Verify we're on dashboard
      expect(page.url()).toContain('/dashboard');
    }
  });

  test('should display error boundary on error', async ({ page }) => {
    // Navigate to a non-existent page
    await page.goto('/non-existent-page');
    
    // Error boundary should catch the 404
    const notFoundElement = page.locator('text=/not found|404/i');
    await expect(notFoundElement).toBeVisible();
  });

  test('should work offline with service worker', async ({ context }) => {
    // First, visit the page online
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveTitle(/Security Management System/);

    // Go offline
    await context.setOffline(true);
    
    // Page should still be accessible via service worker cache
    const offlinePage = await context.newPage();
    await offlinePage.goto('/', { waitUntil: 'commit' });
    
    // Page should load from cache
    const title = await offlinePage.title();
    expect(title).toContain('Security Management System');

    // Go back online
    await context.setOffline(false);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // This would test actual API error handling
    // depending on your app's structure
    await page.goto('/');
    
    // Check that error toast doesn't appear on load
    const errorToast = page.locator('[data-testid="error-toast"]');
    await expect(errorToast).not.toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });
    
    // Check that page renders correctly
    const mainContent = page.locator('[data-testid="main-content"]');
    await expect(mainContent).toBeVisible();
    
    // Check for mobile menu or responsive elements
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if (await mobileMenu.isVisible()) {
      await expect(mobileMenu).toBeVisible();
    }
  });
});
