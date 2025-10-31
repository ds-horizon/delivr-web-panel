import { AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';
import { ApiHelper } from '../../support/helpers/api-helper';

describe('Add Collaborator', () => {
  let appPage: AppPage;
  const testOrgName = 'Test Organization';
  const testAppName = 'MyTestApp';

  beforeEach(() => {
    appPage = new AppPage();

    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock collaborators API
    ApiHelper.mockCollaboratorsApi();
  });

  it('should add a new collaborator successfully', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.wait('@getCollaborators');

    // Click add collaborator button
    cy.get('[data-testid="add-collaborator-btn"]').click();

    // Fill form
    cy.fillField('collaborator-email', 'newuser@example.com');
    cy.get('[data-testid="role-select"]').select('developer');

    // Submit
    cy.get('[data-testid="submit-collaborator-btn"]').click();

    cy.wait('@addCollaborator');

    // Verify success
    cy.checkToast('success', 'Collaborator added successfully');
    cy.contains('newuser@example.com').should('be.visible');
  });

  it('should validate email format', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    // Try invalid email
    cy.fillField('collaborator-email', 'invalid-email');
    cy.get('[data-testid="submit-collaborator-btn"]').click();

    cy.contains('Please enter a valid email address').should('be.visible');
  });

  it('should require email field', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    // Try to submit without email
    cy.get('[data-testid="submit-collaborator-btn"]').click();

    cy.contains('Email is required').should('be.visible');
  });

  it('should list available roles', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    // Verify roles
    cy.get('[data-testid="role-select"]').within(() => {
      cy.contains('Owner').should('exist');
      cy.contains('Admin').should('exist');
      cy.contains('Developer').should('exist');
      cy.contains('Viewer').should('exist');
    });
  });

  it('should set default role to Developer', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    // Verify default selection
    cy.get('[data-testid="role-select"]').should('have.value', 'developer');
  });

  it('should not allow duplicate emails', () => {
    // Mock duplicate error
    cy.intercept('POST', '**/api/v1/*/collaborators', {
      statusCode: 409,
      body: {
        error: 'User is already a collaborator',
      },
    }).as('duplicateCollaborator');

    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    cy.fillField('collaborator-email', 'existing@example.com');
    cy.get('[data-testid="submit-collaborator-btn"]').click();

    cy.wait('@duplicateCollaborator');

    cy.contains('User is already a collaborator').should('be.visible');
  });

  it('should cancel adding collaborator', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    cy.fillField('collaborator-email', 'test@example.com');

    // Cancel
    cy.get('[data-testid="cancel-btn"]').click();

    // Verify modal is closed
    cy.get('[data-testid="collaborator-form-modal"]').should('not.exist');
  });

  it('should show error on API failure', () => {
    cy.intercept('POST', '**/api/v1/*/collaborators', {
      statusCode: 500,
      body: {
        error: 'Failed to add collaborator',
      },
    }).as('addCollaboratorError');

    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    cy.fillField('collaborator-email', 'test@example.com');
    cy.get('[data-testid="submit-collaborator-btn"]').click();

    cy.wait('@addCollaboratorError');

    cy.contains('Failed to add collaborator').should('be.visible');
  });

  it('should display role descriptions', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    // Select role and verify description
    cy.get('[data-testid="role-select"]').select('admin');
    cy.contains('Can manage app settings and collaborators').should('be.visible');

    cy.get('[data-testid="role-select"]').select('developer');
    cy.contains('Can create and manage releases').should('be.visible');

    cy.get('[data-testid="role-select"]').select('viewer');
    cy.contains('Can only view app information').should('be.visible');
  });

  it('should show loading state while adding', () => {
    cy.intercept('POST', '**/api/v1/*/collaborators', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowAdd');

    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    cy.fillField('collaborator-email', 'test@example.com');
    cy.get('[data-testid="submit-collaborator-btn"]').click();

    // Verify loading state
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="submit-collaborator-btn"]').should('be.disabled');

    cy.wait('@slowAdd');

    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should send invitation email', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="add-collaborator-btn"]').click();

    cy.fillField('collaborator-email', 'newuser@example.com');

    // Verify invitation checkbox
    cy.get('[data-testid="send-invitation-checkbox"]').should('be.checked');

    cy.get('[data-testid="submit-collaborator-btn"]').click();

    cy.wait('@addCollaborator').then((interception) => {
      expect(interception.request.body).to.have.property('sendInvitation', true);
    });
  });

  it('should add multiple collaborators', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    // Add first collaborator
    cy.get('[data-testid="add-collaborator-btn"]').click();
    cy.fillField('collaborator-email', 'user1@example.com');
    cy.get('[data-testid="submit-collaborator-btn"]').click();
    cy.wait('@addCollaborator');

    // Add second collaborator
    cy.get('[data-testid="add-collaborator-btn"]').click();
    cy.fillField('collaborator-email', 'user2@example.com');
    cy.get('[data-testid="submit-collaborator-btn"]').click();
    cy.wait('@addCollaborator');

    // Verify both exist
    cy.contains('user1@example.com').should('be.visible');
    cy.contains('user2@example.com').should('be.visible');
  });
});



