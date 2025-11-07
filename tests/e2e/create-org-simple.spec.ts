import { test, expect } from '@playwright/test';

test.describe('Create Organization Flow', () => {
  
  test('should successfully create a new organization with app', async ({ page }) => {
    // Step 1: Login (mock mode: use /test-login; otherwise click Google)
    // if (process.env.OAUTH_TEST_MODE === 'true') {
     
    // } else {
    //   await page.goto('http://localhost:3000');
    //   await page.waitForFunction(() => document.readyState === 'complete');
    //   await page.waitForTimeout(2000);
    //   const loginButton = page.getByTestId('google-login-btn');
    //   await loginButton.waitFor({ state: 'visible', timeout: 10000 });
    //   await loginButton.click();
    //   await page.waitForURL('**/dashboard**', { timeout: 30000 });
    // }

    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Wait for dashboard to hydrate
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.waitForTimeout(3000);
    
    // Step 2: Open create organization modal
    const createOrgButton = page.getByRole('button', { name: /create organization/i });
    await createOrgButton.waitFor({ state: 'visible', timeout: 10000 });
    await createOrgButton.click();
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);
    
    // Step 3: Fill in organization details
    const timestamp = Date.now();
    const orgName = `Test Org ${timestamp}`;
    const appName = `Test App ${timestamp}`;
    
    // Fill organization name
    const orgNameInput = page.getByLabel(/organization name/i);
    await orgNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await orgNameInput.fill(orgName);
    
    // Fill app name
    const appNameInput = page.getByLabel(/initial app name/i);
    await appNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await appNameInput.fill(appName);
    
    // Step 4: Submit the form
    const submitButton = page.getByRole('button', { name: /create organization/i }).last();
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Check if button is enabled
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled) {
      await page.screenshot({ 
        path: 'test-results/create-org-form-disabled.png',
        fullPage: true 
      });
      throw new Error('Submit button is disabled - form validation may have failed');
    }
    
    await submitButton.click();
    
    // Step 5: Wait for success notification
    await page.waitForSelector('text=/success|created/i', { timeout: 10000 });
    
    
    // Wait for modal to close
    await page.waitForTimeout(2000);
    
    
    // Take a final screenshot for verification
    await page.screenshot({ 
      path: 'test-results/create-org-success.png',
      fullPage: true 
    });
  });
  
});
