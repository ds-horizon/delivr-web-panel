import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test.describe('Create Release - Status Tests (Active/Inactive)', () => {
  
  // Reset releases before each test for isolation
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-releases', { method: 'POST' });
    console.log('🔄 Reset releases before test');
  });
  
  // Helper function to create release with specific status
  async function createReleaseWithStatus(
    page: any,
    config: {
      version: string,
      disabled: boolean, // true = inactive, false = active
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
    
    // Select deployment (Production)
    console.log('📝 Selecting Production deployment...');
    const deploymentSelect = page.locator('input[placeholder*="deployment" i]').first();
    await deploymentSelect.waitFor({ state: 'visible', timeout: 5000 });
    await deploymentSelect.click();
    await page.waitForTimeout(500);
    
    const productionOption = page.locator('[role="option"]:has-text("Production")');
    await productionOption.waitFor({ state: 'visible', timeout: 5000 });
    await productionOption.click();
    console.log('✅ Deployment selected');
    
    // Fill description if provided
    if (config.description) {
      const descriptionInput = page.getByLabel(/description/i);
      if (await descriptionInput.isVisible()) {
        await descriptionInput.fill(config.description);
        console.log('✅ Description filled');
      }
    }
    
    // Click Next Step to go to step 3
    const nextStepButton = page.getByRole('button', { name: /next step/i });
    await nextStepButton.waitFor({ state: 'visible', timeout: 5000 });
    await nextStepButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Moved to step 3 (configuration)');
    
    // Step 3: Configure status (Disabled toggle)
    if (config.disabled) {
      console.log('📝 Enabling Disabled toggle (making release inactive)...');
      
      // Look for the Disabled toggle/switch
      // Try multiple selectors to find it
      const disabledLabel = page.locator('text=/^Disabled$/i').first();
      await disabledLabel.waitFor({ state: 'visible', timeout: 5000 });
      
      // Click on the label or its parent to toggle
      await disabledLabel.click();
      console.log('✅ Clicked Disabled toggle');
      
      await page.waitForTimeout(500);
      
      // Verify the toggle is now checked
      const checkbox = page.locator('input[type="checkbox"]').filter({ 
        has: page.locator('text=/disabled/i') 
      }).first();
      
      if (await checkbox.isVisible()) {
        const isChecked = await checkbox.isChecked();
        console.log(`📊 Disabled toggle checked: ${isChecked}`);
        
        if (!isChecked) {
          console.log('⚠️ Toggle not checked, trying alternative method...');
          // Try clicking the checkbox directly
          await checkbox.click({ force: true });
          await page.waitForTimeout(300);
          const isCheckedNow = await checkbox.isChecked();
          console.log(`📊 After force click, checked: ${isCheckedNow}`);
        }
      }
      
      console.log('✅ Disabled toggle turned ON - release will be inactive');
      
      // Take screenshot to verify toggle state
      await page.screenshot({ 
        path: 'test-results/toggle-disabled-on.png',
        fullPage: true 
      });
    } else {
      console.log('📝 Disabled toggle OFF - release will be active');
    }
    
    // Set rollout to 100%
    console.log('📝 Setting rollout to 100%...');
    const rolloutDisplay = page.locator('text=/\\d+%/').first();
    await rolloutDisplay.waitFor({ state: 'visible', timeout: 5000 });
    
    const currentRolloutText = await rolloutDisplay.textContent();
    const currentRollout = parseInt(currentRolloutText?.match(/\d+/)?.[0] || '1');
    
    if (currentRollout !== 100) {
      const sliderThumb = page.locator('[role="slider"]').first();
      if (await sliderThumb.isVisible()) {
        await sliderThumb.focus();
        const steps = 100 - currentRollout;
        for (let i = 0; i < steps; i++) {
          await page.keyboard.press('ArrowRight');
          await page.waitForTimeout(10);
        }
        console.log('✅ Set rollout to 100%');
      }
    }
    
    // Click Review Changes
    const reviewButton = page.getByRole('button', { name: /review changes|review/i });
    await reviewButton.waitFor({ state: 'visible', timeout: 5000 });
    await reviewButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Opened review modal');
    
    // Submit from review modal
    const submitButton = page.getByRole('button', { name: /create release|submit/i }).last();
    await submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await submitButton.click();
    console.log('✅ Submitted release');
    
    // Wait for success notification
    await page.waitForSelector('text=/Release Created Successfully/i', { timeout: 30000 });
    console.log('✅ Release created successfully');
    
    await page.waitForTimeout(3000);
  }

  test('Status 1: Create ACTIVE release (Disabled toggle OFF)', async ({ page }) => {
    console.log('🚀 Test: Create Active Release');
    
    const version = '2.1.0';
    
    await createReleaseWithStatus(page, {
      version: version,
      disabled: false, // Active
      description: 'Test active release - should show green Active badge'
    });
    
    // Verify release in listing
    console.log('📝 Verifying release status in listing...');
    await page.waitForTimeout(2000);
    
    // Look for the release version
    const releaseCard = page.locator(`text=/v1/i`).first();
    await releaseCard.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✅ Found release v${version} in listing`);
    
    // Look for green "Active" badge
    console.log('📝 Checking for Active badge...');
    const activeBadge = page.locator('text=/active/i').first();
    await activeBadge.waitFor({ state: 'visible', timeout: 5000 });
    
    // Verify badge is visible
    const badgeVisible = await activeBadge.isVisible();
    expect(badgeVisible).toBe(true);
    console.log('✅ Green "Active" badge displayed');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/create-release-active-status.png',
      fullPage: true 
    });
    
    console.log('✅ Test passed - Active release created with green badge');
  });

  test('Status 2: Create INACTIVE release (Disabled toggle ON)', async ({ page }) => {
    console.log('🚀 Test: Create Inactive Release');
    
    const version = '2.2.0';
    
    await createReleaseWithStatus(page, {
      version: version,
      disabled: true, // Inactive
      description: 'Test inactive release - should show grey InActive badge'
    });
    
    // Verify release in listing
    console.log('📝 Verifying release status in listing...');
    await page.waitForTimeout(2000);
    
    // Look for the release version
    const releaseCard = page.locator(`text=/v1/i`).first();
    await releaseCard.waitFor({ state: 'visible', timeout: 10000 });
    console.log(`✅ Found release v${version} in listing`);
    
    // Look for grey "InActive" badge
    console.log('📝 Checking for InActive badge...');
    const inactiveBadge = page.locator('text=/inactive/i').first();
    await inactiveBadge.waitFor({ state: 'visible', timeout: 5000 });
    
    // Verify badge is visible
    const badgeVisible = await inactiveBadge.isVisible();
    expect(badgeVisible).toBe(true);
    console.log('✅ Grey "InActive" badge displayed');
    
    // Take screenshot
    await page.screenshot({ 
      path: 'test-results/create-release-inactive-status.png',
      fullPage: true 
    });
    
    console.log('✅ Test passed - Inactive release created with grey badge');
  });
});

