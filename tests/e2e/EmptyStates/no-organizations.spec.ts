import { test, expect } from '@playwright/test';

test.describe('Empty State - No Organizations', () => {
  
  // Reset all data to empty state (no initialization) before each test
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-empty', { method: 'POST' });
  });
  
  // Reset data back to initial state after each test so next tests don't fail
  test.afterEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
  });
  
  test('Empty State 3: No Organizations - Welcome Message Displayed', async ({ page }) => {
    test.setTimeout(60000);
    
    // Step 1: Login
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Check if there are any organizations and delete them
    let orgCards = page.locator('[data-testid="org-card"]');
    let orgCount = await orgCards.count();
    
    // Delete all organizations one by one
    while (orgCount > 0) {
      // Get the first org card
      const firstOrgCard = page.locator('[data-testid="org-card"]').first();
      await firstOrgCard.waitFor({ state: 'visible', timeout: 5000 });
      
      // Find the menu button (three dots icon) - it's an ActionIcon with IconDots
      const menuButton = firstOrgCard.locator('button').filter({ has: page.locator('svg') }).first();
      
      if (await menuButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Click the menu button (stop propagation to prevent navigation)
        await menuButton.click({ force: true });
        await page.waitForTimeout(1000);
        
        // Click "Delete Organization" menu item
        const deleteOption = page.locator('text=/Delete Organization/i');
        if (await deleteOption.isVisible({ timeout: 2000 }).catch(() => false)) {
          await deleteOption.click();
          await page.waitForTimeout(1000);
          
          // Confirm deletion in modal
          const confirmDeleteButton = page.getByRole('button', { name: /^delete$/i, exact: true });
          if (await confirmDeleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
            await confirmDeleteButton.click();
            await page.waitForTimeout(2000);
            
            // Wait for success notification or page update
            await page.waitForTimeout(1000);
          }
        }
      }
      
      // Re-check org count after deletion
      orgCards = page.locator('[data-testid="org-card"]');
      orgCount = await orgCards.count();
    }
    
    // Step 3: Wait for page to update after deletions
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Step 4: Verify "Welcome to the Delivr Dashboard" message is displayed
    const welcomeTitle = page.locator('text=/Welcome to the.*Delivr.*Dashboard/i');
    await expect(welcomeTitle).toBeVisible({ timeout: 10000 });
    
    // Step 5: Verify the exact title text
    const exactTitle = page.locator('text=/Welcome to the Delivr Dashboard/i');
    await expect(exactTitle).toBeVisible({ timeout: 5000 });
  });
});

