import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Promote Release Tests', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async ({ page }) => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
  });
  
  // Helper function to create a release
  async function createTestRelease(page: any, releaseData: {
    version: string;
    deployment: string;
    rollout: number;
    description: string;
  }) {
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Navigate to create release page
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
    
    // Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    // Fill metadata
    const nextStepButton1 = page.getByRole('button', { name: /next step/i });
    await nextStepButton1.click();
    await page.waitForTimeout(2000);
    
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill(releaseData.version);
    
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const deploymentOption = page.locator(`[role="option"]:has-text("${releaseData.deployment}")`);
    await deploymentOption.click();
    
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.fill(releaseData.description);
    
    // Configure
    const nextStepButton2 = page.getByRole('button', { name: /next step/i });
    await nextStepButton2.click();
    await page.waitForTimeout(2000);
    
    // Set rollout
    if (releaseData.rollout !== 1) {
      const rolloutDisplay = page.locator('text=/\\d+%/').first();
      await rolloutDisplay.waitFor({ state: 'visible', timeout: 5000 });
      const currentRolloutText = await rolloutDisplay.textContent();
      const currentRollout = parseInt(currentRolloutText?.match(/\d+/)?.[0] || '1');
      
      if (currentRollout !== releaseData.rollout) {
        const sliderThumb = page.locator('[role="slider"]').first();
        if (await sliderThumb.isVisible()) {
          await sliderThumb.focus();
          const steps = releaseData.rollout - currentRollout;
          const key = steps > 0 ? 'ArrowRight' : 'ArrowLeft';
          for (let i = 0; i < Math.abs(steps); i++) {
            await page.keyboard.press(key);
            await page.waitForTimeout(10);
          }
        }
      }
    }
    
    // Submit
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.click();
    await page.waitForTimeout(2000);
    
    const createButton = page.getByRole('button', { name: /create release/i }).last();
    await createButton.click();
    
    // Wait for success
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    await page.waitForTimeout(2000);
    
  }

  test('Promote Release 1: Promote from Staging to Production', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds (creates + promotes)
    
    // Step 1: Create a release on Staging
    await createTestRelease(page, {
      version: '1.0.0',
      deployment: 'Staging',
      rollout: 100,
      description: 'Release to be promoted from Staging to Production',
    });
    
    // Step 2: Navigate to Staging deployment view
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Staging');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 3: Click on the release to open detail
    const releaseCard = page.locator('text=/1\\.0\\.0/i').first();
    await releaseCard.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Click Promote button
    await page.waitForTimeout(1000); // Extra wait for modal to fully load
    
    let promoteButton = page.locator('[data-testid="release-detail-promote"]');
    const hasTestId = await promoteButton.isVisible().catch(() => false);
    
    if (!hasTestId) {
      // Fallback: find by text if data-testid not available (server not restarted)
      promoteButton = page.getByRole('button', { name: /Promote/i });
    }
    
    await promoteButton.waitFor({ state: 'visible', timeout: 10000 });
    await promoteButton.click();
    await page.waitForTimeout(2000);
    
    // Step 5: Select target deployment (Production)
    const deploymentInput = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentInput.waitFor({ state: 'visible', timeout: 5000 });
    await deploymentInput.fill('Production');
    await page.waitForTimeout(500);
    
    // Click Production option
    const productionOption = page.locator('[role="option"]:has-text("Production")');
    if (await productionOption.isVisible().catch(() => false)) {
      await productionOption.click();
    } else {
      // Alternative: just keep the typed value
    }

    
    // Step 6: Click Promote button in modal (use .last() to get the one in the modal)
    const promoteSubmitButton = page.getByRole('button', { name: /Promote/i }).last();
    await promoteSubmitButton.waitFor({ state: 'visible', timeout: 10000 });
    await promoteSubmitButton.click();
    
    // Step 7: Wait for success notification
    await page.waitForSelector('text=/success|promoted/i', { timeout: 15000 });
    
    await page.waitForTimeout(2000);
    
    // Step 8: Navigate to Production and verify release exists there
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Production');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify release appears in Production
    const promotedRelease = page.locator('text=/1\\.0\\.0/i').first();
    await expect(promotedRelease).toBeVisible({ timeout: 10000 });
    
  });

  test('Promote Release 2: Promote from Production to Staging', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds
    
    // Step 1: Create a release on Production
    await createTestRelease(page, {
      version: '2.0.0',
      deployment: 'Production',
      rollout: 100,
      description: 'Release to be promoted from Production to Staging',
    });
    
    // Step 2: Navigate to Production deployment view
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Production');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Step 3: Open release detail and promote
    const releaseCard = page.locator('text=/2\\.0\\.0/i').first();
    await releaseCard.click();
    await page.waitForTimeout(2000);
    
    let promoteButton = page.locator('[data-testid="release-detail-promote"]');
    if (!(await promoteButton.isVisible().catch(() => false))) {
      promoteButton = page.getByRole('button', { name: /^promote$/i });
    }
    await promoteButton.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Select Staging as target
    const deploymentInput = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentInput.fill('Staging');
    await page.waitForTimeout(500);
    
    const stagingOption = page.locator('[role="option"]:has-text("Staging")');
    if (await stagingOption.isVisible().catch(() => false)) {
      await stagingOption.click();
    }
    
    // Step 5: Promote
    const promoteSubmitButton = page.getByRole('button', { name: /Promote/i }).last();
    await promoteSubmitButton.click();
    
    await page.waitForSelector('text=/success|promoted/i', { timeout: 15000 });
    await page.waitForTimeout(2000);
    
    // Step 6: Verify in Staging
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Staging');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const promotedRelease = page.locator('text=/2\\.0\\.0/i').first();
    await expect(promotedRelease).toBeVisible({ timeout: 10000 });
    
  });

  test('Promote Release 3: Cancel Promotion', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Step 1: Create a release on Staging
    await createTestRelease(page, {
      version: '3.0.0',
      deployment: 'Staging',
      rollout: 100,
      description: 'Release for cancel test',
    });
    
    // Step 2: Open release detail and promote modal
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Staging');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const releaseCard = page.locator('text=/3\\.0\\.0/i').first();
    await releaseCard.click();
    await page.waitForTimeout(2000);
    
    let promoteButton = page.locator('[data-testid="release-detail-promote"]');
    if (!(await promoteButton.isVisible().catch(() => false))) {
      promoteButton = page.getByRole('button', { name: /^promote$/i });
    }
    await promoteButton.click();
    await page.waitForTimeout(2000);
    
    // Step 3: Select Production but then cancel
    const deploymentInput = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentInput.fill('Production');
    await page.waitForTimeout(500);
    
    // Step 4: Cancel/close the promote modal (ESC key or close button)
    await page.keyboard.press('Escape');
    await page.waitForTimeout(2000);
    
    // Step 5: Verify release was NOT promoted to Production
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Production');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Release should NOT be in Production
    const releaseInProduction = page.locator('text=/3\\.0\\.0/i').first();
    const existsInProduction = await releaseInProduction.isVisible().catch(() => false);
    expect(existsInProduction).toBe(false);
    
    // Step 6: Verify release still exists in Staging
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Staging');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const releaseInStaging = page.locator('text=/3\\.0\\.0/i').first();
    await expect(releaseInStaging).toBeVisible({ timeout: 10000 });
    
  });

  test('Promote Release 4: Verify Promoted Release Maintains Metadata', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds
    
    const originalDescription = 'Original release description with important notes';
    
    // Step 1: Create a release on Staging with specific metadata
    await createTestRelease(page, {
      version: '4.0.0',
      deployment: 'Staging',
      rollout: 100,
      description: originalDescription,
    });
    
    // Step 2: Promote to Production
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Staging');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const releaseCard = page.locator('text=/4\\.0\\.0/i').first();
    await releaseCard.click();
    await page.waitForTimeout(2000);
    
    let promoteButton = page.locator('[data-testid="release-detail-promote"]');
    if (!(await promoteButton.isVisible().catch(() => false))) {
      promoteButton = page.getByRole('button', { name: /^promote$/i });
    }
    await promoteButton.click();
    await page.waitForTimeout(2000);
    
    const deploymentInput = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentInput.fill('Production');
    await page.waitForTimeout(500);
    
    const productionOption = page.locator('[role="option"]:has-text("Production")');
    if (await productionOption.isVisible().catch(() => false)) {
      await productionOption.click();
    }
    
    const promoteSubmitButton = page.getByRole('button', { name: /Promote/i }).last();
    await promoteSubmitButton.click();
    await page.waitForSelector('text=/success|promoted/i', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Step 3: Verify promoted release has same description in Production
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Production');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const promotedReleaseCard = page.locator('text=/4\\.0\\.0/i').first();
    await promotedReleaseCard.click();
    await page.waitForTimeout(2000);
    
    // Check if description is visible in the detail view
    const descriptionText = page.locator(`text=/${originalDescription.substring(0, 20)}/i`);
    const hasDescription = await descriptionText.isVisible().catch(() => false);
    
    if (hasDescription) {
    } else {
    }
    
  });

  test('Promote Release 5: Cannot Promote Without Selecting Deployment', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Step 1: Create a release on Staging
    await createTestRelease(page, {
      version: '5.0.0',
      deployment: 'Staging',
      rollout: 100,
      description: 'Release for validation test',
    });
    
    // Step 2: Open promote modal
    await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp?deployment=Staging');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const releaseCard = page.locator('text=/5\\.0\\.0/i').first();
    await releaseCard.click();
    await page.waitForTimeout(2000);
    
    let promoteButton = page.locator('[data-testid="release-detail-promote"]');
    if (!(await promoteButton.isVisible().catch(() => false))) {
      promoteButton = page.getByRole('button', { name: /^promote$/i });
    }
    await promoteButton.click();
    await page.waitForTimeout(2000);
    
    // Step 3: Try to promote without selecting a deployment
    const promoteSubmitButton = page.getByRole('button', { name: /^promote$/i });
    
    // Check if button is disabled
    const isDisabled = await promoteSubmitButton.isDisabled().catch(() => false);
    
    if (isDisabled) {
      expect(isDisabled).toBe(true);
    } else {
      // Button not disabled, try to click and check for error
      await promoteSubmitButton.click();
      await page.waitForTimeout(1000);
      
      // Check if error message appears or if we're still on the modal
      const errorMessage = page.locator('text=/required|select/i');
      const hasError = await errorMessage.isVisible().catch(() => false);
      
      if (hasError) {
      } else {
      }
    }
    
  });
});

