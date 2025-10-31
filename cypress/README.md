# Cypress E2E Testing for Delivr Web Panel

## 📋 Overview

This directory contains End-to-End (E2E) tests for the Delivr Web Panel using Cypress. The tests cover all major user flows including authentication, organization management, app creation, releases, deployments, and more.

## 🏗️ Project Structure

```
cypress/
├── e2e/                        # Test files organized by feature
│   ├── auth/                   # Authentication tests
│   ├── organizations/          # Organization management tests
│   ├── apps/                   # App management tests
│   ├── deployments/            # Deployment tests
│   ├── releases/               # Release tests
│   ├── collaborators/          # Collaborator tests
│   └── tokens/                 # Token management tests
├── fixtures/                   # Test data fixtures
│   ├── users.json
│   ├── organizations.json
│   ├── apps.json
│   ├── deployments.json
│   ├── releases.json
│   ├── collaborators.json
│   └── tokens.json
├── support/                    # Support files and utilities
│   ├── commands.ts            # Custom Cypress commands
│   ├── e2e.ts                 # Global setup and hooks
│   ├── page-objects/          # Page Object Models
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── OrgPage.ts
│   │   └── AppPage.ts
│   └── helpers/               # Helper functions
│       ├── auth-helper.ts
│       └── api-helper.ts
└── plugins/                   # Cypress plugins
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.18.0 (as specified in package.json)
- pnpm 10.17.0+
- Backend server running on `http://localhost:3001`

### Installation

Dependencies are already installed if you've run `pnpm install` in the root directory.

### Configuration

1. **Environment Variables**: Update `cypress.env.json` with your configuration:

```json
{
  "apiUrl": "http://localhost:3001/api/v1",
  "codepushServer": "http://localhost:3001",
  "TEST_USER_EMAIL": "test@delivr.com",
  "TEST_USER_NAME": "Test User"
}
```

2. **Cypress Configuration**: Main configuration is in `cypress.config.ts` at the root level.

## 🧪 Running Tests

### Interactive Mode (Cypress Test Runner)

Open Cypress Test Runner to run tests interactively:

```bash
# Start dev server and open Cypress
pnpm test:e2e:open

# Or manually:
pnpm dev                    # In one terminal
pnpm cy:open               # In another terminal
```

### Headless Mode (Command Line)

Run all tests in headless mode:

```bash
# Start dev server and run all tests
pnpm test:e2e

# Or manually:
pnpm dev                    # In one terminal
pnpm cy:run                # In another terminal
```

### Browser-Specific Tests

```bash
# Chrome
pnpm cy:run:chrome
pnpm test:e2e:chrome

# Firefox
pnpm cy:run:firefox

# Edge
pnpm cy:run:edge
```

### Run Specific Test File

```bash
pnpm cy:run:spec "cypress/e2e/auth/login.cy.ts"
```

### Run Tests in Headed Mode

```bash
pnpm cy:run:headed
```

### CI/CD Mode

```bash
# For CI/CD pipelines (uses production build)
pnpm test:e2e:ci
```

## 📝 Writing Tests

### Using Page Object Models

Page Object Models (POM) help organize test code and make it more maintainable:

```typescript
import { LoginPage, DashboardPage } from '../../support/page-objects';

describe('My Test', () => {
  it('should perform an action', () => {
    const loginPage = new LoginPage();
    const dashboardPage = new DashboardPage();
    
    loginPage
      .visit()
      .clickGoogleLogin();
      
    dashboardPage
      .verifyDashboard()
      .clickCreateOrg();
  });
});
```

### Using Custom Commands

Custom commands are defined in `cypress/support/commands.ts`:

```typescript
// Login using custom command
cy.login('user@example.com');

// Create organization
cy.createOrganization('My Org');

// Create app
cy.createApp('MyApp', 'React-Native', 'iOS');

// Navigate to specific org
cy.navigateToOrg('My Org');
```

### Using Helpers

Helper functions for common operations:

```typescript
import { AuthHelper, ApiHelper } from '../../support/helpers';

// Setup authentication
AuthHelper.setupAuthSession({
  email: 'test@delivr.com',
  name: 'Test User',
  token: 'mock-token',
});

// Mock API endpoints
ApiHelper.mockEndpoints();
ApiHelper.mockCreateOrganization();
```

### Using Fixtures

Load test data from fixtures:

```typescript
cy.fixture('organizations').then((orgs) => {
  // Use organization data
});

// Or with intercept
cy.intercept('GET', '/api/v1/tenants', {
  fixture: 'organizations.json',
});
```

## 🎯 Test Coverage Areas

### ✅ Authentication
- Login with Google OAuth
- Logout
- Session persistence
- Terms acceptance

### ✅ Organization Management
- Create organization
- View organizations list
- Switch between organizations
- Delete organization

### ✅ App Management
- Create app
- View app details
- Delete app
- Navigate between apps

### ✅ Release Management
- Create release
- Edit release
- View release details
- Upload release files

### ✅ Deployment Management
- Create deployment
- Promote deployment
- View deployment details

### ✅ Collaborator Management
- Add collaborator
- Remove collaborator
- View collaborators list

### ✅ Token Management
- Create access token
- Revoke token
- View tokens list

## 🛠️ Best Practices

### 1. Use Data Test IDs

Add `data-testid` attributes to elements for reliable selection:

```tsx
<button data-testid="create-org-btn">Create Organization</button>
```

```typescript
cy.get('[data-testid="create-org-btn"]').click();
```

### 2. Avoid Hard Waits

Use Cypress's built-in retry-ability instead of `cy.wait(milliseconds)`:

```typescript
// ❌ Bad
cy.wait(5000);
cy.get('[data-testid="result"]').should('exist');

// ✅ Good
cy.get('[data-testid="result"]', { timeout: 10000 }).should('exist');
```

### 3. Clean Up After Tests

Use `beforeEach` and `afterEach` hooks:

```typescript
beforeEach(() => {
  // Setup
  cy.clearLocalStorage();
  cy.clearCookies();
});

afterEach(() => {
  // Cleanup
  // Delete test data if needed
});
```

### 4. Use API Calls for Setup

Speed up tests by using API calls for setup instead of UI:

```typescript
beforeEach(() => {
  // Fast: Use API
  cy.request('POST', '/api/v1/tenants', { name: 'Test Org' });
  
  // Slow: Use UI
  // cy.visit('/dashboard');
  // cy.click('[data-testid="create-org-btn"]');
  // ...
});
```

### 5. Test in Isolation

Each test should be independent:

```typescript
describe('My Tests', () => {
  it('test 1', () => {
    // Complete test with setup and assertions
  });
  
  it('test 2', () => {
    // Another independent test
  });
});
```

## 🐛 Debugging

### Screenshots and Videos

Failed tests automatically capture screenshots and videos in:
- `cypress/screenshots/`
- `cypress/videos/`

### Cypress Debug Mode

```bash
DEBUG=cypress:* pnpm cy:run
```

### Interactive Debugging

Use `.debug()` command:

```typescript
cy.get('[data-testid="button"]')
  .debug()  // Pauses test execution
  .click();
```

### Browser DevTools

Open DevTools in Cypress Test Runner with `F12` or by clicking the DevTools icon.

## 📊 Test Reports

Test results are displayed in the terminal after running tests. For CI/CD, Cypress Dashboard can be configured for advanced reporting.

## 🔧 Troubleshooting

### Common Issues

1. **Tests failing due to timing**: Increase timeout values in `cypress.config.ts`
2. **Backend not running**: Ensure backend server is running on `http://localhost:3001`
3. **Port conflicts**: Change port in configuration if 3000 is already in use
4. **Authentication issues**: Check that OAuth mocking is correctly set up

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Page Object Model Pattern](https://martinfowler.com/bliki/PageObject.html)
- [Cypress Testing Library](https://testing-library.com/docs/cypress-testing-library/intro/)

## 🤝 Contributing

When adding new tests:

1. Follow the existing structure
2. Use Page Object Models for UI interactions
3. Add appropriate `data-testid` attributes to components
4. Update fixtures if needed
5. Document any new custom commands
6. Ensure tests are independent and can run in any order

## 📞 Support

For issues or questions, please contact the development team or open an issue in the repository.





