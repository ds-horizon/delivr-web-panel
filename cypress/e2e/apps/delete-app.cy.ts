import { AppPage, OrgPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';

describe('Delete App', () => {
  let appPage: AppPage;
  let orgPage: OrgPage;
  const testOrgName = 'Test Organization';
  const testAppName = 'TestApp';

  beforeEach(() => {
    appPage = new AppPage();
    orgPage = new OrgPage();

    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock apps list
    cy.intercept('GET', '**/api/v1/*/apps', {
      fixture: 'apps.json',
    }).as('getApps');
  });

  it('should delete app successfully', () => {
    // Mock delete API
    cy.intercept('DELETE', `**/api/v1/*/${testAppName}`, {
      statusCode: 204,
    }).as('deleteApp');

    // Visit app page
    appPage.visit(testOrgName, testAppName);

    // Click delete button
    appPage.deleteApp();

    // Confirm deletion
    cy.wait('@deleteApp');

    // Verify redirected to organization page
    cy.url().should('include', testOrgName);
    cy.url().should('not.include', testAppName);

    // Verify success message
    cy.checkToast('success', 'App deleted successfully');
  });

  it('should show confirmation dialog before deleting', () => {
    appPage.visit(testOrgName, testAppName);

    // Click delete button
    cy.get('[data-testid="delete-app-btn"]').click();

    // Verify confirmation modal is shown
    cy.contains('Are you sure you want to delete this app?').should('be.visible');
    cy.get('[data-testid="confirm-delete-btn"]').should('be.visible');
    cy.get('[data-testid="cancel-delete-btn"]').should('be.visible');
  });

  it('should cancel app deletion', () => {
    appPage.visit(testOrgName, testAppName);

    // Click delete
    cy.get('[data-testid="delete-app-btn"]').click();

    // Cancel deletion
    cy.get('[data-testid="cancel-delete-btn"]').click();

    // Verify still on app page
    cy.url().should('include', testAppName);
    appPage.verifyAppName(testAppName);
  });

  it('should require typing app name for confirmation', () => {
    appPage.visit(testOrgName, testAppName);

    cy.get('[data-testid="delete-app-btn"]').click();

    // Verify confirmation input field
    cy.get('[data-testid="confirm-app-name-input"]').should('be.visible');
    cy.contains(`Type "${testAppName}" to confirm`).should('be.visible');

    // Try to delete without typing
    cy.get('[data-testid="confirm-delete-btn"]').should('be.disabled');

    // Type incorrect name
    cy.get('[data-testid="confirm-app-name-input"]').type('WrongName');
    cy.get('[data-testid="confirm-delete-btn"]').should('be.disabled');

    // Type correct name
    cy.get('[data-testid="confirm-app-name-input"]').clear().type(testAppName);
    cy.get('[data-testid="confirm-delete-btn"]').should('not.be.disabled');
  });

  it('should show error message on delete failure', () => {
    // Mock API error
    cy.intercept('DELETE', `**/api/v1/*/${testAppName}`, {
      statusCode: 500,
      body: {
        error: 'Failed to delete app',
      },
    }).as('deleteAppError');

    appPage.visit(testOrgName, testAppName);
    appPage.deleteApp();

    cy.wait('@deleteAppError');

    // Verify error message
    cy.contains('Failed to delete app').should('be.visible');

    // Verify still on app page
    cy.url().should('include', testAppName);
  });

  it('should not allow deleting app with active deployments', () => {
    // Mock error for app with deployments
    cy.intercept('DELETE', `**/api/v1/*/${testAppName}`, {
      statusCode: 400,
      body: {
        error: 'Cannot delete app with active deployments',
      },
    }).as('deleteAppWithDeployments');

    appPage.visit(testOrgName, testAppName);
    appPage.deleteApp();

    cy.wait('@deleteAppWithDeployments');

    cy.contains('Cannot delete app with active deployments').should('be.visible');
    cy.contains('Please delete all deployments first').should('be.visible');
  });

  it('should show warning about data loss', () => {
    appPage.visit(testOrgName, testAppName);

    cy.get('[data-testid="delete-app-btn"]').click();

    // Verify warning message
    cy.contains('This action cannot be undone').should('be.visible');
    cy.contains('All releases and deployments will be permanently deleted').should('be.visible');
  });

  it('should close confirmation modal on escape key', () => {
    appPage.visit(testOrgName, testAppName);

    cy.get('[data-testid="delete-app-btn"]').click();

    // Verify modal is open
    cy.get('[data-testid="delete-confirmation-modal"]').should('be.visible');

    // Press escape
    cy.get('body').type('{esc}');

    // Verify modal is closed
    cy.get('[data-testid="delete-confirmation-modal"]').should('not.exist');
  });

  it('should update org page after deleting app', () => {
    cy.intercept('DELETE', `**/api/v1/*/${testAppName}`, {
      statusCode: 204,
    }).as('deleteApp');

    // Start from org page
    orgPage.visit(testOrgName);
    
    // Verify app exists
    orgPage.verifyAppExists(testAppName);

    // Navigate to app and delete
    orgPage.clickApp(testAppName);
    appPage.deleteApp();

    cy.wait('@deleteApp');

    // Verify back on org page without the app
    cy.url().should('include', testOrgName);
    cy.contains(testAppName).should('not.exist');
  });
});

