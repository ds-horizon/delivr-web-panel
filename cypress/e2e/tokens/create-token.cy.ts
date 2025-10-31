import { AuthHelper } from '../../support/helpers/auth-helper';
import { ApiHelper } from '../../support/helpers/api-helper';

describe('Create Access Token', () => {
  beforeEach(() => {
    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock tokens API
    ApiHelper.mockTokensApi();
  });

  it('should create a new access token successfully', () => {
    ApiHelper.mockCreateToken();

    cy.visit('/dashboard/tokens');

    // Click create token button
    cy.get('[data-testid="create-token-btn"]').click();

    // Fill form
    cy.fillField('token-name', 'CI/CD Token');
    cy.fillField('token-description', 'Token for continuous integration');

    // Submit
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@createToken');

    // Verify success
    cy.checkToast('success', 'Token created successfully');
    cy.contains('CI/CD Token').should('be.visible');
  });

  it('should display generated token', () => {
    ApiHelper.mockCreateToken();

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'API Token');
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@createToken');

    // Verify token is displayed
    cy.get('[data-testid="token-display-modal"]').should('be.visible');
    cy.get('[data-testid="generated-token"]').should('be.visible');
    cy.contains('Save this token').should('be.visible');
    cy.contains('This token will not be shown again').should('be.visible');
  });

  it('should allow copying token to clipboard', () => {
    ApiHelper.mockCreateToken();

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'API Token');
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@createToken');

    // Click copy button
    cy.get('[data-testid="copy-token-btn"]').click();

    // Verify copied toast
    cy.checkToast('success', 'Token copied to clipboard');
  });

  it('should require token name', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();

    // Try to submit without name
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.contains('Token name is required').should('be.visible');
  });

  it('should validate token name length', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();

    // Try very short name
    cy.fillField('token-name', 'AB');
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.contains('Token name must be at least 3 characters').should('be.visible');
  });

  it('should validate token name format', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();

    // Try invalid characters
    cy.fillField('token-name', 'Invalid@Token#Name!');
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.contains('Token name can only contain letters, numbers, hyphens, and underscores').should('be.visible');
  });

  it('should not allow duplicate token names', () => {
    // Mock duplicate error
    cy.intercept('POST', '**/api/v1/access-keys', {
      statusCode: 409,
      body: {
        error: 'Token name already exists',
      },
    }).as('duplicateToken');

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'ExistingToken');
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@duplicateToken');

    cy.contains('Token name already exists').should('be.visible');
  });

  it('should allow optional description', () => {
    ApiHelper.mockCreateToken();

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'API Token');
    // Don't fill description
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@createToken');

    cy.checkToast('success', 'Token created successfully');
  });

  it('should set token expiration date', () => {
    ApiHelper.mockCreateToken();

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'Temporary Token');

    // Set expiration
    cy.get('[data-testid="expiration-date"]').type('2024-12-31');

    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@createToken').then((interception) => {
      expect(interception.request.body).to.have.property('expiresAt');
    });
  });

  it('should create never-expiring token by default', () => {
    ApiHelper.mockCreateToken();

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'Permanent Token');
    // Don't set expiration
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@createToken').then((interception) => {
      expect(interception.request.body.expiresAt).to.be.null;
    });
  });

  it('should cancel token creation', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'Test Token');

    // Cancel
    cy.get('[data-testid="cancel-btn"]').click();

    // Verify modal is closed
    cy.get('[data-testid="token-form-modal"]').should('not.exist');
  });

  it('should show error on API failure', () => {
    cy.intercept('POST', '**/api/v1/access-keys', {
      statusCode: 500,
      body: {
        error: 'Failed to create token',
      },
    }).as('createTokenError');

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'Test Token');
    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@createTokenError');

    cy.contains('Failed to create token').should('be.visible');
  });

  it('should show loading state during creation', () => {
    cy.intercept('POST', '**/api/v1/access-keys', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowCreate');

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'Test Token');
    cy.get('[data-testid="submit-token-btn"]').click();

    // Verify loading state
    cy.get('[data-testid="loading"]').should('be.visible');
    cy.get('[data-testid="submit-token-btn"]').should('be.disabled');

    cy.wait('@slowCreate');

    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should validate expiration date is in the future', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'Test Token');

    // Set past date
    cy.get('[data-testid="expiration-date"]').type('2020-01-01');

    cy.get('[data-testid="submit-token-btn"]').click();

    cy.contains('Expiration date must be in the future').should('be.visible');
  });

  it('should display token scopes/permissions', () => {
    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();

    // Verify scopes are available
    cy.get('[data-testid="scope-read"]').should('be.visible');
    cy.get('[data-testid="scope-write"]').should('be.visible');
    cy.get('[data-testid="scope-delete"]').should('be.visible');
  });

  it('should select token scopes', () => {
    ApiHelper.mockCreateToken();

    cy.visit('/dashboard/tokens');

    cy.get('[data-testid="create-token-btn"]').click();
    cy.fillField('token-name', 'Limited Token');

    // Select specific scopes
    cy.get('[data-testid="scope-read"]').check();
    cy.get('[data-testid="scope-write"]').check();

    cy.get('[data-testid="submit-token-btn"]').click();

    cy.wait('@createToken').then((interception) => {
      expect(interception.request.body.scopes).to.include('read');
      expect(interception.request.body.scopes).to.include('write');
    });
  });
});



