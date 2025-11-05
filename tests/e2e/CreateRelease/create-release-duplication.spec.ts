import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release - Incomplete Rollout Validation', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
    console.log('🔄 Reset releases before test');
  });
  
  // Helper function to create release
  async function createRelease(
    page: any,
    config: {
      version: string,
      rollout: number,
      disabled: boolean,
      deployment: string
    }
  ) {
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Login
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Navigate to org
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstOrgCard.click();
    await page.waitForTimeout(1500);
    
    // Navigate to app
    const firstAppCard = page.locator('[data-testid="app-card"]').first();
    await firstAppCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstAppCard.click();
    await page.waitForTimeout(2000);
    
    // Open create release
    const createReleaseButton = page.getByRole('button', { name: /create release/i });
    await createReleaseButton.waitFor({ state: 'visible', timeout: 10000 });
    await createReleaseButton.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Navigated to create release modal');
    
    // Step 1: Upload bundle
    console.log('📝 Uploading bundle...');
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    console.log('✅ Bundle uploaded');
    
    // Click Next to go to step 2
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Moved to step 2');
    
    // Step 2: Fill metadata
    console.log(`📝 Filling version: ${config.version}`);
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.waitFor({ state: 'visible', timeout: 5000 });
    await appVersionInput.fill(config.version);
    
    // Select deployment
    console.log(`📝 Selecting ${config.deployment} deployment...`);
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.waitFor({ state: 'visible', timeout: 5000 });
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    
    const deploymentOption = page.locator(`[role="option"]:has-text("${config.deployment}")`);
    await deploymentOption.waitFor({ state: 'visible', timeout: 5000 });
    await deploymentOption.click();
    console.log('✅ Deployment selected');
    
    // Fill description
    const descriptionInput = page.getByLabel(/description/i);
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(`Release ${config.version} with ${config.rollout}% rollout`);
    }
    
    // Click Next Step to go to step 3
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Moved to step 3');
    
    // Step 3: Configure
    if (config.disabled) {
      console.log('📝 Enabling Disabled toggle...');
      const disabledLabel = page.locator('text=/^Disabled$/i').first();
      await disabledLabel.waitFor({ state: 'visible', timeout: 5000 });
      await disabledLabel.click();
      await page.waitForTimeout(500);
      console.log('✅ Disabled toggle ON');
    }
    
    // Set rollout
    console.log(`📝 Setting rollout to ${config.rollout}%...`);
    const rolloutDisplay = page.locator('text=/\\d+%/').first();
    await rolloutDisplay.waitFor({ state: 'visible', timeout: 5000 });
    
    const currentRolloutText = await rolloutDisplay.textContent();
    const currentRollout = parseInt(currentRolloutText?.match(/\d+/)?.[0] || '1');
    
    if (currentRollout !== config.rollout) {
      const sliderThumb = page.locator('[role="slider"]').first();
      if (await sliderThumb.isVisible()) {
        await sliderThumb.focus();
        const steps = config.rollout - currentRollout;
        const direction = steps > 0 ? 'ArrowRight' : 'ArrowLeft';
        for (let i = 0; i < Math.abs(steps); i++) {
          await page.keyboard.press(direction);
          await page.waitForTimeout(10);
        }
        console.log(`✅ Set rollout to ${config.rollout}%`);
      }
    }
    
    // Click Review Changes
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.waitFor({ state: 'visible', timeout: 5000 });
    await reviewButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Opened review modal');
    
    // Submit
    const submitButton = page.getByRole('button', { name: /create release|submit/i }).last();
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await submitButton.click();
    console.log('✅ Submitted release');
  }

  test('Incomplete Rollout: Should ALLOW new release when previous has 100% rollout', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds for this test (creates 2 releases)
    console.log('🚀 Test: Allow new release when previous has 100% rollout');
    
    // Step 1: Create first release with 100% rollout
    console.log('\n📝 Step 1: Creating first release with 100% rollout...');
    await createRelease(page, {
      version: '3.5.0',
      rollout: 100,
      disabled: false, // Active
      deployment: 'Production'
    });
    
    // Wait for success
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    console.log('✅ First release created (v3.5.0 with 100% rollout)');
    await page.waitForTimeout(3000);
    
    // Step 2: Create second release on same deployment (should succeed)
    console.log('\n📝 Step 2: Creating second release on same deployment...');
    await createRelease(page, {
      version: '3.6.0',
      rollout: 100,
      disabled: false,
      deployment: 'Production'
    });
    
    // Step 3: Verify success
    console.log('\n📝 Step 3: Verifying second release created successfully...');
    
    // Should see success message
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    console.log('✅ Second release created successfully (previous was 100%)');
    
    // Verify release in listing
    await page.waitForTimeout(3000);
    // Look for the release with app version 3.6.0 (shown as "Target: 3.6.0")
    const releaseCard = page.locator('text=/3\\.6\\.0/i').first();
    await releaseCard.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Release with target 3.6.0 found in listing');
    
    console.log('✅ Test passed - Can create new release when previous is 100%');
  });

  test('Incomplete Rollout: Should prevent creating new release when previous has <100% rollout', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds for this test (creates 2 releases)
    console.log('🚀 Test: Incomplete Rollout Validation');
    
    // Step 1: Create first release with 50% rollout (active)
    console.log('\n📝 Step 1: Creating first release with 50% rollout...');
    await createRelease(page, {
      version: '3.1.0',
      rollout: 50,
      disabled: false, // Active
      deployment: 'Production'
    });
    
    // Wait for success
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    console.log('✅ First release created (v3.1.0 with 50% rollout)');
    await page.waitForTimeout(3000);
    
    // Navigate back to app page (modal should auto-close)
    console.log('📝 Ensuring we\'re on app page...');
    const currentUrl = page.url();
    if (!currentUrl.includes('/dashboard/')) {
      // If not on app page, navigate to it
      await page.goto('http://localhost:3000/dashboard');
      await page.waitForTimeout(2000);
      
      const firstOrgCard = page.locator('[data-testid="org-card"]').first();
      await firstOrgCard.click();
      await page.waitForTimeout(1500);
      
      const firstAppCard = page.locator('[data-testid="app-card"]').first();
      await firstAppCard.click();
      await page.waitForTimeout(2000);
    }
    console.log('✅ On app page, ready for second release');
    
    // Step 2: Try to create second release on same deployment
    console.log('\n📝 Step 2: Attempting to create second release on same deployment...');
    
    // Open create release modal
    const createReleaseButton2 = page.getByRole('button', { name: /create release/i });
    await createReleaseButton2.waitFor({ state: 'visible', timeout: 10000 });
    await createReleaseButton2.click();
    await page.waitForTimeout(1000);
    
    console.log('✅ Opened create release modal for second release');
    
    // Now check if error appears immediately or continue with form
    const hasError = await page
    .locator('text=/Incomplete Rollout/i')
    .isVisible()
    .catch(() => false);
  
    if (hasError) {
      console.log('⚠️ Error appeared immediately when opening modal');
    } else {
      console.log('📝 No immediate error, filling form to trigger validation...');
      
      // Upload bundle
      const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
      const fileInput = page.locator('input[type="file"][webkitdirectory]');
      await fileInput.setInputFiles(testBundleDir);
      await page.waitForTimeout(5000);
      
      // Try to proceed
      const nextButton = page.getByRole('button', { name: /next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        
        // Fill version
        const appVersionInput = page.getByLabel(/app version/i);
        if (await appVersionInput.isVisible()) {
          await appVersionInput.fill('3.2.0');
          
          // Select deployment
          const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
          await deploymentSelect.click();
          await page.waitForTimeout(500);
          const prodOption = page.locator('[role="option"]:has-text("Production")');
          await prodOption.click();
          
          // Try to proceed to next step
          const nextStepButton = page.getByRole('button', { name: /next step/i });
          await nextStepButton.click();
          await page.waitForTimeout(1000);
          
          // Try to review
          const reviewButton = page.getByRole('button', { name: /review/i });
          if (await reviewButton.isVisible()) {
            await reviewButton.click();
            await page.waitForTimeout(1000);
            
            // Try to submit
            const submitButton = page.getByRole('button', { name: /create release|submit/i }).last();
            await submitButton.click();
            console.log('✅ Submitted - waiting for error...');
          }
        }
      }
    }
    
    // Step 3: Verify error message appears
    console.log('\n📝 Step 3: Checking for incomplete rollout error...');
    
    // Wait for error message
   const errorMessage = page.locator('text=/Incomplete Rollout/i').first();
    await errorMessage.waitFor({ state: 'visible', timeout: 10000 });
    
    const errorText = await errorMessage.textContent();
    console.log(`📊 Error message: ${errorText}`);
    
    // Verify error message content
    expect(errorText).toMatch(/Incomplete Rollout/i);
    console.log('✅ Correct error message displayed');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/incomplete-rollout-error.png',
      fullPage: true 
    });
    
    console.log('✅ Test passed - Incomplete rollout validation works');
  });

  test('Incomplete Rollout: Should ALLOW new release when previous is DISABLED (inactive)', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds for this test (creates 2 releases)
    console.log('🚀 Test: Allow new release when previous is disabled');
    
    // Step 1: Create first release with 50% rollout but DISABLED
    console.log('\n📝 Step 1: Creating disabled release with 50% rollout...');
    await createRelease(page, {
      version: '3.3.0',
      rollout: 50,
      disabled: true, // Inactive/Disabled
      deployment: 'Staging'
    });
    
    // Wait for success
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    console.log('✅ First release created (v3.3.0 with 50% rollout, DISABLED)');
    await page.waitForTimeout(3000);
    
    // Step 2: Create second release on same deployment (should succeed)
    console.log('\n📝 Step 2: Creating second release on same deployment...');
    await createRelease(page, {
      version: '3.4.0',
      rollout: 100,
      disabled: false,
      deployment: 'Staging'
    });
    
    // Step 3: Verify success (no error)
    console.log('\n📝 Step 3: Verifying second release created successfully...');
    
    // Should see success message, not error
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    console.log('✅ Second release created successfully (previous was disabled)');
    
    // Verify release in listing (on Staging deployment)
    console.log('📝 Navigating to Staging deployment view...');
    
    // Navigate directly to Staging deployment
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Staging');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to Staging deployment');
    
    // Look for the release with app version 3.4.0
    const releaseCard = page.locator('text=/3\\.4\\.0/i').first();
    await releaseCard.waitFor({ state: 'visible', timeout: 10000 });
    console.log('✅ Release with target 3.4.0 found in listing');
    
    console.log('✅ Test passed - Can create new release when previous is disabled');
  });
});
