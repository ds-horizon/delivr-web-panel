import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Edit Release Tests', () => {
  
  // Reset all data before each test for complete isolation
  test.beforeEach(async ({ page }) => {
    await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
  });
  
  // Helper function to create a release
  async function createTestRelease(page: any, releaseData: {
    version: string;
    deployment: string;
    rollout: number;
    description: string;
    disabled: boolean;
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
    
    // Step 2: Fill metadata
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
    
    // Step 3: Configure
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
    
    // Toggle disabled if needed
    if (releaseData.disabled) {
      const disabledLabel = page.locator('text=/^Disabled$/i').first();
      await disabledLabel.click();
      await page.waitForTimeout(500);
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
    
    // Navigate explicitly to the correct deployment and version URL
    // This ensures we're on the right page even if redirect doesn't include deployment/version
    const org = 'test-org-1';
    const app = 'TestApp';
    const deployment = releaseData.deployment;
    const version = releaseData.version;
    await page.goto(`http://localhost:3000/dashboard/${org}/${app}?deployment=${deployment}`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
  }
  
  // Helper function to open release detail modal
  async function openReleaseDetail(page: any, version: string) {
    // Click on the release card
    const releaseCard = page.locator(`text=/${version}/i`).first();
    await releaseCard.waitFor({ state: 'visible', timeout: 10000 });
    await releaseCard.click();
    await page.waitForTimeout(2000);
    
    // Wait for release detail modal to appear
    const detailModalTitle = page.locator('text=/Release Information/i');
    await detailModalTitle.waitFor({ state: 'visible', timeout: 5000 });
  }
  
  // Helper function to open edit modal
  async function openEditModal(page: any) {
    // Wait a bit for the detail modal to be fully loaded
    await page.waitForTimeout(2000);
    
    // Try data-testid first, fallback to text selector
    let editButton = page.locator('[data-testid="release-detail-edit"]');
    const hasTestId = await editButton.count();
    
    if (hasTestId === 0) {
      editButton = page.getByRole('button', { name: /Edit/i });
    }
    
    await editButton.waitFor({ state: 'visible', timeout: 10000 });
    await editButton.click();
    await page.waitForTimeout(2000);
  }

  test('Edit Release 1: Update Description', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Create a release
    await createTestRelease(page, {
      version: '1.0.0',
      deployment: 'Production',
      rollout: 100,
      description: 'Original description',
      disabled: false,
    });
    
    // Open release detail
    await openReleaseDetail(page, '1.0.0');
    
    // Open edit modal
    await openEditModal(page);
    
    // Update description
    const newDescription = 'Updated description with new features and bug fixes!';
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.clear();
    await descriptionInput.fill(newDescription);
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    
    // Wait for success notification or modal to close
    try {
      await page.waitForSelector('text=/success|updated/i', { timeout: 5000 });
    } catch {
    }
    
    await page.waitForTimeout(2000);
    
    // Close the detail modal if still open, then reopen
    const closeButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
      
      // Reopen release detail
      await openReleaseDetail(page, '1.0.0');
    }
    
    // Verify description updated (reopen edit modal to check)
    await openEditModal(page);
    const descriptionValue = await descriptionInput.inputValue();
    expect(descriptionValue).toBe(newDescription);
    
  });

  test('Edit Release 2: Change Rollout Percentage', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Create a release with 50% rollout
    await createTestRelease(page, {
      version: '1.1.0',
      deployment: 'Production',
      rollout: 50,
      description: 'Test release for rollout change',
      disabled: false,
    });
    
    // Open release detail and edit modal
    await openReleaseDetail(page, '1.1.0');
    await openEditModal(page);
    
    // Change rollout from 50% to 100%
    const targetRollout = 100;
    const rolloutDisplay = page.locator('text=/\\d+%/').first();
    const currentRolloutText = await rolloutDisplay.textContent();
    const currentRollout = parseInt(currentRolloutText?.match(/\d+/)?.[0] || '50');
    
    if (currentRollout !== targetRollout) {
      const sliderThumb = page.locator('[role="slider"]').first();
      if (await sliderThumb.isVisible()) {
        await sliderThumb.focus();
        const steps = targetRollout - currentRollout;
        const key = steps > 0 ? 'ArrowRight' : 'ArrowLeft';
        for (let i = 0; i < Math.abs(steps); i++) {
          await page.keyboard.press(key);
          await page.waitForTimeout(10);
        }
      }
    }
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    
    // Close and reopen if needed
    const closeButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
      await openReleaseDetail(page, '1.1.0');
    }
    
    // Verify rollout updated
    await openEditModal(page);
    const newRolloutText = await rolloutDisplay.textContent();
    const newRollout = parseInt(newRolloutText?.match(/\d+/)?.[0] || '0');
    expect(newRollout).toBe(targetRollout);
    
  });

  test('Edit Release 3: Toggle Disabled Status', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds (creates release + edits it)
    
    // Create an active release (disabled = false)
    await createTestRelease(page, {
      version: '1.2.0',
      deployment: 'Production',
      rollout: 100,
      description: 'Test release for status toggle',
      disabled: false,
    });
    
    // Open release detail and edit modal
    await openReleaseDetail(page, '1.2.0');
    await openEditModal(page);
    
    // Toggle release status (Active → Inactive)
    // In Edit modal, it's called "Release Status" not "Disabled"
    const statusLabel = page.locator('text=/Release Status/i').first();
    await statusLabel.waitFor({ state: 'visible', timeout: 5000 });
    await statusLabel.click();
    await page.waitForTimeout(500);
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    
    // Close edit modal and detail modal
    let closeButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(500);
    }
    
    // Close detail modal if still open
    closeButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify status changed in listing (look for "InActive" badge)
    const inactiveBadge = page.locator('text=/inactive/i').first();
    const isInactive = await inactiveBadge.isVisible().catch(() => false);
    expect(isInactive).toBe(true);
    
  });

  test.skip('Edit Release 4: Toggle Mandatory Flag (Feature Disabled)', async ({ page }) => {
    
    // Create a non-mandatory release
    await createTestRelease(page, {
      version: '1.3.0',
      deployment: 'Production',
      rollout: 100,
      description: 'Test release for mandatory toggle',
      disabled: false,
    });
    
    // Open release detail and edit modal
    await openReleaseDetail(page, '1.3.0');
    await openEditModal(page);
    
    // Toggle mandatory flag ON
    const mandatoryLabel = page.locator('text=/mandatory/i').first();
    await mandatoryLabel.waitFor({ state: 'visible', timeout: 5000 });
    await mandatoryLabel.click();
    await page.waitForTimeout(500);
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    
    // Close and reopen if needed
    const closeButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
      await openReleaseDetail(page, '1.3.0');
    }
    
    // Verify mandatory flag is saved
    await openEditModal(page);
    const mandatoryCheckbox = page.locator('input[type="checkbox"]').filter({ 
      hasText: /mandatory/i 
    }).first();
    
    // Check if checkbox is checked (implementation may vary)
    const isChecked = await mandatoryCheckbox.isChecked().catch(() => false);
    
  });

  test('Edit Release 5: Update Target Version', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Create a release
    await createTestRelease(page, {
      version: '1.4.0',
      deployment: 'Production',
      rollout: 100,
      description: 'Test release for version update',
      disabled: false,
    });
    
    // Open release detail and edit modal
    await openReleaseDetail(page, '1.4.0');
    await openEditModal(page);
    
    // Update target version
    const newVersion = '1.4.1';
    const versionInput = page.getByLabel(/target version|app version/i);
    await versionInput.clear();
    await versionInput.fill(newVersion);
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    
    // Close and reopen if needed
    const closeButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
      await openReleaseDetail(page, '1.4.0');
    }
    
    // Verify version updated
    await openEditModal(page);
    const versionValue = await versionInput.inputValue();
    expect(versionValue).toContain(newVersion);
    
  });

  test('Edit Release 6: Multiple Fields - Comprehensive Edit', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    // Create a release with initial values
    await createTestRelease(page, {
      version: '2.0.0',
      deployment: 'Production',
      rollout: 25,
      description: 'Initial description',
      disabled: false,
    });
    
    // Open release detail and edit modal
    await openReleaseDetail(page, '2.0.0');
    await openEditModal(page);
    
    // Update multiple fields
    
    // 1. Update description
    const newDescription = 'Completely revised description with all new features';
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.clear();
    await descriptionInput.fill(newDescription);
    
    // 2. Change rollout from 25% to 75%
    const targetRollout = 75;
    const rolloutDisplay = page.locator('text=/\\d+%/').first();
    const currentRolloutText = await rolloutDisplay.textContent();
    const currentRollout = parseInt(currentRolloutText?.match(/\d+/)?.[0] || '25');
    
    if (currentRollout !== targetRollout) {
      const sliderThumb = page.locator('[role="slider"]').first();
      if (await sliderThumb.isVisible()) {
        await sliderThumb.focus();
        const steps = targetRollout - currentRollout;
        const key = steps > 0 ? 'ArrowRight' : 'ArrowLeft';
        for (let i = 0; i < Math.abs(steps); i++) {
          await page.keyboard.press(key);
          await page.waitForTimeout(10);
        }
      }
    }
    
    // 3. Toggle mandatory (skip if not available - currently hidden in Edit modal)
    const mandatoryLabel = page.locator('text=/mandatory/i').first();
    if (await mandatoryLabel.isVisible().catch(() => false)) {
      await mandatoryLabel.click();
      await page.waitForTimeout(500);
    } else {
    }
    
    // Save all changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    
    // Close and reopen if needed
    const closeButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
      await page.waitForTimeout(1000);
      await openReleaseDetail(page, '2.0.0');
    }
    
    // Verify all changes persisted
    await openEditModal(page);
    
    const savedDescription = await descriptionInput.inputValue();
    expect(savedDescription).toBe(newDescription);
    
    const savedRolloutText = await rolloutDisplay.textContent();
    const savedRollout = parseInt(savedRolloutText?.match(/\d+/)?.[0] || '0');
    expect(savedRollout).toBe(targetRollout);
    
  });

  test('Edit Release 7: Cancel Edit - Changes Not Saved', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    
    const originalDescription = 'Original description that should remain';
    
    // Create a release
    await createTestRelease(page, {
      version: '2.1.0',
      deployment: 'Production',
      rollout: 100,
      description: originalDescription,
      disabled: false,
    });
    
    // Open release detail and edit modal
    await openReleaseDetail(page, '2.1.0');
    await openEditModal(page);
    
    // Make changes but DON'T save
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.clear();
    await descriptionInput.fill('This should NOT be saved');
    
    // Cancel/close the edit modal
    const cancelButton = page.locator('[data-testid="edit-release-cancel"]');
    await cancelButton.click();
    await page.waitForTimeout(2000);
    
    // Close the detail modal entirely
    const closeDetailButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeDetailButton.isVisible().catch(() => false)) {
      await closeDetailButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Refresh the page to force fresh data fetch from backend
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Reopen release detail and edit modal to verify changes were NOT saved
    await openReleaseDetail(page, '2.1.0');
    await openEditModal(page);
    
    const savedDescription = await descriptionInput.inputValue();
    expect(savedDescription).toBe(originalDescription);
    
  });
});

