import { AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';

describe('Promote Deployment', () => {
  let appPage: AppPage;
  const testOrgName = 'Test Organization';
  const testAppName = 'MyTestApp';

  beforeEach(() => {
    appPage = new AppPage();

    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock deployments with releases
    cy.intercept('GET', `**/api/v1/${testAppName}/deployments`, {
      body: {
        deployments: [
          {
            id: 'dep-001',
            name: 'Staging',
            key: 'staging-key',
            latestRelease: 'v1.0.0',
          },
          {
            id: 'dep-002',
            name: 'Production',
            key: 'prod-key',
            latestRelease: 'v0.9.0',
          },
        ],
      },
    }).as('getDeployments');
  });

  it('should promote release from staging to production', () => {
    // Mock promote API
    cy.intercept('POST', '**/api/v1/*/deployments/Staging/promote/Production', {
      statusCode: 200,
      body: {
        message: 'Release promoted successfully',
      },
    }).as('promoteRelease');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    // Click promote button on Staging deployment
    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    // Select target deployment
    cy.get('[data-testid="target-deployment-select"]').select('Production');

    // Confirm promotion
    cy.get('[data-testid="confirm-promote-btn"]').click();

    cy.wait('@promoteRelease');

    // Verify success message
    cy.checkToast('success', 'Release promoted successfully');
  });

  it('should show confirmation dialog before promoting', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    // Verify confirmation modal
    cy.get('[data-testid="promote-modal"]').should('be.visible');
    cy.contains('Promote Release').should('be.visible');
    cy.contains('This will promote v1.0.0').should('be.visible');
  });

  it('should display release details in promotion dialog', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    // Verify release details are shown
    cy.get('[data-testid="promote-modal"]').within(() => {
      cy.contains('v1.0.0').should('be.visible');
      cy.contains('From: Staging').should('be.visible');
      cy.get('[data-testid="target-deployment-select"]').should('be.visible');
    });
  });

  it('should list available target deployments', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    // Verify target options
    cy.get('[data-testid="target-deployment-select"]').within(() => {
      cy.contains('Production').should('exist');
      // Staging should not be in the list (can't promote to itself)
      cy.contains('Staging').should('not.exist');
    });
  });

  it('should cancel promotion', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    // Cancel
    cy.get('[data-testid="cancel-promote-btn"]').click();

    // Verify modal is closed
    cy.get('[data-testid="promote-modal"]').should('not.exist');
  });

  it('should disable promote button when no release available', () => {
    // Mock deployment with no releases
    cy.intercept('GET', `**/api/v1/${testAppName}/deployments`, {
      body: {
        deployments: [
          {
            id: 'dep-001',
            name: 'Staging',
            key: 'staging-key',
            latestRelease: null,
          },
        ],
      },
    }).as('getDeploymentsNoRelease');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.wait('@getDeploymentsNoRelease');

    // Verify promote button is disabled
    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .should('be.disabled');

    // Verify tooltip
    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .trigger('mouseenter');
    cy.contains('No release available to promote').should('be.visible');
  });

  it('should show error on promotion failure', () => {
    cy.intercept('POST', '**/api/v1/*/deployments/Staging/promote/Production', {
      statusCode: 500,
      body: {
        error: 'Failed to promote release',
      },
    }).as('promoteError');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    cy.get('[data-testid="target-deployment-select"]').select('Production');
    cy.get('[data-testid="confirm-promote-btn"]').click();

    cy.wait('@promoteError');

    cy.contains('Failed to promote release').should('be.visible');
  });

  it('should show warning when promoting to production', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    cy.get('[data-testid="target-deployment-select"]').select('Production');

    // Verify warning
    cy.get('[data-testid="production-warning"]').should('be.visible');
    cy.contains('This will affect production users').should('be.visible');
  });

  it('should update deployment list after promotion', () => {
    cy.intercept('POST', '**/api/v1/*/deployments/Staging/promote/Production', {
      statusCode: 200,
    }).as('promoteRelease');

    // Mock updated deployments after promotion
    cy.intercept('GET', `**/api/v1/${testAppName}/deployments`, {
      body: {
        deployments: [
          {
            id: 'dep-001',
            name: 'Staging',
            key: 'staging-key',
            latestRelease: 'v1.0.0',
          },
          {
            id: 'dep-002',
            name: 'Production',
            key: 'prod-key',
            latestRelease: 'v1.0.0', // Updated
          },
        ],
      },
    }).as('getUpdatedDeployments');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    cy.get('[data-testid="target-deployment-select"]').select('Production');
    cy.get('[data-testid="confirm-promote-btn"]').click();

    cy.wait('@promoteRelease');
    cy.wait('@getUpdatedDeployments');

    // Verify Production now shows v1.0.0
    cy.get('[data-testid="deployment-Production"]')
      .should('contain', 'v1.0.0');
  });

  it('should show loading state during promotion', () => {
    cy.intercept('POST', '**/api/v1/*/deployments/Staging/promote/Production', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowPromote');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    cy.get('[data-testid="target-deployment-select"]').select('Production');
    cy.get('[data-testid="confirm-promote-btn"]').click();

    // Verify loading state
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="confirm-promote-btn"]').should('be.disabled');

    cy.wait('@slowPromote');

    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should allow promoting with custom rollout percentage', () => {
    cy.intercept('POST', '**/api/v1/*/deployments/Staging/promote/Production', {
      statusCode: 200,
    }).as('promoteWithRollout');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="deployment-Staging"]')
      .find('[data-testid="promote-btn"]')
      .click();

    cy.get('[data-testid="target-deployment-select"]').select('Production');

    // Set rollout percentage
    cy.get('[data-testid="rollout-percentage"]').clear().type('50');

    cy.get('[data-testid="confirm-promote-btn"]').click();

    cy.wait('@promoteWithRollout').then((interception) => {
      expect(interception.request.body).to.have.property('rollout', 50);
    });
  });
});



