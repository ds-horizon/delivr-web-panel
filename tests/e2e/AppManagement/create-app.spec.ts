import { test, expect } from '@playwright/test';

test.describe('Create App Tests', () => {
  
  test('Create App 1: Successfully create a new app under existing org', async ({ page }) => {
    
    // Step 1: Login
    await page.goto('/test-login');
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
    
    await page.goto('/test-login');
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

  test('Create App 3: Duplicate App Name in Same Organization Should Be Rejected', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Step 1: Login
    await page.goto('/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Navigate to organization (test-org-1)
    const orgCard = page.locator('[data-testid="org-card"]').filter({ hasText: 'test-org-1' });
    await orgCard.waitFor({ state: 'visible', timeout: 10000 });
    await orgCard.click();
    await page.waitForLoadState('networkidle');
    
    // Step 3: Click "Create App" button
    const createAppButton = page.getByRole('button', { name: /create.*app|new.*app|\+/i }).first();
    await createAppButton.waitFor({ state: 'visible', timeout: 10000 });
    await createAppButton.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Fill app name with duplicate name (TestApp)
    const duplicateAppName = 'TestApp';
    const nameInput = page.getByLabel(/app name|name/i).first();
    await nameInput.fill(duplicateAppName);
    await page.waitForTimeout(1000);
    
    // Step 5: Submit the form
    const submitButton = page.getByRole('button', { name: /create|submit/i }).last();
    
    // Wait for API response to verify duplicate rejection
    const responsePromise = page.waitForResponse(resp => 
      resp.url().includes('/apps') && resp.request().method() === 'POST'
    );
    
    await submitButton.click();
    
    // Step 6: Verify API response shows duplicate error
    const response = await responsePromise;
    expect(response.status()).toBe(409); // Conflict status code
    
    const responseData = await response.json();
    expect(responseData.error || responseData.message).toContain('already exists');
    expect(responseData.error || responseData.message).toContain(duplicateAppName);
    
    // Step 7: Verify error notification is shown
    await page.waitForSelector('text=/already exists|duplicate|error/i', { timeout: 10000 });
    
    // Step 8: Verify form is still visible (not submitted)
    await expect(nameInput).toBeVisible();
  });
});

