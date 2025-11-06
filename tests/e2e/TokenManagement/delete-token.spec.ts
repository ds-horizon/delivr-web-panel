import { test, expect } from '@playwright/test';

test.describe('Delete Token Tests', () => {
  
  // Helper to navigate to token list page
  async function navigateToTokenList(page: any) {
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const userButton = page.locator('[data-testid="user-profile-button"]');
    await userButton.click();
    await page.waitForTimeout(1000);
    
    const tokenListOption = page.locator('text=/token list/i');
    await tokenListOption.click();
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to Token List page');
  }
  
  // Helper to create a test token
  async function createToken(page: any, tokenName: string) {
    const createTokenButton = page.getByRole('button', { name: /Create Token/i });
    await createTokenButton.click();
    await page.waitForTimeout(2000);
    
    const nameInput = page.getByLabel(/token name|enter token name/i);
    await nameInput.fill(tokenName);
    
    const createButton = page.getByRole('button', { name: /create|generate/i }).last();
    await createButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Submitted token creation');
    
    // Wait for token to be created (modal shows copy button with token name)
    await page.waitForTimeout(2000);
    
    // Close modal by clicking X button to see the token in the list
    const closeModalButton = page.locator('[data-testid="close-token-modal"]');
    await closeModalButton.waitFor({ state: 'visible', timeout: 5000 });
    await closeModalButton.click();
    await page.waitForTimeout(1000);
    console.log(`✅ Created token: ${tokenName} - modal closed`);
  }

  test('Delete Token 1: Delete a single token', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    console.log('🚀 Test: Delete Single Token');
    
    // Step 1: Navigate to token list
    await navigateToTokenList(page);
    
    // Step 2: Create a token to delete
    const tokenName = `DeleteMe-${Date.now()}`;
    await createToken(page, tokenName);
    
    // Step 3: Find the token in the list
    const tokenRow = page.locator(`tr:has-text("${tokenName}")`);
    await expect(tokenRow).toBeVisible({ timeout: 10000 });
    console.log(`✅ Found token in list: ${tokenName}`);
    
    // Step 4: Click checkbox to select the token
    const checkbox = tokenRow.locator('input[type="checkbox"]');
    await checkbox.click();
    await page.waitForTimeout(1000);
    console.log('✅ Selected token');
    
    // Step 5: Verify "Delete 1 Token" button appears
    const deleteButton = page.getByRole('button', { name: /delete.*1.*token/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Delete button appeared');
    
    // Step 6: Click delete button
    await deleteButton.click();
    console.log('✅ Clicked Delete');
    
    // Step 7: Wait for success notification
    await page.waitForSelector('text=/token.*removed successfully/i', { timeout: 15000 });
    console.log('✅ Success notification: "1 token(s) removed successfully!"');
    
    await page.waitForTimeout(2000);
    
    // Step 8: Verify token is removed from list
    const tokenStillExists = await tokenRow.isVisible().catch(() => false);
    expect(tokenStillExists).toBe(false);
    console.log('✅ Token removed from list');
    
    console.log('✅ Test passed - Token deleted successfully');
  });

  test('Delete Token 2: Delete multiple tokens', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds
    console.log('🚀 Test: Delete Multiple Tokens');
    
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
    console.log(`✅ Created ${tokenNames.length} tokens for deletion`);
    
    // Step 3: Select all 3 tokens
    for (const tokenName of tokenNames) {
      const tokenRow = page.locator(`tr:has-text("${tokenName}")`);
      const checkbox = tokenRow.locator('input[type="checkbox"]');
      await checkbox.click();
      await page.waitForTimeout(300);
    }
    console.log('✅ Selected all 3 tokens');
    
    // Step 4: Verify "Delete 3 Tokens" button appears
    const deleteButton = page.getByRole('button', { name: /delete.*3.*tokens/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Delete button shows: Delete 3 Tokens');
    
    // Step 5: Click delete button
    await deleteButton.click();
    console.log('✅ Clicked Delete');
    
    // Step 6: Wait for success notification
    await page.waitForSelector('text=/3 token.*removed successfully/i', { timeout: 15000 });
    console.log('✅ Success notification: "3 token(s) removed successfully!"');
    
    await page.waitForTimeout(2000);
    
    // Step 7: Verify all tokens are removed from list
    for (const tokenName of tokenNames) {
      const tokenRow = page.locator(`tr:has-text("${tokenName}")`);
      const exists = await tokenRow.isVisible().catch(() => false);
      expect(exists).toBe(false);
    }
    console.log('✅ All 3 tokens removed from list');
    
    console.log('✅ Test passed - Multiple tokens deleted successfully');
  });

  test('Delete Token 3: Select and deselect token', async ({ page }) => {
    console.log('🚀 Test: Select and Deselect Token');
    
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
    console.log('✅ Selected token');
    
    // Step 4: Verify delete button appears
    const deleteButton = page.getByRole('button', { name: /delete.*1.*token/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    console.log('✅ Delete button appeared: "Delete 1 Token"');
    
    // Step 5: Deselect the token
    await checkbox.click();
    await page.waitForTimeout(1000);
    console.log('✅ Deselected token');
    
    // Step 6: Verify delete button disappears
    const buttonGone = !(await deleteButton.isVisible().catch(() => false));
    expect(buttonGone).toBe(true);
    console.log('✅ Delete button disappeared');
    
    // Step 7: Verify token still exists (not deleted)
    await expect(tokenRow).toBeVisible();
    console.log('✅ Token still in list (not deleted)');
    
    console.log('✅ Test passed - Selection/deselection works correctly');
  });
});

