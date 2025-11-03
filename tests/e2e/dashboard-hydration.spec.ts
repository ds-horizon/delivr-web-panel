import { test, expect } from '@playwright/test';

/**
 * Simple test to check if hydration errors occur when loading the dashboard
 * This test will help us determine if the hydration bug affects Playwright tests
 */
test.describe('Dashboard Hydration Test', () => {
  let consoleErrors: string[] = [];
  let hydrationErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Clear error arrays
    consoleErrors = [];
    hydrationErrors = [];

    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const errorText = msg.text();
        consoleErrors.push(errorText);
        
        // Check specifically for hydration errors
        if (
          errorText.includes('Hydration') ||
          errorText.includes('hydration') ||
          errorText.includes('Text content did not match') ||
          errorText.includes('Prop') && errorText.includes('did not match')
        ) {
          hydrationErrors.push(errorText);
          console.log('🔴 HYDRATION ERROR DETECTED:', errorText);
        }
      }
    });

    // Listen for page errors (uncaught exceptions)
    page.on('pageerror', (error) => {
      const errorText = error.message;
      consoleErrors.push(errorText);
      
      if (errorText.includes('Hydration') || errorText.includes('hydration')) {
        hydrationErrors.push(errorText);
        console.log('🔴 HYDRATION PAGE ERROR:', errorText);
      }
    });
  });

  test('should load dashboard without hydration errors', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Wait for React hydration
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.waitForTimeout(2000);
    
    // Check if login page loaded
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    
    // Click the mock Google login button
    await loginButton.click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    
    // Wait for page to fully load and hydrate
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
    
    // Additional wait for React hydration
    await page.waitForTimeout(2000);
    
    // Take a screenshot for visual inspection
    await page.screenshot({ path: 'tests/e2e/screenshots/dashboard-loaded.png', fullPage: true });
    
    // Log results
    console.log('\n📊 Test Results:');
    console.log(`Total console errors: ${consoleErrors.length}`);
    console.log(`Hydration errors: ${hydrationErrors.length}`);
    
    if (hydrationErrors.length > 0) {
      console.log('\n🔴 HYDRATION ERRORS FOUND:');
      hydrationErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    } else {
      console.log('\n✅ No hydration errors detected!');
    }
    
    // Verify dashboard loaded
    const url = page.url();
    expect(url).toContain('/dashboard');
    
    // Check if we can see dashboard content (this will fail if hydration broke the UI)
    await expect(page.locator('body')).toBeVisible();
    
    // FAIL the test if hydration errors were detected
    if (hydrationErrors.length > 0) {
      throw new Error(
        `❌ HYDRATION ERROR DETECTED!\n\n` +
        `Found ${hydrationErrors.length} hydration error(s):\n\n` +
        hydrationErrors.map((e, i) => `${i + 1}. ${e}`).join('\n\n') +
        `\n\nThis confirms the hydration bug exists in the app code, not specific to Cypress.`
      );
    }
  });

  test('should check if release list causes hydration errors', async ({ page }) => {
    // This test specifically checks the ReleaseListForDeploymentTable component
    // which we know has the Date.now() issue
    
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Wait for React hydration
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.waitForTimeout(2000);
    
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    await page.waitForURL('**/dashboard', { timeout: 30000 });
    
    // Wait for dashboard to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Log results
    console.log('\n📊 Release List Test Results:');
    console.log(`Total console errors: ${consoleErrors.length}`);
    console.log(`Hydration errors: ${hydrationErrors.length}`);
    
    if (hydrationErrors.length > 0) {
      console.log('\n🔴 HYDRATION ERRORS IN RELEASE LIST:');
      hydrationErrors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
      
      throw new Error(
        `❌ Hydration errors detected when loading release list! ` +
        `This is likely caused by the formatRelativeTime() function using Date.now().`
      );
    }
  });
});

