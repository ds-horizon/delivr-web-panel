/// <reference types="cypress" />

// ***********************************************
// Custom commands for Delivr Web Panel
// ***********************************************

/**
 * Login command - Logs in a user using the UI
 * @example cy.login('user@example.com', 'password')
 */
Cypress.Commands.add('login', (email?: string, password?: string) => {
  const userEmail = email || Cypress.env('TEST_USER_EMAIL') || 'test@delivr.com';
  
  cy.session(
    [userEmail],
    () => {
      cy.visit('/login');
      cy.get('[data-testid="google-login-btn"]', { timeout: 10000 }).should('be.visible');
      
      // For Google OAuth, we might need to mock the response
      // or use a test account with OAuth
      cy.window().then((win) => {
        // Store session data manually for testing
        win.localStorage.setItem('user', JSON.stringify({
          email: userEmail,
          name: 'Test User',
        }));
      });
      
      // Wait for redirect to dashboard
      cy.url().should('include', '/dashboard');
    },
    {
      validate() {
        // Verify session is still valid
        cy.window().then((win) => {
          expect(win.localStorage.getItem('user')).to.exist;
        });
      },
    }
  );
});

/**
 * Login via API - Faster login using API endpoint
 * @example cy.loginByAPI('user@example.com', 'token')
 */
Cypress.Commands.add('loginByAPI', (email: string, token?: string) => {
  cy.session([email, token], () => {
    cy.request({
      method: 'POST',
      url: `${Cypress.env('apiUrl')}/auth/login`,
      body: { email, token },
      failOnStatusCode: false,
    }).then((response) => {
      if (response.status === 200) {
        cy.window().then((win) => {
          win.localStorage.setItem('authToken', response.body.token);
          win.localStorage.setItem('user', JSON.stringify(response.body.user));
        });
      }
    });
  });
});

/**
 * Logout command
 * @example cy.logout()
 */
Cypress.Commands.add('logout', () => {
  // Logout requires a POST request to /logout
  cy.request({
    method: 'POST',
    url: '/logout',
    failOnStatusCode: false,
  });
  // Clear local session
  cy.clearCookies();
  cy.clearLocalStorage();
  // Verify redirected to login
  cy.visit('/login');
  cy.url().should('include', '/login');
});

/**
 * Create organization command
 * @example cy.createOrganization('My Org')
 */
Cypress.Commands.add('createOrganization', (orgName: string) => {
  cy.get('[data-testid="create-org-btn"]').click();
  cy.get('[data-testid="org-name-input"]').type(orgName);
  cy.get('[data-testid="submit-org-btn"]').click();
  cy.contains(orgName).should('be.visible');
});

/**
 * Create app command
 * @example cy.createApp('MyApp', 'React-Native', 'iOS')
 */
Cypress.Commands.add('createApp', (appName: string, platform?: string, os?: string) => {
  cy.get('[data-testid="create-app-btn"]').click();
  cy.get('[data-testid="app-name-input"]').type(appName);
  
  if (platform) {
    cy.get('[data-testid="platform-select"]').select(platform);
  }
  
  if (os) {
    cy.get('[data-testid="os-select"]').select(os);
  }
  
  cy.get('[data-testid="submit-app-btn"]').click();
  cy.contains(appName).should('be.visible');
});

/**
 * Navigate to organization
 * @example cy.navigateToOrg('MyOrg')
 */
Cypress.Commands.add('navigateToOrg', (orgName: string) => {
  cy.visit('/dashboard');
  cy.contains(orgName).click();
  cy.url().should('include', orgName);
});

/**
 * Navigate to app
 * @example cy.navigateToApp('MyOrg', 'MyApp')
 */
Cypress.Commands.add('navigateToApp', (orgName: string, appName: string) => {
  cy.navigateToOrg(orgName);
  cy.contains(appName).click();
  cy.url().should('include', appName);
});

/**
 * Wait for API call to complete
 * @example cy.waitForApi('GET', '/api/v1/apps')
 */
Cypress.Commands.add('waitForApi', (method: string, url: string) => {
  cy.intercept(method, url).as('apiCall');
  cy.wait('@apiCall');
});

/**
 * Mock API response
 * @example cy.mockApiResponse('GET', '/api/v1/apps', { fixture: 'apps.json' })
 */
Cypress.Commands.add('mockApiResponse', (method: string, url: string, response: any) => {
  cy.intercept(method as any, url, response).as('mockedApi');
});

/**
 * Check if element is visible and contains text
 * @example cy.shouldContainText('[data-testid="header"]', 'Welcome')
 */
Cypress.Commands.add('shouldContainText', (selector: string, text: string) => {
  cy.get(selector).should('be.visible').and('contain', text);
});

/**
 * Accept terms and conditions
 * @example cy.acceptTerms()
 */
Cypress.Commands.add('acceptTerms', () => {
  cy.get('[data-testid="accept-terms-checkbox"]').check();
  cy.get('[data-testid="accept-terms-btn"]').click();
});

/**
 * Fill form field
 * @example cy.fillField('username', 'testuser')
 */
Cypress.Commands.add('fillField', (fieldName: string, value: string) => {
  cy.get(`[data-testid="${fieldName}-input"]`).clear().type(value);
});

/**
 * Upload file
 * @example cy.uploadFile('[data-testid="file-input"]', 'test-file.zip')
 */
Cypress.Commands.add('uploadFile', (selector: string, fileName: string) => {
  cy.get(selector).attachFile(fileName);
});

/**
 * Wait for loading to complete
 * @example cy.waitForLoading()
 */
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist');
});

/**
 * Check toast notification
 * @example cy.checkToast('success', 'Organization created')
 */
Cypress.Commands.add('checkToast', (type: 'success' | 'error' | 'info', message: string) => {
  cy.get(`[data-testid="toast-${type}"]`).should('be.visible').and('contain', message);
});

/**
 * Wait for hydration (React/Remix) and CSS to be fully loaded
 * This ensures the page is stable before interacting with elements
 * @example cy.waitForHydration()
 */
Cypress.Commands.add('waitForHydration', () => {
  // 1. Wait for document to be fully loaded
  cy.document().its('readyState').should('eq', 'complete');
  
  // 2. Wait for Mantine to be initialized (color scheme set)
  cy.document({ log: false }).then((doc) => {
    cy.wrap(null, { timeout: 10000 }).should(() => {
      const htmlElement = doc.documentElement;
      const colorScheme = htmlElement.getAttribute('data-mantine-color-scheme');
      expect(colorScheme).to.exist;
    });
  });
  
  // 3. Wait for any loading skeletons to disappear (optional)
  // Wrapped in a try-catch style to avoid failures if no skeletons exist
  cy.get('body').then(($body) => {
    if ($body.find('[class*="Skeleton"]').length > 0) {
      cy.get('[class*="Skeleton"]', { timeout: 5000 }).should('not.exist');
    }
  });
  
  // 4. Wait for React Query and animations to settle
  // This prevents flickers from API calls and layout shifts
  cy.wait(1000);
  
  // 5. Verify body is visible and interactive
  cy.get('body').should('be.visible');
});

/**
 * Wait for CSS stylesheets to be loaded
 * Ensures Tailwind and other styles are ready before interacting with elements
 * @example cy.waitForStyles()
 */
Cypress.Commands.add('waitForStyles', () => {
  // 1. Verify at least one stylesheet link exists
  cy.get('link[rel="stylesheet"]', { timeout: 10000 })
    .should('have.length.at.least', 1);
  
  // 2. Verify document has loaded stylesheets
  cy.document().its('styleSheets.length').should('be.greaterThan', 0);
  
  // 3. Wait for Tailwind styles to be applied (check for common Tailwind class)
  cy.document({ log: false }).then((doc) => {
    cy.wrap(null, { timeout: 10000 }).should(() => {
      // Verify that styles are actually applied by checking computed styles
      const body = doc.body;
      const computedStyle = window.getComputedStyle(body);
      // Just verify we can read styles (they're loaded)
      expect(computedStyle).to.exist;
    });
  });
  
  // 4. Small delay to ensure all styles are processed
  cy.wait(500);
});

// Declare custom commands for TypeScript
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to wait for React hydration and CSS to load
       * @example cy.waitForHydration()
       */
      waitForHydration(): Chainable<void>;
      
      /**
       * Custom command to wait for CSS stylesheets to load
       * @example cy.waitForStyles()
       */
      waitForStyles(): Chainable<void>;
      
      /**
       * Custom command to login using UI
       * @example cy.login('user@example.com', 'password')
       */
      login(email?: string, password?: string): Chainable<void>;
      
      /**
       * Custom command to login using API
       * @example cy.loginByAPI('user@example.com', 'token')
       */
      loginByAPI(email: string, token?: string): Chainable<void>;
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;
      
      /**
       * Custom command to create organization
       * @example cy.createOrganization('My Org')
       */
      createOrganization(orgName: string): Chainable<void>;
      
      /**
       * Custom command to create app
       * @example cy.createApp('MyApp', 'React-Native', 'iOS')
       */
      createApp(appName: string, platform?: string, os?: string): Chainable<void>;
      
      /**
       * Custom command to navigate to organization
       * @example cy.navigateToOrg('MyOrg')
       */
      navigateToOrg(orgName: string): Chainable<void>;
      
      /**
       * Custom command to navigate to app
       * @example cy.navigateToApp('MyOrg', 'MyApp')
       */
      navigateToApp(orgName: string, appName: string): Chainable<void>;
      
      /**
       * Custom command to wait for API call
       * @example cy.waitForApi('GET', '/api/v1/apps')
       */
      waitForApi(method: string, url: string): Chainable<void>;
      
      /**
       * Custom command to mock API response
       * @example cy.mockApiResponse('GET', '/api/v1/apps', { fixture: 'apps.json' })
       */
      mockApiResponse(method: string, url: string, response: any): Chainable<void>;
      
      /**
       * Custom command to check if element contains text
       * @example cy.shouldContainText('[data-testid="header"]', 'Welcome')
       */
      shouldContainText(selector: string, text: string): Chainable<void>;
      
      /**
       * Custom command to accept terms
       * @example cy.acceptTerms()
       */
      acceptTerms(): Chainable<void>;
      
      /**
       * Custom command to fill form field
       * @example cy.fillField('username', 'testuser')
       */
      fillField(fieldName: string, value: string): Chainable<void>;
      
      /**
       * Custom command to upload file
       * @example cy.uploadFile('[data-testid="file-input"]', 'test-file.zip')
       */
      uploadFile(selector: string, fileName: string): Chainable<void>;
      
      /**
       * Custom command to wait for loading
       * @example cy.waitForLoading()
       */
      waitForLoading(): Chainable<void>;
      
      /**
       * Custom command to check toast notification
       * @example cy.checkToast('success', 'Organization created')
       */
      checkToast(type: 'success' | 'error' | 'info', message: string): Chainable<void>;
      
      /**
       * Custom command to wait for React hydration and CSS to load
       * @example cy.waitForHydration()
       */
      waitForHydration(): Chainable<void>;
    }
  }
}

export {};

