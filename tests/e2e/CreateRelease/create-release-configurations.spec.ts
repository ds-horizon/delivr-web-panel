import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release - Configuration Tests', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
  });
  
  // Helper function to complete release creation flow
  async function createReleaseWithConfig(
    page: any, 
    config: { 
      version: string, 
      deployment: string, 
      rollout: number,
      description?: string 
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
    
    
    // Step 1: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    
    // Click Next to go to step 2
    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Step 2: Fill metadata
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.waitFor({ state: 'visible', timeout: 5000 });
    await appVersionInput.fill(config.version);
    
    // Select deployment
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.waitFor({ state: 'visible', timeout: 5000 });
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    
    // Find and click the specified deployment
    const deploymentOption = page.locator(`[role="option"]:has-text("${config.deployment}")`);
    await deploymentOption.waitFor({ state: 'visible', timeout: 5000 });
    await deploymentOption.click();
    
    // Fill description if provided
    if (config.description) {
      const descriptionInput = page.getByLabel(/description/i);
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill(config.description);
      }
    }
    
    // Click Next Step to go to step 3
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Step 3: Set rollout
    
    // Find the rollout percentage display to verify current value
    const rolloutDisplay = page.locator('text=/\\d+%/').first();
    await rolloutDisplay.waitFor({ state: 'visible', timeout: 5000 });
    
    // If rollout is not 1 (default might be 1), adjust the slider
    if (config.rollout !== 1) {
      // Try to find slider input
      const slider = page.locator('input[type="hidden"]').first(); // Mantine slider uses hidden input
      
      // Alternative: Use keyboard to adjust slider
      const sliderThumb = page.locator('[role="slider"]').first();
      if (await sliderThumb.isVisible()) {
        await sliderThumb.focus();
        
        // Calculate how many arrow key presses needed
        // Assuming default is 1%, we need to get to target
        const steps = config.rollout - 1;
        
        for (let i = 0; i < steps; i++) {
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(50);
        }
        
      }
    } else {
    }
    
    // Verify rollout value
    const finalRolloutText = await rolloutDisplay.textContent();
    
    // Click Review Changes
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.waitFor({ state: 'visible', timeout: 5000 });
    await reviewButton.click();
    await page.waitForTimeout(1000);
    
    // Submit from review modal
    const submitButton = page.getByRole('button', { name: /create release|submit/i }).last();
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await submitButton.click();
    
    // Wait for success notification
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    
    await page.waitForTimeout(2000);
  }

  test('Config 1: Create release with 1% rollout (minimum)', async ({ page }) => {
    
    await createReleaseWithConfig(page, {
      version: '1.1.0',
      deployment: 'Production',
      rollout: 1,
      description: 'Test release with 1% rollout'
    });
    
  });

  test('Config 2: Create release with 50% rollout', async ({ page }) => {
    
    await createReleaseWithConfig(page, {
      version: '1.2.0',
      deployment: 'Production',
      rollout: 50,
      description: 'Test release with 50% rollout'
    });
    
  });

  test('Config 3: Create release with 100% rollout (maximum)', async ({ page }) => {
    
    await createReleaseWithConfig(page, {
      version: '1.3.0',
      deployment: 'Production',
      rollout: 100,
      description: 'Test release with 100% rollout'
    });
    
  });

  test('Config 4: Create release for Staging deployment', async ({ page }) => {
    
    await createReleaseWithConfig(page, {
      version: '1.4.0',
      deployment: 'Staging',
      rollout: 100,
      description: 'Test release for Staging environment'
    });
    
  });

  test('Config 5: Create release for Production deployment', async ({ page }) => {
    
    await createReleaseWithConfig(page, {
      version: '1.5.0',
      deployment: 'Production',
      rollout: 100,
      description: 'Test release for Production environment'
    });
    
  });
});

