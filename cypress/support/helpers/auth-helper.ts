/**
 * Authentication Helper Functions
 */

export class AuthHelper {
  /**
   * Login with session caching (FAST! Only logs in once, then reuses session)
   * Use this in beforeEach() for non-auth tests
   */
  static login(userData?: { email?: string; name?: string; userId?: string }) {
    const email = userData?.email || 'test@delivr.com';
    const name = userData?.name || 'Test User';
    const userId = userData?.userId || 'test-user-id';
    
    cy.session(
      ['authenticated-user', email], // Cache key
      () => {
        // This only runs ONCE per unique email, then cached!
        cy.visit('/login', { timeout: 30000 });
        
        // Wait for login page to fully load and stabilize
        cy.wait(500);
        
        // Find button and click - force click to avoid detachment issues
        cy.get('[data-testid="google-login-btn"]', { timeout: 10000 })
          .should('exist')
          .should('be.visible')
          .click({ force: true }); // Force click to avoid re-render issues
        
        // Wait for dashboard to load (API mocks handled server-side now)
        cy.url({ timeout: 30000 }).should('include', '/dashboard');
        cy.getCookie('_session', { timeout: 10000 }).should('exist');
        
        // Wait for CSS to load, hydration to complete, and styles to be ready
        cy.wait(1500);
      },
      {
        validate() {
          // Just verify cookie exists - don't navigate
          cy.getCookie('_session').should('exist');
        },
        cacheAcrossSpecs: true, // Reuse across different test files!
      }
    );
  }


  /**
   * Setup authenticated session (Legacy - for backward compatibility)
   */
  static setupAuthSession(userData: { email: string; name: string; token?: string }) {
    cy.window().then((win) => {
      win.localStorage.setItem('user', JSON.stringify({
        email: userData.email,
        name: userData.name,
      }));
      
      if (userData.token) {
        win.localStorage.setItem('authToken', userData.token);
      }
    });
  }

  /**
   * Clear authentication
   */
  static clearAuth() {
    cy.clearLocalStorage();
    cy.clearCookies();
  }

  /**
   * Verify user is logged in
   */
  static verifyLoggedIn() {
    cy.getCookie('_session').should('exist');
    cy.url().should('include', '/dashboard');
  }

  /**
   * Verify user is logged out
   */
  static verifyLoggedOut() {
    cy.getCookie('_session').should('not.exist');
    cy.url().should('include', '/login');
  }

  /**
   * Mock Google OAuth callback
   */
  static mockGoogleOAuthCallback(email: string = 'test@delivr.com') {
    cy.intercept('POST', '**/auth/google/callback', {
      statusCode: 200,
      body: {
        user: {
          email,
          name: 'Test User',
          picture: 'https://via.placeholder.com/150',
        },
        token: 'mock-jwt-token',
      },
    }).as('googleAuth');
  }

  /**
   * Accept terms and conditions programmatically
   */
  static acceptTerms() {
    cy.window().then((win) => {
      win.localStorage.setItem('termsAccepted', 'true');
    });
  }
}

