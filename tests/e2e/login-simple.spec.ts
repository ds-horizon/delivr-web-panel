import { test, expect } from '@playwright/test';
import { waitFor } from '@testing-library/react';

/**
 * Simple login tests to verify the OAuth mock flow works with Playwright
 */
test.describe('Login Flow - Simple', () => {
  
  test('should display the login page correctly', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check if we're on the login page
    expect(page.url()).toContain('/login');
    
    // Verify page title/heading
    await expect(page.getByText('Welcome to Delivr')).toBeVisible();
    
    // Verify the Google login button exists
    await expect(page.locator('[data-testid="google-login-btn"]')).toBeVisible();
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/login-page.png',
      fullPage: true 
    });
    
    console.log('✅ Login page loaded successfully with all elements');
  });
  
  test('should have a clickable Google login button', async ({ page }) => {
    await page.goto('/login');
    
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    
    // Verify button is visible and enabled
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    
    // Verify button text
    await expect(loginButton).toContainText('Continue with Google');
    
    console.log('✅ Google login button is interactive');
  });
  
  test('should initiate OAuth flow when clicking login button', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Wait for React hydration to complete
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.waitForTimeout(2000); // Extra wait for React hydration
    
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    
    // Click login button
    await loginButton.click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');
    console.log('✅ Successfully redirected to dashboard');
    
    // Wait 3 seconds to see the dashboard
    await page.waitForTimeout(3000);
    
    // Verify session cookie exists
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === '_session');
    expect(sessionCookie).toBeDefined();
    console.log('✅ Session cookie found');
    
    // Take screenshot of dashboard
    await page.screenshot({ 
      path: 'tests/e2e/screenshots/after-login-dashboard.png',
      fullPage: true 
    });
  });
  
  test('should check if OAUTH_TEST_MODE is working', async ({ page }) => {
    // Listen for network requests
    const requests: string[] = [];
    page.on('request', request => {
      requests.push(`${request.method()} ${request.url()}`);
    });
    
    await page.goto('/login', { waitUntil: 'networkidle' });
    
    // Wait for React hydration to complete
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.waitForTimeout(2000);
    
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
    console.log('✅ Successfully reached dashboard');
    
    // Wait 3 seconds to see the dashboard
    await page.waitForTimeout(30000);
    
    // Verify session cookie exists
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === '_session');
    expect(sessionCookie).toBeDefined();
    console.log('✅ Session cookie found');
    
    // Verify no real Google OAuth requests were made
    const hasGoogleOAuthRequest = requests.some(r => 
      r.includes('accounts.google.com') || 
      r.includes('oauth2.googleapis.com')
    );
    expect(hasGoogleOAuthRequest).toBe(false);
    console.log('✅ OAUTH_TEST_MODE is working - no real Google OAuth calls');
  });
});

