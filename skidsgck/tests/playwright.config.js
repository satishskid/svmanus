import { defineConfig, devices } from '@playwright/test';

/**
 * SKIDS EYEAR - End-to-End Test Configuration
 * 
 * This configuration defines the test environments for:
 * - Admin Portal (React/Vite PWA)
 * - Mobile App (React Native/Expo via web preview)
 * 
 * Test Strategy:
 * - Cross-browser testing (Chrome, Firefox, Safari)
 * - Mobile viewport testing
 * - Offline/online scenarios
 * - File upload/download
 * - Camera/audio mocking
 */

export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Maximum time one test can run
  timeout: 60 * 1000,
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }],
    ['list']
  ],
  
  // Shared settings for all tests
  use: {
    // Base URL for tests
    baseURL: process.env.BASE_URL || 'http://localhost:2434',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Trace on failure
    trace: 'on-first-retry',
    
    // Action timeout
    actionTimeout: 15 * 1000,
    
    // Navigation timeout
    navigationTimeout: 30 * 1000,
  },
  
  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 }
      },
    },
    
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5']
      },
    },
    
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 13']
      },
    },
    
    // Tablet viewport
    {
      name: 'tablet',
      use: { 
        ...devices['iPad Pro']
      },
    },
  ],
  
  // Run local dev server before tests
  webServer: {
    command: 'cd ../admin-portal && npm run dev',
    url: 'http://localhost:2434',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
