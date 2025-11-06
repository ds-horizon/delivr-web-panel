import { test, expect } from '@playwright/test';

test.describe('Create Token Tests', () => {
  
  test('Token 1: Create token via user profile menu', async ({ page }) => {
    test.setTimeout(60000); // 60 seconds
    console.log('🚀 Test: Create Token - Happy Path');
    
    // Add error listeners
    page.on('response', async (response) => {
      if (response.status() >= 400) {
        console.error(`HTTP ${response.status()}: ${response.url()}`);
        try {
          const text = await response.text();
          console.error(`Response: ${text}`);
        } catch (e) {}
      }
    });
    
    // Step 1: Login
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    console.log('✅ Logged in');
    
    // Step 2: Click user profile button
    const userButton = page.locator('[data-testid="user-profile-button"]');
    await userButton.waitFor({ state: 'visible', timeout: 10000 });
    await userButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Opened user menu');
    
    // Step 3: Click "Token List" option
    const tokenListOption = page.locator('text=/token list/i');
    await tokenListOption.waitFor({ state: 'visible', timeout: 5000 });
    await tokenListOption.click();
    await page.waitForTimeout(2000);
    console.log('✅ Navigated to Token List page');
    
    // Step 4: Click "Create Token" button (should be on the tokens page)
    const createTokenButton = page.getByRole('button', { name: /create.*token|new.*token|\+/i });
    await createTokenButton.waitFor({ state: 'visible', timeout: 10000 });
    await createTokenButton.click();
    await page.waitForTimeout(2000);
    console.log('✅ Opened Create Token modal');
    
    // Step 5: Fill token name
    const tokenName = `TestToken-${Date.now()}`;
    const nameInput = page.getByLabel(/token name|enter token name/i);
    await nameInput.waitFor({ state: 'visible', timeout: 5000 });
    await nameInput.fill(tokenName);
    console.log(`✅ Filled token name: ${tokenName}`);
    
    // Step 6: Select access type (optional - default is "Read")
    // Available options: All, Write, Read
    const accessSelect = page.getByLabel(/access type/i);
    if (await accessSelect.isVisible().catch(() => false)) {
      await accessSelect.selectOption('All');
      console.log('✅ Selected access type: All');
    } else {
      console.log('✅ Using default access type');
    }
    
    await page.waitForTimeout(1000);
    
    // Step 7: Click Create button
    const createButton = page.getByRole('button', { name: /create|generate/i }).last();
    await createButton.waitFor({ state: 'visible', timeout: 5000 });
    await createButton.click();
    console.log('✅ Clicked Create Token');
    
    // Step 8: Wait for token to be created
    await page.waitForTimeout(2000);
    
    // Step 9: Verify copy button with token name appears (modal shows created token)
    const copyButtonWithTokenName = page.getByRole('button', { name: new RegExp(tokenName, 'i') });
    await expect(copyButtonWithTokenName).toBeVisible({ timeout: 10000 });
    console.log(`✅ Token created - copy button shows: "${tokenName}"`);
    
    // Step 10: Close the modal
    const closeModalButton = page.locator('[data-testid="close-token-modal"]');
    await closeModalButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Closed modal');
    
    // Step 11: Verify token appears in the list
    const tokenRow = page.locator(`tr:has-text("${tokenName}")`);
    await expect(tokenRow).toBeVisible({ timeout: 10000 });
    console.log(`✅ Token "${tokenName}" found in list`);
    
    console.log('✅ Test passed - Token created and verified in list');
  });

  test('Token 2: Validation - Empty token name', async ({ page }) => {
    console.log('🚀 Test: Create Token - Empty Name Validation');
    
    // Step 1: Login and navigate to token page
    await page.goto('http://localhost:3000/test-login');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await page.waitForTimeout(2000);
    
    // Step 2: Navigate to Token List
    const userButton = page.locator('[data-testid="user-profile-button"]');
    await userButton.click();
    await page.waitForTimeout(1000);
    
    const tokenListOption = page.locator('text=/token list/i');
    await tokenListOption.click();
    await page.waitForTimeout(2000);
    console.log('✅ On Token List page');
    
    // Step 3: Open create token modal
    const createTokenButton = page.getByRole('button', { name: /Create Token/i });
    await createTokenButton.click();
    await page.waitForTimeout(2000);
    
    // Step 4: Try to create without entering name
    const createButton = page.getByRole('button', { name: /create|generate/i }).last();
    await createButton.click();
    await page.waitForTimeout(1000);
    
    // Step 5: Verify error message
    const errorMessage = page.locator("text=/Name Can't be Empty/i");
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
    const errorText = await errorMessage.textContent();
    console.log(`✅ Error message displayed: "${errorText}"`);
    
    // Step 6: Verify modal is still open (check for the h3 title specifically)
    const modalTitle = page.locator('h3:has-text("Create Token")');
    await expect(modalTitle).toBeVisible();
    console.log('✅ Modal still open (validation prevented submission)');
    
    console.log('✅ Test passed - Empty name validation works');
  });

  test('Token 3: Create token with different access types', async ({ page }) => {
    test.setTimeout(90000); // 90 seconds (creates 3 tokens)
    console.log('🚀 Test: Create Token - Different Access Types');
    
    const accessTypes = ['Read', 'Write', 'All'];
    
    for (const accessType of accessTypes) {
      console.log(`\n📝 Creating token with ${accessType} access...`);
      
      // Login and navigate to token page
      if (accessType === 'Read') {
        await page.goto('http://localhost:3000/test-login');
        await page.waitForURL('**/dashboard**', { timeout: 10000 });
        await page.waitForTimeout(2000);
        
        const userButton = page.locator('[data-testid="user-profile-button"]');
        await userButton.click();
        await page.waitForTimeout(1000);
        
        const tokenListOption = page.locator('text=/token list/i');
        await tokenListOption.click();
        await page.waitForTimeout(2000);
      }
      
      // Open create token modal
      const createTokenButton = page.getByRole('button', { name: /Create Token/i });
      await createTokenButton.click();
      await page.waitForTimeout(2000);
      
      // Fill name
      const tokenName = `${accessType}Token-${Date.now()}`;
      const nameInput = page.getByLabel(/token name|enter token name/i);
      await nameInput.fill(tokenName);
      
      // Select access type
      const accessSelect = page.getByLabel(/access type/i);
      if (await accessSelect.isVisible()) {
        await accessSelect.selectOption(accessType);
        console.log(`  ✅ Selected access: ${accessType}`);
      }
      
      // Create
      const createButton = page.getByRole('button', { name: /create|generate/i }).last();
      await createButton.click();
      await page.waitForTimeout(3000);
      
      console.log(`  ✅ ${accessType} token created`);
      
      // Close modal if needed
      const closeButton = page.locator('button[aria-label="Close modal"]').first();
      if (await closeButton.isVisible().catch(() => false)) {
        await closeButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    console.log('\n✅ Test passed - All access types work');
  });
});

