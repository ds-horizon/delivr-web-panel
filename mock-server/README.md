# Delivr Mock Backend Server

This is a fully-functional mock backend server that simulates the Delivr backend API for testing purposes.

## Features

✅ **Complete API Coverage** - All endpoints from the real backend  
✅ **State Management** - In-memory state that persists across requests  
✅ **Proper Types** - TypeScript types matching the real backend  
✅ **Session/Cookie Support** - Works with OAuth test mode  
✅ **Reset Functionality** - Clean state for each test  
✅ **Logging** - Detailed request/response logging  

---

## Quick Start

### 1. Install Dependencies

```bash
cd mock-server
npm install
```

Or from the project root:

```bash
npm run mock:install
```

### 2. Start the Server

```bash
npm run mock:server
```

The server will start on **http://localhost:3011**

### 3. Verify It's Running

```bash
curl http://localhost:3011/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": 1698765432000,
  "message": "Mock server is running"
}
```

---

## Available Endpoints

### Authentication

All endpoints (except `/health` and `/test/*`) require:
- **Header**: `userId` - The user ID making the request

Some endpoints also require:
- **Header**: `tenant` - The organization/tenant ID

### Organizations / Tenants

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|-----------------|
| GET | `/tenants` | Get all organizations | `userId` |
| DELETE | `/tenants/:tenant` | Delete an organization | `userId` |

### Account / Terms

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|-----------------|
| GET | `/account/ownerTermsStatus` | Get owner terms status | `userId` |
| POST | `/account/acceptOwnerTerms` | Accept owner terms | `userId` |

### Apps

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|-----------------|
| GET | `/apps` | Get apps for organization | `userId`, `tenant` |
| POST | `/apps` | Create a new app | `userId` |
| DELETE | `/apps/:app` | Delete an app | `userId`, `tenant` |

**Create App Request Body:**
```json
{
  "name": "MyApp",
  "orgId": "test-org-1"  // OR "orgName": "Test Organization"
}
```

### Deployments

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|-----------------|
| GET | `/deployments?appId=xxx` | Get deployments for app | `userId`, `tenant` |
| POST | `/deployments` | Create a deployment | `userId`, `tenant` |
| DELETE | `/deployments?appId=xxx` | Delete a deployment | `userId`, `tenant`, `deploymentName` |

**Create Deployment Request Body:**
```json
{
  "appId": "MyApp",
  "name": "Production"
}
```

### Access Keys / Tokens

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|-----------------|
| GET | `/access-keys` | Get all access keys | `userId` |
| POST | `/access-keys` | Create an access key | `userId` |
| DELETE | `/access-keys` | Delete an access key | `userId`, `name` |

**Create Access Key Request Body:**
```json
{
  "name": "My Token",
  "access": "All"  // "All", "Write", or "Read"
}
```

### Collaborators

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|-----------------|
| GET | `/collaborators?appId=xxx` | Get collaborators for app | `userId`, `tenant` |
| POST | `/collaborators` | Add a collaborator | `userId`, `tenant` |
| PATCH | `/collaborators` | Update collaborator permission | `userId`, `tenant` |
| DELETE | `/collaborators?appId=xxx` | Remove a collaborator | `userId`, `tenant`, `email` |

**Add Collaborator Request Body:**
```json
{
  "appId": "MyApp",
  "email": "user@example.com"
}
```

### Test Utilities

| Method | Endpoint | Description | Headers Required |
|--------|----------|-------------|-----------------|
| POST | `/test/reset` | Reset state to initial values | None |
| GET | `/test/state` | Get current state (debugging) | None |

---

## State Management

The mock server maintains in-memory state that includes:

```typescript
{
  organizations: Organization[],
  apps: Record<string, App[]>,  // Keyed by orgId
  deployments: Record<string, Deployment[]>,  // Keyed by appId
  packages: Record<string, Package[]>,  // Keyed by deploymentId
  accessKeys: AccessKey[],
  users: Record<string, User>  // Keyed by userId
}
```

### Initial State

By default, the server starts with:
- **1 Organization**: "Test Organization" (id: `test-org-1`)
- **1 User**: test@delivr.com (id: `test-user-id`)
- **No apps, deployments, or access keys**

### Resetting State

To reset to initial state (useful between tests):

```bash
curl -X POST http://localhost:3011/test/reset
```

Or in Cypress:
```typescript
MockServerHelper.resetState();
```

---

## Usage with Cypress

### 1. Import the Helper

```typescript
import { MockServerHelper } from '../support/helpers/mock-server-helper';
```

### 2. Check Health (in `before()`)

```typescript
before(() => {
  MockServerHelper.checkHealth();
});
```

### 3. Reset State (in `beforeEach()`)

```typescript
beforeEach(() => {
  MockServerHelper.resetState();
  AuthHelper.login();
});
```

### 4. Seed Test Data

```typescript
it('should create an app', () => {
  // Seed: Create an app via API
  MockServerHelper.createApp({
    name: 'TestApp',
    orgId: 'test-org-1'
  });

  // Test: Verify it appears in UI
  dashboardPage.visit();
  cy.contains('TestApp').should('be.visible');
});
```

### 5. Verify Data

```typescript
it('should add collaborator', () => {
  // ... UI actions to add collaborator ...
  
  // Verify: Check via API
  MockServerHelper.verifyCollaboratorExists('user@example.com', 'TestApp', 'test-org-1');
});
```

---

## Example Test with Mock Server

```typescript
import { DashboardPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';
import { MockServerHelper } from '../../support/helpers/mock-server-helper';

describe('Create App Flow', () => {
  let dashboardPage: DashboardPage;

  before(() => {
    // Ensure mock server is running
    MockServerHelper.checkHealth();
  });

  beforeEach(() => {
    // Reset to clean state
    MockServerHelper.resetState();
    
    // Login (uses cached session)
    AuthHelper.login();
    
    dashboardPage = new DashboardPage();
  });

  it('should create a new app', () => {
    dashboardPage.visit();
    
    // Create app via UI
    cy.get('[data-testid="create-app-btn"]').click();
    cy.get('[data-testid="app-name-input"]').type('MyNewApp');
    cy.get('[data-testid="submit-btn"]').click();
    
    // Verify: App appears in UI
    cy.contains('MyNewApp').should('be.visible');
    
    // Verify: App exists in mock server
    MockServerHelper.verifyAppExists('MyNewApp', 'test-org-1');
  });
});
```

---

## Running Tests with Mock Server

### Option 1: Automated (Recommended)

This runs both mock server and Cypress together:

```bash
npm run test:e2e:with-mock
```

This will:
1. Start mock server on `:3011`
2. Start frontend (test mode) on `:3000`
3. Run Cypress tests
4. Stop both servers when done

### Option 2: Manual (3 Terminals)

**Terminal 1** - Mock Server:
```bash
npm run mock:server
```

**Terminal 2** - Frontend (test mode):
```bash
npm run dev:test
```

**Terminal 3** - Cypress:
```bash
npm run cy:run
# OR
npm run cy:open
```

---

## Development Mode

For hot-reloading during development:

```bash
npm run mock:server:dev
```

This uses `ts-node-dev` to automatically restart the server when you change files.

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MOCK_SERVER_PORT` | `3011` | Port for the mock server |

Example:
```bash
MOCK_SERVER_PORT=3012 npm run mock:server
```

---

## Debugging

### View Current State

```bash
curl http://localhost:3011/test/state | jq
```

Or in Cypress:
```typescript
MockServerHelper.getState().then(console.log);
```

### Enable Verbose Logging

The server automatically logs all requests with details:

```
📥 POST /apps {
  userId: 'test-user-id',
  tenant: 'test-org-1',
  params: {},
  query: {},
  body: { name: 'MyApp', orgId: 'test-org-1' }
}
➕ Added app: MyApp to org: test-org-1
```

---

## Advantages Over `cy.intercept()`

| Feature | Mock Server | `cy.intercept()` |
|---------|-------------|-----------------|
| **State Persistence** | ✅ Yes | ❌ No |
| **Session/Cookie Support** | ✅ Yes | ⚠️ Limited |
| **Create → Read Flow** | ✅ Works | ❌ Doesn't work |
| **Reusable Across Tests** | ✅ Yes | ❌ Reset per test |
| **Easier to Maintain** | ✅ One place | ❌ Scattered in tests |
| **Works Outside Cypress** | ✅ Yes | ❌ No |

---

## Troubleshooting

### Mock server not starting

```bash
# Check if port 3011 is already in use
lsof -i :3011

# Kill existing process
kill -9 <PID>
```

### Frontend not connecting to mock server

Make sure your frontend is configured to use `http://localhost:3011`:

```typescript
// app/.server/services/config.ts
const backendUrl = process.env.NODE_ENV === 'test' 
  ? 'http://localhost:3011'
  : process.env.DELIVR_BACKEND_URL;
```

### Tests failing with 401 Unauthorized

Ensure you're passing the `userId` header in all requests:

```typescript
cy.request({
  method: 'GET',
  url: 'http://localhost:3011/tenants',
  headers: {
    userId: 'test-user-id'  // ← Required!
  }
});
```

---

## Next Steps

1. ✅ **Install dependencies**: `npm run mock:install`
2. ✅ **Start the server**: `npm run mock:server`
3. ✅ **Verify health**: `curl http://localhost:3011/health`
4. ✅ **Update tests**: Use `MockServerHelper` in your tests
5. ✅ **Run tests**: `npm run test:e2e:with-mock`

---

## Questions?

The mock server is designed to be a drop-in replacement for the real backend during testing. If you find any discrepancies or missing features, you can easily extend it by:

1. Adding new routes in `server.ts`
2. Updating types in `types.ts`
3. Adding state management functions in `state.ts`

Happy testing! 🚀

