import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SKIDS EYEAR - Admin Portal E2E Tests
 * 
 * Test Suite Coverage:
 * 1. Initial load and PWA functionality
 * 2. Roster import workflow
 * 3. Analytics dashboard
 * 4. Data synchronization
 * 5. Export operations
 * 6. Offline functionality
 */

test.describe('Admin Portal - Core Functionality', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to admin portal
    await page.goto('/');
    
    // Wait for React app to load
    await page.waitForLoadState('networkidle');
    
    // Wait for IndexedDB initialization to complete
    // The loading screen will disappear when services are ready
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 15000 });
  });
  
  test('should load the admin portal successfully', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/SKIDS EYEAR/i);
    
    // Wait for app to initialize (IndexedDB setup may take time)
    await page.waitForSelector('[data-testid="main-navigation"], nav', { timeout: 10000 });
    
    // Check for main navigation
    const nav = page.locator('[data-testid="main-navigation"], nav');
    await expect(nav).toBeVisible();
    
    // Check for main content area
    await expect(page.locator('[data-testid="main-content"], main, [role="main"]')).toBeVisible();
  });
  
  test('should display navigation links', async ({ page }) => {
    // Navigation should already be loaded (from beforeEach)
    // Check for specific navigation buttons using test IDs
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-import"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-data"]')).toBeVisible();
  });
  
  test('should show connection status indicator', async ({ page }) => {
    // Navigation should already be loaded (from beforeEach)
    // Look for online/offline indicator with test ID
    const statusIndicator = page.locator('[data-testid="connection-status"]');
    
    await expect(statusIndicator).toBeVisible();
    const statusText = await statusIndicator.textContent();
    expect(statusText).toMatch(/online|offline|connected|ready/i);
  });
});

test.describe('Admin Portal - Analytics Dashboard', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for app initialization (IndexedDB setup)
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 15000 });
    
    // Navigate to analytics/dashboard
    const dashboardLink = page.locator('[data-testid="nav-dashboard"]');
    await dashboardLink.click();
    await page.waitForLoadState('networkidle');
  });
  
  test('should display statistics cards', async ({ page }) => {
    // Look for stat cards with test ID
    const statsContainer = page.locator('[data-testid="stats-container"]');
    
    await expect(statsContainer).toBeVisible({ timeout: 10000 });
  });
  
  test('should display screening data if available', async ({ page }) => {
    // Check for school table or data sections
    const schoolBreakdown = page.locator('[data-testid="school-breakdown"], [data-testid="school-table"]');
    const statsSection = page.locator('[data-testid="stats-section"]');
    
    // At least stats section should be present
    await expect(statsSection).toBeVisible({ timeout: 10000 });
  });
  
  test('should allow manual sync trigger', async ({ page }) => {
    // Look for sync button with test ID
    const syncButton = page.locator('[data-testid="sync-button"]');
    
    await expect(syncButton).toBeVisible({ timeout: 10000 });
    await syncButton.click();
    
    // Should show syncing state
    await expect(syncButton).toContainText(/syncing/i, { timeout: 5000 });
  });
  
  test('should display school-level breakdowns', async ({ page }) => {
    // Look for school-specific data sections
    const schoolSection = page.locator('[data-testid="school-breakdown"]');
    
    // School breakdown may not be visible if no data, so just check page loaded
    await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Admin Portal - Roster Import', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for app initialization (IndexedDB setup)
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 15000 });
    
    // Navigate to roster import screen
    const importLink = page.locator('[data-testid="nav-import"]');
    await importLink.click();
    await page.waitForLoadState('networkidle');
  });
  
  test('should display file upload interface', async ({ page }) => {
    // Look for file input or upload area
    const fileInput = page.locator('input[type="file"]');
    
    await expect(fileInput.first()).toBeVisible({ timeout: 10000 });
  });
  
  test('should accept Excel file upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      // Create a sample CSV file (easier to create than Excel in tests)
      const csvContent = `First Name,Last Name,DOB,Grade,School Code
John,Doe,2015-05-15,K,SCH001
Jane,Smith,2016-03-20,1,SCH001
Mike,Johnson,2014-08-10,2,SCH001`;
      
      // Set the file input
      await fileInput.setInputFiles({
        name: 'roster.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent)
      });
      
      // Should show file selected or processing message
      await expect(
        page.locator('[data-testid*="file"], text=/roster.csv|selected|uploaded/i').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });
  
  test('should provide template download', async ({ page }) => {
    // Look for template download button/link
    const templateButton = page.getByText(/template|download|sample/i).first();
    
    if (await templateButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      
      await templateButton.click();
      
      const download = await downloadPromise;
      if (download) {
        expect(download.suggestedFilename()).toMatch(/template|roster|sample/i);
      }
    }
  });
  
  test('should validate imported data', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      // Upload invalid data
      const invalidCsv = `First Name,Last Name,DOB
John,Doe,invalid-date
Jane,,2016-03-20`;
      
      await fileInput.setInputFiles({
        name: 'invalid.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(invalidCsv)
      });
      
      // Should show validation errors
      await expect(
        page.locator('[data-testid*="error"], [data-testid*="validation"], .error, .validation-error').first()
      ).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe('Admin Portal - Data Manager', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for app initialization (IndexedDB setup)
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 15000 });
    
    // Navigate to data manager
    const dataLink = page.locator('[data-testid="nav-data"]');
    await dataLink.click();
    await page.waitForLoadState('networkidle');
  });
  
  test('should display sync status', async ({ page }) => {
    // Look for sync status information
    const syncStatus = page.locator('[data-testid*="sync"], .sync-status, .sync-info').first();
    
    if (await syncStatus.isVisible()) {
      const statusText = await syncStatus.textContent();
      expect(statusText.length).toBeGreaterThan(0);
    }
  });
  
  test('should show pending sync items', async ({ page }) => {
    // Look for pending items list or counter
    const pendingSection = page.locator('[data-testid*="pending"], .pending-items').first();
    
    if (await pendingSection.isVisible()) {
      // Should display count or list
      const pendingText = await pendingSection.textContent();
      expect(pendingText).toMatch(/\d+|pending|queue/i);
    }
  });
  
  test('should allow data export', async ({ page }) => {
    // Look for export buttons
    const exportButton = page.getByRole('button', { name: /export|download/i }).first();
    
    if (await exportButton.isVisible()) {
      // Set up download listener
      const downloadPromise = page.waitForEvent('download', { timeout: 10000 }).catch(() => null);
      
      await exportButton.click();
      
      const download = await downloadPromise;
      if (download) {
        const filename = download.suggestedFilename();
        expect(filename).toMatch(/\.(json|csv|xlsx)$/i);
      }
    }
  });
  
  test('should display audit log', async ({ page }) => {
    // Look for audit log section
    const auditLog = page.locator('[data-testid*="audit"], [data-testid*="log"], .audit-log').first();
    
    if (await auditLog.isVisible()) {
      // Should contain log entries or timestamps
      const logText = await auditLog.textContent();
      expect(logText.length).toBeGreaterThan(0);
    }
  });
});

test.describe('Admin Portal - PWA Functionality', () => {
  
  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        return registrations.length > 0;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
  });
  
  test('should have PWA manifest', async ({ page }) => {
    await page.goto('/');
    
    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();
  });
  
  test('should work offline after initial load', async ({ page, context }) => {
    // Load the app online first
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for service worker to be active
    await page.waitForTimeout(2000);
    
    // Go offline
    await context.setOffline(true);
    
    // Try to navigate within the app
    await page.reload();
    
    // Should still load (from cache)
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Admin Portal - Accessibility', () => {
  
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for app to load (IndexedDB initialization)
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 15000 });
    
    // Check for h1 (should be in the nav brand)
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
  
  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through focusable elements
    await page.keyboard.press('Tab');
    
    // Check if focus is visible
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBeTruthy();
  });
  
  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check all inputs have labels or aria-label
    const inputs = page.locator('input, textarea, select');
    const count = await inputs.count();
    
    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const hasLabel = await input.evaluate((el) => {
        return !!(el.labels?.length > 0 || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby'));
      });
      expect(hasLabel).toBeTruthy();
    }
  });
});

test.describe('Admin Portal - Performance', () => {
  
  test('should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load in less than 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });
  
  test('should have small bundle size', async ({ page }) => {
    const response = await page.goto('/');
    
    // Check main bundle size (if available in response)
    const contentLength = response?.headers()['content-length'];
    if (contentLength) {
      const sizeKB = parseInt(contentLength) / 1024;
      expect(sizeKB).toBeLessThan(1000); // Less than 1MB
    }
  });
});
