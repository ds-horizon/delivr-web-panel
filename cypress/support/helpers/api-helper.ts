/**
 * API Helper Functions
 */

export class ApiHelper {
  /**
   * Mock API endpoints for testing
   */
  static mockEndpoints() {
    // Mock organizations list
    cy.intercept('GET', '**/api/v1/tenants', {
      fixture: 'organizations.json',
    }).as('getOrganizations');

    // Mock apps list
    cy.intercept('GET', '**/api/v1/*/apps', {
      fixture: 'apps.json',
    }).as('getApps');

    // Mock deployments list
    cy.intercept('GET', '**/api/v1/*/deployments', {
      fixture: 'deployments.json',
    }).as('getDeployments');

    // Mock releases list
    cy.intercept('GET', '**/api/v1/*/*/releases', {
      fixture: 'releases.json',
    }).as('getReleases');
  }

  /**
   * Mock successful organization creation
   */
  static mockCreateOrganization() {
    cy.intercept('POST', '**/api/v1/tenants', {
      statusCode: 201,
      body: {
        id: 'org-123',
        name: 'Test Organization',
        createdAt: new Date().toISOString(),
      },
    }).as('createOrganization');
  }

  /**
   * Mock successful app creation
   */
  static mockCreateApp() {
    cy.intercept('POST', '**/api/v1/*/apps', {
      statusCode: 201,
      body: {
        id: 'app-123',
        name: 'Test App',
        platform: 'React-Native',
        os: 'iOS',
        createdAt: new Date().toISOString(),
      },
    }).as('createApp');
  }

  /**
   * Mock successful deployment creation
   */
  static mockCreateDeployment() {
    cy.intercept('POST', '**/api/v1/*/deployments', {
      statusCode: 201,
      body: {
        id: 'deployment-123',
        name: 'Production',
        key: 'deployment-key-123',
        createdAt: new Date().toISOString(),
      },
    }).as('createDeployment');
  }

  /**
   * Mock successful release creation
   */
  static mockCreateRelease() {
    cy.intercept('POST', '**/api/v1/*/*/*/release', {
      statusCode: 201,
      body: {
        id: 'release-123',
        label: 'v1.0.0',
        description: 'Test release',
        isMandatory: false,
        createdAt: new Date().toISOString(),
      },
    }).as('createRelease');
  }

  /**
   * Mock successful token creation
   */
  static mockCreateToken() {
    cy.intercept('POST', '**/api/v1/access-keys', {
      statusCode: 201,
      body: {
        id: 'token-123',
        name: 'Test Token',
        token: 'test-token-value',
        createdAt: new Date().toISOString(),
      },
    }).as('createToken');
  }

  /**
   * Mock API error
   */
  static mockApiError(statusCode: number = 500, message: string = 'Internal Server Error') {
    cy.intercept('**/api/v1/**', {
      statusCode,
      body: {
        error: message,
      },
    }).as('apiError');
  }

  /**
   * Wait for all pending API calls
   */
  static waitForAllApiCalls() {
    cy.wait([
      '@getOrganizations',
      '@getApps',
      '@getDeployments',
      '@getReleases',
    ], { timeout: 10000 });
  }

  /**
   * Verify API was called with correct payload
   */
  static verifyApiCall(alias: string, expectedPayload: any) {
    cy.wait(`@${alias}`).then((interception) => {
      expect(interception.request.body).to.deep.include(expectedPayload);
    });
  }

  /**
   * Mock collaborators API
   */
  static mockCollaboratorsApi() {
    cy.intercept('GET', '**/api/v1/*/collaborators', {
      fixture: 'collaborators.json',
    }).as('getCollaborators');

    cy.intercept('POST', '**/api/v1/*/collaborators', {
      statusCode: 201,
      body: {
        id: 'collab-123',
        email: 'newcollab@example.com',
        role: 'developer',
      },
    }).as('addCollaborator');

    cy.intercept('DELETE', '**/api/v1/*/collaborators/*', {
      statusCode: 204,
    }).as('removeCollaborator');
  }

  /**
   * Mock tokens API
   */
  static mockTokensApi() {
    cy.intercept('GET', '**/api/v1/access-keys', {
      fixture: 'tokens.json',
    }).as('getTokens');

    cy.intercept('DELETE', '**/api/v1/access-keys/*', {
      statusCode: 204,
    }).as('deleteToken');
  }
}

