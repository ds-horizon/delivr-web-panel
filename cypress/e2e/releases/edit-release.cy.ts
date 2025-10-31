import { AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';

describe('Edit Release', () => {
  let appPage: AppPage;
  const testOrgName = 'Test Organization';
  const testAppName = 'MyTestApp';
  const testRelease = 'v1.0.0';

  beforeEach(() => {
    appPage = new AppPage();

    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock releases
    cy.intercept('GET', `**/api/v1/${testOrgName}/${testAppName}/*/releases`, {
      fixture: 'releases.json',
    }).as('getReleases');
  });

  it('should update release description', () => {
    cy.intercept('PATCH', `**/api/v1/*/*/*/releases/${testRelease}`, {
      statusCode: 200,
      body: {
        message: 'Release updated successfully',
      },
    }).as('updateRelease');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    // Click edit on release
    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    // Update description
    cy.get('[data-testid="release-description-input"]')
      .clear()
      .type('Updated description with new features');

    cy.get('[data-testid="save-release-btn"]').click();

    cy.wait('@updateRelease');

    cy.checkToast('success', 'Release updated successfully');
  });

  it('should toggle mandatory flag', () => {
    cy.intercept('PATCH', `**/api/v1/*/*/*/releases/${testRelease}`, {
      statusCode: 200,
    }).as('updateRelease');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    // Toggle mandatory
    cy.get('[data-testid="mandatory-checkbox"]').check();

    cy.get('[data-testid="save-release-btn"]').click();

    cy.wait('@updateRelease').then((interception) => {
      expect(interception.request.body).to.have.property('isMandatory', true);
    });
  });

  it('should update rollout percentage', () => {
    cy.intercept('PATCH', `**/api/v1/*/*/*/releases/${testRelease}`, {
      statusCode: 200,
    }).as('updateRelease');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    // Update rollout
    cy.get('[data-testid="rollout-slider"]').invoke('val', 75).trigger('input');
    cy.get('[data-testid="rollout-display"]').should('contain', '75%');

    cy.get('[data-testid="save-release-btn"]').click();

    cy.wait('@updateRelease').then((interception) => {
      expect(interception.request.body).to.have.property('rollout', 75);
    });
  });

  it('should disable/enable release', () => {
    cy.intercept('PATCH', `**/api/v1/*/*/*/releases/${testRelease}`, {
      statusCode: 200,
    }).as('updateRelease');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    // Disable release
    cy.get('[data-testid="disabled-checkbox"]').check();

    cy.get('[data-testid="save-release-btn"]').click();

    cy.wait('@updateRelease').then((interception) => {
      expect(interception.request.body).to.have.property('isDisabled', true);
    });

    // Verify release is marked as disabled
    cy.get('[data-testid="release-v1.0.0"]')
      .should('contain', 'Disabled');
  });

  it('should cancel edit without saving', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    // Make changes
    cy.get('[data-testid="release-description-input"]')
      .clear()
      .type('New description');

    // Cancel
    cy.get('[data-testid="cancel-btn"]').click();

    // Verify changes not saved
    cy.get('[data-testid="release-v1.0.0"]')
      .should('not.contain', 'New description');
  });

  it('should show validation error for empty description', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    // Clear description
    cy.get('[data-testid="release-description-input"]').clear();

    cy.get('[data-testid="save-release-btn"]').click();

    cy.contains('Description is required').should('be.visible');
  });

  it('should show error on update failure', () => {
    cy.intercept('PATCH', `**/api/v1/*/*/*/releases/${testRelease}`, {
      statusCode: 500,
      body: {
        error: 'Failed to update release',
      },
    }).as('updateError');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    cy.get('[data-testid="release-description-input"]')
      .clear()
      .type('Updated description');

    cy.get('[data-testid="save-release-btn"]').click();

    cy.wait('@updateError');

    cy.contains('Failed to update release').should('be.visible');
  });

  it('should show confirmation when disabling mandatory release', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    // Try to disable a mandatory release
    cy.get('[data-testid="disabled-checkbox"]').check();

    // Verify warning
    cy.contains('This is a mandatory release').should('be.visible');
    cy.contains('Disabling it may affect user experience').should('be.visible');
  });

  it('should validate rollout percentage range', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    // Try to set invalid rollout
    cy.get('[data-testid="rollout-input"]').clear().type('150');

    cy.get('[data-testid="save-release-btn"]').click();

    cy.contains('Rollout percentage must be between 0 and 100').should('be.visible');
  });

  it('should show loading state during save', () => {
    cy.intercept('PATCH', `**/api/v1/*/*/*/releases/${testRelease}`, (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowUpdate');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="release-v1.0.0"]')
      .find('[data-testid="edit-release-btn"]')
      .click();

    cy.get('[data-testid="release-description-input"]')
      .clear()
      .type('Updated');

    cy.get('[data-testid="save-release-btn"]').click();

    // Verify loading state
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="save-release-btn"]').should('be.disabled');

    cy.wait('@slowUpdate');

    cy.get('[data-testid="loading"]').should('not.exist');
  });
});



