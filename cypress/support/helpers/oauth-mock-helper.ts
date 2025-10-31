/**
 * OAuth Mock Helper
 * Provides utilities for mocking OAuth flows in Cypress tests
 */

export class OAuthMockHelper {
  /**
   * Setup mock OAuth server that intercepts Google OAuth flow
   * This allows testing login without real Google OAuth
   */
  static setupMockOAuthServer(userEmail: string = 'test@delivr.com') {
    // Load mock user data
    cy.fixture('auth/mock-oauth-user.json').then((mockUser) => {
      // Override email if provided
      const testUser = { ...mockUser, email: userEmail };

      // Step 1: Intercept the initial POST to /auth/google
      // This is triggered when user clicks the login button
      cy.intercept('POST', '/auth/google', (req) => {
        // Instead of redirecting to Google, redirect to our mock callback
        req.reply({
          statusCode: 302,
          headers: {
            location: `/auth/google/callback?code=mock-auth-code-${Date.now()}&state=mock-state`
          }
        });
      }).as('mockGoogleAuthInit');

      // Step 2: Intercept the OAuth callback
      // This is where the app receives the auth code and exchanges it for tokens
      cy.intercept('GET', '/auth/google/callback*', (req) => {
        // Simulate successful authentication
        // Set session cookie and redirect to dashboard
        req.reply({
          statusCode: 302,
          headers: {
            'set-cookie': [
              `__session=${this.generateMockSessionToken(testUser)}; Path=/; HttpOnly; SameSite=Lax`,
              `user_email=${testUser.email}; Path=/; SameSite=Lax`
            ],
            location: '/dashboard'
          }
        });
      }).as('mockGoogleAuthCallback');

      // Step 3: Mock the user info endpoint (if your app calls it)
      cy.intercept('GET', '**/api/v1/account/me', {
        statusCode: 200,
        body: testUser
      }).as('mockUserInfo');

      // Step 4: Mock any loader requests to verify authentication
      cy.intercept('GET', '/dashboard*', (req) => {
        // Add the session cookie to the request
        req.continue();
      });
    });
  }

  /**
   * Setup mock OAuth with authenticated session
   * Use this to start tests with user already logged in
   */
  static setupAuthenticatedSession(userEmail: string = 'test@delivr.com') {
    cy.fixture('auth/mock-oauth-user.json').then((mockUser) => {
      const testUser = { ...mockUser, email: userEmail };
      
      // Set session cookie directly
      cy.setCookie('__session', this.generateMockSessionToken(testUser));
      cy.setCookie('user_email', testUser.email);
      
      // Mock user info endpoints
      cy.intercept('GET', '**/api/v1/account/me', {
        statusCode: 200,
        body: testUser
      }).as('mockUserInfo');

      cy.intercept('GET', '**/api/v1/account/organizations', {
        statusCode: 200,
        body: []
      }).as('mockOrganizations');
    });
  }

  /**
   * Generate a mock session token
   */
  private static generateMockSessionToken(user: any): string {
    const payload = {
      userId: user.id,
      email: user.email,
      exp: Date.now() + 3600000 // 1 hour from now
    };
    
    // In a real scenario, this would be a JWT
    // For testing, we just use a base64 encoded string
    return btoa(JSON.stringify(payload));
  }

  /**
   * Clear OAuth session
   */
  static clearSession() {
    cy.clearCookies();
    cy.clearLocalStorage();
  }

  /**
   * Mock failed OAuth response
   */
  static setupFailedOAuthFlow(errorMessage: string = 'authentication_failed') {
    cy.intercept('POST', '/auth/google', (req) => {
      req.reply({
        statusCode: 302,
        headers: {
          location: `/auth/google/callback?error=${errorMessage}`
        }
      });
    }).as('mockGoogleAuthInit');

    cy.intercept('GET', '/auth/google/callback*', (req) => {
      req.reply({
        statusCode: 302,
        headers: {
          location: `/login?error=${errorMessage}`
        }
      });
    }).as('mockGoogleAuthCallbackFailed');
  }

  /**
   * Wait for OAuth flow to complete
   */
  static waitForAuthFlow() {
    cy.wait('@mockGoogleAuthInit', { timeout: 5000 }).its('response.statusCode').should('eq', 302);
    cy.wait('@mockGoogleAuthCallback', { timeout: 5000 }).its('response.statusCode').should('eq', 302);
  }
}

