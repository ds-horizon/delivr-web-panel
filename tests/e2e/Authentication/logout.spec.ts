import { test, expect } from '@playwright/test';

test.describe('Logout Tests', () => {
  
  test('Logout 1: Successfully logout from application', async ({ page }) => {
    console.log('🚀 Test: Logout');
    
    // Step 1: Login first
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✅ Logged in');
    
    // Step 2: Click on user profile button to open menu
    const userButton = page.locator('[data-testid="user-profile-button"]');
    await userButton.waitFor({ state: 'visible', timeout: 10000 });
    await userButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Opened user menu');
    
    // Step 3: Click Logout button
    const logoutButton = page.locator('[data-testid="logout-button"]');
    await logoutButton.waitFor({ state: 'visible', timeout: 5000 });
    await logoutButton.click();
    console.log('✅ Clicked Logout');
    
    // Step 4: Wait for redirect (should go to login page or home)
    await page.waitForTimeout(3000);
    
    // Step 5: Verify we're logged out
    // Should be redirected to login page or root
    const currentUrl = page.url();
    console.log(`Current URL after logout: ${currentUrl}`);
    
    // Verify we're no longer on dashboard
    const isOnDashboard = currentUrl.includes('/dashboard');
    expect(isOnDashboard).toBe(false);
    console.log('✅ Redirected away from dashboard');
  });
});

