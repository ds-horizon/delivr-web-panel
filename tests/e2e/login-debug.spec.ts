import { test, expect } from '@playwright/test';

test.describe('Login Debug', () => {
  test('should debug login flow with detailed logging', async ({ page }) => {
    // Capture all console messages
    page.on('console', msg => {
      console.log(`🖥️  Console ${msg.type()}: ${msg.text()}`);
    });

    // Capture all page errors
    page.on('pageerror', error => {
      console.error('🔴 Page Error:', error.message);
    });

    // Capture all network requests and responses
    page.on('request', request => {
      console.log(`→ ${request.method()} ${request.url()}`);
    });

    page.on('response', response => {
      console.log(`← ${response.status()} ${response.url()}`);
      if (response.status() >= 400) {
        console.error(`❌ Error Response: ${response.status()} ${response.url()}`);
      }
    });

    // Navigate to login
    console.log('\n📍 Step 1: Navigate to login page');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Take screenshot of login page
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/debug-1-login-page.png',
      fullPage: true 
    });

    // Check if login button exists
    console.log('\n📍 Step 2: Check for login button');
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    await expect(loginButton).toBeVisible();
    console.log('✅ Login button is visible');

    // Click the login button
    console.log('\n📍 Step 3: Click login button');
    await loginButton.click();

    // Wait a bit for any redirects
    await page.waitForTimeout(3000);

    // Check final URL
    const finalUrl = page.url();
    console.log('\n📍 Final URL:', finalUrl);

    // Take screenshot of result
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/debug-2-after-click.png',
      fullPage: true 
    });

    // Check if we're on dashboard or still on login
    if (finalUrl.includes('/dashboard')) {
      console.log('✅ SUCCESS: Redirected to dashboard!');
      
      // Check for session cookie
      const cookies = await page.context().cookies();
      console.log('\n🍪 Cookies:', cookies.map(c => c.name));
      
      const sessionCookie = cookies.find(c => c.name === '_session');
      if (sessionCookie) {
        console.log('✅ Session cookie found');
      } else {
        console.error('❌ No session cookie found');
      }
    } else {
      console.error('❌ FAILED: Still on login page');
      
      // Check for any error messages on the page
      const errorElement = page.locator('[role="alert"]');
      if (await errorElement.count() > 0) {
        const errorText = await errorElement.textContent();
        console.error('🔴 Error message on page:', errorText);
      }
    }

    // This test is for debugging, so we don't fail it
    // expect(finalUrl).toContain('/dashboard');
  });
});


