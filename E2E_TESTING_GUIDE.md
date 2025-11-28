# E2E Testing Guide

Complete guide for running and maintaining end-to-end tests for the Delivr Web Panel.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Setup Instructions](#setup-instructions)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Environment Variables](#environment-variables)
- [Mock Server](#mock-server)
- [Test Utilities](#test-utilities)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

## Prerequisites

Before running E2E tests, ensure you have the following installed:

### Required Software

1. **Node.js** (exact version required)
   - Version: `18.18.0`
   - Check: `node --version`

2. **pnpm** (package manager)
   - Version: `10.17.0+`
   - Install: `npm install -g pnpm`
   - Enable: `corepack enable`

3. **Docker & Docker Compose**
   - Required for running the mock server
   - Check: `docker --version` and `docker-compose --version`

4. **Playwright** (installed automatically)
   - Installed as a dev dependency
   - Browsers are downloaded on first run

### System Requirements

- **Ports Available:**
  - `3000` - Frontend dev server (automatically started by Playwright)
  - `3001` - Mock backend server (must be running)
  - `1080` - MockServer gateway (automatically started with Docker)

## Quick Start

### 1. Start Mock Server

```bash
# Navigate to mock server directory
cd code-push-server/e2e-mocks

# Start Docker containers
docker-compose up -d

# Register API expectations
./register-expectations.sh

# Verify mock server is running
curl http://localhost:3001/ping
# Expected: {"message":"pong"}
```

### 2. Run Tests

```bash
# From delivr-web-panel directory
cd delivr-web-panel

# Run all tests (headless mode)
pnpm test:e2e

# Run tests with visible browser
pnpm test:e2e:headed

# Run tests in interactive UI mode
pnpm test:e2e:ui

# Run tests in debug mode
pnpm test:e2e:debug
```

That's it! Playwright automatically:
- ✅ Starts the frontend dev server with test mode enabled
- ✅ Sets `NODE_ENV=development` and `DELIVR_BACKEND_URL=http://localhost:3001`
- ✅ Enables test login bypass (`/test-login` route)
- ✅ Points all API calls to the mock server

## Setup Instructions

### Step 1: Install Dependencies

```bash
# Navigate to frontend directory
cd delivr-web-panel

# Install dependencies
pnpm install
```

### Step 2: Setup Mock Server

The mock server provides a complete backend API for testing without requiring a real backend.

```bash
# Navigate to mock server directory
cd code-push-server/e2e-mocks

# Start Docker containers (MockServer + mock-callback)
docker-compose up -d

# Wait a few seconds for services to start
sleep 5

# Register all API expectations
./register-expectations.sh

# Verify services are running
docker-compose ps
# Both services should show "Up" status
```

**Verify Mock Server:**
```bash
# Test ping endpoint
curl http://localhost:3001/ping
# Expected: {"message":"pong"}

# Test MockServer gateway
curl http://localhost:1080
# Should return MockServer response
```

### Step 3: Verify Setup

```bash
# From delivr-web-panel directory
cd delivr-web-panel

# Run a single test to verify everything works
pnpm exec playwright test tests/e2e/EmptyStates/no-releases.spec.ts --headed
```

## Running Tests

### Available Commands

| Command | Description | Use Case |
|---------|-------------|----------|
| `pnpm test:e2e` | Run all tests in headless mode | CI/CD, quick runs |
| `pnpm test:e2e:headed` | Run tests with visible browser | Debugging, watching tests |
| `pnpm test:e2e:ui` | Interactive UI mode | Exploring tests, debugging |
| `pnpm test:e2e:debug` | Debug mode with inspector | Step-by-step debugging |
| `pnpm test:e2e:report` | View HTML test report | Reviewing results |

### Running Specific Tests

```bash
# Run a specific test file
pnpm exec playwright test tests/e2e/Collaborators/owner-only-permissions.spec.ts

# Run tests matching a pattern
pnpm exec playwright test tests/e2e/EmptyStates/

# Run a specific test by name
pnpm exec playwright test -g "No Releases Message Displayed"

# Run with specific browser
pnpm exec playwright test --project=chromium
```

### Running with Options

```bash
# Run with single worker (sequential, useful for debugging)
pnpm exec playwright test --workers=1

# Run in headed mode with single worker
pnpm test:e2e:headed --workers=1

# Run with retries
pnpm exec playwright test --retries=2

# Run with timeout
pnpm exec playwright test --timeout=60000
```

## Test Structure

### Directory Structure

```
delivr-web-panel/
├── tests/
│   ├── e2e/
│   │   ├── Collaborators/          # Collaborator management tests
│   │   │   ├── owner-only-permissions.spec.ts
│   │   │   └── prevent-creator-demotion.spec.ts
│   │   ├── CreateRelease/         # Release creation tests
│   │   │   └── create-release-duplication.spec.ts
│   │   ├── DeploymentKey/         # Deployment key tests
│   │   │   └── create-deployment-key.spec.ts
│   │   ├── EmptyStates/           # Empty state tests
│   │   │   ├── no-organizations.spec.ts
│   │   │   ├── no-releases.spec.ts
│   │   │   └── no-tokens.spec.ts
│   │   └── TEST_CASES.csv         # Test case inventory
│   └── fixtures/                   # Test fixtures and helpers
│       ├── auth.js                # Authentication helpers
│       └── test-data.json         # Test data
├── playwright.config.ts            # Playwright configuration
└── E2E_TESTING_GUIDE.md           # This file
```

### Test File Structure

Each test file follows this structure:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  // Setup: Reset mock data before each test
  test.beforeEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
  });

  // Cleanup: Reset mock data after each test
  test.afterEach(async () => {
    await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
  });

  test('Test Name', async ({ page }) => {
    // 1. Navigate to test login
    await page.goto('/test-login');
    
    // 2. Perform actions
    // ...
    
    // 3. Assertions
    await expect(page.locator('...')).toBeVisible();
  });
});
```

## Environment Variables

### Test Mode Configuration

When running E2E tests, Playwright automatically sets:

- `NODE_ENV=development` - Keeps dev server in development mode (avoids hydration issues)
- `DELIVR_BACKEND_URL=http://localhost:3001` - Points to mock server

**Test Mode Detection:**
- Test mode is automatically detected when `DELIVR_BACKEND_URL` points to the mock server (`http://localhost:3001`)
- The `isTestMode()` utility function checks this condition
- This enables test login bypass and routes API calls to the mock server

**Important:** These are set automatically by `playwright.config.ts`. You don't need to set them manually.

### Manual Testing (Optional)

If you want to manually test the application in test mode:

```bash
# Start frontend in test mode manually
cd delivr-web-panel
NODE_ENV=development DELIVR_BACKEND_URL=http://localhost:3001 pnpm dev

# Then in browser:
# 1. Go to http://localhost:3000/test-login
# 2. Should automatically redirect to dashboard
# 3. Should use mock server at http://localhost:3001
```

**Note:** Test mode is detected automatically when `DELIVR_BACKEND_URL=http://localhost:3001` is set.

### Why Not NODE_ENV=test?

We use `DELIVR_BACKEND_URL` to detect test mode instead of `NODE_ENV=test` because:

- `NODE_ENV=test` caused hydration errors with Remix/Vite (asset manifest issues)
- `NODE_ENV` remains `"development"` for the dev server, preventing build and hydration issues
- Test mode is detected by checking if `DELIVR_BACKEND_URL === "http://localhost:3001"`
- This approach is simpler and doesn't interfere with build tools
- The `isTestMode()` utility function in `app/utils/test-mode.ts` centralizes this logic

## Mock Server

### Overview

The mock server provides a complete backend API implementation for testing:

- **MockServer** (port 1080) - API gateway that routes requests
- **mock-callback** (port 3001) - Mock logic service with in-memory data storage

### Starting/Stopping Mock Server

```bash
# Start mock server
cd code-push-server/e2e-mocks
docker-compose up -d
./register-expectations.sh

# Stop mock server
docker-compose down

# Restart mock server (clears all data)
docker-compose restart mock-callback
sleep 3
./register-expectations.sh

# View logs
docker-compose logs -f mock-callback
```

### Mock Server Endpoints

The mock server provides test utility endpoints:

#### Reset Data

```bash
# Reset to initial state (with pre-configured data)
curl -X POST http://localhost:3001/api/test/reset-data

# Reset to empty state (accounts only, no orgs/apps)
curl -X POST http://localhost:3001/api/test/reset-empty

# Reset releases only (keeps orgs/apps/deployments)
curl -X POST http://localhost:3001/api/test/reset-releases
```

#### Pre-configured Test Data

The mock server includes pre-configured test accounts:

- `test-user` - Test user account
- `test-user-playwright` - Playwright test user (email: `playwright@example.com`)
- `test@example.com` - Additional test account

### Mock Server Architecture

```
Request → MockServer (1080) → Routes to → mock-callback (3001) → Returns Response
```

All API requests from the frontend go through MockServer, which routes them to the appropriate mock-callback endpoint.

## Test Utilities

### Test Isolation

Each test should reset mock data to ensure isolation:

```typescript
test.beforeEach(async () => {
  // Reset to initial state before each test
  await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
});

test.afterEach(async () => {
  // Clean up after each test
  await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
});
```

### Authentication Helper

Tests use the `/test-login` route for authentication:

```typescript
// Navigate to test login (automatically authenticates)
await page.goto('/test-login');

// Wait for redirect to dashboard
await page.waitForURL('**/dashboard**', { timeout: 10000 });
```

### Selectors Best Practices

Use `data-testid` attributes for reliable selectors:

```typescript
// ✅ Good: Using data-testid
await page.locator('[data-testid="add-collaborator-button"]').click();

// ⚠️ Acceptable: Using text/label with fallback
let input = page.locator('[data-testid="app-version-input"]');
if (!(await input.isVisible().catch(() => false))) {
  input = page.getByLabel(/app version/i);
}
```

### Waiting for Elements

Always wait for elements to be visible before interacting:

```typescript
// Wait for element to be visible
await page.locator('[data-testid="button"]').waitFor({ state: 'visible', timeout: 10000 });

// Wait for element to be enabled
await expect(page.locator('[data-testid="button"]')).toBeEnabled({ timeout: 5000 });
```

## Troubleshooting

### Issue: Mock Server Not Responding

**Symptoms:**
- Tests fail with connection errors
- `curl http://localhost:3001/ping` returns error

**Solution:**
```bash
cd code-push-server/e2e-mocks

# Check if containers are running
docker-compose ps

# Restart services
docker-compose restart

# Re-register expectations
./register-expectations.sh

# Verify
curl http://localhost:3001/ping
```

### Issue: Frontend Not Starting

**Symptoms:**
- "Remix Vite plugin not found" error
- Hydration errors in console

**Solution:**
- This should not happen with current `vite.config.ts` (uses `process.env.VITEST` check)
- If it does, verify `vite.config.ts` has the correct Remix plugin configuration
- Restart the dev server

### Issue: Tests Timing Out

**Symptoms:**
- Tests fail with timeout errors
- Elements not found

**Solution:**
```typescript
// Increase timeout for specific test
test.setTimeout(60000); // 60 seconds

// Wait longer for elements
await page.locator('...').waitFor({ state: 'visible', timeout: 15000 });

// Check if mock server is responding
// Check if frontend is running
```

### Issue: Test Data Conflicts

**Symptoms:**
- Tests fail with "already exists" errors
- Tests interfere with each other

**Solution:**
```typescript
// Ensure each test resets data
test.beforeEach(async () => {
  await fetch('http://localhost:3001/api/test/reset-data', { method: 'POST' });
});
```

### Issue: Port Already in Use

**Symptoms:**
- "Port 3000 already in use" or "Port 3001 already in use"

**Solution:**
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process (replace PID with actual process ID)
kill -9 <PID>

# Or stop existing dev server
# Or change ports in playwright.config.ts
```

### Issue: Collaborator Tests Failing with 404

**Symptoms:**
- `{"error":"The specified e-mail address doesn't represent a registered user"}`

**Solution:**
- Use pre-configured test emails: `test@example.com` or `playwright@example.com`
- The mock server requires accounts to exist before adding as collaborators

## Best Practices

### 1. Test Isolation

- Always reset mock data in `beforeEach`/`afterEach`
- Don't rely on test execution order
- Each test should be independent

### 2. Selectors

- Prefer `data-testid` attributes
- Use fallback selectors when needed
- Avoid brittle selectors (CSS classes, complex XPath)

### 3. Waiting

- Always wait for elements before interacting
- Use appropriate timeouts
- Don't use `page.waitForTimeout()` unless necessary

### 4. Assertions

- Use Playwright's built-in assertions (`expect().toBeVisible()`)
- Be specific about what you're testing
- Test user-visible behavior, not implementation details

### 5. Test Data

- Use pre-configured test accounts when possible
- Reset data between tests
- Use meaningful test data names

### 6. Debugging

- Use `--headed` mode to watch tests
- Use `--debug` mode for step-by-step debugging
- Use `page.pause()` to pause execution
- Check browser console for errors

## Additional Resources

- **Test Cases Inventory**: `tests/e2e/TEST_CASES.csv`
- **Mock Server Docs**: `code-push-server/e2e-mocks/GETTING_STARTED.md`
- **Playwright Docs**: https://playwright.dev/docs/intro
- **Main README**: `README.md`

## Getting Help

If you encounter issues:

1. Check this guide's [Troubleshooting](#troubleshooting) section
2. Verify mock server is running: `curl http://localhost:3001/ping`
3. Check test logs in `playwright-report/`
4. Run tests in `--headed` mode to see what's happening
5. Check browser console for errors

---

**Last Updated:** Based on current implementation using `DELIVR_BACKEND_URL=http://localhost:3001` for test mode detection and mock server at `http://localhost:3001`





