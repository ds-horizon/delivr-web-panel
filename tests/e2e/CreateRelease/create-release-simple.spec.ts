import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release Flow', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
    console.log('🔄 Reset releases before test');
  });
  
  test('should successfully create a new release', async ({ page }) => {
    // Use the fixtures we already created
    const testFixturesDir = path.join(__dirname, '../../fixtures');
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
    
    // Step 8: Set rollout slider to 100%
    console.log('📝 Setting rollout to 100%...');
    
    // Find the rollout percentage display
    const rolloutDisplay = page.locator('text=/\\d+%/').first();
    await rolloutDisplay.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get current rollout value
    const currentRolloutText = await rolloutDisplay.textContent();
    const currentRollout = parseInt(currentRolloutText?.match(/\d+/)?.[0] || '1');
    console.log(`Current rollout: ${currentRollout}%`);
    
    // If not already at 100%, adjust the slider
    if (currentRollout !== 100) {
      const sliderThumb = page.locator('[role="slider"]').first();
      if (await sliderThumb.isVisible()) {
        await sliderThumb.focus();
        
        // Move to 100% (press ArrowRight from current position)
        const steps = 100 - currentRollout;
        for (let i = 0; i < steps; i++) {
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(10);
        }
        
        console.log('✅ Set rollout to 100%');
      }
    } else {
      console.log('✅ Rollout already at 100%');
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
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    
    console.log('✅ Release created successfully - notification displayed');
    
    // Step 12: Verify release appears in listing
    console.log('📝 Step 12: Verifying release in listing...');
    
    // Wait for modal to close and page to reload/refresh
    await page.waitForTimeout(3000);
    
    // Check current URL - should be back on app page
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Look for the release v1.0.0 in the list
    // Note: Ignore console errors about packageHistory - they don't prevent display
    console.log('📝 Looking for release v1.0.0 in listing...');
    const releaseCard = page.locator('text=/v1/i').first();
    
    // Wait for the release to appear (it should be visible)
    await releaseCard.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Release v1.0.0 found in listing');
    
    // Verify it's actually visible
    const isVisible = await releaseCard.isVisible();
    expect(isVisible).toBe(true);
    console.log('✅ Release listing verified');
    
    // Wait a bit to see the result
    await page.waitForTimeout(1000);
    
    // Take a final screenshot for verification
    await page.screenshot({ 
      path: 'test-results/create-release-success.png',
      fullPage: true 
    });
    
    console.log('✅ Test completed successfully');
  });
  
});

