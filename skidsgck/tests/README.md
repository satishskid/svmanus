# SKIDS EYEAR - E2E Test Suite

Comprehensive end-to-end testing for the SKIDS EYEAR pediatric screening platform.

## Overview

This test suite uses Playwright to perform automated testing across:
- **Admin Portal** (React/Vite PWA)
- **Integration scenarios** (data flow, sync, exports)
- **Cross-browser compatibility**
- **Mobile responsiveness**
- **Performance metrics**
- **Accessibility compliance**

## Getting Started

### Installation

```bash
cd tests
npm install
npm run test:install
```

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug

# Run specific browser
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit

# Run mobile tests
npm run test:e2e:mobile
```

### View Test Report

```bash
npm run test:e2e:report
```

## Test Structure

```
tests/
├── e2e/
│   ├── admin-portal.spec.js    # Admin portal tests
│   ├── integration.spec.js     # Integration tests
│   └── test-utils.js           # Shared utilities
├── playwright.config.js        # Playwright configuration
├── package.json
└── README.md
```

## Test Coverage

### Admin Portal Tests (admin-portal.spec.js)

**Core Functionality**
- ✅ Application loads successfully
- ✅ Navigation works correctly
- ✅ Connection status indicator

**Analytics Dashboard**
- ✅ Statistics cards display
- ✅ Data visualization (tables/charts)
- ✅ Manual sync trigger
- ✅ School-level breakdowns

**Roster Import**
- ✅ File upload interface
- ✅ Excel/CSV file acceptance
- ✅ Template download
- ✅ Data validation
- ✅ Import feedback

**Data Manager**
- ✅ Sync status display
- ✅ Pending items tracking
- ✅ Data export (CSV/JSON)
- ✅ Audit log viewer

**PWA Features**
- ✅ Service worker registration
- ✅ PWA manifest present
- ✅ Offline functionality
- ✅ Cache-first strategy

**Accessibility**
- ✅ Heading hierarchy
- ✅ Keyboard navigation
- ✅ Form label association
- ✅ ARIA attributes

**Performance**
- ✅ Load time <5s
- ✅ Bundle size reasonable

### Integration Tests (integration.spec.js)

**Roster Import → Analytics Flow**
- ✅ End-to-end roster import
- ✅ Data reflects in analytics
- ✅ Large dataset handling (100+ records)

**Export Workflows**
- ✅ CSV export with validation
- ✅ JSON export with validation
- ✅ File download handling

**Offline → Online Sync**
- ✅ Changes queued while offline
- ✅ Auto-sync when online
- ✅ Conflict resolution UI

**Multi-User Scenarios**
- ✅ Concurrent imports
- ✅ Data consistency

**Data Validation Pipeline**
- ✅ Validation errors displayed
- ✅ Duplicate detection
- ✅ Error message clarity

**Performance Under Load**
- ✅ Rapid navigation handling
- ✅ Large dataset rendering (500+ records)

## Test Configuration

### Browsers

Tests run against:
- **Chromium** (Desktop 1920x1080)
- **Firefox** (Desktop 1920x1080)
- **WebKit/Safari** (Desktop 1920x1080)
- **Mobile Chrome** (Pixel 5)
- **Mobile Safari** (iPhone 13)
- **Tablet** (iPad Pro)

### Timeouts

- Test timeout: 60 seconds
- Action timeout: 15 seconds
- Navigation timeout: 30 seconds

### Retry Strategy

- CI environment: 2 retries
- Local environment: 0 retries

## Writing New Tests

### Basic Test Structure

```javascript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup
    await page.goto('/');
  });
  
  test('should do something', async ({ page }) => {
    // Test implementation
    await expect(page.locator('selector')).toBeVisible();
  });
});
```

### Using Test Utilities

```javascript
import { generateRosterCSV, uploadFile } from './test-utils.js';

test('should import roster', async ({ page }) => {
  const csvData = generateRosterCSV(50); // 50 children
  await uploadFile(page, 'input[type="file"]', 'roster.csv', csvData);
});
```

### Mocking API Responses

```javascript
import { mockAPIResponse } from './test-utils.js';

test('should handle API error', async ({ page }) => {
  await mockAPIResponse(page, '**/api/sync', { error: 'Network error' });
  // Test error handling
});
```

## Best Practices

### 1. Use Data Attributes for Selectors

```javascript
// Good
await page.locator('[data-testid="submit-button"]').click();

// Avoid
await page.locator('.btn-primary').click(); // May break with CSS changes
```

### 2. Wait for Network Idle

```javascript
await page.waitForLoadState('networkidle');
```

### 3. Handle Dynamic Content

```javascript
await page.waitForSelector('[data-testid="results"]', { state: 'visible' });
```

### 4. Use Soft Assertions for Multiple Checks

```javascript
await expect.soft(page.locator('h1')).toBeVisible();
await expect.soft(page.locator('nav')).toBeVisible();
// Test continues even if one fails
```

### 5. Clean Up After Tests

```javascript
test.afterEach(async ({ page }) => {
  // Clear IndexedDB
  await page.evaluate(() => indexedDB.deleteDatabase('skids-eyear'));
});
```

## Debugging Tests

### Visual Debugging

```bash
# Run with UI mode
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Debug mode with pause
npm run test:e2e:debug
```

### Playwright Inspector

When running in debug mode:
1. Tests pause at breakpoints
2. Inspect page state
3. Step through actions
4. View network requests

### Screenshots and Videos

Failures automatically capture:
- **Screenshots**: `test-results/` directory
- **Videos**: Retained on failure
- **Traces**: First retry only

### View Trace

```bash
npx playwright show-trace test-results/trace.zip
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: |
          cd admin-portal && npm install
          cd ../tests && npm install
      
      - name: Install Playwright browsers
        run: cd tests && npx playwright install --with-deps
      
      - name: Run E2E tests
        run: cd tests && npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: tests/playwright-report
```

## Performance Testing

### Lighthouse Integration

```javascript
test('should meet performance thresholds', async ({ page }) => {
  await page.goto('/');
  
  const metrics = await page.evaluate(() => {
    const perfData = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: perfData.loadEventEnd - perfData.loadEventStart,
      domContentLoaded: perfData.domContentLoadedEventEnd,
    };
  });
  
  expect(metrics.loadTime).toBeLessThan(3000);
});
```

## Accessibility Testing

### axe-core Integration

```javascript
import { injectAxe, checkA11y } from 'axe-playwright';

test('should have no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

## Troubleshooting

### Common Issues

**1. Service worker not registering**
```javascript
// Wait for service worker
await page.waitForFunction(() => navigator.serviceWorker.controller !== null, {
  timeout: 10000
});
```

**2. File uploads failing**
```javascript
// Ensure file input is visible
const fileInput = page.locator('input[type="file"]');
await fileInput.setInputFiles({
  name: 'test.csv',
  mimeType: 'text/csv',
  buffer: Buffer.from('data')
});
```

**3. Flaky tests**
- Increase timeouts for slow operations
- Use `waitForLoadState('networkidle')`
- Add explicit waits for dynamic content
- Use retry strategy

**4. Tests pass locally but fail in CI**
- Check browser versions
- Verify network conditions
- Review CI environment settings
- Check timezone differences

## Test Metrics

### Target Coverage

- **E2E Coverage**: ≥80% of user workflows
- **Browser Coverage**: 6 browsers/viewports
- **Performance**: All tests complete in <10 minutes
- **Flakiness**: <1% flaky test rate

### Current Status

| Metric | Target | Current |
|--------|--------|---------|
| Test Count | 50+ | 35 |
| Test Coverage | ≥80% | ~75% |
| Pass Rate | 100% | TBD |
| Avg Duration | <10min | TBD |

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Examples](https://playwright.dev/docs/ci)

## Contributing

When adding new tests:

1. Follow existing patterns
2. Use descriptive test names
3. Add comments for complex scenarios
4. Update this README if needed
5. Ensure tests are stable (not flaky)
6. Keep tests independent
7. Clean up after tests

## Support

For questions or issues:
- Check Playwright docs
- Review existing tests
- Open an issue on GitHub
- Contact development team
