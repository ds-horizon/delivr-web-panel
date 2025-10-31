import { AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';
import { ApiHelper } from '../../support/helpers/api-helper';

describe('Create Deployment', () => {
  let appPage: AppPage;
  const testOrgName = 'Test Organization';
  const testAppName = 'MyTestApp';

  beforeEach(() => {
    appPage = new AppPage();

    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock app details
    cy.intercept('GET', `**/api/v1/${testOrgName}/apps/${testAppName}`, {
      fixture: 'apps.json',
    }).as('getAppDetails');
  });

  it('should create a new deployment successfully', () => {
    ApiHelper.mockCreateDeployment();

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    // Fill deployment form
    const deploymentName = `Production-${Date.now()}`;
    cy.fillField('deployment-name', deploymentName);
    cy.get('[data-testid="submit-deployment-btn"]').click();

    // Wait for API call
    cy.wait('@createDeployment');

    // Verify deployment was created
    cy.checkToast('success', 'Deployment created successfully');
    appPage.verifyDeploymentExists(deploymentName);
  });

  it('should generate deployment key automatically', () => {
    ApiHelper.mockCreateDeployment();

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    cy.fillField('deployment-name', 'Production');
    cy.get('[data-testid="submit-deployment-btn"]').click();

    cy.wait('@createDeployment').then((interception) => {
      // Verify response contains deployment key
      expect(interception.response?.body).to.have.property('key');
      expect(interception.response?.body.key).to.be.a('string');
    });
  });

  it('should display generated deployment key in modal', () => {
    ApiHelper.mockCreateDeployment();

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    cy.fillField('deployment-name', 'Production');
    cy.get('[data-testid="submit-deployment-btn"]').click();

    cy.wait('@createDeployment');

    // Verify key is displayed
    cy.get('[data-testid="deployment-key-modal"]').should('be.visible');
    cy.get('[data-testid="deployment-key"]').should('be.visible');
    cy.contains('Save this key').should('be.visible');
  });

  it('should allow copying deployment key', () => {
    ApiHelper.mockCreateDeployment();

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    cy.fillField('deployment-name', 'Production');
    cy.get('[data-testid="submit-deployment-btn"]').click();

    cy.wait('@createDeployment');

    // Click copy button
    cy.get('[data-testid="copy-key-btn"]').click();

    // Verify copied toast
    cy.checkToast('success', 'Key copied to clipboard');
  });

  it('should show validation error for empty deployment name', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    // Try to submit without name
    cy.get('[data-testid="submit-deployment-btn"]').click();

    cy.contains('Deployment name is required').should('be.visible');
  });

  it('should validate deployment name format', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    // Try invalid characters
    cy.fillField('deployment-name', 'Invalid@Deploy#');
    cy.get('[data-testid="submit-deployment-btn"]').click();

    cy.contains('Deployment name can only contain letters, numbers, hyphens, and underscores').should('be.visible');
  });

  it('should not allow duplicate deployment names', () => {
    // Mock duplicate error
    cy.intercept('POST', '**/api/v1/*/deployments', {
      statusCode: 409,
      body: {
        error: 'Deployment name already exists',
      },
    }).as('duplicateDeployment');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    cy.fillField('deployment-name', 'Production');
    cy.get('[data-testid="submit-deployment-btn"]').click();

    cy.wait('@duplicateDeployment');

    cy.contains('Deployment name already exists').should('be.visible');
  });

  it('should create multiple deployments', () => {
    ApiHelper.mockCreateDeployment();

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    // Create Production
    appPage.clickCreateDeployment();
    cy.fillField('deployment-name', 'Production');
    cy.get('[data-testid="submit-deployment-btn"]').click();
    cy.wait('@createDeployment');
    cy.get('[data-testid="close-key-modal-btn"]').click();

    // Create Staging
    appPage.clickCreateDeployment();
    cy.fillField('deployment-name', 'Staging');
    cy.get('[data-testid="submit-deployment-btn"]').click();
    cy.wait('@createDeployment');
    cy.get('[data-testid="close-key-modal-btn"]').click();

    // Verify both exist
    appPage.verifyDeploymentExists('Production');
    appPage.verifyDeploymentExists('Staging');
  });

  it('should cancel deployment creation', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    cy.fillField('deployment-name', 'Production');

    // Cancel
    cy.get('[data-testid="cancel-btn"]').click();

    // Verify modal is closed
    cy.get('[data-testid="deployment-form-modal"]').should('not.exist');
  });

  it('should show error on API failure', () => {
    cy.intercept('POST', '**/api/v1/*/deployments', {
      statusCode: 500,
      body: {
        error: 'Failed to create deployment',
      },
    }).as('createDeploymentError');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    cy.fillField('deployment-name', 'Production');
    cy.get('[data-testid="submit-deployment-btn"]').click();

    cy.wait('@createDeploymentError');

    cy.contains('Failed to create deployment').should('be.visible');
  });

  it('should display loading state during creation', () => {
    // Mock delayed response
    cy.intercept('POST', '**/api/v1/*/deployments', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowCreateDeployment');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    cy.fillField('deployment-name', 'Production');
    cy.get('[data-testid="submit-deployment-btn"]').click();

    // Verify loading state
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="submit-deployment-btn"]').should('be.disabled');

    cy.wait('@slowCreateDeployment');

    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should suggest common deployment names', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();
    appPage.clickCreateDeployment();

    // Verify suggestions are shown
    cy.contains('Production').should('be.visible');
    cy.contains('Staging').should('be.visible');
    cy.contains('Development').should('be.visible');

    // Click on suggestion
    cy.get('[data-testid="suggestion-Production"]').click();

    // Verify input is filled
    cy.get('[data-testid="deployment-name-input"]').should('have.value', 'Production');
  });
});



