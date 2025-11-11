import { test, expect } from '@playwright/test';

test.describe('Empty State - No Tokens', () => {
  
  // Reset all data before each test to ensure no tokens exist
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
  });
  
  test('Empty State 2: No Tokens Message Displayed', async ({ page }) => {
    test.setTimeout(30000);
    
    // Step 1: Login
    await page.goto('/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Click user profile button
    const userButton = page.locator('[data-testid="user-profile-button"]');
    await userButton.waitFor({ state: 'visible', timeout: 10000 });
    await userButton.click();
    await page.waitForTimeout(1000);
    
    // Step 3: Click "Token List" option
    const tokenListOption = page.locator('text=/token list/i');
    await tokenListOption.waitFor({ state: 'visible', timeout: 5000 });
    await tokenListOption.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Verify "Access Tokens" title is displayed
    const tokensTitle = page.locator('text=/Access Tokens/i');
    await expect(tokensTitle).toBeVisible({ timeout: 10000 });
    
    // Step 5: Verify "No Data" message is displayed in the table
    const noDataMessage = page.locator('text=/^No Data$/i');
    await expect(noDataMessage).toBeVisible({ timeout: 5000 });
    
    // Step 6: Verify "Create Token" button is still visible and enabled
    const createTokenButton = page.locator('[data-testid="create-token-button"]');
    await expect(createTokenButton).toBeVisible({ timeout: 5000 });
    await expect(createTokenButton).toBeEnabled({ timeout: 5000 });
  });
});

