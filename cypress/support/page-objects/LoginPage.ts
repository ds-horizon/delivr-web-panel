/**
 * Login Page Object Model
 */

export class LoginPage {
  // Selectors
  private selectors = {
    googleLoginBtn: '[data-testid="google-login-btn"]',
    emailInput: '[data-testid="email-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-btn"]',
    errorMessage: '[data-testid="error-message"]',
    logo: '[data-testid="logo"]',
  };

  /**
   * Visit the login page
   */
  visit() {
    cy.visit('/login');
    return this;
  }

  /**
   * Click Google login button
   */
  clickGoogleLogin() {
    cy.get(this.selectors.googleLoginBtn).click();
    return this;
  }

  /**
   * Enter email
   */
  enterEmail(email: string) {
    cy.get(this.selectors.emailInput).clear().type(email);
    return this;
  }

  /**
   * Enter password
   */
  enterPassword(password: string) {
    cy.get(this.selectors.passwordInput).clear().type(password);
    return this;
  }

  /**
   * Click login button
   */
  clickLogin() {
    cy.get(this.selectors.loginButton).click();
    return this;
  }

  /**
   * Verify login page is displayed
   */
  verifyLoginPage() {
    cy.url().should('include', '/login');
    cy.get(this.selectors.googleLoginBtn).should('be.visible');
    cy.contains('Welcome to Delivr').should('be.visible');
    return this;
  }

  /**
   * Verify error message
   */
  verifyErrorMessage(message: string) {
    cy.get(this.selectors.errorMessage).should('be.visible').and('contain', message);
    return this;
  }

  /**
   * Verify redirect to dashboard
   */
  verifyRedirectToDashboard() {
    cy.url().should('include', '/dashboard');
    return this;
  }
}



