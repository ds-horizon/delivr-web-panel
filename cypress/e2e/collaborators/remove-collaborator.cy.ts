import { AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';
import { ApiHelper } from '../../support/helpers/api-helper';

describe('Remove Collaborator', () => {
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

  it('should remove collaborator successfully', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.wait('@getCollaborators');

    // Click remove on a collaborator
    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    // Confirm removal
    cy.get('[data-testid="confirm-remove-btn"]').click();

    cy.wait('@removeCollaborator');

    // Verify success
    cy.checkToast('success', 'Collaborator removed successfully');
    cy.contains('john.doe@example.com').should('not.exist');
  });

  it('should show confirmation dialog before removing', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    // Verify confirmation modal
    cy.get('[data-testid="remove-confirmation-modal"]').should('be.visible');
    cy.contains('Are you sure you want to remove this collaborator?').should('be.visible');
    cy.contains('john.doe@example.com').should('be.visible');
  });

  it('should cancel collaborator removal', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    // Cancel
    cy.get('[data-testid="cancel-remove-btn"]').click();

    // Verify collaborator still exists
    cy.contains('john.doe@example.com').should('be.visible');
  });

  it('should not allow removing yourself', () => {
    // Mock collaborators with current user
    cy.intercept('GET', '**/api/v1/*/collaborators', {
      body: {
        collaborators: [
          {
            id: 'collab-001',
            email: 'test@delivr.com', // Current user
            name: 'Test User',
            role: 'owner',
          },
          {
            id: 'collab-002',
            email: 'other@example.com',
            role: 'developer',
          },
        ],
      },
    }).as('getCollaboratorsWithSelf');

    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.wait('@getCollaboratorsWithSelf');

    // Verify remove button is disabled for current user
    cy.get('[data-testid="collaborator-test@delivr.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .should('be.disabled');
  });

  it('should not allow removing the last owner', () => {
    // Mock error
    cy.intercept('DELETE', '**/api/v1/*/collaborators/*', {
      statusCode: 400,
      body: {
        error: 'Cannot remove the last owner',
      },
    }).as('removeLastOwner');

    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    cy.get('[data-testid="confirm-remove-btn"]').click();

    cy.wait('@removeLastOwner');

    cy.contains('Cannot remove the last owner').should('be.visible');
  });

  it('should show error on removal failure', () => {
    cy.intercept('DELETE', '**/api/v1/*/collaborators/*', {
      statusCode: 500,
      body: {
        error: 'Failed to remove collaborator',
      },
    }).as('removeError');

    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    cy.get('[data-testid="confirm-remove-btn"]').click();

    cy.wait('@removeError');

    cy.contains('Failed to remove collaborator').should('be.visible');
  });

  it('should display collaborator role in removal confirmation', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    // Verify role is shown
    cy.get('[data-testid="remove-confirmation-modal"]').within(() => {
      cy.contains('john.doe@example.com').should('be.visible');
      cy.contains('developer').should('be.visible');
    });
  });

  it('should show loading state during removal', () => {
    cy.intercept('DELETE', '**/api/v1/*/collaborators/*', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowRemove');

    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    cy.get('[data-testid="confirm-remove-btn"]').click();

    // Verify loading state
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="confirm-remove-btn"]').should('be.disabled');

    cy.wait('@slowRemove');

    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should update collaborator count after removal', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    // Get initial count
    cy.get('[data-testid="collaborator-count"]').invoke('text').then((initialCount) => {
      // Remove collaborator
      cy.get('[data-testid="collaborator-john.doe@example.com"]')
        .find('[data-testid="remove-collaborator-btn"]')
        .click();

      cy.get('[data-testid="confirm-remove-btn"]').click();

      cy.wait('@removeCollaborator');

      // Verify count decreased
      cy.get('[data-testid="collaborator-count"]').should('not.contain', initialCount);
    });
  });

  it('should require proper permissions to remove collaborator', () => {
    // Mock insufficient permissions error
    cy.intercept('DELETE', '**/api/v1/*/collaborators/*', {
      statusCode: 403,
      body: {
        error: 'You do not have permission to remove collaborators',
      },
    }).as('insufficientPermissions');

    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    cy.get('[data-testid="confirm-remove-btn"]').click();

    cy.wait('@insufficientPermissions');

    cy.contains('You do not have permission to remove collaborators').should('be.visible');
  });

  it('should close confirmation modal on escape key', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToCollaboratorsTab();

    cy.get('[data-testid="collaborator-john.doe@example.com"]')
      .find('[data-testid="remove-collaborator-btn"]')
      .click();

    // Press escape
    cy.get('body').type('{esc}');

    // Verify modal is closed
    cy.get('[data-testid="remove-confirmation-modal"]').should('not.exist');
  });
});



