import { test, expect } from '@playwright/test';

test.describe('Delete Token Tests', () => {
  
  // Reset all data before each test for complete isolation
  test.beforeEach(async ({ page }) => {
    await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
  });
  
  // Helper to navigate to token list page
  async function navigateToTokenList(page: any) {
    await page.goto('/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const userButton = page.locator('[data-testid="user-profile-button"]');
    await userButton.click();
    await page.waitForTimeout(1000);
    
    const tokenListOption = page.locator('text=/token list/i');
    await tokenListOption.click();
    await page.waitForTimeout(2000);
  }
  
  // Helper to create a test token
  async function createToken(page: any, tokenName: string) {
    const createTokenButton = page.locator('[data-testid="create-token-button"]');
    await createTokenButton.waitFor({ state: 'visible', timeout: 10000 });
    await createTokenButton.click();
    await page.waitForTimeout(2000);
    
    const nameInput = page.getByLabel(/token name|enter token name/i);
    await nameInput.fill(tokenName);
    
    const createButton = page.getByRole('button', { name: /create|generate/i }).last();
    await createButton.click();
    await page.waitForTimeout(2000);
    
    // Wait for token to be created (modal shows copy button with token name)
    await page.waitForTimeout(2000);
    
    // Close modal by clicking X button to see the token in the list
    const closeModalButton = page.locator('[data-testid="close-token-modal"]');
    await closeModalButton.waitFor({ state: 'visible', timeout: 5000 });
    await closeModalButton.click();
    await page.waitForTimeout(1000);
  }

  test('Delete Token 1: Delete a single token', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Step 1: Navigate to token list
    await navigateToTokenList(page);
    
    // Step 2: Create a token to delete
    const tokenName = `DeleteMe-${Date.now()}`;
    await createToken(page, tokenName);
    
    // Step 3: Find the token in the list
    const tokenRow = page.locator(`tr:has-text("${tokenName}")`);
    await expect(tokenRow).toBeVisible({ timeout: 10000 });
    
    // Step 4: Click checkbox to select the token
    const checkbox = tokenRow.locator('input[type="checkbox"]');
    await checkbox.click();
    await page.waitForTimeout(1000);
    
    // Step 5: Verify "Delete 1 Token" button appears
    const deleteButton = page.getByRole('button', { name: /delete.*1.*token/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    // Step 6: Click delete button
    await deleteButton.click();
    
    // Step 7: Wait for success notification
    await page.waitForSelector('text=/token.*removed successfully/i', { timeout: 15000 });
    
    await page.waitForTimeout(2000);
    
    // Step 8: Verify token is removed from list
    const tokenStillExists = await tokenRow.isVisible().catch(() => false);
    expect(tokenStillExists).toBe(false);
    
  });

  test('Delete Token 2: Delete multiple tokens', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds
    
    // Step 1: Navigate to token list
    await navigateToTokenList(page);
    
    // Step 2: Create 3 tokens to delete
    const tokenNames: string[] = [];
    for (let i = 0; i < 3; i++) {
      const tokenName = `Bulk-Delete-${i}-${Date.now()}`;
      tokenNames.push(tokenName);
      await createToken(page, tokenName);
      await page.waitForTimeout(500);
    }
    
    // Step 3: Select all 3 tokens
    for (const tokenName of tokenNames) {
      const tokenRow = page.locator(`tr:has-text("${tokenName}")`);
      const checkbox = tokenRow.locator('input[type="checkbox"]');
      await checkbox.click();
      await page.waitForTimeout(300);
    }
    
    // Step 4: Verify "Delete 3 Tokens" button appears
    const deleteButton = page.getByRole('button', { name: /delete.*3.*tokens/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    // Step 5: Click delete button
    await deleteButton.click();
    
    // Step 6: Wait for success notification
    await page.waitForSelector('text=/3 token.*removed successfully/i', { timeout: 15000 });
    
    await page.waitForTimeout(2000);
    
    // Step 7: Verify all tokens are removed from list
    for (const tokenName of tokenNames) {
      const tokenRow = page.locator(`tr:has-text("${tokenName}")`);
      const exists = await tokenRow.isVisible().catch(() => false);
      expect(exists).toBe(false);
    }
    
  });

  test('Delete Token 3: Select and deselect token', async ({ page }) => {
    
    // Step 1: Navigate to token list
    await navigateToTokenList(page);
    
    // Step 2: Create a token
    const tokenName = `SelectTest-${Date.now()}`;
    await createToken(page, tokenName);
    
    // Step 3: Find and select the token
    const tokenRow = page.locator(`tr:has-text("${tokenName}")`);
    const checkbox = tokenRow.locator('input[type="checkbox"]');
    await checkbox.click();
    await page.waitForTimeout(1000);
    
    // Step 4: Verify delete button appears
    const deleteButton = page.getByRole('button', { name: /delete.*1.*token/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    // Step 5: Deselect the token
    await checkbox.click();
    await page.waitForTimeout(1000);
    
    // Step 6: Verify delete button disappears
    const buttonGone = !(await deleteButton.isVisible().catch(() => false));
    expect(buttonGone).toBe(true);
    
    // Step 7: Verify token still exists (not deleted)
    await expect(tokenRow).toBeVisible();
    
  });
});

