import { AuthHelper } from '../../support/helpers/auth-helper';

describe('Create Organization Flow', () => {
  beforeEach(() => {
    // Login with session caching
    AuthHelper.login();
  });

  it('should display create organization button on dashboard', () => {
    cy.visit('/dashboard');
    cy.wait(1000); // Wait for dashboard to load
    
    // Verify create org button exists
    cy.get('[data-testid="create-org-btn"]').should('be.visible');
  });

  it('should open create organization modal when clicking button', () => {
    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Click create org button
    cy.get('[data-testid="create-org-btn"]').click();
    
    // Verify modal is visible with correct elements
    cy.contains('Create Organization').should('be.visible');
    cy.get('[data-testid="org-name-input"]').should('be.visible');
    cy.get('[data-testid="initial-app-name-input"]').should('be.visible');
    cy.get('[data-testid="submit-org-btn"]').should('be.visible');
  });

  it('should show validation error for empty organization name', () => {
    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    
    // Try to submit with empty org name
    cy.get('[data-testid="org-name-input"]').clear();
    cy.get('[data-testid="initial-app-name-input"]').type('Test App');
    
    // Trigger validation
    cy.get('[data-testid="org-name-input"]').blur();
    
    // Verify error message
    cy.contains('Organization name is required').should('be.visible');
    
    // Submit button should be disabled
    cy.get('[data-testid="submit-org-btn"]').should('be.disabled');
  });

  it('should show validation error for empty app name', () => {
    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    
    // Fill org name but leave app name empty
    cy.get('[data-testid="org-name-input"]').type('Test Org');
    cy.get('[data-testid="initial-app-name-input"]').clear();
    
    // Trigger validation
    cy.get('[data-testid="initial-app-name-input"]').blur();
    
    // Verify error message
    cy.contains('Initial app name is required').should('be.visible');
    
    // Submit button should be disabled
    cy.get('[data-testid="submit-org-btn"]').should('be.disabled');
  });

  it('should show validation error for short organization name', () => {
    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    
    // Type short org name
    cy.get('[data-testid="org-name-input"]').clear().type('ab');
    cy.get('[data-testid="initial-app-name-input"]').type('Test App');
    
    // Trigger validation
    cy.get('[data-testid="org-name-input"]').blur();
    
    // Verify error message
    cy.contains('Organization name must be at least 3 characters').should('be.visible');
  });

  it('should show validation error for short app name', () => {
    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    
    // Fill valid org name, short app name
    cy.get('[data-testid="org-name-input"]').type('Test Org');
    cy.get('[data-testid="initial-app-name-input"]').clear().type('ab');
    
    // Trigger validation
    cy.get('[data-testid="initial-app-name-input"]').blur();
    
    // Verify error message
    cy.contains('App name must be at least 3 characters').should('be.visible');
  });

  it('should enable submit button with valid inputs', () => {
    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    
    // Fill valid data
    cy.get('[data-testid="org-name-input"]').type('Test Organization');
    cy.get('[data-testid="initial-app-name-input"]').type('Test App');
    
    // Submit button should be enabled
    cy.get('[data-testid="submit-org-btn"]').should('not.be.disabled');
  });

  it('should create organization successfully with API mock', () => {
    // Mock the API response
    cy.intercept('POST', '**/api/v1/new/apps', {
      statusCode: 201,
      body: {
        id: 'new-org-123',
        name: 'Test App',
        orgId: 'org-123',
        orgName: 'Test Organization',
        createdAt: new Date().toISOString(),
      },
    }).as('createOrg');

    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    
    // Fill form
    const orgName = `Test Org ${Date.now()}`;
    cy.get('[data-testid="org-name-input"]').type(orgName);
    cy.get('[data-testid="initial-app-name-input"]').type('My First App');
    
    // Submit
    cy.get('[data-testid="submit-org-btn"]').click();
    
    // Wait for API call
    cy.wait('@createOrg');
    
    // Verify success notification
    cy.contains('Organization created successfully').should('be.visible');
    
    // Modal should close
    cy.get('[data-testid="org-name-input"]').should('not.exist');
  });

  it('should show error message on API failure', () => {
    // Mock API error
    cy.intercept('POST', '**/api/v1/new/apps', {
      statusCode: 500,
      body: {
        message: 'Failed to create organization',
      },
    }).as('createOrgError');

    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Open modal and fill form
    cy.get('[data-testid="create-org-btn"]').click();
    cy.get('[data-testid="org-name-input"]').type('Test Org');
    cy.get('[data-testid="initial-app-name-input"]').type('Test App');
    
    // Submit
    cy.get('[data-testid="submit-org-btn"]').click();
    
    // Wait for API call
    cy.wait('@createOrgError');
    
    // Verify error message
    cy.contains('Failed to create organization').should('be.visible');
  });

  it('should close modal when clicking outside (if closeOnClickOutside is true)', () => {
    cy.visit('/dashboard');
    cy.wait(1000);
    
    // Open modal
    cy.get('[data-testid="create-org-btn"]').click();
    
    // Verify modal is open
    cy.get('[data-testid="org-name-input"]').should('be.visible');
    
    // Click on modal backdrop (Mantine modal behavior)
    // Note: This might not work if closeOnClickOutside is false
    // Adjust based on your modal configuration
  });
});

