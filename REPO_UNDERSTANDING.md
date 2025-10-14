# DOTA Repository - Comprehensive Understanding

## 📋 Overview

**DOTA** (Dashboard for Over-The-Air updates) is a CodePush Dashboard built with **Remix**, **React**, **Mantine UI**, and **Tailwind CSS**. It enables developers to push real-time updates to React Native mobile applications without requiring app store approvals.

### Tech Stack
- **Framework**: Remix (v2.13.1) - Full-stack React framework with SSR
- **Runtime**: Node.js (v18.18.0)
- **UI Libraries**: 
  - Mantine UI (v7.13.2) - Component library
  - Tailwind CSS (v3.4.4) - Utility-first CSS
  - Tabler Icons React - Icon library
- **State Management**: React Query (v3.39.3)
- **Authentication**: remix-auth with Google OAuth
- **API Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Build Tool**: Vite
- **Package Manager**: pnpm

---

## 🏗️ Architecture

### 1. **Application Structure**

```
dota/
├── app/
│   ├── .server/              # Server-side only code
│   │   └── services/         # Backend services
│   │       ├── Auth/         # Authentication service
│   │       ├── Codepush/     # CodePush API service
│   │       ├── SessionStorage/ # Session management
│   │       ├── Cookie/       # Cookie utilities
│   │       └── config.ts     # Environment configuration
│   ├── components/           # React components
│   │   ├── Pages/           # Page-level components
│   │   ├── NavbarNested/    # Navigation sidebar
│   │   ├── UserButton/      # User profile component
│   │   └── ...              # Other UI components
│   ├── routes/              # Remix routes (file-based routing)
│   ├── utils/               # Utility functions
│   ├── root.tsx             # Root layout
│   └── tailwind.css         # Global styles
├── config/                  # Environment configs
├── public/                  # Static assets
├── build/                   # Build output
└── server.mjs              # Express server
```

---

## 🔐 Authentication Flow

### Authentication Methods
1. **Google OAuth** (Primary)
2. **API Key** (For programmatic access)

### Flow Diagram
```
User Request
    ↓
authenticateLoaderRequest/authenticateActionRequest
    ↓
Check for API Key in headers?
    ├─ Yes → getUserByAccessKey() → Return User
    └─ No → Google OAuth Flow
              ↓
         Check Session
              ↓
         Valid? → Return User
              ↓
         Invalid? → Redirect to /login
```

### Key Files
- **`app/utils/authenticate.ts`**: Authentication wrapper functions
  - `authenticateLoaderRequest()`: Wraps loader functions with auth
  - `authenticateActionRequest()`: Wraps action functions with auth
- **`app/.server/services/Auth/Auth.ts`**: Main authentication service
  - `isAuthenticated()`: Validates user session or API key
  - `callback()`: Handles OAuth callback
  - `logout()`: Clears session
- **`app/.server/services/SessionStorage/`**: Session management using cookies

### User Object Structure
```typescript
type User = {
  authenticated: boolean;
  user: {
    createdTime: number;
    name: string;
    email: string;
    id: string;
    createdAt: string;
    updatedAt: string;
  };
};
```

---

## 🛣️ Routing Structure

Remix uses **file-based routing** in the `app/routes/` directory.

### Public Routes
- `/` → Redirects to `/dashboard`
- `/login` → Google OAuth login page
- `/logout` → Logout action
- `/auth/:provider` → OAuth initiation
- `/auth/:provider/callback` → OAuth callback handler
- `/healthcheck` → Health check endpoint

### Protected Routes (Dashboard)
All `/dashboard/*` routes are protected by `authenticateLoaderRequest()`

#### Organization & App Management
- `/dashboard` → Main dashboard with sidebar navigation
- `/dashboard/_index` → Dashboard home (shows intro or app overview)
- `/dashboard/create/org` → Create new organization
- `/dashboard/create/app` → Create new app
- `/dashboard/:org/apps` → List apps for an organization
- `/dashboard/:org/manage` → Manage organization settings
- `/dashboard/:org/:app` → App details with tabs:
  - **Deployments**: Manage deployments (staging, production, etc.)
  - **Release**: Create new releases
  - **Collaborators**: Manage app collaborators

#### Other Routes
- `/dashboard/tokens` → Manage API access keys
- `/dashboard/delete` → Delete confirmation modal (for orgs, apps, deployments)

### API Routes (v1)
All API routes are prefixed with `/api/v1/`

#### Tenant/Organization APIs
- `GET /api/v1/tenants` → Get user's organizations
- `POST /api/v1/:org` → Create organization
- `DELETE /api/v1/:org` → Delete organization

#### App APIs
- `GET /api/v1/:org/apps` → Get apps for organization
- `POST /api/v1/:org/apps` → Create app
- `DELETE /api/v1/:org/apps/:app` → Delete app

#### Deployment APIs
- `GET /api/v1/:app/deployments` → Get deployments for app
- `POST /api/v1/:app/deployments` → Create deployment
- `DELETE /api/v1/:app/deployments/:deploymentName` → Delete deployment
- `POST /api/v1/:app/deployments/:deploymentName/promote/:targetDeployment` → Promote release

#### Release APIs
- `GET /api/v1/:org/:app/deployments/:deploymentName/release` → Get releases
- `POST /api/v1/:org/:app/deployments/:deploymentName/release` → Create release
- `PATCH /api/v1/:org/:app/deployments/:deploymentName/release` → Update release (edit, promote)

#### Collaborator APIs
- `GET /api/v1/:app/collaborators` → Get collaborators
- `POST /api/v1/:app/collaborators` → Add collaborator
- `DELETE /api/v1/:app/collaborators` → Remove collaborator
- `PUT /api/v1/:app/collaborators` → Update collaborator permissions

#### Access Key APIs
- `GET /api/v1/access-keys` → Get access keys
- `POST /api/v1/access-keys` → Create access key
- `DELETE /api/v1/access-keys` → Delete access key

#### Account APIs
- `GET /api/v1/account/owner-terms-status` → Check if user accepted terms
- `POST /api/v1/account/accept-terms` → Accept terms and conditions

---

## 🔌 Backend Service Layer

### CodepushService (`app/.server/services/Codepush/index.ts`)

This is the **main API client** that communicates with the DOTA backend server.

#### Configuration
```typescript
private __client = axios.create({
  baseURL: env.DOTA_SERVER_URL,
  timeout: 10000,
});
```

#### Mock Data Support
When `DOTA_SERVER_URL` is empty (local development), the service returns mock data:
```typescript
async getUser(token: string): Promise<User> {
  if (!env.DOTA_SERVER_URL.length) {
    return Promise.resolve({
      authenticated: true,
      user: {
        createdTime: Date.now(),
        name: "Dummy User",
        email: "dummy_user@dream11.com",
        id: "id_1",
        createdAt: "2024-10-30T08:41:07.000Z",
        updatedAt: "2024-10-30T08:41:07.000Z",
      },
    });
  }
  // Real API call...
}
```

#### Key Methods

**User Management**
- `getUser(token: string)` - Authenticate user with JWT token
- `getUserByAccessKey(key: string)` - Authenticate with API key

**Tenant/Organization Management**
- `getTenants(userId: string)` - Get user's organizations
- `deleteTenant(data)` - Delete organization

**App Management**
- `getAppsForTenants(data)` - Get apps for organization
- `createAppForTenant(data)` - Create new app
- `deleteAppForTenant(data)` - Delete app

**Deployment Management**
- `getDeployentsForApp(data)` - Get deployments for app
- `createDeployentsForApp(data)` - Create deployment
- `deleteDeployentsForApp(data)` - Delete deployment

**Release Management**
- `getReleasesForDeployentsForApp(data)` - Get releases
- `createReleaseForApp(data)` - Create release (upload code)
- `promoteReleaseFromDeployment(data)` - Promote release between deployments
- `updatePackageForApp(data)` - Update release metadata (rollout, mandatory flag, etc.)

**Collaborator Management**
- `getCollaboratorForApp(data)` - Get app collaborators
- `addCollaboratorForApp(data)` - Add collaborator
- `removeCollaboratorForApp(data)` - Remove collaborator
- `updateCollaboratorPermissionForApp(data)` - Update permissions

**Access Key Management**
- `getAccessKeys(data)` - Get API access keys
- `createAccessKey(data)` - Create access key
- `deleteAccessKey(data)` - Delete access key

**Terms & Conditions**
- `getOwnerTermsStatus(data)` - Check if user accepted terms
- `acceptTerms(data)` - Accept terms

---

## 📦 Data Flow Pattern

DOTA follows a **feature-based component structure** with co-located data fetching.

### Pattern Example: App List

```
components/Pages/components/AppList/
├── index.tsx                    # UI Component
├── data/
│   └── getAppListForOrg.ts     # API call function
└── hooks/
    └── useGetAppListForOrg.ts  # React Query hook
```

### Data Flow
```
Component (index.tsx)
    ↓
Custom Hook (useGetAppListForOrg)
    ↓
Data Function (getAppListForOrg)
    ↓
API Route (/api/v1/:org/apps)
    ↓
CodepushService.getAppsForTenants()
    ↓
Backend Server (or Mock Data)
```

### Example Code Flow

**1. Component** (`AppList/index.tsx`)
```typescript
export function AppListForOrg({ user }: AppListForOrgProps) {
  const { data, isLoading } = useGetAppListForOrg(user);
  
  return (
    <div>
      {data?.map(app => <AppCard key={app.id} app={app} />)}
    </div>
  );
}
```

**2. Hook** (`hooks/useGetAppListForOrg.ts`)
```typescript
export const useGetAppListForOrg = (user: User) => {
  const params = useParams();
  
  return useQuery({
    queryKey: ["apps", params.org],
    queryFn: () => getAppListForOrg({ userId: user.user.id, orgId: params.org }),
    enabled: !!user && !!params.org,
  });
};
```

**3. Data Function** (`data/getAppListForOrg.ts`)
```typescript
export const getAppListForOrg = async (args: GetAppListForOrgArgs) => {
  const response = await axios.get(`/api/v1/${args.orgId}/apps`, {
    params: { userId: args.userId },
  });
  return response.data;
};
```

**4. API Route** (`routes/api.v1.$org.apps.ts`)
```typescript
export const loader = authenticateLoaderRequest(async ({ params, user }) => {
  const { data } = await CodepushService.getAppsForTenants({
    userId: user.user.id,
    orgId: params.org!,
  });
  return json(data);
});
```

**5. Service** (`Codepush/index.ts`)
```typescript
async getAppsForTenants(data: AppsRequest) {
  const headers: AppsRequest = data;
  return this.__client.get<null, AxiosResponse<AppsResponse>>("/apps", {
    headers,
  });
}
```

---

## 🎨 UI Components Structure

### Layout Components

**NavbarNested** (`components/NavbarNested/`)
- Sidebar navigation
- Shows organization list with nested links
- User profile button at bottom

**AppShell** (from Mantine)
- Main layout wrapper
- Header with logo and "Create App" button
- Collapsible sidebar for mobile

### Page Components

All major features are in `components/Pages/components/`:

**OrgListNavbar**
- Displays user's organizations in sidebar
- Links to Apps and Manage pages
- Delete option for admins

**AppList**
- Grid of app cards
- Shows app details (name, deployments, collaborators)
- Quick actions (view, delete)

**DeploymentList**
- Lists deployments for an app (staging, production, etc.)
- Search and filter deployments
- Create new deployment
- View release history

**ReleaseForm**
- Upload new release (directory/zip)
- Set metadata (version, description, rollout percentage)
- Mandatory update flag
- Target deployment selection

**CollaboratorList**
- Table of app collaborators
- Add/remove collaborators
- Update permissions (read/write)

**TokenList**
- Manage API access keys
- Create/delete tokens
- Copy token to clipboard

**CreateApp**
- Form to create new app
- Organization selection
- App name input

**CreateDeploymentForm**
- Create new deployment (e.g., staging, production)
- Deployment name input

**ReleaseDetailCard**
- Shows release details
- Metrics (downloads, installs, failures)
- Edit release (description, rollout, mandatory flag)
- Promote to another deployment

---

## 🔄 Key User Flows

### 1. **User Login**
```
/login → Google OAuth → /auth/google/callback → /dashboard
```

### 2. **Create Organization**
```
Dashboard → Create Org Button → Form → Submit → API → Refetch Org List
```

### 3. **Create App**
```
Dashboard → "C" Hotkey or Button → Create App Form → Select Org → Submit → Navigate to App List
```

### 4. **Deploy Release**
```
App Page → Release Tab → Upload Directory → Fill Metadata → Submit → 
  → Create ZIP → Upload to Server → Show Success → Refetch Releases
```

### 5. **Promote Release**
```
App Page → Deployments Tab → Select Deployment → View Releases → 
  → Promote Button → Select Target Deployment → Confirm → Promote
```

### 6. **Manage Collaborators**
```
App Page → Collaborators Tab → 
  → Add: Email + Permission → Submit
  → Update: Change Permission → Confirm
  → Remove: Delete Button → Confirm
```

---

## 🌐 Environment Configuration

### Environment Variables (`.env`)
```bash
# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# DOTA Backend Server URL
DOTA_SERVER_URL=""  # Empty = Mock mode for local development

# AWS S3 (for file uploads)
AWS_S3_BUCKET=""
aws_access_key_id=""
aws_secret_access_key=""

# Optional: GitHub integration
GITHUB_TOKEN=""
GITHUB_OWNER=""
GITHUB_REPO=""
```

### Config Service (`app/.server/services/config.ts`)
- Loads environment variables
- Supports production mode with `VAULT_SERVICE_` prefix
- Provides typed config object

---

## 🧪 Testing

### Test Setup
- **Framework**: Vitest
- **Utilities**: React Testing Library, @testing-library/jest-dom
- **Coverage**: vitest/coverage-v8

### Running Tests
```bash
pnpm test              # Run all tests
pnpm test:coverage     # Run with coverage report
```

### Test Structure
Tests are co-located with components in `__tests__/` folders:
```
components/AppCard/
├── __tests__/
│   ├── AppCard.test.tsx
│   └── __snapshots__/
│       └── AppCard.test.tsx.snap
└── index.tsx
```

---

## 🚀 Development Workflow

### Starting Local Development
```bash
# Install dependencies
pnpm install

# Start dev server (with hot reload)
pnpm dev

# Server runs on http://localhost:3000
```

### Mock Data Mode
When `DOTA_SERVER_URL=""` in `.env`:
- Authentication returns "Dummy User"
- All API calls return mock data
- No backend server needed

### Building for Production
```bash
# Build the app
pnpm build

# Start production server
pnpm start
```

### Code Generation
```bash
# Generate route types (auto-runs on postinstall)
pnpm gen:routes

# Generate version file
pnpm gen:config
```

---

## 📝 Key Concepts

### 1. **CodePush Terminology**

- **Tenant/Organization**: A company or team that owns apps
- **App**: A mobile application (e.g., "MyApp-iOS", "MyApp-Android")
- **Deployment**: An environment for releases (e.g., "Staging", "Production")
- **Release/Package**: A version of code/assets pushed to a deployment
- **Label**: Version identifier for a release (e.g., "v1", "v2")
- **Rollout**: Percentage of users who receive an update (0-100%)
- **Mandatory**: Flag indicating if update is required
- **Promote**: Copy a release from one deployment to another (e.g., Staging → Production)

### 2. **Authentication Strategy**

DOTA supports two authentication methods:

**A. Google OAuth (Users)**
- For dashboard access
- Session-based authentication
- Stored in encrypted cookies

**B. API Keys (CLI/Automation)**
- For programmatic access
- Passed in `api-key` header
- Used by React Native CLI

### 3. **File Upload Flow**

When creating a release:
1. User selects a directory (React Native bundle)
2. Frontend creates a ZIP file using JSZip
3. ZIP is uploaded via multipart/form-data
4. Backend stores in S3 (or file storage)
5. Release metadata stored in database

### 4. **Event-Driven Refetch**

DOTA uses a custom event emitter for cross-component communication:
```typescript
// Emit event to refetch orgs
actions.emit(ACTION_EVENTS.REFETCH_ORGS);

// Listen for refetch event
actions.add(ACTION_EVENTS.REFETCH_ORGS, refetch);
```

---

## 🔧 Common Operations

### Adding a New API Endpoint

1. **Define types** in `Codepush/types.ts`
2. **Add method** to `CodepushService`
3. **Create API route** in `app/routes/api.v1.*.ts`
4. **Create data function** in component's `data/` folder
5. **Create React Query hook** in component's `hooks/` folder
6. **Use in component**

### Creating a New Page

1. **Create route file** in `app/routes/`
2. **Add loader** with `authenticateLoaderRequest()`
3. **Create component** in `app/components/Pages/`
4. **Add to navigation** if needed

### Adding a New Feature Component

1. **Create folder** in `app/components/Pages/components/YourFeature/`
2. **Add subfolders**: `data/`, `hooks/`, `components/` (if needed)
3. **Create `index.tsx`** with main component
4. **Add data fetching** in `data/` and `hooks/`
5. **Import and use** in parent page

---

## 📊 Data Models

### Organization
```typescript
{
  id: string;
  orgName: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### App
```typescript
{
  id: string;
  name: string;
  orgId: string;
  collaborators: Collaborator[];
  deployments: Deployment[];
  createdAt: string;
  updatedAt: string;
}
```

### Deployment
```typescript
{
  id: string;
  name: string; // e.g., "Staging", "Production"
  deploymentKey: string; // Used by React Native app
  appId: string;
  createdAt: string;
  updatedAt: string;
}
```

### Release/Package
```typescript
{
  label: string; // e.g., "v1", "v2"
  appVersion: string;
  description: string;
  packageHash: string;
  blobUrl: string; // S3 URL
  size: number;
  rollout: number; // 0-100
  isMandatory: boolean;
  isDisabled: boolean;
  uploadTime: number;
  releasedBy: string;
  // Metrics
  active: number | null;
  downloaded: number | null;
  failed: number | null;
  installed: number | null;
}
```

### Collaborator
```typescript
{
  id: string;
  email: string;
  permission: "Owner" | "Collaborator"; // Owner has full access
  isCurrentAccount: boolean;
}
```

### Access Key
```typescript
{
  id: string;
  name: string;
  accessKey: string; // Secret key
  description: string;
  createdAt: string;
  createdBy: string;
}
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Invalid URL" Error**
- **Cause**: `DOTA_SERVER_URL` is empty but API method doesn't have mock data
- **Fix**: Add mock data handling to the method in `Codepush/index.ts`

**2. "localStorage is not defined" (SSR)**
- **Cause**: Accessing `localStorage` during server-side rendering
- **Fix**: Use `useEffect` to access `localStorage` only on client-side

**3. Authentication Loop
- **Cause**: Session cookie not being set properly
- **Fix**: Check Google OAuth credentials and callback URL

**4. Release Upload Fails**
- **Cause**: File too large or S3 credentials missing
- **Fix**: Check AWS credentials in `.env` and file size limits

---

## 🎯 Best Practices

1. **Always use authentication wrappers**
   - `authenticateLoaderRequest()` for loaders
   - `authenticateActionRequest()` for actions

2. **Co-locate data fetching with components**
   - Keep `data/` and `hooks/` folders with components
   - Use React Query for caching and refetching

3. **Handle loading and error states**
   - Show skeletons during loading
   - Display user-friendly error messages

4. **Use TypeScript strictly**
   - Define types for all API responses
   - Use `Type` imports for better tree-shaking

5. **Follow Remix conventions**
   - Use loaders for GET requests
   - Use actions for mutations (POST/PUT/DELETE)
   - Return JSON from API routes

6. **Mock data for local development**
   - Add mock data support to all CodepushService methods
   - Ensure development can happen without backend

---

## 🔮 Future Enhancements

Potential improvements to consider:

1. **Real-time Updates**: WebSocket support for live release metrics
2. **Advanced Analytics**: Charts for downloads, install rates, failure rates
3. **A/B Testing**: Percentage-based rollouts with user targeting
4. **Role-Based Access Control**: More granular permissions (read, write, deploy, admin)
5. **Audit Logs**: Track all actions for compliance
6. **Multi-factor Authentication**: Enhanced security
7. **CLI Integration**: Command-line tool for developers
8. **Notification System**: Email/Slack alerts for releases and failures

---

## 📚 Additional Resources

- **Remix Docs**: https://remix.run/docs
- **Mantine UI**: https://mantine.dev
- **React Query**: https://tanstack.com/query/latest
- **CodePush Concept**: https://learn.microsoft.com/en-us/appcenter/distribution/codepush/

---

## 🤝 Contributing

When contributing to DOTA:

1. Follow the existing folder structure
2. Write tests for new components
3. Add TypeScript types for all data structures
4. Update this documentation for major changes
5. Test with mock data mode before connecting to backend

---

**Last Updated**: October 14, 2025
**Document Version**: 1.0

