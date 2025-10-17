/**
 * SKIDS EYEAR - E2E Test Utilities
 * 
 * Helper functions for E2E tests
 */

/**
 * Generate sample CSV roster data
 */
export function generateRosterCSV(count = 10, schoolCode = 'SCH001') {
  let csv = 'First Name,Last Name,DOB,Grade,School Code\n';
  
  const firstNames = ['John', 'Jane', 'Mike', 'Sarah', 'Emily', 'David', 'Lisa', 'Tom', 'Anna', 'Chris'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
  const grades = ['K', '1', '2', '3', '4', '5'];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[i % firstNames.length];
    const lastName = lastNames[i % lastNames.length];
    const month = String((i % 12) + 1).padStart(2, '0');
    const day = String((i % 28) + 1).padStart(2, '0');
    const dob = `2015-${month}-${day}`;
    const grade = grades[i % grades.length];
    
    csv += `${firstName}${i},${lastName}${i},${dob},${grade},${schoolCode}\n`;
  }
  
  return csv;
}

/**
 * Generate invalid CSV data for validation testing
 */
export function generateInvalidRosterCSV() {
  return `First Name,Last Name,DOB,Grade,School Code
,NoFirstName,2015-05-15,K,SCH001
John,,2015-06-20,K,SCH001
Jane,Doe,invalid-date,K,SCH001
Mike,Smith,2015-08-10,,SCH001
,,,, 
Sarah,Johnson,2025-01-01,K,SCH001`;
}

/**
 * Wait for service worker to be active
 */
export async function waitForServiceWorker(page, timeout = 10000) {
  return await page.waitForFunction(
    () => {
      return navigator.serviceWorker.controller !== null;
    },
    { timeout }
  ).catch(() => false);
}

/**
 * Check if IndexedDB has data
 */
export async function getIndexedDBData(page, dbName, storeName) {
  return await page.evaluate(
    ({ dbName, storeName }) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName);
        
        request.onsuccess = (event) => {
          const db = event.target.result;
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          const getAllRequest = store.getAll();
          
          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
          };
          
          getAllRequest.onerror = () => {
            reject(getAllRequest.error);
          };
        };
        
        request.onerror = () => {
          reject(request.error);
        };
      });
    },
    { dbName, storeName }
  );
}

/**
 * Clear IndexedDB for testing
 */
export async function clearIndexedDB(page, dbName) {
  return await page.evaluate(
    (dbName) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);
        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    },
    dbName
  );
}

/**
 * Upload file using file input
 */
export async function uploadFile(page, fileSelector, filename, content, mimeType = 'text/csv') {
  const fileInput = page.locator(fileSelector);
  
  await fileInput.setInputFiles({
    name: filename,
    mimeType: mimeType,
    buffer: Buffer.from(content)
  });
}

/**
 * Wait for element with retry
 */
export async function waitForElementWithRetry(page, selector, options = {}) {
  const { timeout = 10000, retries = 3 } = options;
  
  for (let i = 0; i < retries; i++) {
    try {
      await page.waitForSelector(selector, { timeout: timeout / retries });
      return true;
    } catch (error) {
      if (i === retries - 1) {
        return false;
      }
      await page.waitForTimeout(1000);
    }
  }
  
  return false;
}

/**
 * Get all visible text from page
 */
export async function getPageText(page) {
  return await page.evaluate(() => document.body.innerText);
}

/**
 * Check if element contains text
 */
export async function elementContainsText(page, selector, text) {
  const element = page.locator(selector).first();
  if (!await element.isVisible()) {
    return false;
  }
  
  const content = await element.textContent();
  return content.toLowerCase().includes(text.toLowerCase());
}

/**
 * Simulate slow network
 */
export async function setSlowNetwork(page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: (50 * 1024) / 8, // 50kb/s
    uploadThroughput: (20 * 1024) / 8,   // 20kb/s
    latency: 500 // 500ms
  });
}

/**
 * Reset network conditions
 */
export async function resetNetwork(page) {
  const client = await page.context().newCDPSession(page);
  await client.send('Network.emulateNetworkConditions', {
    offline: false,
    downloadThroughput: -1,
    uploadThroughput: -1,
    latency: 0
  });
}

/**
 * Take accessibility snapshot
 */
export async function getAccessibilityTree(page) {
  const snapshot = await page.accessibility.snapshot();
  return snapshot;
}

/**
 * Check color contrast
 */
export async function checkColorContrast(page, selector) {
  return await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (!element) return null;
    
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    
    // Simple contrast ratio calculation (simplified)
    // Real implementation would use WCAG contrast ratio formula
    return {
      backgroundColor,
      color,
      // Would calculate actual ratio here
      ratio: null
    };
  }, selector);
}

/**
 * Get performance metrics
 */
export async function getPerformanceMetrics(page) {
  return await page.evaluate(() => {
    const perfData = window.performance.getEntriesByType('navigation')[0];
    const paintData = window.performance.getEntriesByType('paint');
    
    return {
      domContentLoaded: perfData?.domContentLoadedEventEnd - perfData?.domContentLoadedEventStart,
      loadComplete: perfData?.loadEventEnd - perfData?.loadEventStart,
      firstPaint: paintData.find(x => x.name === 'first-paint')?.startTime,
      firstContentfulPaint: paintData.find(x => x.name === 'first-contentful-paint')?.startTime,
    };
  });
}

/**
 * Mock API response
 */
export async function mockAPIResponse(page, url, response) {
  await page.route(url, (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(response)
    });
  });
}

/**
 * Wait for network idle
 */
export async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Get console errors
 */
export async function getConsoleErrors(page) {
  const errors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Generate screening result data
 */
export function generateScreeningResult(childId, overrides = {}) {
  return {
    id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    childId: childId,
    childName: overrides.childName || 'Test Child',
    dateOfBirth: overrides.dateOfBirth || '2015-05-15',
    screeningDate: overrides.screeningDate || new Date().toISOString().split('T')[0],
    
    // Vision data
    visionAcuity: overrides.visionAcuity || {
      logMAR: 0.2,
      snellenEquivalent: '20/32',
      pass: true
    },
    
    // Hearing data
    hearingResults: overrides.hearingResults || {
      '1000_30dB': true,
      '2000_30dB': true,
      '4000_30dB': true
    },
    hearingPass: overrides.hearingPass !== undefined ? overrides.hearingPass : true,
    
    // Referral
    referralNeeded: overrides.referralNeeded || false,
    referralReasons: overrides.referralReasons || [],
    
    // Metadata
    screenerId: overrides.screenerId || 'screener-001',
    schoolCode: overrides.schoolCode || 'SCH001',
    notes: overrides.notes || ''
  };
}

/**
 * Generate multiple screening results
 */
export function generateScreeningResults(count = 10) {
  const results = [];
  
  for (let i = 0; i < count; i++) {
    const pass = Math.random() > 0.2; // 80% pass rate
    
    results.push(generateScreeningResult(`child-${i}`, {
      childName: `Child ${i}`,
      visionAcuity: {
        logMAR: pass ? 0.1 + Math.random() * 0.2 : 0.4 + Math.random() * 0.3,
        snellenEquivalent: pass ? '20/25' : '20/50',
        pass: pass
      },
      hearingPass: pass,
      referralNeeded: !pass,
      referralReasons: pass ? [] : ['Vision concerns']
    }));
  }
  
  return results;
}
