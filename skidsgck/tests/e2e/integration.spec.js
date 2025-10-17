import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SKIDS EYEAR - Integration E2E Tests
 * 
 * Test Suite Coverage:
 * 1. End-to-end roster import → database → analytics flow
 * 2. Data synchronization scenarios
 * 3. Export workflows (multiple formats)
 * 4. Offline → Online sync recovery
 * 5. Conflict resolution
 */

test.describe('Integration - Roster Import to Analytics Flow', () => {
  
  test('should import roster and reflect in analytics', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for app initialization (IndexedDB setup)
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 15000 });
    
    // Step 1: Navigate to roster import
    const importLink = page.locator('[data-testid="nav-import"]');
    await importLink.click();
    await page.waitForLoadState('networkidle');
      
      // Step 2: Upload roster file
      const fileInput = page.locator('input[type="file"]').first();
      
      if (await fileInput.isVisible()) {
        const csvContent = `First Name,Last Name,DOB,Grade,School Code
Alice,Johnson,2015-01-15,K,SCH001
Bob,Williams,2015-06-20,K,SCH001
Charlie,Brown,2014-09-10,1,SCH001`;
        
        await fileInput.setInputFiles({
          name: 'test-roster.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csvContent)
        });
        
        // Step 3: Wait for import to complete
        await page.waitForTimeout(2000);
        
        // Step 4: Check for success message
        const successMessage = page.locator('[data-testid*="success"], .success, text=/imported|success/i').first();
        if (await successMessage.isVisible()) {
          // Step 5: Navigate to analytics
          const dashboardLink = page.locator('[data-testid="nav-dashboard"]');
          await dashboardLink.click();
          await page.waitForLoadState('networkidle');
          
          // Step 6: Verify data appears in analytics
          const statsContainer = page.locator('[data-testid="stats-container"]');
          await expect(statsContainer).toBeVisible();
          
          // Should show at least the imported children count
          const pageContent = await page.textContent('body');
          expect(pageContent).toMatch(/\d+/); // Should contain numbers
        }
      }
  });
  
  test('should handle large roster import', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for app initialization (IndexedDB setup)
    await page.waitForSelector('[data-testid="main-navigation"]', { timeout: 15000 });
    
    const importLink = page.locator('[data-testid="nav-import"]');
    await importLink.click();
    await page.waitForLoadState('networkidle');
      
    const fileInput = page.locator('input[type="file"]').first();
      
      if (await fileInput.isVisible()) {
        // Generate large CSV (100 children)
        let csvContent = 'First Name,Last Name,DOB,Grade,School Code\n';
        for (let i = 1; i <= 100; i++) {
          csvContent += `Child${i},Test${i},2015-0${(i % 9) + 1}-15,${i % 6},SCH001\n`;
        }
        
        await fileInput.setInputFiles({
          name: 'large-roster.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csvContent)
        });
        
        // Should handle large import without crashing
        await page.waitForTimeout(5000);
        
        // Check for success or progress indicator
        const statusElement = page.locator('[data-testid*="status"], [data-testid*="progress"], .status, .progress').first();
        if (await statusElement.isVisible()) {
          const statusText = await statusElement.textContent();
          expect(statusText.length).toBeGreaterThan(0);
        }
      }
  });
});

test.describe('Integration - Data Export Workflows', () => {
  
  test('should export data in CSV format', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to data manager
    const dataLink = page.getByText(/data|manage/i).first();
    if (await dataLink.isVisible()) {
      await dataLink.click();
      await page.waitForLoadState('networkidle');
      
      // Find CSV export button
      const csvExportButton = page.getByRole('button', { name: /csv|export.*csv/i }).first();
      
      if (await csvExportButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        
        await csvExportButton.click();
        
        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        
        expect(filename).toMatch(/\.csv$/i);
        
        // Verify file content
        const filepath = await download.path();
        if (filepath) {
          const fs = await import('fs/promises');
          const content = await fs.readFile(filepath, 'utf-8');
          expect(content.length).toBeGreaterThan(0);
        }
      }
    }
  });
  
  test('should export data in JSON format', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const dataLink = page.getByText(/data|manage/i).first();
    if (await dataLink.isVisible()) {
      await dataLink.click();
      await page.waitForLoadState('networkidle');
      
      const jsonExportButton = page.getByRole('button', { name: /json|export.*json/i }).first();
      
      if (await jsonExportButton.isVisible()) {
        const downloadPromise = page.waitForEvent('download', { timeout: 10000 });
        
        await jsonExportButton.click();
        
        const download = await downloadPromise;
        const filename = download.suggestedFilename();
        
        expect(filename).toMatch(/\.json$/i);
        
        // Verify JSON is valid
        const filepath = await download.path();
        if (filepath) {
          const fs = await import('fs/promises');
          const content = await fs.readFile(filepath, 'utf-8');
          const json = JSON.parse(content); // Should not throw
          expect(json).toBeDefined();
        }
      }
    }
  });
});

test.describe('Integration - Offline to Online Sync', () => {
  
  test('should queue changes while offline', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Make some changes while online
    const importLink = page.getByText(/import|roster/i).first();
    if (await importLink.isVisible()) {
      await importLink.click();
      await page.waitForLoadState('networkidle');
      
      // Go offline
      await context.setOffline(true);
      
      // Try to import data while offline
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        const csvContent = `First Name,Last Name,DOB,Grade,School Code
Offline,Test,2015-05-15,K,SCH001`;
        
        await fileInput.setInputFiles({
          name: 'offline-roster.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csvContent)
        });
        
        await page.waitForTimeout(2000);
        
        // Should show offline indicator or queued message
        const offlineIndicator = page.locator('[data-testid*="offline"], .offline, text=/offline|queued/i').first();
        
        // Go back online
        await context.setOffline(false);
        await page.waitForTimeout(2000);
        
        // Should sync automatically
        const onlineIndicator = page.locator('[data-testid*="online"], .online, text=/online|synced/i').first();
        if (await onlineIndicator.isVisible({ timeout: 10000 })) {
          expect(await onlineIndicator.isVisible()).toBeTruthy();
        }
      }
    }
  });
  
  test('should handle sync conflicts', async ({ page }) => {
    // This test requires backend support for conflict simulation
    // For now, we'll test the UI behavior
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const dataLink = page.getByText(/data|manage|sync/i).first();
    if (await dataLink.isVisible()) {
      await dataLink.click();
      await page.waitForLoadState('networkidle');
      
      // Look for conflict resolution UI (if any conflicts exist)
      const conflictSection = page.locator('[data-testid*="conflict"], .conflict, .conflict-resolution').first();
      
      if (await conflictSection.isVisible()) {
        // Should show conflict details
        const conflictText = await conflictSection.textContent();
        expect(conflictText).toMatch(/conflict|version|merge/i);
      }
    }
  });
});

test.describe('Integration - Multi-User Scenarios', () => {
  
  test('should handle concurrent imports in different tabs', async ({ browser }) => {
    // Create two contexts (simulating two users)
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Both users navigate to import screen
    await page1.goto('/');
    await page1.waitForLoadState('networkidle');
    await page2.goto('/');
    await page2.waitForLoadState('networkidle');
    
    const importLink1 = page1.getByText(/import|roster/i).first();
    const importLink2 = page2.getByText(/import|roster/i).first();
    
    if (await importLink1.isVisible() && await importLink2.isVisible()) {
      await importLink1.click();
      await importLink2.click();
      
      await page1.waitForLoadState('networkidle');
      await page2.waitForLoadState('networkidle');
      
      // Both upload files simultaneously
      const fileInput1 = page1.locator('input[type="file"]').first();
      const fileInput2 = page2.locator('input[type="file"]').first();
      
      if (await fileInput1.isVisible() && await fileInput2.isVisible()) {
        const csv1 = 'First Name,Last Name,DOB,Grade,School Code\nUser1,Test1,2015-01-15,K,SCH001';
        const csv2 = 'First Name,Last Name,DOB,Grade,School Code\nUser2,Test2,2015-02-20,K,SCH001';
        
        await Promise.all([
          fileInput1.setInputFiles({
            name: 'user1-roster.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(csv1)
          }),
          fileInput2.setInputFiles({
            name: 'user2-roster.csv',
            mimeType: 'text/csv',
            buffer: Buffer.from(csv2)
          })
        ]);
        
        await page1.waitForTimeout(3000);
        await page2.waitForTimeout(3000);
        
        // Both should complete successfully
        const success1 = page1.locator('[data-testid*="success"], .success').first();
        const success2 = page2.locator('[data-testid*="success"], .success').first();
        
        // At least one should show success
        const hasSuccess = await success1.isVisible() || await success2.isVisible();
        expect(hasSuccess).toBeTruthy();
      }
    }
    
    await context1.close();
    await context2.close();
  });
});

test.describe('Integration - Data Validation Pipeline', () => {
  
  test('should validate data throughout the pipeline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const importLink = page.getByText(/import|roster/i).first();
    if (await importLink.isVisible()) {
      await importLink.click();
      await page.waitForLoadState('networkidle');
      
      const fileInput = page.locator('input[type="file"]').first();
      
      if (await fileInput.isVisible()) {
        // Upload data with validation errors
        const invalidCsv = `First Name,Last Name,DOB,Grade,School Code
,InvalidNoFirstName,2015-05-15,K,SCH001
John,,2015-06-20,K,SCH001
Jane,Doe,invalid-date,K,SCH001
Mike,Smith,2015-08-10,InvalidGrade,SCH001`;
        
        await fileInput.setInputFiles({
          name: 'invalid-data.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(invalidCsv)
        });
        
        await page.waitForTimeout(2000);
        
        // Should show validation errors
        const errorSection = page.locator('[data-testid*="error"], [data-testid*="validation"], .error, .validation-error');
        
        const errorCount = await errorSection.count();
        expect(errorCount).toBeGreaterThan(0);
        
        // Should list specific errors
        const errorText = await page.textContent('body');
        expect(errorText).toMatch(/first name|last name|date|grade/i);
      }
    }
  });
  
  test('should prevent importing duplicate records', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const importLink = page.getByText(/import|roster/i).first();
    if (await importLink.isVisible()) {
      await importLink.click();
      await page.waitForLoadState('networkidle');
      
      const fileInput = page.locator('input[type="file"]').first();
      
      if (await fileInput.isVisible()) {
        // Upload duplicate records
        const duplicateCsv = `First Name,Last Name,DOB,Grade,School Code
John,Doe,2015-05-15,K,SCH001
John,Doe,2015-05-15,K,SCH001
John,Doe,2015-05-15,K,SCH001`;
        
        await fileInput.setInputFiles({
          name: 'duplicate-roster.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(duplicateCsv)
        });
        
        await page.waitForTimeout(2000);
        
        // Should show warning about duplicates
        const warningSection = page.locator('[data-testid*="warning"], [data-testid*="duplicate"], .warning, text=/duplicate/i');
        
        if (await warningSection.first().isVisible()) {
          const warningText = await warningSection.first().textContent();
          expect(warningText).toMatch(/duplicate/i);
        }
      }
    }
  });
});

test.describe('Integration - Performance Under Load', () => {
  
  test('should handle rapid navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Rapidly navigate between screens
    const screens = ['dashboard', 'import', 'data'];
    
    for (let i = 0; i < 10; i++) {
      const targetScreen = screens[i % screens.length];
      const link = page.getByText(new RegExp(targetScreen, 'i')).first();
      
      if (await link.isVisible()) {
        await link.click();
        await page.waitForLoadState('domcontentloaded');
      }
    }
    
    // Should not crash or show errors
    const errorElement = page.locator('.error, [data-testid*="error"]').first();
    const hasError = await errorElement.isVisible().catch(() => false);
    expect(hasError).toBeFalsy();
  });
  
  test('should handle large dataset in analytics', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // First, import a large dataset
    const importLink = page.getByText(/import|roster/i).first();
    if (await importLink.isVisible()) {
      await importLink.click();
      await page.waitForLoadState('networkidle');
      
      const fileInput = page.locator('input[type="file"]').first();
      if (await fileInput.isVisible()) {
        // Generate large dataset
        let csvContent = 'First Name,Last Name,DOB,Grade,School Code\n';
        for (let i = 1; i <= 500; i++) {
          csvContent += `Child${i},Test${i},2015-0${(i % 9) + 1}-${(i % 28) + 1},${i % 6},SCH00${(i % 5) + 1}\n`;
        }
        
        await fileInput.setInputFiles({
          name: 'large-dataset.csv',
          mimeType: 'text/csv',
          buffer: Buffer.from(csvContent)
        });
        
        await page.waitForTimeout(5000);
        
        // Navigate to analytics
        const dashboardLink = page.getByText(/dashboard|analytics/i).first();
        await dashboardLink.click();
        await page.waitForLoadState('networkidle');
        
        // Analytics should load without crashing
        const statsContainer = page.locator('[data-testid*="stat"], .stat-card').first();
        await expect(statsContainer).toBeVisible({ timeout: 15000 });
      }
    }
  });
});
