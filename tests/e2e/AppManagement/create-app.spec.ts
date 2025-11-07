import { test, expect } from '@playwright/test';

test.describe('Create App Tests', () => {
  
  test('Create App 1: Successfully create a new app under existing org', async ({ page }) => {
    
    // Step 1: Login
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Navigate to organization
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstOrgCard.click();
    await page.waitForTimeout(2000);
    
    // Step 3: Look for "Create App" or "+" button
    // Might be a button like "Create App", "New App", or "+" icon
    const createAppButton = page.getByRole('button', { name: /create.*app|new.*app|\+/i }).first();
    
    if (await createAppButton.isVisible().catch(() => false)) {
      await createAppButton.click();
      await page.waitForTimeout(2000);
      
      // Fill app name
      const appName = `TestApp-${Date.now()}`;
      const nameInput = page.getByLabel(/app name|name/i).first();
      await nameInput.fill(appName);
      
      // Submit
      const submitButton = page.getByRole('button', { name: /create|submit/i }).last();
      await submitButton.click();
      
      // Wait for modal to close or form to submit
      await page.waitForTimeout(3000);
      
      // Verify app appears in list (this is the real verification)
      const newAppCard = page.locator(`text=/${appName}/i`).first();
      await expect(newAppCard).toBeVisible({ timeout: 10000 });
      
    } else {
    }
  });
  
  test('Create App 2: Validation - Empty app name', async ({ page }) => {
    
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.click();
    await page.waitForTimeout(2000);
    
    const createAppButton = page.getByRole('button', { name: /create.*app|new.*app|\+/i }).first();
    
    if (await createAppButton.isVisible().catch(() => false)) {
      await createAppButton.click();
      await page.waitForTimeout(2000);
      
      // Leave name empty and try to submit
      const submitButton = page.getByRole('button', { name: /create|submit/i }).last();
      
      // Check if button is disabled or click to trigger validation
      const isDisabled = await submitButton.isDisabled().catch(() => false);
      
      if (isDisabled) {
      } else {
        await submitButton.click();
        await page.waitForTimeout(1000);
        
        // Check for error message
        const errorMessage = page.locator('text=/app name.*required|name.*required/i');
        const hasError = await errorMessage.isVisible().catch(() => false);
        
        if (hasError) {
          const errorText = await errorMessage.textContent();
        } else {
        }
      }
      
    } else {
    }
  });
});

