import { AuthHelper } from '../../support/helpers/auth-helper';
import { ApiHelper } from '../../support/helpers/api-helper';

describe('Revoke Access Token', () => {
  beforeEach(() => {
    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock tokens API
    ApiHelper.mockTokensApi();
  });

  it('should revoke token successfully', () => {
    cy.visit('/dashboard/tokens');

    cy.wait('@getTokens');

    // Click revoke on a token
    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    // Confirm revocation
    cy.get('[data-testid="confirm-revoke-btn"]').click();

    cy.wait('@deleteToken');

    // Verify success
    cy.checkToast('success', 'Token revoked successfully');
    cy.contains('CI/CD Token').should('not.exist');
  });

  it('should show confirmation dialog before revoking', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    // Verify confirmation modal
    cy.get('[data-testid="revoke-confirmation-modal"]').should('be.visible');
    cy.contains('Are you sure you want to revoke this token?').should('be.visible');
    cy.contains('CI/CD Token').should('be.visible');
    cy.contains('This action cannot be undone').should('be.visible');
  });

  it('should cancel token revocation', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    // Cancel
    cy.get('[data-testid="cancel-revoke-btn"]').click();

    // Verify token still exists
    cy.contains('CI/CD Token').should('be.visible');
  });

  it('should show error on revocation failure', () => {
    cy.intercept('DELETE', '**/api/v1/access-keys/*', {
      statusCode: 500,
      body: {
        error: 'Failed to revoke token',
      },
    }).as('revokeError');

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    cy.get('[data-testid="confirm-revoke-btn"]').click();

    cy.wait('@revokeError');

    cy.contains('Failed to revoke token').should('be.visible');
  });

  it('should display token details in revocation confirmation', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    // Verify details are shown
    cy.get('[data-testid="revoke-confirmation-modal"]').within(() => {
      cy.contains('CI/CD Token').should('be.visible');
      cy.contains('Token for continuous integration').should('be.visible');
    });
  });

  it('should show warning about active services', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    // Verify warning
    cy.contains('Services using this token will lose access').should('be.visible');
  });

  it('should show loading state during revocation', () => {
    cy.intercept('DELETE', '**/api/v1/access-keys/*', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowRevoke');

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    cy.get('[data-testid="confirm-revoke-btn"]').click();

    // Verify loading state
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="confirm-revoke-btn"]').should('be.disabled');

    cy.wait('@slowRevoke');

    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should update token count after revocation', () => {
    cy.visit('/dashboard/tokens');

    // Get initial count
    cy.get('[data-testid="token-count"]').invoke('text').then((initialCount) => {
      // Revoke token
      cy.get('[data-testid="token-CI/CD Token"]')
        .find('[data-testid="revoke-token-btn"]')
        .click();

      cy.get('[data-testid="confirm-revoke-btn"]').click();

      cy.wait('@deleteToken');

      // Verify count decreased
      cy.get('[data-testid="token-count"]').should('not.contain', initialCount);
    });
  });

  it('should display last used date in revocation dialog', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    // Verify last used date is shown
    cy.get('[data-testid="revoke-confirmation-modal"]').within(() => {
      cy.contains('Last used').should('be.visible');
    });
  });

  it('should close confirmation modal on escape key', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    // Press escape
    cy.get('body').type('{esc}');

    // Verify modal is closed
    cy.get('[data-testid="revoke-confirmation-modal"]').should('not.exist');
  });

  it('should revoke multiple tokens', () => {
    cy.visit('/dashboard/tokens');

    // Revoke first token
    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();
    cy.get('[data-testid="confirm-revoke-btn"]').click();
    cy.wait('@deleteToken');

    // Revoke second token
    cy.get('[data-testid="token-Deployment Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();
    cy.get('[data-testid="confirm-revoke-btn"]').click();
    cy.wait('@deleteToken');

    // Verify both are gone
    cy.contains('CI/CD Token').should('not.exist');
    cy.contains('Deployment Token').should('not.exist');
  });

  it('should show expired tokens differently', () => {
    // Mock tokens with expired one
    cy.intercept('GET', '**/api/v1/access-keys', {
      body: {
        tokens: [
          {
            id: 'token-001',
            name: 'Expired Token',
            expiresAt: '2020-01-01T00:00:00.000Z',
            isExpired: true,
          },
        ],
      },
    }).as('getExpiredTokens');

    cy.visit('/dashboard/tokens');

    cy.wait('@getExpiredTokens');

    // Verify expired token is marked
    cy.get('[data-testid="token-Expired Token"]')
      .should('contain', 'Expired');

    // Verify revoke button is disabled or shows different text
    cy.get('[data-testid="token-Expired Token"]')
      .find('[data-testid="delete-token-btn"]')
      .should('be.visible');
  });

  it('should require confirmation typing for important tokens', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="token-CI/CD Token"]')
      .find('[data-testid="revoke-token-btn"]')
      .click();

    // Verify confirmation input
    cy.get('[data-testid="confirm-token-name-input"]').should('be.visible');

    // Try to revoke without typing
    cy.get('[data-testid="confirm-revoke-btn"]').should('be.disabled');

    // Type token name
    cy.get('[data-testid="confirm-token-name-input"]').type('CI/CD Token');

    // Now button should be enabled
    cy.get('[data-testid="confirm-revoke-btn"]').should('not.be.disabled');
  });
});



