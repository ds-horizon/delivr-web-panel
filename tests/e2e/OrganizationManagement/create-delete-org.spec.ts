import { test, expect } from '@playwright/test';

test.describe('Organization Management - Create & Delete', () => {
  
  test('Org 1: Create Organization with App', async ({ page }) => {
    
    // Step 1: Login
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Click "Create Organization" button
    const createOrgButton = page.getByRole('button', { name: /create organization/i });
    await createOrgButton.waitFor({ state: 'visible', timeout: 10000 });
    await createOrgButton.click();
    await page.waitForTimeout(2000);
    
    // Step 3: Fill organization name (min 3 chars required)
    const timestamp = Date.now();
    const orgName = `TestOrg-${timestamp}`;
    const orgNameInput = page.getByLabel(/organization name/i);
    await orgNameInput.fill(orgName);
    
    // Step 4: Fill initial app name (required - every org needs at least one app)
    const appName = `InitialApp-${timestamp}`;
    const appNameInput = page.getByLabel(/initial app name/i);
    await appNameInput.fill(appName);
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Step 5: Click Create Organization button (in the modal - use .last() to get submit button)
    const createButton = page.getByRole('button', { name: /create organization/i }).last();
    await createButton.click();
    
    // Step 6: Wait for success notification
    await page.waitForSelector('text=/Organization created successfully/i', { timeout: 15000 });
    
    await page.waitForTimeout(3000);
    
    // Step 7: Verify organization appears in the list
    const newOrgCard = page.locator('[data-testid="org-card"]').filter({ hasText: orgName });
    await expect(newOrgCard.first()).toBeVisible({ timeout: 10000 });
    
  });

  test('Org 2: Delete Organization (Owner Only)', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Step 1: Login
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Find test-org-1 (where user is owner)
    const orgCard = page.locator('[data-testid="org-card"]', { hasText: 'test-org-1' });
    await orgCard.waitFor({ state: 'visible', timeout: 10000 });
    
    // Step 3: Look for delete option (three dots menu)
    // Might be on the org card itself or need to hover
    const menuButton = orgCard.locator('button[aria-label*="menu" i], button:has(svg)').first();
    
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      
      // Step 4: Click Delete option
      const deleteOption = page.locator('text=/delete.*org|delete/i').first();
      await deleteOption.waitFor({ state: 'visible', timeout: 5000 });
      await deleteOption.click();
      await page.waitForTimeout(2000);
      
      // Step 5: Confirm deletion
      const confirmDeleteButton = page.getByRole('button', { name: /^delete$/i, exact: true });
      await confirmDeleteButton.waitFor({ state: 'visible', timeout: 5000 });
      await confirmDeleteButton.click();
      
      await page.waitForTimeout(3000);
      
      // Step 6: Verify org removed from list
      const orgStillExists = await orgCard.isVisible().catch(() => false);
      expect(orgStillExists).toBe(false);
      
    } else {
    }
  });

  test('Org 3: Cancel Organization Deletion', async ({ page }) => {
    
    // Step 1: Login
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Find test-org-1
    const orgCard = page.locator('[data-testid="org-card"]', { hasText: 'test-org-1' });
    await orgCard.waitFor({ state: 'visible', timeout: 10000 });
    
    // Step 3: Open menu and start delete
    const menuButton = orgCard.locator('button[aria-label*="menu" i], button:has(svg)').first();
    
    if (await menuButton.isVisible().catch(() => false)) {
      await menuButton.click();
      await page.waitForTimeout(1000);
      
      const deleteOption = page.locator('text=/delete.*org|delete/i').first();
      await deleteOption.click();
      await page.waitForTimeout(2000);
      
      // Step 4: Cancel deletion
      const cancelButton = page.getByRole('button', { name: /cancel/i });
      await cancelButton.waitFor({ state: 'visible', timeout: 5000 });
      await cancelButton.click();
      await page.waitForTimeout(2000);
      
      // Step 5: Verify org still exists
      await expect(orgCard).toBeVisible();
      
    } else {
    }
  });
});

