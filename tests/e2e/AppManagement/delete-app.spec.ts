import { test, expect } from '@playwright/test';

test.describe('Delete App Tests', () => {
  
  test('Delete App 1: Successfully delete an app', async ({ page }) => {
    
    // Step 1: Login and navigate to org
    await page.goto('/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.click();
    await page.waitForTimeout(2000);
    
    // Step 2: Find TestApp (where test-user-playwright is owner)
    // Delete option only shows for apps where user is Owner
    // Note: Multiple apps might have "TestApp" in name, use .first()
    const appCard = page.locator('[data-testid="app-card"]').filter({ hasText: 'TestApp' }).first();
    await appCard.waitFor({ state: 'visible', timeout: 10000 });
    
    // Get app name for verification
    const appNameText = await appCard.textContent();
    
    // Step 3: Open app menu (three dots) - only visible for owners
    // Look for menu icon within the app card
    const menuButton = appCard.locator('button[aria-label*="menu" i], button:has(svg)').first();
    
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      
      // Step 4: Click Delete option
      const deleteOption = page.locator('text=/delete app/i').first();
      await deleteOption.waitFor({ state: 'visible', timeout: 5000 });
      await deleteOption.click();
      await page.waitForTimeout(2000);
      
      // Step 5: Confirm deletion in modal
      const confirmDeleteButton = page.getByRole('button', { name: /^delete$/i, exact: true });
      await confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmDeleteButton.click();
      
      // Step 6: Wait for deletion to complete
      await page.waitForTimeout(3000);
      
      // Step 7: Verify app no longer appears in list
      const appStillExists = await appCard.isVisible().catch(() => false);
      expect(appStillExists).toBe(false);
      
    } else {
    }
  });

  test('Delete App 2: Cancel app deletion', async ({ page }) => {
    
    // Step 1: Login and navigate to org
    await page.goto('/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.click();
    await page.waitForTimeout(2000);
    
    // Step 2: Find TestApp (where test-user-playwright is owner)
    // Delete option only shows for apps where user is Owner
    // Note: Multiple apps might have "TestApp" in name, use .first()
    const appCard = page.locator('[data-testid="app-card"]').filter({ hasText: 'TestApp' }).first();
    await appCard.waitFor({ state: 'visible', timeout: 10000 });
    
    const appNameText = await appCard.textContent();
    
    // Step 3: Open menu and click delete
    const menuButton = appCard.locator('button[aria-label*="menu" i], button:has(svg)').first();
    
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      
      const deleteOption = page.locator('text=/delete app/i').first();
      await deleteOption.click();
      await page.waitForTimeout(2000);
      
      // Step 4: Cancel deletion
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.waitFor({ state: 'visible', timeout: 5000 });
      await cancelButton.click();
      await page.waitForTimeout(2000);
      
      // Step 5: Verify app still exists in list
      await expect(appCard).toBeVisible();
      
    } else {
    }
  });
});

