import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release - Navigation & Flow Tests', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
  });
  
  test('Navigation 1: Cancel via Back Arrow at Step 1 (Bundle Upload)', async ({ page }) => {
    
    // Step 1: Login and navigate to create release page
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Navigate to app
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.click();
    await page.waitForTimeout(2000);
    
    const firstAppCard = page.locator('[data-testid="app-card"]').first();
    await firstAppCard.click();
    await page.waitForTimeout(2000);
    
    // Step 3: Open create release modal
    const createReleaseButton = page.getByRole('button', { name: /create release/i });
    await createReleaseButton.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Verify we're on Step 1 (Bundle Upload)
    const uploadInput = page.locator('input[type="file"][webkitdirectory]');
    await expect(uploadInput).toBeVisible();
    
    // Step 5: Click back arrow to close/exit form
    const backArrow = page.locator('[data-testid="close-create-release"]');
    await backArrow.click();
    
    await page.waitForTimeout(2000);
    
    // Step 6: Verify modal is closed (heading should not be visible)
    const modalHeading = page.locator('text=/Upload Your Application Bundle/i');
    await expect(modalHeading).not.toBeVisible();
    
    // Step 7: Verify no release was created
    await page.waitForTimeout(1000);
    // Should still be on app page, not showing success notification
    const successNotification = page.locator('text=/Release Created Successfully/i');
    const hasSuccessMessage = await successNotification.isVisible().catch(() => false);
    expect(hasSuccessMessage).toBe(false);
    
  });

  test('Navigation 2: Cancel via Back Arrow at Step 2 (Metadata)', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Step 1-3: Login and navigate to create release modal
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
    
    // Step 4: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    // Step 5: Click "Next Step" to go to Step 2
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(2000);
    
    // Step 6: Verify we're on Step 2 (App Version field visible)
    const appVersionInput = page.getByLabel(/app version/i);
    await expect(appVersionInput).toBeVisible();
    
    // Step 7: Click back arrow to close form
    const backArrow = page.locator('[data-testid="close-create-release"]');
    await backArrow.click();
    
    await page.waitForTimeout(2000);
    
    // Step 8: Verify modal is closed (app version input should not be visible)
    await expect(appVersionInput).not.toBeVisible();
    
    // Step 9: Verify no release was created
    const successNotification = page.locator('text=/Release Created Successfully/i');
    const hasSuccessMessage = await successNotification.isVisible().catch(() => false);
    expect(hasSuccessMessage).toBe(false);
    
  });

  test('Navigation 3: Cancel via Back Arrow at Step 3 (Rollout)', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Step 1-3: Login and navigate to create release modal
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
    
    // Step 4: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    // Step 5: Move to Step 2
    const nextStepButton1 = page.getByRole('button', { name: /next step/i });
    await nextStepButton1.click();
    await page.waitForTimeout(2000);
    
    // Step 6: Fill metadata
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('5.0.0');
    
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const prodOption = page.locator('[role="option"]:has-text("Production")');
    await prodOption.click();
    
    // Step 7: Move to Step 3 (Rollout)
    const nextStepButton2 = page.getByRole('button', { name: /next step/i });
    await nextStepButton2.click();
    await page.waitForTimeout(2000);
    
    // Step 8: Verify we're on Step 3 (Rollout slider visible)
    const rolloutDisplay = page.locator('text=/\\d+%/').first();
    await expect(rolloutDisplay).toBeVisible();
    
    // Step 9: Click back arrow to close form
    const backArrow = page.locator('[data-testid="close-create-release"]');
    await backArrow.click();
    
    await page.waitForTimeout(2000);
    
    // Step 10: Verify modal is closed (rollout display should not be visible)
    await expect(rolloutDisplay).not.toBeVisible();
    
    // Step 11: Verify no release was created
    const successNotification = page.locator('text=/Release Created Successfully/i');
    const hasSuccessMessage = await successNotification.isVisible().catch(() => false);
    expect(hasSuccessMessage).toBe(false);
    
  });

  test('Navigation 4: Cancel from Review Modal', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Step 1-3: Login and navigate to create release modal
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
    
    // Step 4: Complete all steps to reach review modal
    // Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    // Step 2: Metadata
    const nextStepButton1 = page.getByRole('button', { name: /next step/i });
    await nextStepButton1.click();
    await page.waitForTimeout(2000);
    
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('6.0.0');
    
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    const prodOption = page.locator('[role="option"]:has-text("Production")');
    await prodOption.click();
    
    // Step 3: Rollout
    const nextStepButton2 = page.getByRole('button', { name: /next step/i });
    await nextStepButton2.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Click Review Changes
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.click();
    await page.waitForTimeout(2000);
    
    // Step 5: Verify review modal is open (look for version, deployment info)
    const reviewContent = page.locator('text=/6\\.0\\.0|Production/i').first();
    await expect(reviewContent).toBeVisible();
    
    // Step 6: Click Cancel button on review modal
    const cancelButton = page.locator('[data-testid="review-modal-cancel"]');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();
    
    await page.waitForTimeout(2000);
    
    // Step 7: Verify review modal is closed (should go back to Step 3 or close entirely)
    // The review modal should not show "Create Release" button anymore
    const createButton = page.getByRole('button', { name: /create release|submit/i }).last();
    const reviewModalClosed = !(await createButton.isVisible().catch(() => false));
    expect(reviewModalClosed).toBe(true);
    
    // Step 8: Verify no release was created
    const successNotification = page.locator('text=/Release Created Successfully/i');
    const hasSuccessMessage = await successNotification.isVisible().catch(() => false);
    expect(hasSuccessMessage).toBe(false);
    
  });

  test('Navigation 5: Back Navigation - Data Retention (Step 2 → Step 1)', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Step 1-3: Login and navigate to create release modal
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
    
    // Step 4: Upload bundle
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    // Step 5: Move to Step 2
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(2000);
    
    // Step 6: Fill some metadata
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('7.0.0');
    
    // Step 7: Navigate back to Step 1 using Back button
    const backButton = page.locator('[data-testid="step-back-button"]');
    await backButton.click();
    
    await page.waitForTimeout(2000);
    
    // Step 8: Verify we're back on Step 1 (check for bundle name or upload text)
    // Since bundle is already uploaded, we should see "Bundle Selected" or the directory name
    const step1Text = page.locator('text=/Bundle Selected/i');
    await expect(step1Text).toBeVisible();
    
    // Step 9: Navigate forward again to Step 2
    await nextStepButton.click();
    await page.waitForTimeout(2000);
    
    // Step 10: Verify the version we entered is still there
    const versionValue = await appVersionInput.inputValue().catch(() => '');
    expect(versionValue).toBe('7.0.0');
    
  });

  test('Navigation6: Close and Reopen Modal - Verify Reset', async ({ page }) => {
    
    const testBundleDir = path.join(__dirname, '../../fixtures/test-bundle');
    
    // Step 1-3: Login and navigate to create release modal
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
    
    // Step 4: Upload bundle and fill some data
    const fileInput = page.locator('input[type="file"][webkitdirectory]');
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.click();
    await page.waitForTimeout(2000);
    
    const appVersionInput = page.getByLabel(/app version/i);
    await appVersionInput.fill('8.0.0');
    
    // Step 5: Close the form using back arrow
    const backArrow = page.locator('[data-testid="close-create-release"]');
    await backArrow.click();
    await page.waitForTimeout(2000);
    
    // Step 6: Reopen the modal
    await createReleaseButton.click();
    await page.waitForTimeout(2000);
    
    // Step 7: Verify modal is reset (should be back on Step 1)
    const uploadInputVisible = await fileInput.isVisible().catch(() => false);
    expect(uploadInputVisible).toBe(true);
    
    // Step 8: Upload bundle again to proceed to Step 2
    await fileInput.setInputFiles(testBundleDir);
    await page.waitForTimeout(3000);
    
    // Step 9: Move to Step 2 and verify version field is empty (reset)
    await nextStepButton.click();
    await page.waitForTimeout(2000);
    
    const versionValue = await appVersionInput.inputValue().catch(() => '');
    expect(versionValue).toBe('');
    
  });
});

