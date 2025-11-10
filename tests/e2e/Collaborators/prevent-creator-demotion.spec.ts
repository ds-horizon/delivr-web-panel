import { test, expect } from '@playwright/test';

test.describe('Collaborators - Prevent App Creator Demotion', () => {
  
  // Reset all data before each test for complete isolation
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
  });
  
  test('Collaborator 1: Cannot Change App Creator Permission from Owner to Collaborator', async ({ page }) => {
    test.setTimeout(60000);
    
    // Step 1: Login as app owner/creator
    await page.goto('http://localhost:3000/test-login');
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
    
    // Step 4: Navigate to Collaborators tab
    const collaboratorsTab = page.getByRole('tab', { name: /collaborators/i });
    await collaboratorsTab.waitFor({ state: 'visible', timeout: 10000 });
    await collaboratorsTab.click();
    await page.waitForTimeout(2000);
    
    // Step 5: Find the app creator in the collaborators list
    // We're logged in as playwright@example.com viewing TestApp
    // TestApp was created by playwright@example.com, so that's the app creator
    const appCreatorEmail = 'playwright@example.com';
    
    // Wait for collaborators list to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find the collaborator row with the app creator's email
    // First try using data-testid
    const creatorEmailTestId = `collaborator-email-${appCreatorEmail.replace(/[@.]/g, '-')}`;
    const creatorEmailElement = page.locator(`[data-testid="${creatorEmailTestId}"]`);
    
    // Wait for the email to appear in the table
    await page.waitForSelector(`text=/^${appCreatorEmail}$/i`, { timeout: 10000 });
    await page.waitForTimeout(1000);
    
    // Find the table row containing the email
    const emailText = page.locator(`text=/^${appCreatorEmail}$/i`);
    await emailText.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get the table row (go up from the text element to find the Table.Tr)
    const creatorRow = emailText.locator('xpath=ancestor::tr');
    await creatorRow.waitFor({ state: 'visible', timeout: 5000 });
    
    // Step 6: Verify the app creator has "Owner" permission
    // Look for Owner badge in the same row
    const ownerBadge = creatorRow.locator('text=/Owner/i');
    await expect(ownerBadge).toBeVisible({ timeout: 5000 });
    
    // Step 7: Try to change permission from Owner to Collaborator
    // Find the permission select dropdown in the same row
    const permissionSelect = page.locator(`[data-testid="collaborator-permission-select-${appCreatorEmail.replace(/[@.]/g, '-')}"]`);
    
    // If data-testid not found, use fallback selector from the row
    let selectElement = permissionSelect;
    if (!(await selectElement.isVisible({ timeout: 2000 }).catch(() => false))) {
      // Find select/combobox in the same row
      selectElement = creatorRow.locator('[role="combobox"], select').first();
    }
    
    await selectElement.waitFor({ state: 'visible', timeout: 5000 });
    await selectElement.click();
    await page.waitForTimeout(500);
    
    // Select "Collaborator" option
    const collaboratorOption = page.locator('[role="option"]:has-text("Collaborator")');
    await collaboratorOption.waitFor({ state: 'visible', timeout: 5000 });
    await collaboratorOption.click();
    await page.waitForTimeout(2000);
    
    // Step 8: Verify error notification appears
    // Mantine notifications show the error message in a notification toast
    // The notification has title "Collaborator Updation" and the error message
    // The error message from backend is: "The app creator cannot change their permission from Owner to Collaborator."
    // We can check for the message text (with or without period)
    const errorNotification = page.locator('text=/The app creator cannot change their permission from Owner to Collaborator/i');
    await expect(errorNotification).toBeVisible({ timeout: 10000 });
    
    // Also verify the notification title appears
    const notificationTitle = page.locator('text=/Collaborator Updation/i');
    await expect(notificationTitle).toBeVisible({ timeout: 5000 });
    
    // Step 9: Verify permission remains as "Owner"
    const ownerBadgeAfter = creatorRow.locator('text=/Owner/i');
    await expect(ownerBadgeAfter).toBeVisible({ timeout: 5000 });
    
    // Step 10: Verify permission select still shows "Owner"
    const selectValue = await selectElement.inputValue().catch(() => null);
    if (selectValue !== null) {
      expect(selectValue).toBe('Owner');
    } else {
      // For Mantine Select, check the displayed text
      const selectText = await selectElement.textContent();
      expect(selectText).toContain('Owner');
    }
  });
});

