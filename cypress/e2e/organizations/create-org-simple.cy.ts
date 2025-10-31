import { AuthHelper } from '../../support/helpers/auth-helper';

describe('Create Organization - Simple Flow', () => {
  beforeEach(() => {
    // Login with session caching
    AuthHelper.login();
  });

  it('should display and open create organization modal', () => {
    cy.visit('/dashboard');
    // Wait for CSS stylesheets to load
    cy.get('link[rel="stylesheet"]', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.document().its('styleSheets.length').should('be.greaterThan', 0);
    cy.wait(1000); // Additional wait for hydration and rendering
    
    // Verify create org button exists and click it
    cy.get('[data-testid="create-org-btn"]').should('be.visible').click();
    
    // Verify modal elements are visible
    cy.contains('Create Organization').should('be.visible');
    cy.get('[data-testid="org-name-input"]').should('exist');
    cy.get('[data-testid="initial-app-name-input"]').should('exist');
    cy.get('[data-testid="submit-org-btn"]').should('exist');
  });

  it('should create organization successfully with force interactions', () => {
    // Mock the API response
    cy.intercept('POST', '**/api/v1/new/apps', {
      statusCode: 201,
      body: {
        id: 'new-app-123',
        name: 'Test App',
        orgId: 'org-123',
        orgName: 'Test Organization',
        createdAt: new Date().toISOString(),
      },
    }).as('createOrg');

    cy.visit('/dashboard');
    // Wait for CSS stylesheets to load
    cy.get('link[rel="stylesheet"]', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.document().its('styleSheets.length').should('be.greaterThan', 0);
    cy.wait(1000); // Additional wait for hydration and rendering
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    cy.wait(500); // Wait for modal animation
    
    // Fill form using force to bypass CSS overlap issues
    const orgName = `TestOrg${Date.now()}`;
    cy.get('[data-testid="org-name-input"]').type(orgName, { force: true });
    cy.get('[data-testid="initial-app-name-input"]').type('MyFirstApp', { force: true });
    
    // Submit
    cy.get('[data-testid="submit-org-btn"]').click({ force: true });
    
    // Wait for API call
    cy.wait('@createOrg').then((interception) => {
      // Verify the request payload
      expect(interception.request.body).to.have.property('orgName', orgName);
      expect(interception.request.body).to.have.property('name', 'MyFirstApp');
    });
    
    // Verify success notification
    cy.contains('Organization created successfully', { timeout: 10000 }).should('be.visible');
  });

  it('should show API error message on failure', () => {
    // Mock API error
    cy.intercept('POST', '**/api/v1/new/apps', {
      statusCode: 500,
      body: {
        message: 'Server error: Failed to create organization',
      },
    }).as('createOrgError');

    cy.visit('/dashboard');
    // Wait for CSS stylesheets to load
    cy.get('link[rel="stylesheet"]', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.document().its('styleSheets.length').should('be.greaterThan', 0);
    cy.wait(1000); // Additional wait for hydration and rendering
    
    // Open modal and fill form
    cy.get('[data-testid="create-org-btn"]').click();
    cy.wait(500);
    
    cy.get('[data-testid="org-name-input"]').type('Test Org', { force: true });
    cy.get('[data-testid="initial-app-name-input"]').type('Test App', { force: true });
    
    // Submit
    cy.get('[data-testid="submit-org-btn"]').click({ force: true });
    
    // Wait for API call
    cy.wait('@createOrgError');
    
    // Verify error notification
    cy.contains('Failed to create organization', { timeout: 10000 }).should('be.visible');
  });

  it('should have submit button disabled initially', () => {
    cy.visit('/dashboard');
    // Wait for CSS stylesheets to load
    cy.get('link[rel="stylesheet"]', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.document().its('styleSheets.length').should('be.greaterThan', 0);
    cy.wait(1000); // Additional wait for hydration and rendering
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    cy.wait(500);
    
    // Submit button should be disabled (empty inputs)
    cy.get('[data-testid="submit-org-btn"]').should('be.disabled');
  });

  it('should enable submit button with valid inputs', () => {
    cy.visit('/dashboard');
    // Wait for CSS stylesheets to load
    cy.get('link[rel="stylesheet"]', { timeout: 10000 }).should('have.length.at.least', 1);
    cy.document().its('styleSheets.length').should('be.greaterThan', 0);
    cy.wait(1000); // Additional wait for hydration and rendering
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    cy.wait(500);
    
    // Fill both inputs
    cy.get('[data-testid="org-name-input"]').type('Test Organization', { force: true });
    cy.get('[data-testid="initial-app-name-input"]').type('Test App', { force: true });
    
    // Submit button should be enabled
    cy.get('[data-testid="submit-org-btn"]').should('not.be.disabled');
  });
});

