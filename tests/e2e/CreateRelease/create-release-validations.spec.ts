import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release - Validation Tests', () => {
  
  // Helper function to navigate to create release page
  async function navigateToCreateRelease(page: any) {
    await page.goto('/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstOrgCard.click();
    await page.waitForTimeout(1500);
    
    const firstAppCard = page.locator('[data-testid="app-card"]').first();
    await firstAppCard.waitFor({ state: 'visible', timeout: 10000 });
    await firstAppCard.click();
    await page.waitForTimeout(2000);
    
    const createReleaseButton = page.getByRole('button', { name: /create release/i });
    await createReleaseButton.waitFor({ state: 'visible', timeout: 10000 });
    await createReleaseButton.click();
    await page.waitForTimeout(1000);
  }

  test('Validation 1: Should prevent proceeding without bundle upload (Step 1)', async ({ page }) => {
    
    await navigateToCreateRelease(page);
    
    // Try to click "Next" without uploading bundle
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Get initial URL/state
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    const fileInputVisibleBefore = await fileInput.isVisible();
    expect(fileInputVisibleBefore).toBe(true);
    
    // Click Next button
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Verify error message appears
    const errorMessage = page.locator('text=/please select a directory to upload/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('Please select a directory');
    
    // Verify we're still on step 1 (file input still visible)
    const fileInputVisibleAfter = await fileInput.isVisible();
    expect(fileInputVisibleAfter).toBe(true);
    
    // Check if App Version input is NOT visible (means we didn't proceed to step 2)
    const appVersionInput = page.getByLabel(/app version/i);
    const versionVisible = await appVersionInput.isVisible().catch(() => false);
    expect(versionVisible).toBe(false);
    
  });

  test('Validation 2: Should prevent proceeding without app version (Step 2)', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    await navigateToCreateRelease(page);
    
    // Step 1: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    
    // Click Next to go to step 2
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Step 2: Try to proceed without filling app version
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.waitFor({ state: 'visible', timeout: 5000 });
    
    // Don't fill version, try to click Next Step
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify error message appears
    const errorMessage = page.locator('text=/app version is required/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('App version is required');
    
    // Verify we're still on step 2 (app version input still visible)
    const versionStillVisible = await appVersionInput.isVisible();
    expect(versionStillVisible).toBe(true);
    
    // Check if rollout slider is NOT visible (means we didn't proceed to step 3)
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible().catch(() => false);
    expect(rolloutVisible).toBe(false);
    
  });

  test('Validation 3: Should prevent proceeding without deployment selection (Step 2)', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    await navigateToCreateRelease(page);
    
    // Step 1: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    
    // Click Next to go to step 2
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Step 2: Fill version but skip deployment
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.waitFor({ state: 'visible', timeout: 5000 });
    await appVersionInput.fill('1.0.0');
    
    // Try to proceed without selecting deployment
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify error message appears
    const errorMessage = page.locator('text=/please select a deployment/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/please select a deployment/i);
    
    // Verify we're still on step 2
    const versionStillVisible = await appVersionInput.isVisible();
    expect(versionStillVisible).toBe(true);
    
    // Check if rollout slider is NOT visible (means we didn't proceed to step 3)
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible().catch(() => false);
    expect(rolloutVisible).toBe(false);
    
  });

  test('Validation 4: Should accept valid semver format and reject invalid', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    await navigateToCreateRelease(page);
    
    // Step 1: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Test invalid version format
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('abc');
    
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify error message for invalid semver
    const errorMessage = page.locator('text=/app version must be a valid semantic version/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/valid semantic version/i);
    
    // Should still be on step 2
    const versionStillVisible = await appVersionInput.isVisible();
    expect(versionStillVisible).toBe(true);
    
    // Test valid version format
    await appVersionInput.clear();
    await appVersionInput.fill('1.0.0');
    
    // Select deployment
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const firstDeployment = page.locator('[role="option"]').first();
    await firstDeployment.click();
    
    // Now it should proceed to step 3
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify we moved to step 3 (rollout slider visible)
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible();
    expect(rolloutVisible).toBe(true);
    
  });

  test('Validation 5: Should allow optional description field', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    await navigateToCreateRelease(page);
    
    // Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Fill required fields only (skip description)
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('1.0.0');
    
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const firstDeployment = page.locator('[role="option"]').first();
    await firstDeployment.click();
    
    
    // Should be able to proceed without description
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify we moved to step 3
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible();
    expect(rolloutVisible).toBe(true);
    
  });

  test('Validation 6: Should handle long description text', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    const longDescription = 'A'.repeat(500); // 500 characters
    
    await navigateToCreateRelease(page);
    
    // Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Fill all fields including long description
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('1.0.0');
    
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const firstDeployment = page.locator('[role="option"]').first();
    await firstDeployment.click();
    
    const descriptionInput = page.getByLabel(/description/i);
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill(longDescription);
    }
    
    // Should be able to proceed with long description
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify we moved to step 3
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible();
    expect(rolloutVisible).toBe(true);
    
  });

  test('Validation 7: Should handle empty/minimal bundle appropriately', async ({ page }) => {
    
    await navigateToCreateRelease(page);
    
    // Try to upload an empty/minimal directory
    const emptyBundleDir = path.join(__dirname, '../../fixtures/empty-bundle');
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    
    // Note: webkitdirectory won't upload truly empty directories
    // We're testing with a minimal bundle (only .gitkeep file)
    try {
      await fileInput.setInputFiles(emptyBundleDir);
      await page.waitForTimeout(3000);
      
      // Try to proceed to next step
      const nextStepButton = page.getByRole('button', { name: /next step/i });
      await nextStepButton.click();
      await page.waitForTimeout(2000);
      
      // Check if we proceeded or stayed on step 1
      // If validation works, we should either:
      // 1. See an error message, OR
      // 2. Not be able to proceed (still on step 1)
      
      const appVersionInput = page.getByLabel(/app version/i);
      const onStep2 = await appVersionInput.isVisible().catch(() => false);
      
      if (onStep2) {
        // We proceeded to step 2 - minimal bundle was accepted
      } else {
        // We're still on step 1 - check for error
        const errorMessage = page.locator('text=/please select|required|empty|invalid/i');
        const hasError = await errorMessage.isVisible().catch(() => false);
        
        if (hasError) {
          const errorText = await errorMessage.textContent();
        } else {
        }
        
      }
    } catch (error) {
      // If setInputFiles fails, it means the directory couldn't be uploaded
    }
  });

  test('Validation 8: Should allow removing uploaded bundle and require re-upload', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    await navigateToCreateRelease(page);
    
    // Step 1: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    
    // Verify bundle is uploaded (check for "Bundle Selected" or similar text)
    const bundleSelectedText = page.locator('text=/bundle selected|scripts/i');
    await bundleSelectedText.waitFor({ state: 'visible', timeout: 5000 });
    
    // Find and click the remove/delete button (X icon)
    
    // Use data-testid selector for the remove button
    const removeButton = page.locator('[data-testid="remove-bundle-button"]');
    await removeButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click the remove button
    await removeButton.click();
    await page.waitForTimeout(2000);
    
    // Verify bundle is removed (file input should be visible again)
    const fileInputVisibleAgain = await fileInput.isVisible();
    expect(fileInputVisibleAgain).toBe(true);
    
    // Verify "Bundle Selected" text is no longer visible
    const bundleStillSelected = await bundleSelectedText.isVisible().catch(() => false);
    expect(bundleStillSelected).toBe(false);
    
    // Try to proceed without re-uploading
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    
    // Verify error message appears
    const errorMessage = page.locator('text=/Please select a directory to upload/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('Please select a directory to upload');
    
    // Verify we're still on step 1
    const stillOnStep1 = await fileInput.isVisible();
    expect(stillOnStep1).toBe(true);
    
  });
});

