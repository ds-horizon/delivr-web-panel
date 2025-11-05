import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release - Review Modal Verification', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
    console.log('🔄 Reset releases before test');
  });
  
  test('Review Verification: All details should be displayed correctly in review modal', async ({ page }) => {
    console.log('🚀 Test: Review Modal - Verify All Details');
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Test data - we'll verify all these appear in the review modal
    const testData = {
      version: '2.5.0',
      deployment: 'Production',
      rollout: 75,
      description: 'This is a test release with new features and bug fixes.',
      disabled: false,
    };
    
    // Step 1: Login and navigate to create release page
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.click();
    await page.waitForTimeout(2000);
    
    const firstAppCard = page.locator('[data-testid="app-card"]').first();
    await firstAppCard.click();
    await page.waitForTimeout(2000);
    
    const createReleaseButton = page.getByRole('button', { name: /create release/i });
    await createReleaseButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Opened create release form');
    
    // Step 2: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    console.log('✅ Bundle uploaded');
    
    // Get bundle name for verification
    const bundleNameText = await page.locator('text=/test-bundle/i').textContent().catch(() => 'test-bundle');
    console.log(`📦 Bundle name: ${bundleNameText}`);
    
    // Step 3: Move to Step 2 - Fill metadata
    const nextStepButton1 = page.getByRole('button', { name: /next step/i });
    await nextStepButton1.click();
    await page.waitForTimeout(2000);
    console.log('✅ Moved to Step 2');
    
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill(testData.version);
    console.log(`✅ Filled version: ${testData.version}`);
    
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const deploymentOption = page.locator(`[role="option"]:has-text("${testData.deployment}")`);
    await deploymentOption.click();
    console.log(`✅ Selected deployment: ${testData.deployment}`);
    
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.fill(testData.description);
    console.log(`✅ Filled description: "${testData.description}"`);
    
    // Step 4: Move to Step 3 - Configure rollout
    const nextStepButton2 = page.getByRole('button', { name: /next step/i });
    await nextStepButton2.click();
    await page.waitForTimeout(2000);
    console.log('✅ Moved to Step 3');
    
    // Set rollout percentage using keyboard
    const rolloutDisplay = page.locator('text=/\\d+%/').first();
    await rolloutDisplay.waitFor({ state: 'visible', timeout: 5000 });
    const currentRolloutText = await rolloutDisplay.textContent();
    const currentRollout = parseInt(currentRolloutText?.match(/\d+/)?.[0] || '1');
    
    if (currentRollout !== testData.rollout) {
      const sliderThumb = page.locator('[role="slider"]').first();
      if (await sliderThumb.isVisible()) {
        await sliderThumb.focus();
        const steps = testData.rollout - currentRollout;
        const key = steps > 0 ? 'ArrowRight' : 'ArrowLeft';
        for (let i = 0; i < Math.abs(steps); i++) {
          await page.keyboard.press(key);
          await page.waitForTimeout(10);
        }
      }
    }
    console.log(`✅ Set rollout to: ${testData.rollout}%`);
    
    // Optionally toggle disabled switch
    if (testData.disabled) {
      const disabledSwitch = page.locator('input[type="checkbox"]').filter({ 
        has: page.locator('text=/disabled/i') 
      }).first();
      await disabledSwitch.check();
      console.log('✅ Enabled "Disabled" toggle');
    } else {
      console.log('✅ Left "Disabled" toggle OFF (active release)');
    }
    
    // Step 5: Open Review Modal
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Opened Review Modal');
    
    // Step 6: Verify all details in the Review Modal
    console.log('\n🔍 Verifying Review Modal Content...');
    
    // Verify Bundle/Directory name
    const bundleInReview = page.locator(`text=/${bundleNameText}/i`);
    await expect(bundleInReview).toBeVisible();
    console.log(`✅ Bundle name verified: ${bundleNameText}`);
    
    // Verify App Version
    const versionInReview = page.locator(`text=/${testData.version}/`);
    await expect(versionInReview).toBeVisible();
    console.log(`✅ App version verified: ${testData.version}`);
    
    // Verify Deployment Key
    const deploymentInReview = page.locator(`text=/${testData.deployment}/i`);
    await expect(deploymentInReview).toBeVisible();
    console.log(`✅ Deployment verified: ${testData.deployment}`);
    
    // Verify Rollout percentage (select the one in review modal, not on Step 3)
    const rolloutInReview = page.locator(`text=/${testData.rollout}%/`).last();
    await expect(rolloutInReview).toBeVisible();
    console.log(`✅ Rollout verified: ${testData.rollout}%`);
    
    // Verify Description
    const descriptionInReview = page.locator(`text=/${testData.description.substring(0, 20)}/i`);
    await expect(descriptionInReview).toBeVisible();
    console.log(`✅ Description verified: "${testData.description}"`);
    
    // Verify Disabled status
    const disabledText = testData.disabled ? 'Yes' : 'No';
    const disabledInReview = page.locator(`text=/Disabled.*${disabledText}/i`).first();
    await expect(disabledInReview).toBeVisible();
    console.log(`✅ Disabled status verified: ${disabledText}`);
    
    // Step 7: Verify action buttons are present
    const cancelButton = page.locator('[data-testid="review-modal-cancel"]');
    await expect(cancelButton).toBeVisible();
    console.log('✅ Cancel button visible');
    
    const createButton = page.getByRole('button', { name: /create release/i }).last();
    await expect(createButton).toBeVisible();
    console.log('✅ Create Release button visible');
    
    console.log('\n✅ Test passed - All details verified correctly in Review Modal');
  });
  
  test('Review Verification: Edit from Review - Go back and modify details', async ({ page }) => {
    console.log('🚀 Test: Edit from Review Modal');
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Step 1: Login and navigate to create release page
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.click();
    await page.waitForTimeout(2000);
    
    const firstAppCard = page.locator('[data-testid="app-card"]').first();
    await firstAppCard.click();
    await page.waitForTimeout(2000);
    
    const createReleaseButton = page.getByRole('button', { name: /create release/i });
    await createReleaseButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Opened create release form');
    
    // Step 2: Complete form with initial values
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    const nextStepButton1 = page.getByRole('button', { name: /next step/i });
    await nextStepButton1.click();
    await page.waitForTimeout(2000);
    
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('1.0.0');
    console.log('✅ Initial version: 1.0.0');
    
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const prodOption = page.locator('[role="option"]:has-text("Production")');
    await prodOption.click();
    
    const nextStepButton2 = page.getByRole('button', { name: /next step/i });
    await nextStepButton2.click();
    await page.waitForTimeout(2000);
    
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Opened Review Modal');
    
    // Step 3: Cancel from review to go back and edit
    const cancelButton = page.locator('[data-testid="review-modal-cancel"]');
    await cancelButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Canceled review, back on Step 3');
    
    // Step 4: Navigate back to Step 2 to edit version
    const backButton = page.locator('[data-testid="step-back-button"]');
    await backButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Back on Step 2');
    
    // Step 5: Modify the version
    await appVersionInput.clear();
    await appVersionInput.fill('2.0.0');
    console.log('✅ Modified version to: 2.0.0');
    
    // Step 6: Go forward again
    await nextStepButton2.click();
    await page.waitForTimeout(2000);
    
    await reviewButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Reopened Review Modal');
    
    // Step 7: Verify the modified version appears in review
    const newVersionInReview = page.locator('text=/2\\.0\\.0/');
    await expect(newVersionInReview).toBeVisible();
    console.log('✅ Modified version (2.0.0) verified in Review Modal');
    
    // Verify old version is NOT present
    const oldVersionInReview = page.locator('text=/1\\.0\\.0/');
    const oldVersionVisible = await oldVersionInReview.isVisible().catch(() => false);
    expect(oldVersionVisible).toBe(false);
    console.log('✅ Old version (1.0.0) not shown (as expected)');
    
    console.log('✅ Test passed - Can edit and changes reflect in Review Modal');
  });
});

