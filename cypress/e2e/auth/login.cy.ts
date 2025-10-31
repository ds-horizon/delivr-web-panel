import { LoginPage } from '../../support/page-objects';
import { AuthHelper, OAuthMockHelper } from '../../support/helpers';

describe('Login Flow', () => {
  let loginPage: LoginPage;

  beforeEach(() => {
    loginPage = new LoginPage();
    AuthHelper.clearAuth();
  });

  it('should display the login page correctly', () => {
    loginPage
      .visit()
      .verifyLoginPage();

    cy.get('[data-testid="google-login-btn"]').should('be.visible');
  });

  it('should have functional Google login button', () => {
    loginPage.visit();

    // Verify the button exists and is clickable
    cy.get('[data-testid="google-login-btn"]')
      .should('be.visible')
      .should('not.be.disabled')
      .should('contain', 'Continue with Google');

    // Verify the button has the correct attributes
    cy.get('[data-testid="google-login-btn"]')
      .should('have.attr', 'type', 'button');
  });

  it('should complete OAuth login flow with mock server', () => {
    // This test now works with backend test mode enabled!
    loginPage.visit();

    // Click Google login button
    cy.get('[data-testid="google-login-btn"]').click();

    // Should redirect to dashboard after mock OAuth
    cy.url().should('include', '/dashboard', { timeout: 60000 });
    
    // Verify session exists
    cy.getCookie('_session').should('exist');
  });

  it('should persist session after page refresh', () => {
    // First login
    loginPage.visit();
    cy.get('[data-testid="google-login-btn"]').click();
    cy.url().should('include', '/dashboard', { timeout: 60000 });
    
    // Refresh the page
    cy.reload();
    
    // Should still be on dashboard (session persisted)
    cy.url().should('include', '/dashboard');
    cy.getCookie('_session').should('exist');
  });

  it('should redirect to login when not authenticated', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it.skip('should handle failed login gracefully', () => {
    // Note: Requires backend test mode
    // Same as OAuth flow test - needs backend integration
    
    /*
    OAuthMockHelper.setupFailedOAuthFlow('access_denied');
    loginPage.visit();
    cy.get('[data-testid="google-login-btn"]').click();
    cy.url().should('include', '/login');
    cy.url().should('include', 'error=access_denied');
    cy.get('[data-testid="google-login-btn"]').should('be.visible');
    */
  });
});

