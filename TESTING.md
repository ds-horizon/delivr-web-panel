# 🧪 Testing Guide - Delivr Web Panel

## 🚀 Quick Start

### Prerequisites
- Node.js v20+
- pnpm installed
- Backend server running (or use mock server)

### Run Tests

```bash
# Install dependencies (if not done)
cd /Users/poonamjain/Delivt-frontend-backend/delivr-web-panel
pnpm install

# Start mock server (for isolated testing)
cd mock-server && npm start

# In another terminal, start dev server in test mode
cd /Users/poonamjain/Delivt-frontend-backend/delivr-web-panel
OAUTH_TEST_MODE=true NODE_ENV=test pnpm dev

# In another terminal, run tests
cd /Users/poonamjain/Delivt-frontend-backend/delivr-web-panel

# Option 1: Open Cypress GUI
npx cypress open

# Option 2: Run all tests headless
npx cypress run

# Option 3: Run specific test file
npx cypress run --spec "cypress/e2e/auth/login.cy.ts"
```

---

## 📁 Test Structure

```
cypress/
├── e2e/                      # Test files
│   ├── auth/                 # Authentication tests
│   │   ├── login.cy.ts       ✅ 5/6 passing
│   │   └── logout.cy.ts      ✅ 2/2 passing
│   ├── apps/                 # App management tests
│   ├── organizations/        # Org management tests
│   ├── deployments/         # Deployment tests
│   ├── releases/            # Release tests
│   ├── collaborators/       # Collaborator tests
│   └── tokens/              # Access token tests
│
├── fixtures/                # Test data (JSON)
├── support/
│   ├── commands.ts          # Custom Cypress commands
│   ├── e2e.ts              # Global configuration
│   ├── helpers/            # Helper functions
│   │   ├── auth-helper.ts  # AuthHelper.login() etc.
│   │   └── api-helper.ts   # ApiHelper.mockCreateApp() etc.
│   └── page-objects/       # Page Object Models
│       ├── DashboardPage.ts
│       ├── LoginPage.ts
│       └── ...
│
└── cypress.config.ts        # Cypress configuration
```

---

## 🏗️ Architecture

### Test Mode Setup

When running tests, we use:
1. **Mock OAuth** - Bypasses real Google OAuth
2. **Mock Backend Server** (Port 3011) - Provides fake API responses
3. **Dev Server** (Port 3000) - Serves the frontend

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Cypress   │ visits  │  Frontend   │  calls  │ Mock Server │
│   Tests     │ ───────>│ (Port 3000) │ ───────>│ (Port 3011) │
└─────────────┘         └─────────────┘         └─────────────┘
```

### Environment Variables

For testing, set these in your `.env`:

```bash
# Enable mock OAuth
OAUTH_TEST_MODE=true
NODE_ENV=test

# Mock credentials (not used, but required)
GOOGLE_CLIENT_ID=mock-client-id
GOOGLE_CLIENT_SECRET=mock-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Backend URL (will auto-switch to mock server in test mode)
DELIVR_BACKEND_URL=http://localhost:3010

# Session secret
SESSION_SECRET=your-session-secret
```

---

## ✅ Current Test Status

| Category | Status | Tests Passing |
|----------|--------|---------------|
| **Login** | ✅ | 5/6 (1 skipped) |
| **Logout** | ✅ | 2/2 |
| **Create App** | ⏳ | Needs data-testid fixes |
| **Other Tests** | ⏳ | Not yet run |

---

## 🛠️ Writing Tests

### Using AuthHelper (Fast Login)

```typescript
import { AuthHelper } from '../../support/helpers/auth-helper';

describe('My Test Suite', () => {
  beforeEach(() => {
    // This logs in ONCE and caches the session!
    AuthHelper.login();
  });

  it('should do something', () => {
    cy.visit('/dashboard');
    // Already logged in!
  });
});
```

### Using Page Objects

```typescript
import { DashboardPage } from '../../support/page-objects/DashboardPage';

it('should navigate dashboard', () => {
  const dashboardPage = new DashboardPage();
  dashboardPage
    .visit()
    .clickOrganization('Test Org')
    .verifyOrgExists('Test Org');
});
```

### Mocking APIs

```typescript
import { ApiHelper } from '../../support/helpers/api-helper';

it('should create app', () => {
  // Mock the API response
  ApiHelper.mockCreateApp();
  
  // Perform actions
  cy.get('[data-testid="create-app-btn"]').click();
  cy.get('[data-testid="app-name-input"]').type('MyApp');
  cy.get('[data-testid="submit-app-btn"]').click();
  
  // Wait for API call
  cy.wait('@createApp');
});
```

---

## 📝 Adding data-testid Attributes

For reliable tests, add `data-testid` attributes to your components:

```tsx
// ✅ Good
<Button data-testid="create-app-btn">Create App</Button>

// ❌ Bad (brittle, can break with styling changes)
<Button className="primary-btn">Create App</Button>
```

---

## 🐛 Debugging Tests

### 1. Run Tests in Headed Mode
```bash
npx cypress run --headed --browser chrome --spec "path/to/test.cy.ts"
```

### 2. Use Chrome DevTools
- Open Cypress GUI: `npx cypress open`
- Click on test
- Press F12 to open DevTools
- Use `debugger` statements in your test

### 3. Check Screenshots/Videos
Failed tests automatically capture:
- Screenshots: `cypress/screenshots/`
- Videos: `cypress/videos/`

### 4. Enable Verbose Logging
```typescript
cy.visit('/dashboard', { log: true });
```

---

## 🎯 Best Practices

### ✅ DO:
- Use `data-testid` attributes
- Use Page Objects for reusability
- Cache login with `AuthHelper.login()`
- Mock API calls for speed
- Wait for elements properly: `cy.get('[data-testid="btn"]', { timeout: 10000 })`

### ❌ DON'T:
- Don't use CSS classes/IDs for selectors (they change)
- Don't add `cy.wait(5000)` everywhere (use proper assertions)
- Don't test external services (mock them)
- Don't repeat login logic (use session caching)

---

## 🆘 Common Issues

### Issue: "Cypress could not verify server is running"
**Solution**: Make sure dev server is running on port 3000
```bash
OAUTH_TEST_MODE=true NODE_ENV=test pnpm dev
```

### Issue: "401 Unauthorized" errors
**Solution**: Make sure mock server is running
```bash
cd mock-server && npm start
```

### Issue: CSS looks broken in tests
**Solution**: This is a known issue with Mantine CSS loading in Cypress. The functionality still works; it's just a visual issue.

### Issue: Tests are slow
**Solution**: Use `AuthHelper.login()` which caches the session across tests

---

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Mock Server README](./mock-server/README.md)
- [Cypress README](./cypress/README.md)

---

## 🎉 Next Steps

1. Run login/logout tests to verify setup
2. Fix `data-testid` attributes for create app tests
3. Add mock server endpoints as needed
4. Run remaining test suites one by one
5. Fix issues as they arise

Happy Testing! 🚀

