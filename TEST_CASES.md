# Delivr Web Dashboard - E2E Test Cases

## Overview
This document outlines all End-to-End (E2E) test cases for the Delivr Web Dashboard. These tests will be implemented using Playwright to ensure comprehensive coverage of critical user flows.

---

## 1. Authentication & Authorization

### 1.1 Login Flow
- [ ] User can view login page with Google login button
- [ ] User can click Google login button
- [ ] User is redirected to dashboard after successful login
- [ ] Session cookie is created on successful login
- [ ] Logged-in user is automatically redirected to dashboard when accessing login page
- [ ] Mock OAuth works correctly in test mode (no real Google API calls)

### 1.2 Logout Flow
- [ ] User can open user menu from header
- [ ] User can click logout button
- [ ] Session cookie is cleared on logout
- [ ] User is redirected to login page after logout
- [ ] User cannot access dashboard after logout without re-authenticating

### 1.3 Protected Routes
- [ ] Unauthenticated users are redirected to login when accessing protected routes
- [ ] Authenticated users can access all dashboard routes
- [ ] Session persists across page refreshes

---

## 2. Dashboard

### 2.1 Dashboard Loading
- [ ] Dashboard loads without hydration errors
- [ ] Dashboard displays user information in header
- [ ] Dashboard shows navigation menu with all sections
- [ ] Dashboard loads organizations list
- [ ] Dashboard shows loading states appropriately

### 2.2 Navigation
- [ ] User can navigate to Organizations page via sidebar
- [ ] User can navigate to Apps page via sidebar
- [ ] User can navigate to Tokens/Access Keys page via sidebar
- [ ] Active navigation item is highlighted
- [ ] Back/forward browser navigation works correctly

---

## 3. Organizations Management

### 3.1 List Organizations
- [ ] User can view list of all organizations
- [ ] Organization cards display correct information (name, role, app count)
- [ ] Empty state is shown when user has no organizations
- [ ] User's role (Owner/Collaborator) is displayed correctly for each organization

### 3.2 Create Organization
- [ ] User can click "Create Organization" button
- [ ] Create organization modal opens with empty form
- [ ] Organization name field is required
- [ ] Initial app name field is required
- [ ] Form shows validation errors for empty required fields
- [ ] User can successfully create new organization with initial app
- [ ] Success notification is shown after creation
- [ ] Modal closes after successful creation
- [ ] New organization appears in the organizations list
- [ ] User is automatically set as Owner of new organization

### 3.3 Delete Organization
- [ ] User can open delete confirmation dialog for organization they own
- [ ] Delete button is disabled/hidden for organizations where user is not owner
- [ ] User can cancel delete operation
- [ ] User can confirm delete operation
- [ ] Organization is removed from list after successful deletion
- [ ] Success notification is shown after deletion

---

## 4. Apps Management

### 4.1 List Apps
- [ ] User can view list of apps for selected organization
- [ ] App cards display correct information (name, deployments count)
- [ ] Empty state is shown when organization has no apps
- [ ] User can switch between different organizations to view their apps

### 4.2 Create App
- [ ] User can click "Create App" button
- [ ] Create app modal opens with empty form
- [ ] App name field is required
- [ ] Organization can be selected from dropdown
- [ ] User can create app in existing organization
- [ ] User can create app in new organization (creates both)
- [ ] Form shows validation errors for empty required fields
- [ ] User can successfully create new app
- [ ] Default deployments (Staging, Production) are created automatically
- [ ] Success notification is shown after creation
- [ ] User is navigated to app details page after creation

### 4.3 View App Details
- [ ] User can click on app to view details
- [ ] App details page displays app name and metadata
- [ ] App details page shows list of deployments
- [ ] App details page displays collaborators
- [ ] App details page shows settings/configuration options

### 4.4 Update App
- [ ] User can rename app
- [ ] Changes are saved successfully
- [ ] Success notification is shown after update
- [ ] Updated app name appears in apps list

### 4.5 Delete App
- [ ] User can click delete app button
- [ ] Delete confirmation dialog is shown
- [ ] User can cancel delete operation
- [ ] User can confirm delete operation
- [ ] App is removed after successful deletion
- [ ] User is redirected to apps list after deletion
- [ ] Success notification is shown after deletion

---

## 5. Deployments Management

### 5.1 List Deployments
- [ ] User can view deployments for selected app
- [ ] Deployment cards display name, key (masked), and latest release info
- [ ] Default deployments (Staging, Production) are shown for new apps

### 5.2 Create Deployment
- [ ] User can click "Create Deployment" button
- [ ] Create deployment modal opens
- [ ] Deployment name field is required
- [ ] Form shows validation errors for empty fields
- [ ] User can successfully create new deployment
- [ ] Deployment key is generated automatically
- [ ] New deployment appears in deployments list
- [ ] Success notification is shown after creation

### 5.3 View Deployment Details
- [ ] User can view deployment key (masked by default)
- [ ] User can reveal/copy deployment key
- [ ] Deployment details show release history
- [ ] Deployment metrics/statistics are displayed

### 5.4 Delete Deployment
- [ ] User can click delete deployment button
- [ ] Delete confirmation dialog is shown
- [ ] System prevents deleting the last deployment
- [ ] User can successfully delete deployment (if not the last one)
- [ ] Deployment is removed from list after deletion

---

## 6. Releases Management

### 6.1 List Releases
- [ ] User can view release history for selected deployment
- [ ] Release list displays version, description, date, and status
- [ ] Active release is highlighted/indicated
- [ ] Target versions are displayed correctly
- [ ] Rollout percentage is shown
- [ ] Relative time displays correctly without hydration errors
- [ ] Release status (active/disabled) is shown

### 6.2 Create Release
- [ ] User can click "Create Release" button
- [ ] Create release modal opens with upload form
- [ ] User can upload release bundle (.zip file)
- [ ] Target version field is required
- [ ] Description field is optional
- [ ] User can set mandatory flag (true/false)
- [ ] User can set rollout percentage (0-100)
- [ ] Form shows validation errors for invalid inputs
- [ ] Upload progress is displayed during file upload
- [ ] User can successfully create release
- [ ] New release appears in release history
- [ ] Success notification is shown after creation

### 6.3 Update Release
- [ ] User can edit release description
- [ ] User can update rollout percentage
- [ ] User can toggle mandatory flag
- [ ] User can disable/enable release
- [ ] Changes are saved successfully
- [ ] Success notification is shown after update

### 6.4 Rollback Release
- [ ] User can rollback to previous release
- [ ] Rollback confirmation dialog is shown
- [ ] User can confirm rollback
- [ ] Active release indicator updates after rollback
- [ ] Success notification is shown after rollback

### 6.5 Promote Release
- [ ] User can promote release from Staging to Production
- [ ] Promotion confirmation dialog is shown
- [ ] User can confirm promotion
- [ ] New release is created in target deployment
- [ ] Success notification is shown after promotion

---

## 7. Access Keys/Tokens Management

### 7.1 List Access Keys
- [ ] User can view list of all access keys
- [ ] Access key list displays name, created date, expiry, and status
- [ ] Active and expired keys are distinguished visually
- [ ] Last used information is displayed (if available)

### 7.2 Create Access Key
- [ ] User can click "Create Access Key" button
- [ ] Create access key modal opens
- [ ] Key name/friendly name field is required
- [ ] User can set description (optional)
- [ ] User can set TTL (time to live)
- [ ] Form shows validation errors for empty required fields
- [ ] User can successfully create access key
- [ ] Generated key is displayed (one-time view)
- [ ] User can copy key to clipboard
- [ ] Warning about saving key is displayed
- [ ] New key appears in keys list after creation

### 7.3 Revoke Access Key
- [ ] User can click revoke button on access key
- [ ] Revoke confirmation dialog is shown
- [ ] User can confirm revoke operation
- [ ] Key status changes to "Revoked" after revocation
- [ ] Revoked key cannot be used for authentication
- [ ] Success notification is shown after revocation

### 7.4 Delete Access Key
- [ ] User can delete access key
- [ ] Delete confirmation dialog is shown
- [ ] Key is removed from list after deletion
- [ ] Success notification is shown after deletion

---

## 8. Collaborators Management

### 8.1 List Collaborators
- [ ] User can view collaborators for selected app
- [ ] Collaborator list displays email, role, and status
- [ ] Pending invitations are indicated clearly
- [ ] Current user is shown in the list

### 8.2 Add Collaborator
- [ ] User can click "Add Collaborator" button
- [ ] Add collaborator modal opens
- [ ] Email field is required and validated
- [ ] User can select role (Collaborator/Owner)
- [ ] Form shows validation errors for invalid email
- [ ] User can successfully send invitation
- [ ] New collaborator appears in list with "Pending" status
- [ ] Success notification is shown after sending invitation

### 8.3 Update Collaborator Role
- [ ] User can change collaborator role
- [ ] Role update confirmation dialog is shown (for Owner changes)
- [ ] Role is updated successfully
- [ ] Success notification is shown after update

### 8.4 Remove Collaborator
- [ ] User can click remove button on collaborator
- [ ] Remove confirmation dialog is shown
- [ ] System prevents removing the last owner
- [ ] User can successfully remove collaborator
- [ ] Collaborator is removed from list
- [ ] Success notification is shown after removal

---

## 9. UI/UX & Error Handling

### 9.1 Loading States
- [ ] Skeleton loaders are shown during data fetching
- [ ] Loading spinners appear for action buttons during operations
- [ ] Progress bars show upload/download progress

### 9.2 Empty States
- [ ] Empty state is shown for organizations when none exist
- [ ] Empty state is shown for apps when none exist
- [ ] Empty state is shown for releases when none exist
- [ ] Empty states include appropriate call-to-action buttons

### 9.3 Error Handling
- [ ] 401 Unauthorized errors redirect to login
- [ ] 403 Forbidden errors show appropriate error message
- [ ] 404 Not Found errors show "Resource not found" message
- [ ] 500 Server errors show "Something went wrong" message
- [ ] Network timeout errors are handled gracefully
- [ ] Error notifications are displayed with retry options

### 9.4 Notifications
- [ ] Success notifications appear after successful operations
- [ ] Error notifications appear after failed operations
- [ ] Warning notifications appear for important actions
- [ ] Notifications auto-dismiss after appropriate timeout
- [ ] User can manually dismiss notifications

### 9.5 Form Validations
- [ ] Required fields show validation error when empty
- [ ] Email fields validate email format
- [ ] Numeric fields only accept numbers
- [ ] Min/max length validations work correctly
- [ ] Custom validation rules work as expected

---

## 10. Performance & Compatibility

### 10.1 Hydration & SSR
- [ ] No hydration mismatches occur on any page
- [ ] Server-rendered HTML matches client-rendered HTML
- [ ] Relative time displays correctly without hydration errors
- [ ] CSS loads consistently during SSR and client hydration

### 10.2 Responsive Design
- [ ] Dashboard works correctly on desktop (1920x1080)
- [ ] Dashboard works correctly on laptop (1440x900)
- [ ] Dashboard works correctly on tablet (768x1024)
- [ ] Dashboard works correctly on mobile (375x667)

### 10.3 Browser Compatibility
- [ ] All features work in Chrome/Chromium
- [ ] All features work in Firefox
- [ ] All features work in Safari (WebKit)

---

## Priority Level

### P0 - Critical (Must Have)
- All Authentication flows
- Create Organization
- Create App
- List Organizations
- List Apps
- Dashboard loading without errors

### P1 - High (Should Have)
- Create Deployment
- Create Release
- View App Details
- Delete App/Organization
- Error handling

### P2 - Medium (Nice to Have)
- Update Release settings
- Add Collaborators
- Create Access Keys
- Promote Release
- Advanced filtering

### P3 - Low (Future)
- Responsive design edge cases
- Advanced search
- Keyboard shortcuts
- Export/Import features

---

## Test Execution Strategy

1. **Setup Phase**: Ensure mock server is running and expectations are registered
2. **Execution**: Run tests in order of priority (P0 → P1 → P2 → P3)
3. **Reporting**: Generate HTML report after each run
4. **Fix Issues**: Address failures immediately for P0/P1 tests
5. **Regression**: Run full suite before each release

---

## Notes
- All tests use mock OAuth (no real Google authentication)
- Mock server runs on `http://localhost:1080`
- Mock callback service runs on `http://localhost:3001`
- Frontend dev server runs on `http://localhost:3000`
- Tests should be independent and can run in parallel
- Each test should clean up its own data (if applicable)

---

**Document Version**: 1.0  
**Last Updated**: November 2, 2025  
**Total Test Cases**: 150+


