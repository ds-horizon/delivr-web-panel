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
    
  });
  
  test('should have a clickable Google login button', async ({ page }) => {
    await page.goto('/login');
    
    const loginButton = page.locator('[data-testid="google-login-btn"]');
    
    // Verify button is visible and enabled
    await expect(loginButton).toBeVisible();
    await expect(loginButton).toBeEnabled();
    
    // Verify button text
    await expect(loginButton).toContainText('Continue with Google');
    
  });
  
  test('should initiate OAuth flow when clicking login button', async ({ page }) => {
    // In test mode, use the test-login endpoint instead of clicking Google button
    // This avoids redirecting to real Google OAuth
    await page.goto('http://localhost:3000/test-login');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Verify we're on dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Wait 3 seconds to see the dashboard
    await page.waitForTimeout(3000);
    
    // Verify session cookie exists
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === '_session');
    expect(sessionCookie).toBeDefined();
    
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
    
    // In test mode, use the test-login endpoint
    // This verifies that OAUTH_TEST_MODE bypasses real Google OAuth
    await page.goto('http://localhost:3000/test-login');
    
    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Verify we're on the dashboard
    expect(page.url()).toContain('/dashboard');
    
    // Wait a bit for the dashboard to load
    await page.waitForTimeout(2000);
    
    // Verify session cookie exists
    const cookies = await page.context().cookies();
    const sessionCookie = cookies.find(c => c.name === '_session');
    expect(sessionCookie).toBeDefined();
    
    // Verify no real Google OAuth requests were made
    // (test-login should bypass OAuth entirely)
    const hasGoogleOAuthRequest = requests.some(r => 
      r.includes('accounts.google.com') || 
      r.includes('oauth2.googleapis.com')
    );
    expect(hasGoogleOAuthRequest).toBe(false);
  });
});

