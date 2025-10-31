/**
 * Mock Server Helper for Cypress
 * Provides utilities to interact with the mock backend server during tests
 */

export class MockServerHelper {
  static baseUrl = 'http://localhost:3011';

  /**
   * Check if mock server is healthy
   */
  static checkHealth() {
    cy.request(`${this.baseUrl}/health`)
      .its('body')
      .should('have.property', 'status', 'ok');
  }

  /**
   * Reset mock server state to initial values
   * Use this in beforeEach() to ensure clean state for each test
   */
  static resetState() {
    cy.request('POST', `${this.baseUrl}/test/reset`);
    cy.log('🔄 Mock server state reset');
  }

  /**
   * Get current mock server state (for debugging)
   */
  static getState() {
    return cy.request('GET', `${this.baseUrl}/test/state`).its('body');
  }

  /**
   * Seed: Add an organization
   */
  static addOrganization(org: { id: string; displayName: string; role: 'Owner' | 'Collaborator' }) {
    cy.log(`➕ Adding organization: ${org.displayName}`);
    // This modifies state directly through the test endpoint
    // In real implementation, you'd call the actual API
    return this.getState().then((state: any) => {
      state.organizations.push(org);
    });
  }

  /**
   * Seed: Create an app for testing
   */
  static createApp(data: { 
    name: string; 
    orgId: string; 
    userId?: string;
  }) {
    cy.log(`➕ Creating app: ${data.name}`);
    return cy.request({
      method: 'POST',
      url: `${this.baseUrl}/apps`,
      headers: {
        userId: data.userId || 'test-user-id'
      },
      body: {
        name: data.name,
        orgId: data.orgId
      }
    });
  }

  /**
   * Seed: Create a deployment for testing
   */
  static createDeployment(data: {
    appId: string;
    name: string;
    tenant: string;
    userId?: string;
  }) {
    cy.log(`➕ Creating deployment: ${data.name} for app: ${data.appId}`);
    return cy.request({
      method: 'POST',
      url: `${this.baseUrl}/deployments`,
      headers: {
        userId: data.userId || 'test-user-id',
        tenant: data.tenant
      },
      body: {
        appId: data.appId,
        name: data.name
      }
    });
  }

  /**
   * Seed: Add a collaborator to an app
   */
  static addCollaborator(data: {
    appId: string;
    email: string;
    tenant: string;
    userId?: string;
  }) {
    cy.log(`➕ Adding collaborator: ${data.email} to app: ${data.appId}`);
    return cy.request({
      method: 'POST',
      url: `${this.baseUrl}/collaborators`,
      headers: {
        userId: data.userId || 'test-user-id',
        tenant: data.tenant
      },
      body: {
        appId: data.appId,
        email: data.email
      }
    });
  }

  /**
   * Seed: Create an access key
   */
  static createAccessKey(data: {
    name: string;
    access: 'All' | 'Write' | 'Read';
    userId?: string;
  }) {
    cy.log(`➕ Creating access key: ${data.name}`);
    return cy.request({
      method: 'POST',
      url: `${this.baseUrl}/access-keys`,
      headers: {
        userId: data.userId || 'test-user-id'
      },
      body: {
        name: data.name,
        access: data.access
      }
    });
  }

  /**
   * Verify: Check that an organization exists
   */
  static verifyOrganizationExists(displayName: string) {
    cy.request({
      method: 'GET',
      url: `${this.baseUrl}/tenants`,
      headers: {
        userId: 'test-user-id'
      }
    })
      .its('body.organisations')
      .should('be.an', 'array')
      .then((orgs: any[]) => {
        const found = orgs.some(o => o.displayName === displayName);
        expect(found, `Organization "${displayName}" should exist`).to.be.true;
      });
  }

  /**
   * Verify: Check that an app exists
   */
  static verifyAppExists(appName: string, tenant: string) {
    cy.request({
      method: 'GET',
      url: `${this.baseUrl}/apps`,
      headers: {
        userId: 'test-user-id',
        tenant
      }
    })
      .its('body.apps')
      .should('be.an', 'array')
      .then((apps: any[]) => {
        const found = apps.some(a => a.name === appName);
        expect(found, `App "${appName}" should exist`).to.be.true;
      });
  }

  /**
   * Verify: Check that a deployment exists
   */
  static verifyDeploymentExists(appId: string, deploymentName: string, tenant: string) {
    cy.request({
      method: 'GET',
      url: `${this.baseUrl}/deployments?appId=${appId}`,
      headers: {
        userId: 'test-user-id',
        tenant
      }
    })
      .its('body.deployments')
      .should('be.an', 'array')
      .then((deployments: any[]) => {
        const found = deployments.some(d => d.name === deploymentName);
        expect(found, `Deployment "${deploymentName}" should exist`).to.be.true;
      });
  }
}

