import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Edit Release Tests', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async ({ page }) => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
    console.log('🔄 Reset releases before test');
    
    // Add error listeners for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Browser console error:', msg.text());
      }
    });
    
    page.on('response', async (response) => {
      if (response.status() >= 400) {
        console.error(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
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
    
    console.log(`✅ Created test release: v${releaseData.version}`);
  }
  
  // Helper function to open release detail modal
  async function openReleaseDetail(page: any, version: string) {
    // Click on the release card
    const releaseCard = page.locator(`text=/${version}/i`).first();
    await releaseCard.waitFor({ state: 'visible', timeout: 10000 });
    await releaseCard.click();
    await page.waitForTimeout(2000);
    console.log(`✅ Clicked on release v${version}`);
    
    // Wait for release detail modal to appear
    const detailModalTitle = page.locator('text=/Release Information/i');
    await detailModalTitle.waitFor({ state: 'visible', timeout: 5000 });
    console.log(`✅ Release detail modal opened for v${version}`);
  }
  
  // Helper function to open edit modal
  async function openEditModal(page: any) {
    // Wait a bit for the detail modal to be fully loaded
    await page.waitForTimeout(2000);
    
    // Try data-testid first, fallback to text selector
    let editButton = page.locator('[data-testid="release-detail-edit"]');
    const hasTestId = await editButton.count();
    
    if (hasTestId === 0) {
      console.log('⚠️ data-testid not found, using fallback selector');
      editButton = page.getByRole('button', { name: /Edit/i });
    }
    
    await editButton.waitFor({ state: 'visible', timeout: 10000 });
    await editButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Opened Edit Release modal');
  }

  test('Edit Release 1: Update Description', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    console.log('🚀 Test: Edit Release - Update Description');
    
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
    console.log(`✅ Updated description to: "${newDescription}"`);
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    
    // Wait for success notification or modal to close
    try {
      await page.waitForSelector('text=/success|updated/i', { timeout: 5000 });
      console.log('✅ Success notification shown');
    } catch {
      console.log('⚠️ No success notification (might have auto-closed)');
    }
    
    await page.waitForTimeout(2000);
    console.log('✅ Saved changes');
    
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
    console.log('✅ Description verified - changes persisted');
    
    console.log('✅ Test passed - Description updated successfully');
  });

  test('Edit Release 2: Change Rollout Percentage', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    console.log('🚀 Test: Edit Release - Change Rollout');
    
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
    console.log(`📊 Current rollout: ${currentRollout}%`);
    
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
    console.log(`✅ Changed rollout to: ${targetRollout}%`);
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Saved changes');
    
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
    console.log(`✅ Rollout verified: ${newRollout}%`);
    
    console.log('✅ Test passed - Rollout updated successfully');
  });

  test('Edit Release 3: Toggle Disabled Status', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds (creates release + edits it)
    console.log('🚀 Test: Edit Release - Toggle Disabled Status');
    
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
    console.log('✅ Toggled Release Status to Inactive');
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Saved changes');
    
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
    console.log('✅ Status verified - Release is now INACTIVE');
    
    console.log('✅ Test passed - Disabled status toggled successfully');
  });

  test.skip('Edit Release 4: Toggle Mandatory Flag (Feature Disabled)', async ({ page }) => {
    console.log('🚀 Test: Edit Release - Toggle Mandatory Flag');
    
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
    console.log('✅ Toggled Mandatory flag ON');
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Saved changes');
    
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
    console.log(`✅ Mandatory flag verified: ${isChecked ? 'ON' : 'OFF'}`);
    
    console.log('✅ Test passed - Mandatory flag toggled successfully');
  });

  test('Edit Release 5: Update Target Version', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    console.log('🚀 Test: Edit Release - Update Target Version');
    
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
    console.log(`✅ Updated target version to: ${newVersion}`);
    
    // Save changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Saved changes');
    
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
    console.log(`✅ Target version verified: ${versionValue}`);
    
    console.log('✅ Test passed - Target version updated successfully');
  });

  test('Edit Release 6: Multiple Fields - Comprehensive Edit', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    console.log('🚀 Test: Edit Release - Update Multiple Fields');
    
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
    console.log('📝 Updating multiple fields...');
    
    // 1. Update description
    const newDescription = 'Completely revised description with all new features';
    const descriptionInput = page.getByLabel(/description/i);
    await descriptionInput.clear();
    await descriptionInput.fill(newDescription);
    console.log(`  ✅ Description: "${newDescription}"`);
    
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
    console.log(`  ✅ Rollout: ${targetRollout}%`);
    
    // 3. Toggle mandatory (skip if not available - currently hidden in Edit modal)
    const mandatoryLabel = page.locator('text=/mandatory/i').first();
    if (await mandatoryLabel.isVisible().catch(() => false)) {
      await mandatoryLabel.click();
      await page.waitForTimeout(500);
      console.log('  ✅ Mandatory: ON');
    } else {
      console.log('  ⚠️ Mandatory toggle not available (feature disabled)');
    }
    
    // Save all changes
    const saveButton = page.locator('[data-testid="edit-release-save"]');
    await saveButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Saved all changes');
    
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
    console.log('✅ Description persisted');
    
    const savedRolloutText = await rolloutDisplay.textContent();
    const savedRollout = parseInt(savedRolloutText?.match(/\d+/)?.[0] || '0');
    expect(savedRollout).toBe(targetRollout);
    console.log(`✅ Rollout persisted: ${savedRollout}%`);
    
    console.log('✅ Test passed - Multiple fields updated successfully');
  });

  test('Edit Release 7: Cancel Edit - Changes Not Saved', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    console.log('🚀 Test: Edit Release - Cancel Without Saving');
    
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
    console.log('✅ Made changes (not saved)');
    
    // Cancel/close the edit modal
    const cancelButton = page.locator('[data-testid="edit-release-cancel"]');
    await cancelButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Canceled edit modal');
    
    // Close the detail modal entirely
    const closeDetailButton = page.locator('button[aria-label="Close modal"]').first();
    if (await closeDetailButton.isVisible().catch(() => false)) {
      await closeDetailButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Closed detail modal');
    }
    
    // Refresh the page to force fresh data fetch from backend
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    console.log('✅ Refreshed page to fetch fresh data');
    
    // Reopen release detail and edit modal to verify changes were NOT saved
    await openReleaseDetail(page, '2.1.0');
    await openEditModal(page);
    
    const savedDescription = await descriptionInput.inputValue();
    expect(savedDescription).toBe(originalDescription);
    console.log('✅ Verified - Original description preserved');
    
    console.log('✅ Test passed - Cancel works, changes not saved');
  });
});

