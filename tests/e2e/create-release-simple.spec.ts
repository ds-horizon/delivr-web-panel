import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release Flow', () => {
  
  test('should successfully create a new release', async ({ page }) => {
    // Use the fixtures we already created
    const testFixturesDir = path.join(__dirname, '../fixtures');
    const testBundleDir = path.join(testFixturesDir, 'test-bundle');
    
    // Capture console errors and network failures for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
    
    page.on('pageerror', (error) => {
      console.error('Page error:', error.message);
    });
    
    page.on('response', async (response) => {
      if (response.status() >= 400) {
        console.error(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
    
    // Step 1: Login using test-login
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    
    // Wait for dashboard to hydrate
    await page.waitForFunction(() => document.readyState === 'complete');
    await page.waitForTimeout(3000);
    
    console.log('✅ Logged in and on dashboard');
    
    // Step 2: Click on first organization
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstOrgCard.click();
    
    console.log('✅ Clicked on organization');
    
    // Wait for org page to load
    await page.waitForTimeout(2000);
    
    // Step 3: Click on first app
    const firstAppCard = page.locator('[data-testid="app-card"]').first();
    await firstAppCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstAppCard.click();
    
    console.log('✅ Clicked on app');
    
    // Wait for app details page to load
    await page.waitForTimeout(2000);
    
    // Step 4: Click "Create Release" button
    const createReleaseButton = page.getByRole('button', { name: /create release/i });
    await createReleaseButton.waitFor({ state: 'visible', timeout: 10000 });
    await createReleaseButton.click();
    
    console.log('✅ Opened create release modal');
    
    // Wait for modal to appear
    await page.waitForTimeout(1000);
    
    // Step 5: Upload directory
    // Note: webkitdirectory inputs in Playwright require the directory path
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    
    // Pass the directory path directly
    await fileInput.setInputFiles(testBundleDir);
    
    console.log('✅ Uploaded test bundle directory');
    
    // Wait for file processing (ZIP creation takes time)
    await page.waitForTimeout(5000);
    
    // Step 5.5: Click "Next" button to proceed to metadata step
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextButton.click();
    
    console.log('✅ Clicked Next to metadata step');
    
    // Wait for next step to load
    await page.waitForTimeout(1000);
    
    // Step 6: Fill in release metadata
    // App Version
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.waitFor({ state: 'visible', timeout: 5000 });
    await appVersionInput.fill('1.0.0');
    
    console.log('✅ Filled app version');
    
    // Deployment (select first option)
    const deploymentSelect = page.locator('input[placeholder*="deployment" i], input[placeholder*="select" i]').first();
    await deploymentSelect.waitFor({ state: 'visible', timeout: 5000 });
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    
    // Click first deployment option
    const firstDeploymentOption = page.locator('[role="option"]').first();
    await firstDeploymentOption.waitFor({ state: 'visible', timeout: 5000 });
    await firstDeploymentOption.click();
    
    console.log('✅ Selected deployment');

    // Description (optional)
    const descriptionInput = page.getByLabel(/description/i);
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Test release from E2E test');
    }
    
    console.log('✅ Filled release metadata');
    
    // Step 7: Click "Next Step" to proceed to rollout step
    const nextButton2 = page.getByRole('button', { name: /next step|next/i });
    await nextButton2.waitFor({ state: 'visible', timeout: 5000 });
    await nextButton2.click();
    
    console.log('✅ Clicked Next Step to rollout');
    
    // Wait for rollout step to load
    await page.waitForTimeout(1000);
    
    // Step 8: Set rollout slider
    const rolloutInput = page.getByLabel(/rollout/i);
    if (await rolloutInput.isVisible()) {
      await rolloutInput.fill('100');
      console.log('✅ Set rollout to 100%');
    }
    
    // Step 9: Click "Review Changes" button
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.waitFor({ state: 'visible', timeout: 5000 });
    await reviewButton.click();
    
    console.log('✅ Clicked Review Changes');
    
    // Wait for review modal to appear
    await page.waitForTimeout(1000);
    
    // Step 10: Submit from review modal
    const submitButton = page.getByRole('button', { name: /create release|submit|upload/i }).last();
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Check if button is enabled
    const isDisabled = await submitButton.isDisabled();
    if (isDisabled) {
      await page.screenshot({ 
        path: 'test-results/create-release-form-disabled.png',
        fullPage: true 
      });
      throw new Error('Submit button is disabled - form validation may have failed');
    }
    
    await submitButton.click();
    
    console.log('✅ Submitted release from review modal');
    
    // Step 11: Wait for success notification
    await page.waitForSelector('text=/success|created|uploaded/i', { timeout: 30000 });
    
    console.log('✅ Release created successfully');
    
    // Wait a bit to see the result
    await page.waitForTimeout(3000);
    
    // Take a final screenshot for verification
    await page.screenshot({ 
      path: 'test-results/create-release-success.png',
      fullPage: true 
    });
    
    console.log('✅ Test completed successfully');
  });
  
});

