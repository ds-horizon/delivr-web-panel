import { AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';
import { ApiHelper } from '../../support/helpers/api-helper';

describe('Create Release', () => {
  let appPage: AppPage;
  const testOrgName = 'Test Organization';
  const testAppName = 'MyTestApp';
  const testDeployment = 'Production';

  beforeEach(() => {
    appPage = new AppPage();

    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock app and deployments
    cy.intercept('GET', `**/api/v1/${testOrgName}/apps/${testAppName}`, {
      fixture: 'apps.json',
    }).as('getAppDetails');

    cy.intercept('GET', `**/api/v1/${testAppName}/deployments`, {
      fixture: 'deployments.json',
    }).as('getDeployments');
  });

  it('should create a new release successfully', () => {
    ApiHelper.mockCreateRelease();

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    // Fill release form
    cy.fillField('release-version', 'v1.0.0');
    cy.fillField('release-description', 'Initial release with new features');
    cy.get('[data-testid="deployment-select"]').select(testDeployment);
    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');

    // Submit
    cy.get('[data-testid="submit-release-btn"]').click();

    cy.wait('@createRelease');

    // Verify success
    cy.checkToast('success', 'Release created successfully');
    appPage.verifyReleaseExists('v1.0.0');
  });

  it('should show file upload progress', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.fillField('release-version', 'v1.0.0');
    cy.get('[data-testid="deployment-select"]').select(testDeployment);

    // Upload file
    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');

    // Verify upload progress
    cy.get('[data-testid="upload-progress"]').should('be.visible');
    cy.get('[data-testid="progress-bar"]').should('be.visible');
  });

  it('should validate file size limit', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    // Try to upload large file (mock)
    cy.get('[data-testid="release-file-input"]').then((input) => {
      const largeFile = new File([''], 'large-file.zip', {
        type: 'application/zip',
      });
      Object.defineProperty(largeFile, 'size', { value: 100 * 1024 * 1024 }); // 100MB

      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(largeFile);
      (input[0] as HTMLInputElement).files = dataTransfer.files;
    });

    // Verify error message
    cy.contains('File size must be less than 50MB').should('be.visible');
  });

  it('should validate file type', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    // Try to upload invalid file type
    cy.get('[data-testid="release-file-input"]').attachFile('invalid-file.txt');

    cy.contains('Only .zip and .ipa files are allowed').should('be.visible');
  });

  it('should require mandatory fields', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    // Try to submit without filling required fields
    cy.get('[data-testid="submit-release-btn"]').click();

    // Verify validation errors
    cy.contains('Version is required').should('be.visible');
    cy.contains('Deployment is required').should('be.visible');
    cy.contains('Release file is required').should('be.visible');
  });

  it('should validate version format', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    // Try invalid version formats
    cy.fillField('release-version', 'invalid');
    cy.get('[data-testid="submit-release-btn"]').click();

    cy.contains('Version must follow semver format (e.g., v1.0.0)').should('be.visible');
  });

  it('should set release as mandatory', () => {
    ApiHelper.mockCreateRelease();

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.fillField('release-version', 'v2.0.0');
    cy.get('[data-testid="deployment-select"]').select(testDeployment);
    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');

    // Mark as mandatory
    cy.get('[data-testid="mandatory-checkbox"]').check();

    cy.get('[data-testid="submit-release-btn"]').click();

    cy.wait('@createRelease').then((interception) => {
      expect(interception.request.body).to.have.property('isMandatory', true);
    });
  });

  it('should set rollout percentage', () => {
    ApiHelper.mockCreateRelease();

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.fillField('release-version', 'v2.0.0');
    cy.get('[data-testid="deployment-select"]').select(testDeployment);
    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');

    // Set rollout percentage
    cy.get('[data-testid="rollout-slider"]').invoke('val', 50).trigger('input');

    cy.get('[data-testid="submit-release-btn"]').click();

    cy.wait('@createRelease').then((interception) => {
      expect(interception.request.body).to.have.property('rollout', 50);
    });
  });

  it('should cancel release creation', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.fillField('release-version', 'v1.0.0');

    // Cancel
    cy.get('[data-testid="cancel-btn"]').click();

    // Verify modal is closed
    cy.get('[data-testid="release-form-modal"]').should('not.exist');
  });

  it('should show error on API failure', () => {
    cy.intercept('POST', '**/api/v1/*/*/*/release', {
      statusCode: 500,
      body: {
        error: 'Failed to create release',
      },
    }).as('createReleaseError');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.fillField('release-version', 'v1.0.0');
    cy.get('[data-testid="deployment-select"]').select(testDeployment);
    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');
    cy.get('[data-testid="submit-release-btn"]').click();

    cy.wait('@createReleaseError');

    cy.contains('Failed to create release').should('be.visible');
  });

  it('should not allow duplicate version in same deployment', () => {
    cy.intercept('POST', '**/api/v1/*/*/*/release', {
      statusCode: 409,
      body: {
        error: 'Version already exists in this deployment',
      },
    }).as('duplicateVersion');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.fillField('release-version', 'v1.0.0');
    cy.get('[data-testid="deployment-select"]').select(testDeployment);
    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');
    cy.get('[data-testid="submit-release-btn"]').click();

    cy.wait('@duplicateVersion');

    cy.contains('Version already exists').should('be.visible');
  });

  it('should show loading state during upload', () => {
    cy.intercept('POST', '**/api/v1/*/*/*/release', (req) => {
      req.on('response', (res) => {
        res.setDelay(3000);
      });
    }).as('slowUpload');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.fillField('release-version', 'v1.0.0');
    cy.get('[data-testid="deployment-select"]').select(testDeployment);
    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');
    cy.get('[data-testid="submit-release-btn"]').click();

    // Verify loading state
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="submit-release-btn"]').should('be.disabled');

    cy.wait('@slowUpload');

    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should display file preview before upload', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');

    // Verify file preview
    cy.get('[data-testid="file-preview"]').should('be.visible');
    cy.contains('test-release.zip').should('be.visible');
    cy.get('[data-testid="file-size"]').should('be.visible');
    cy.get('[data-testid="remove-file-btn"]').should('be.visible');
  });

  it('should allow removing uploaded file', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();
    appPage.clickCreateRelease();

    cy.uploadFile('[data-testid="release-file-input"]', 'test-release.zip');

    // Remove file
    cy.get('[data-testid="remove-file-btn"]').click();

    // Verify file is removed
    cy.get('[data-testid="file-preview"]').should('not.exist');
  });
});



