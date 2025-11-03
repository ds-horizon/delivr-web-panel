import { test, expect } from '@playwright/test';

test('Debug login flow - see all requests and responses', async ({ page }) => {
  // Capture ALL requests
  const allRequests: string[] = [];
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    console.log(`→ REQUEST: ${method} ${url}`);
    allRequests.push(`${method} ${url}`);
  });

  // Capture ALL responses
  const allResponses: string[] = [];
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    console.log(`← RESPONSE: ${status} ${url}`);
    allResponses.push(`${status} ${url}`);
  });

  // Capture console messages
  page.on('console', msg => {
    console.log(`🖥️  Console [${msg.type()}]:`, msg.text());
  });

  // Capture page errors
  page.on('pageerror', error => {
    console.error('🔴 Page Error:', error.message);
  });

  // Navigate to login
  console.log('\n📍 Step 1: Navigate to /login');
  await page.goto('/login', { waitUntil: 'networkidle' });
  console.log('✅ Login page loaded\n');

  // Wait for React to hydrate - check if button is actually clickable
  console.log('📍 Step 2: Wait for React hydration');
  await page.waitForFunction(() => {
    return document.readyState === 'complete';
  });
  await page.waitForTimeout(2000); // Extra wait for React hydration
  console.log('✅ Hydration complete\n');

  // Check for login button
  console.log('📍 Step 3: Find login button');
  const loginButton = page.locator('[data-testid="google-login-btn"]');
  await expect(loginButton).toBeVisible();
  await expect(loginButton).toBeEnabled();
  console.log('✅ Login button found and enabled\n');

  // Click login button
  console.log('📍 Step 4: Click login button');
  await loginButton.click();
  console.log('✅ Button clicked\n');

  // Wait a bit to see what happens
  await page.waitForTimeout(5000);

  // Print summary
  console.log('\n📊 SUMMARY:');
  console.log('Current URL:', page.url());
  console.log('\n🔍 All Requests Made:');
  allRequests.forEach(req => {
    if (req.includes('/auth') || req.includes('/api') || req.includes('/login') || req.includes('/dashboard')) {
      console.log('  ', req);
    }
  });

  console.log('\n🔍 All Responses Received:');
  allResponses.forEach(res => {
    if (res.includes('/auth') || res.includes('/api') || res.includes('/login') || res.includes('/dashboard')) {
      console.log('  ', res);
    }
  });

  // Check cookies
  const cookies = await page.context().cookies();
  console.log('\n🍪 Cookies:');
  cookies.forEach(cookie => {
    console.log(`   ${cookie.name}: ${cookie.value.substring(0, 20)}...`);
  });

  // Take screenshot
  await page.screenshot({ 
    path: 'tests/e2e/screenshots/debug-after-click.png',
    fullPage: true 
  });

  console.log('\n✅ Screenshot saved: tests/e2e/screenshots/debug-after-click.png');
});

