# Create Release - Test Cases Plan

## Test Cases Overview

### ✅ 1. Happy Path (Already Implemented)
- **Test**: `create-release-simple.spec.ts`
- **Description**: Successfully create a release with all valid inputs
- **Steps**: Login → Select Org → Select App → Upload Bundle → Fill Metadata → Set Rollout → Review → Submit
- **Expected**: Success message displayed

### 1.1 Release Appears in Listing After Creation
- **Test**: `create-release-verify-listing.spec.ts`
- **Description**: Verify newly created release appears in the release listing page
- **Steps**: Create release → Navigate to releases list → Verify new release is displayed with correct version, deployment, rollout
- **Expected**: New release appears in the listing with all correct details

---

## 2. Validation Tests

### 2.1 Missing Bundle Upload
- **Test**: `create-release-validation-no-bundle.spec.ts`
- **Description**: Try to proceed without uploading a bundle
- **Steps**: Open create release modal → Click "Next" without uploading
- **Expected**: Error message or disabled "Next" button

### 2.2 Missing Required Fields
- **Test**: `create-release-validation-required-fields.spec.ts`
- **Description**: Try to proceed without filling required fields (App Version)
- **Steps**: Upload bundle → Click "Next" → Leave App Version empty → Try to proceed
- **Expected**: Validation error for required field

### 2.3 Invalid App Version Format
- **Test**: `create-release-validation-version-format.spec.ts`
- **Description**: Enter invalid version format (e.g., "abc", "1.2.3.4.5")
- **Steps**: Upload bundle → Enter invalid version → Try to proceed
- **Expected**: Validation error for version format

### 2.4 Deployment Key Selection Required
- **Test**: `create-release-validation-deployment-key.spec.ts`
- **Description**: Try to proceed without selecting a deployment key
- **Steps**: Upload bundle → Fill version → Skip deployment selection → Try to proceed
- **Expected**: Error or disabled "Next" button

---

## 3. Rollout Percentage Tests

### 3.1 Minimum Rollout (1%)
- **Test**: `create-release-rollout-minimum.spec.ts`
- **Description**: Create release with 1% rollout
- **Steps**: Complete flow with rollout set to 1%
- **Expected**: Release created successfully with 1% rollout

### 3.2 Maximum Rollout (100%)
- **Test**: `create-release-rollout-maximum.spec.ts`
- **Description**: Create release with 100% rollout
- **Steps**: Complete flow with rollout set to 100%
- **Expected**: Release created successfully with 100% rollout

### 3.3 Custom Rollout (50%)
- **Test**: `create-release-rollout-custom.spec.ts`
- **Description**: Create release with 50% rollout
- **Steps**: Complete flow with rollout set to 50%
- **Expected**: Release created successfully with 50% rollout

---

## 4. Navigation & Flow Tests

### 4.1 Cancel at Step 1 (Bundle Upload)
- **Test**: `create-release-cancel-step1.spec.ts`
- **Description**: Cancel the modal during bundle upload step
- **Steps**: Open modal → Click cancel/close
- **Expected**: Modal closes, no release created

### 4.2 Cancel at Step 2 (Metadata)
- **Test**: `create-release-cancel-step2.spec.ts`
- **Description**: Cancel after uploading bundle but before submitting
- **Steps**: Upload bundle → Click "Next" → Click cancel
- **Expected**: Modal closes, no release created

### 4.3 Back Navigation Between Steps
- **Test**: `create-release-navigation-back.spec.ts`
- **Description**: Navigate back between steps and verify data is retained
- **Steps**: Upload bundle → Next → Fill metadata → Go back → Verify bundle is still there
- **Expected**: Data is retained when navigating back

### 4.4 Close and Reopen Modal
- **Test**: `create-release-reopen-modal.spec.ts`
- **Description**: Close modal and reopen to verify it resets
- **Steps**: Upload bundle → Close modal → Reopen modal
- **Expected**: Modal is reset to initial state

---

## 5. Description Field Tests

### 5.1 Long Description
- **Test**: `create-release-long-description.spec.ts`
- **Description**: Create release with a very long description (500+ characters)
- **Steps**: Fill description with long text → Submit
- **Expected**: Release created successfully with full description

### 5.2 Special Characters in Description
- **Test**: `create-release-special-characters.spec.ts`
- **Description**: Use special characters in description (emojis, symbols, etc.)
- **Steps**: Fill description with special chars → Submit
- **Expected**: Release created successfully with special characters preserved

### 5.3 Empty Description (Optional Field)
- **Test**: `create-release-empty-description.spec.ts`
- **Description**: Create release without description
- **Steps**: Skip description field → Submit
- **Expected**: Release created successfully without description

---

## 6. Multiple Deployment Keys

### 6.1 Create Release for Production Deployment
- **Test**: `create-release-production-deployment.spec.ts`
- **Description**: Create release for Production deployment
- **Steps**: Select "Production" deployment → Complete flow
- **Expected**: Release created for Production

### 6.2 Create Release for Staging Deployment
- **Test**: `create-release-staging-deployment.spec.ts`
- **Description**: Create release for Staging deployment
- **Steps**: Select "Staging" deployment → Complete flow
- **Expected**: Release created for Staging

---

## 7. Review Modal Tests

### 7.1 Verify All Details in Review
- **Test**: `create-release-review-verification.spec.ts`
- **Description**: Verify all entered details appear correctly in review modal
- **Steps**: Complete all steps → Verify review shows correct version, deployment, rollout, description
- **Expected**: All details match what was entered

### 7.2 Edit from Review Modal
- **Test**: `create-release-edit-from-review.spec.ts`
- **Description**: Go back to edit after reviewing
- **Steps**: Complete to review → Click "Edit" or "Back" → Modify details → Submit again
- **Expected**: Changes are reflected in final submission

---

## 8. Bundle Upload Tests

### 8.1 Upload Different File Types
- **Test**: `create-release-bundle-file-types.spec.ts`
- **Description**: Upload bundle with various file types (.js, .json, .png, etc.)
- **Steps**: Upload bundle with mixed file types → Submit
- **Expected**: All files are uploaded successfully

### 8.2 Upload Large Bundle
- **Test**: `create-release-large-bundle.spec.ts`
- **Description**: Upload a large bundle (10MB+)
- **Steps**: Upload large bundle → Monitor progress → Submit
- **Expected**: Upload completes successfully (may take longer)

### 8.3 Upload Empty Directory
- **Test**: `create-release-empty-bundle.spec.ts`
- **Description**: Try to upload an empty directory
- **Steps**: Upload empty directory → Try to proceed
- **Expected**: Error message or validation prevents submission

---

## 9. Concurrent Operations

### 9.1 Multiple Releases Same App
- **Test**: `create-release-multiple-sequential.spec.ts`
- **Description**: Create multiple releases sequentially for the same app
- **Steps**: Create release v1.0.0 → Create release v1.0.1 → Create release v1.0.2
- **Expected**: All releases created successfully

---

## 10. Error Handling

### 10.1 Backend Error Simulation
- **Test**: `create-release-backend-error.spec.ts`
- **Description**: Simulate backend error during submission
- **Steps**: Complete flow → Backend returns error
- **Expected**: Error message displayed, user can retry

### 10.2 Duplicate Version Number
- **Test**: `create-release-duplicate-version.spec.ts`
- **Description**: Try to create release with existing version number
- **Steps**: Create release v1.0.0 → Try to create another v1.0.0
- **Expected**: Error message about duplicate version

---

## Priority Order for Implementation

### High Priority (Core Functionality)
1. ✅ Happy Path (Done)
2. **Release Appears in Listing (1.1)** ⭐ NEW
3. Missing Bundle Upload (2.1)
4. Missing Required Fields (2.2)
5. Minimum Rollout (3.1)
6. Maximum Rollout (3.2)
7. Production Deployment (6.1)
8. Staging Deployment (6.2)

### Medium Priority (User Experience)
8. Cancel at Step 1 (4.1)
9. Back Navigation (4.3)
10. Long Description (5.1)
11. Empty Description (5.3)
12. Review Verification (7.1)

### Low Priority (Edge Cases)
13. Invalid Version Format (2.3)
14. Special Characters (5.2)
15. Large Bundle (8.2)
16. Multiple Sequential Releases (9.1)

### Future (Advanced)
17. Backend Error Simulation (10.1)
18. Duplicate Version (10.2)
19. Empty Bundle (8.3)
20. Edit from Review (7.2)

---

## Notes
- Each test should be independent and not rely on previous tests
- Use the existing `test-bundle` fixture for most tests
- Create additional fixtures as needed (large-bundle, empty-bundle, etc.)
- All tests should work with the mock backend
- Tests should clean up after themselves (if applicable)

