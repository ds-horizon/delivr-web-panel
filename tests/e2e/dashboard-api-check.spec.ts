import { test, expect } from '@playwright/test';

test.describe('Dashboard API Check', () => {
  test('should successfully call tenants API on dashboard load', async ({ page }) => {
    const apiCalls: { url: string; status: number }[] = [];
    
    // Track API calls
    page.on('response', response => {
      if (response.url().includes('/api/v1/tenants')) {
        apiCalls.push({
          url: response.url(),
          status: response.status()
        });
        console.log(`📡 API Call: ${response.status()} ${response.url()}`);
      }
    });
    
    // Login
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Wait for React hydration
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.waitForTimeout(2000);
    
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Wait for dashboard to load and API calls to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    console.log('\n📊 Tenants API Calls Summary:');
    console.log(`Total calls: ${apiCalls.length}`);
    apiCalls.forEach((call, index) => {
      console.log(`${index + 1}. ${call.status} - ${call.url}`);
    });
    
    // Verify that the tenants API was called
    expect(apiCalls.length).toBeGreaterThan(0);
    console.log('✅ Tenants API was called');
    
    // Verify that the API call was successful (200 OK)
    const successfulCalls = apiCalls.filter(call => call.status === 200);
    expect(successfulCalls.length).toBeGreaterThan(0);
    console.log('✅ Tenants API returned 200 OK (no more 401 errors!)');
    
    // Take screenshot of dashboard
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/dashboard-with-api-working.png',
      fullPage: true 
    });
    console.log('✅ Screenshot saved');
  });
});

