import { test, expect } from '@playwright/test';

test.describe('Empty State - No Releases', () => {
  
  // Reset releases before each test to ensure empty state
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
  });
  
  test('Empty State 1: No Releases Message Displayed', async ({ page }) => {
    test.setTimeout(30000);
    
    // Step 1: Login
    await page.goto('/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Navigate to organization
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstOrgCard.click();
    await page.waitForTimeout(1500);
    
    // Step 3: Navigate to app
    const firstAppCard = page.locator('[data-testid="app-card"]').first();
    await firstAppCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstAppCard.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Wait for page to load and deployment to be selected (if any)
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Step 5: Verify empty state message is displayed
    // The empty state should show exactly "No Releases Yet"
    const emptyStateTitle = page.locator('text=/^No Releases Yet$/i');
    await expect(emptyStateTitle).toBeVisible({ timeout: 10000 });
    
    // Step 6: Verify empty state description message
    const emptyStateMessage = page.locator('text=/This deployment Key doesn\'t have any releases. Create your first release to get started!/i');
    await expect(emptyStateMessage).toBeVisible({ timeout: 5000 });
  });
});

