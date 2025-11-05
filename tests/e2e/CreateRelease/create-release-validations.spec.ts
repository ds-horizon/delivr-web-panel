import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release - Validation Tests', () => {
  
  // Helper function to navigate to create release page
  async function navigateToCreateRelease(page: any) {
    await page.goto('http://localhost:3000/test-login');
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
    console.log('🚀 Test 1: No bundle upload validation');
    
    await navigateToCreateRelease(page);
    console.log('✅ Navigated to create release modal');
    
    // Try to click "Next" without uploading bundle
    console.log('📝 Attempting to click Next without bundle...');
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
    console.log('📝 Checking for error message...');
    const errorMessage = page.locator('text=/please select a directory to upload/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('Please select a directory');
    console.log(`✅ Error message displayed: "${errorText}"`);
    
    // Verify we're still on step 1 (file input still visible)
    const fileInputVisibleAfter = await fileInput.isVisible();
    expect(fileInputVisibleAfter).toBe(true);
    console.log('✅ Validation prevented proceeding - still on bundle upload step');
    
    // Check if App Version input is NOT visible (means we didn't proceed to step 2)
    const appVersionInput = page.getByLabel(/app version/i);
    const versionVisible = await appVersionInput.isVisible().catch(() => false);
    expect(versionVisible).toBe(false);
    
    console.log('✅ Test 1 passed - Cannot proceed without bundle');
  });

  test('Validation 2: Should prevent proceeding without app version (Step 2)', async ({ page }) => {
    console.log('🚀 Test 2: No app version validation');
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    await navigateToCreateRelease(page);
    console.log('✅ Navigated to create release modal');
    
    // Step 1: Upload bundle
    console.log('📝 Uploading bundle...');
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    console.log('✅ Bundle uploaded');
    
    // Click Next to go to step 2
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Moved to step 2');
    
    // Step 2: Try to proceed without filling app version
    console.log('📝 Attempting to click Next Step without version...');
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.waitFor({ state: 'visible', timeout: 5000 });
    
    // Don't fill version, try to click Next Step
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify error message appears
    console.log('📝 Checking for error message...');
    const errorMessage = page.locator('text=/app version is required/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toContain('App version is required');
    console.log(`✅ Error message displayed: "${errorText}"`);
    
    // Verify we're still on step 2 (app version input still visible)
    const versionStillVisible = await appVersionInput.isVisible();
    expect(versionStillVisible).toBe(true);
    console.log('✅ Validation prevented proceeding - still on version/deployment step');
    
    // Check if rollout slider is NOT visible (means we didn't proceed to step 3)
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible().catch(() => false);
    expect(rolloutVisible).toBe(false);
    
    console.log('✅ Test 2 passed - Cannot proceed without app version');
  });

  test('Validation 3: Should prevent proceeding without deployment selection (Step 2)', async ({ page }) => {
    console.log('🚀 Test 3: No deployment selection validation');
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    await navigateToCreateRelease(page);
    console.log('✅ Navigated to create release modal');
    
    // Step 1: Upload bundle
    console.log('📝 Uploading bundle...');
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    console.log('✅ Bundle uploaded');
    
    // Click Next to go to step 2
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Moved to step 2');
    
    // Step 2: Fill version but skip deployment
    console.log('📝 Filling version but skipping deployment...');
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.waitFor({ state: 'visible', timeout: 5000 });
    await appVersionInput.fill('1.0.0');
    console.log('✅ Filled version');
    
    // Try to proceed without selecting deployment
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify error message appears
    console.log('📝 Checking for error message...');
    const errorMessage = page.locator('text=/please select a deployment/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/please select a deployment/i);
    console.log(`✅ Error message displayed: "${errorText}"`);
    
    // Verify we're still on step 2
    const versionStillVisible = await appVersionInput.isVisible();
    expect(versionStillVisible).toBe(true);
    console.log('✅ Validation prevented proceeding - still on version/deployment step');
    
    // Check if rollout slider is NOT visible (means we didn't proceed to step 3)
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible().catch(() => false);
    expect(rolloutVisible).toBe(false);
    
    console.log('✅ Test 3 passed - Cannot proceed without deployment selection');
  });

  test('Validation 4: Should accept valid semver format and reject invalid', async ({ page }) => {
    console.log('🚀 Test 4: Semver version format validation');
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    await navigateToCreateRelease(page);
    console.log('✅ Navigated to create release modal');
    
    // Step 1: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(5000);
    
    const nextButton = page.getByRole('button', { name: /^next step$/i });
    await nextButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Moved to step 2');
    
    // Test invalid version format
    console.log('📝 Testing invalid version format...');
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('abc');
    
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify error message for invalid semver
    console.log('📝 Checking for invalid semver error...');
    const errorMessage = page.locator('text=/app version must be a valid semantic version/i');
    await errorMessage.waitFor({ state: 'visible', timeout: 5000 });
    const errorText = await errorMessage.textContent();
    expect(errorText).toMatch(/valid semantic version/i);
    console.log(`✅ Error message displayed: "${errorText}"`);
    
    // Should still be on step 2
    const versionStillVisible = await appVersionInput.isVisible();
    expect(versionStillVisible).toBe(true);
    console.log('✅ Invalid version format rejected');
    
    // Test valid version format
    console.log('📝 Testing valid version format...');
    await appVersionInput.clear();
    await appVersionInput.fill('1.0.0');
    
    // Select deployment
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const firstDeployment = page.locator('[role="option"]').first();
    await firstDeployment.click();
    console.log('✅ Filled valid version and deployment');
    
    // Now it should proceed to step 3
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify we moved to step 3 (rollout slider visible)
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible();
    expect(rolloutVisible).toBe(true);
    
    console.log('✅ Test 4 passed - Valid semver accepted, invalid rejected');
  });

  test('Validation 5: Should allow optional description field', async ({ page }) => {
    console.log('🚀 Test 5: Optional description field');
    
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
    
    console.log('✅ Filled required fields, skipped description');
    
    // Should be able to proceed without description
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify we moved to step 3
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible();
    expect(rolloutVisible).toBe(true);
    
    console.log('✅ Test 5 passed - Description is optional');
  });

  test('Validation 6: Should handle long description text', async ({ page }) => {
    console.log('🚀 Test 6: Long description handling');
    
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
      console.log('✅ Filled long description (500 chars)');
    }
    
    // Should be able to proceed with long description
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    
    // Verify we moved to step 3
    const rolloutText = page.locator('text=/rollout percentage/i');
    const rolloutVisible = await rolloutText.isVisible();
    expect(rolloutVisible).toBe(true);
    
    console.log('✅ Test 6 passed - Long description accepted');
  });
});

