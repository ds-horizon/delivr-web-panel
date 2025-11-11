import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release - Review Modal Verification', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
  });
  
  test('Review Verification: All details should be displayed correctly in review modal', async ({ page }) => {
    
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
    await page.goto('/test-login');
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
    
    // Step 2: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    // Get bundle name for verification
    const bundleNameText = await page.locator('text=/test-bundle/i').textContent().catch(() => 'test-bundle');
    
    // Step 3: Move to Step 2 - Fill metadata
    const nextStepButton1 = page.getByRole('button', { name: /next step/i });
    await nextStepButton1.click();
    await page.waitForTimeout(2000);
    
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill(testData.version);
    
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const deploymentOption = page.locator(`[role="option"]:has-text("${testData.deployment}")`);
    await deploymentOption.click();
    
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.fill(testData.description);
    
    // Step 4: Move to Step 3 - Configure rollout
    const nextStepButton2 = page.getByRole('button', { name: /next step/i });
    await nextStepButton2.click();
    await page.waitForTimeout(2000);
    
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
    
    // Optionally toggle disabled switch
    if (testData.disabled) {
      const disabledSwitch = page.locator('input[type="checkbox"]').filter({ 
        has: page.locator('text=/disabled/i') 
      }).first();
      await disabledSwitch.check();
    } else {
    }
    
    // Step 5: Open Review Modal
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.click();
    await page.waitForTimeout(2000);
    
    // Step 6: Verify all details in the Review Modal
    
    // Verify Bundle/Directory name
    const bundleInReview = page.locator(`text=/${bundleNameText}/i`);
    await expect(bundleInReview).toBeVisible();
    
    // Verify App Version
    const versionInReview = page.locator(`text=/${testData.version}/`);
    await expect(versionInReview).toBeVisible();
    
    // Verify Deployment Key
    const deploymentInReview = page.locator(`text=/${testData.deployment}/i`);
    await expect(deploymentInReview).toBeVisible();
    
    // Verify Rollout percentage (select the one in review modal, not on Step 3)
    const rolloutInReview = page.locator(`text=/${testData.rollout}%/`).last();
    await expect(rolloutInReview).toBeVisible();
    
    // Verify Description
    const descriptionInReview = page.locator(`text=/${testData.description.substring(0, 20)}/i`);
    await expect(descriptionInReview).toBeVisible();
    
    // Verify Disabled status
    const disabledText = testData.disabled ? 'Yes' : 'No';
    const disabledInReview = page.locator(`text=/Disabled.*${disabledText}/i`).first();
    await expect(disabledInReview).toBeVisible();
    
    // Step 7: Verify action buttons are present
    const cancelButton = page.locator('[data-testid="review-modal-cancel"]');
    await expect(cancelButton).toBeVisible();
    
    const createButton = page.getByRole('button', { name: /create release/i }).last();
    await expect(createButton).toBeVisible();
    
  });
  
  test('Review Verification: Edit from Review - Go back and modify details', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Step 1: Login and navigate to create release page
    await page.goto('/test-login');
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
    
    // Step 2: Complete form with initial values
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    const nextStepButton1 = page.getByRole('button', { name: /next step/i });
    await nextStepButton1.click();
    await page.waitForTimeout(2000);
    
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('1.0.0');
    
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
    
    // Step 3: Cancel from review to go back and edit
    const cancelButton = page.locator('[data-testid="review-modal-cancel"]');
    await cancelButton.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Navigate back to Step 2 to edit version
    const backButton = page.locator('[data-testid="step-back-button"]');
    await backButton.click();
    await page.waitForTimeout(2000);
    
    // Step 5: Modify the version
    await appVersionInput.clear();
    await appVersionInput.fill('2.0.0');
    
    // Step 6: Go forward again
    await nextStepButton2.click();
    await page.waitForTimeout(2000);
    
    await reviewButton.click();
    await page.waitForTimeout(2000);
    
    // Step 7: Verify the modified version appears in review
    const newVersionInReview = page.locator('text=/2\\.0\\.0/');
    await expect(newVersionInReview).toBeVisible();
    
    // Verify old version is NOT present
    const oldVersionInReview = page.locator('text=/1\\.0\\.0/');
    const oldVersionVisible = await oldVersionInReview.isVisible().catch(() => false);
    expect(oldVersionVisible).toBe(false);
    
  });
});

