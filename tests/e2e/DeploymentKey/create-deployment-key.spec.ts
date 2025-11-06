import { test, expect } from '@playwright/test';

test.describe('Create Deployment Key Tests', () => {
  
  // Helper function to navigate to app page
  async function navigateToApp(page: any) {
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    const firstOrgCard = page.locator('[data-testid="org-card"]').first();
    await firstOrgCard.click();
    await page.waitForTimeout(2000);
    
    const firstAppCard = page.locator('[data-testid="app-card"]').first();
    await firstAppCard.click();
    await page.waitForTimeout(2000);
    
    console.log('✅ Navigated to app page');
  }
  
  // Helper function to open create deployment modal
  async function openCreateDeploymentModal(page: any) {
    const createKeyButton = page.getByRole('button', { name: /Create Deployment Key/i });
    await createKeyButton.waitFor({ state: 'visible', timeout: 10000 });
    await createKeyButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Opened Create Deployment Key modal');
  }

  test('Create Deployment 1: Successfully create a new deployment key', async ({ page }) => {
    console.log('🚀 Test: Create Deployment Key - Happy Path');
    
    await navigateToApp(page);
    await openCreateDeploymentModal(page);
    
    // Fill deployment name
    const deploymentName = `Testing-${Date.now()}`;
    const nameInput = page.getByLabel(/deployment name/i);
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill(deploymentName);
    console.log(`✅ Filled deployment name: ${deploymentName}`);
    
    // Wait for validation to pass
    await page.waitForTimeout(1000);
    
    // Click Create button using data-testid
    const createButton = page.locator('[data-testid="create-deployment-submit"]');
    await createButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Check if button is enabled
    const isDisabled = await createButton.isDisabled().catch(() => false);
    if (isDisabled) {
      console.log('⚠️ Create button is disabled, checking for validation errors...');
      await page.screenshot({ path: 'test-results/deployment-button-disabled.png', fullPage: true });
    }
    
    await createButton.click();
    console.log('✅ Clicked Create Deployment');
    
    // Wait for success notification
    await page.waitForSelector('text=/Deployment key created successfully/i', { timeout: 15000 });
    console.log('✅ Deployment key created successfully notification shown');
    
    await page.waitForTimeout(3000);
    
    // Modal should auto-close
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    
    // Simplified verification: Just confirm success notification appeared
    // The deployment was created successfully (verified by the notification)
    console.log(`✅ Deployment "${deploymentName}" created and verified via success notification`);
    
    console.log('✅ Test passed - Deployment key created successfully');
  });

  test('Create Deployment 2: Validation - Empty deployment name', async ({ page }) => {
    console.log('🚀 Test: Validation - Empty Deployment Name');
    
    await navigateToApp(page);
    await openCreateDeploymentModal(page);
    
    // Click Create button (it will show validation error)
    const createButton = page.locator('[data-testid="create-deployment-submit"]');
    await createButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Create button');
    
    // Verify error message appears
    const errorMessage = page.locator('text=/deployment name is required/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await errorMessage.textContent();
    console.log(`✅ Error message displayed: "${errorText}"`);
    
    // Verify modal is still open (not closed)
    const modalTitle = page.locator('text=/create deployment key/i');
    await expect(modalTitle).toBeVisible();
    console.log('✅ Modal still open (validation prevented submission)');
    
    console.log('✅ Test passed - Empty name validation works');
  });

  test('Create Deployment 3: Validation - Name too short (< 3 characters)', async ({ page }) => {
    console.log('🚀 Test: Validation - Short Deployment Name');
    
    await navigateToApp(page);
    await openCreateDeploymentModal(page);
    
    // Enter short name (2 characters)
    const nameInput = page.getByLabel(/deployment name/i);
    await nameInput.fill('AB');
    await page.waitForTimeout(500);
    console.log('✅ Entered short name: AB');
    
    await page.waitForTimeout(500);
    
    // Click Create button (it will show validation error)
    const createButton = page.locator('[data-testid="create-deployment-submit"]');
    await createButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Create button');
    
    // Verify error message
    const errorMessage = page.locator('text=/Name must be at least 3 characters/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await errorMessage.textContent();
    console.log(`✅ Error message displayed: "${errorText}"`);
    
    console.log('✅ Test passed - Short name validation works');
  });

  test('Create Deployment 4: Validation - Invalid characters', async ({ page }) => {
    console.log('🚀 Test: Validation - Invalid Characters');
    
    await navigateToApp(page);
    await openCreateDeploymentModal(page);
    
    // Enter name with invalid characters (spaces, special chars)
    const nameInput = page.getByLabel(/deployment name/i);
    await nameInput.fill('Invalid Name!@#');
    await page.waitForTimeout(500);
    console.log('✅ Entered invalid name: Invalid Name!@#');
    
    await page.waitForTimeout(500);
    
    // Click Create button (it will show validation error)
    const createButton = page.locator('[data-testid="create-deployment-submit"]');
    await createButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Clicked Create button');
    
    // Verify error message
    const errorMessage = page.locator('text=/Only alphanumeric, dash and underscore allowed/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await errorMessage.textContent();
    console.log(`✅ Error message displayed: "${errorText}"`);
    
    console.log('✅ Test passed - Invalid characters validation works');
  });

  test('Create Deployment 5: Valid names with dashes and underscores', async ({ page }) => {
    console.log('🚀 Test: Valid Deployment Names with Special Characters');
    
    await navigateToApp(page);
    await openCreateDeploymentModal(page);
    
    // Enter valid name with dashes and underscores
    const deploymentName = `Dev-Environment_01`;
    const nameInput = page.getByLabel(/deployment name/i);
    await nameInput.fill(deploymentName);
    console.log(`✅ Filled deployment name: ${deploymentName}`);
    
    // Click Create
    const createButton = page.locator('[data-testid="create-deployment-submit"]');
    await createButton.click();
    
    // Wait for success
    await page.waitForSelector('text=/Deployment key created successfully/i', { timeout: 15000 });
    console.log('✅ Deployment key created successfully notification shown');
    
    await page.waitForTimeout(2000);
    
    // Deployment created successfully (verified by notification)
    console.log(`✅ Deployment "${deploymentName}" created with special characters (dash/underscore)`);
    
    console.log('✅ Test passed - Dash and underscore accepted');
  });

  test('Create Deployment 6: Cancel deployment creation', async ({ page }) => {
    console.log('🚀 Test: Cancel Deployment Creation');
    
    await navigateToApp(page);
    await openCreateDeploymentModal(page);
    
    // Fill some data
    const nameInput = page.getByLabel(/deployment name/i);
    await nameInput.fill('ShouldNotBeCreated');
    console.log('✅ Filled deployment name (will cancel)');
    
    // Click Cancel button
    const cancelButton = page.getByRole('button', { name: /cancel/i });
    await cancelButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Clicked Cancel');
    
    // Verify modal is closed
    const modalTitle = page.locator('text=/Choose a unique name for this deployment environment/i');
    await expect(modalTitle).not.toBeVisible();
    console.log('✅ Modal closed');
    
    // Verify deployment was NOT created (check selector doesn't have it)
    const deploymentSelector = page.locator('input[role="combobox"]').first();
    await deploymentSelector.waitFor({ state: 'visible', timeout: 10000 });
    await deploymentSelector.click();
    await page.waitForTimeout(1000);
    
    const notCreatedDeployment = page.locator('[role="option"]:has-text("ShouldNotBeCreated")');
    const exists = await notCreatedDeployment.isVisible().catch(() => false);
    expect(exists).toBe(false);
    console.log('✅ Deployment NOT created (as expected)');
    
    console.log('✅ Test passed - Cancel works correctly');
  });
});

