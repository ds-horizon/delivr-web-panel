# How Login is Bypassed in E2E Tests

## Overview
The E2E tests bypass the real Google OAuth login flow using a special test route (`/test-login`) and an environment variable (`OAUTH_TEST_MODE`). This allows tests to run without requiring actual OAuth credentials or making real API calls to Google.

## Architecture

### 1. **Environment Variable: `OAUTH_TEST_MODE`**
   - Set to `"true"` when running tests
   - Configured in `playwright.config.ts` (line 60):
     ```typescript
     webServer: {
       command: 'OAUTH_TEST_MODE=true NODE_ENV=test DELIVR_BACKEND_URL=http://localhost:3001 pnpm dev',
       ...
     }
     ```
   - This ensures the frontend dev server starts with test mode enabled

### 2. **Test Login Route: `/test-login`**
   **File:** `app/routes/test-login.ts`
   
   This route:
   - **Only works when `OAUTH_TEST_MODE === "true"`** (line 5)
   - If test mode is OFF, it redirects to `/login` (line 6)
   - If test mode is ON, it:
     1. Creates a mock session with a test user
     2. Sets the session cookie
     3. Redirects to `/dashboard`
   
   ```typescript
   export const loader = async () => {
     if (process.env.OAUTH_TEST_MODE !== "true") {
       return redirect("/login");  // Safety: redirect if not in test mode
     }

     const session = await SessionStorageService.sessionStorage.getSession();
     // Create mock user
     const mockUser = {
       user: { id: "test-user-playwright" },
       authenticated: true,
     };
     session.set(SessionStorageService.sessionKey, mockUser);

     const cookie = await SessionStorageService.sessionStorage.commitSession(session);
     return redirect("/dashboard", { headers: { "Set-Cookie": cookie } });
   };
   ```

### 3. **Authentication Middleware Bypass**
   **File:** `app/utils/authenticate.ts`
   
   The authentication helpers (`authenticateLoaderRequest` and `authenticateActionRequest`) check for `OAUTH_TEST_MODE`:
   
   ```typescript
   // Short-circuit auth in mock E2E mode
   if (process.env.OAUTH_TEST_MODE === "true") {
     const user = { user: { id: "test-user-playwright" } } as unknown as User;
     // Skip real authentication, return mock user
     return (await cb?.({ ...args, user })) ?? user;
   }
   // Otherwise, use real authentication
   const user = await AuthenticatorService.isAuthenticated(args.request);
   ```
   
   This means:
   - **In test mode:** All protected routes automatically get the mock user without checking session
   - **In production:** Normal OAuth authentication flow runs

### 4. **How Tests Use It**
   
   Every test starts with:
   ```typescript
   await page.goto('http://localhost:3000/test-login');
   await page.waitForURL('**/dashboard**', { timeout: 30000 });
   ```
   
   This:
   1. Navigates to `/test-login`
   2. The route creates a mock session and redirects to `/dashboard`
   3. The browser receives the session cookie
   4. All subsequent requests use this cookie
   5. The authentication middleware recognizes test mode and accepts the mock user

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    E2E Test Execution                        │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Playwright starts dev server with OAUTH_TEST_MODE=true    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Test calls: page.goto('http://localhost:3000/test-login') │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. test-login.ts route loader executes                      │
│    - Checks: process.env.OAUTH_TEST_MODE === "true" ✅      │
│    - Creates mock session with user: "test-user-playwright" │
│    - Sets session cookie                                    │
│    - Redirects to /dashboard                                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Browser receives:                                        │
│    - Set-Cookie header with session                         │
│    - Redirect to /dashboard                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Dashboard loader calls authenticateLoaderRequest()       │
│    - Checks: process.env.OAUTH_TEST_MODE === "true" ✅     │
│    - Returns mock user directly (skips real auth check)      │
│    - Dashboard loads successfully                           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. All subsequent API calls use authenticateActionRequest() │
│    - Each call checks OAUTH_TEST_MODE === "true" ✅        │
│    - Mock user is automatically injected                    │
│    - No real OAuth validation occurs                        │
└─────────────────────────────────────────────────────────────┘
```

## Security Features

1. **Production Safety:**
   - `/test-login` route redirects to `/login` if `OAUTH_TEST_MODE !== "true"`
   - This prevents accidental use in production

2. **Isolation:**
   - Test mode only works when explicitly enabled
   - All authentication checks have conditional logic
   - Mock user ID is fixed: `"test-user-playwright"`

3. **No Real OAuth Calls:**
   - Tests never make requests to `accounts.google.com`
   - No OAuth tokens are generated
   - No external dependencies

## Mock User Details

- **User ID:** `"test-user-playwright"`
- **Authenticated:** `true`
- **Used by:** All E2E tests
- **Backend:** Mock backend (`localhost:3001`) recognizes this user and has seed data for it

## Example: Complete Test Flow

```typescript
test('should create a release', async ({ page }) => {
  // Step 1: Bypass login
  await page.goto('http://localhost:3000/test-login');
  await page.waitForURL('**/dashboard**', { timeout: 30000 });
  
  // Step 2: Now authenticated as "test-user-playwright"
  // All API calls will automatically use this mock user
  
  // Step 3: Perform test actions
  await page.goto('http://localhost:3000/dashboard/test-org-1/TestApp');
  // ... rest of test
});
```

## Key Files

1. **`app/routes/test-login.ts`** - Test login route
2. **`app/utils/authenticate.ts`** - Authentication middleware with test mode bypass
3. **`playwright.config.ts`** - Configures `OAUTH_TEST_MODE=true` for test server
4. **All test files** - Use `page.goto('/test-login')` to authenticate

## Benefits

✅ **Fast:** No network calls to OAuth providers  
✅ **Reliable:** No dependency on external services  
✅ **Isolated:** Tests don't affect real user sessions  
✅ **Safe:** Can't accidentally run in production  
✅ **Simple:** One line of code to authenticate in tests

