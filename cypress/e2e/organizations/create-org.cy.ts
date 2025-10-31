import { DashboardPage, OrgPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';
import { ApiHelper } from '../../support/helpers/api-helper';

describe('Create Organization', () => {
  let dashboardPage: DashboardPage;
  let orgPage: OrgPage;

  beforeEach(() => {
    dashboardPage = new DashboardPage();
    orgPage = new OrgPage();

    // ⚡ Login with session caching (only logs in once!)
    AuthHelper.login();

    // Mock backend API responses
    cy.intercept('GET', '**/tenants', {
      statusCode: 200,
      body: {
        tenants: []
      }
    }).as('getTenants');
  });

  it('should create a new organization successfully', () => {
    // Mock API response
    ApiHelper.mockCreateOrganization();

    dashboardPage.visit();
    orgPage.visitCreate();

    // Fill and submit form
    const orgName = `Test Org ${Date.now()}`;
    orgPage
      .enterOrgName(orgName)
      .submitOrgForm();

    // Verify organization was created
    cy.wait('@createOrganization');
    cy.url().should('include', '/dashboard');
    dashboardPage.verifyOrgExists(orgName);
  });

  it('should show validation error for empty organization name', () => {
    orgPage.visitCreate();
    
    // Try to submit without filling name
    orgPage.submitOrgForm();

    // Verify validation error (adjust based on your implementation)
    cy.contains('Organization name is required').should('be.visible');
  });

  it('should cancel organization creation', () => {
    orgPage.visitCreate();
    
    orgPage.enterOrgName('Test Org');
    
    // Click cancel button
    cy.get('[data-testid="cancel-btn"]').click();

    // Verify redirected back to dashboard
    cy.url().should('include', '/dashboard');
  });

  it('should show error message on API failure', () => {
    // Mock API error
    cy.intercept('POST', '**/api/v1/tenants', {
      statusCode: 500,
      body: {
        error: 'Failed to create organization',
      },
    }).as('createOrgError');

    orgPage.visitCreate();
    
    orgPage
      .enterOrgName('Test Org')
      .submitOrgForm();

    cy.wait('@createOrgError');

    // Verify error message is displayed
    cy.contains('Failed to create organization').should('be.visible');
  });

  it('should not allow duplicate organization names', () => {
    // Mock duplicate name error
    cy.intercept('POST', '**/api/v1/tenants', {
      statusCode: 409,
      body: {
        error: 'Organization name already exists',
      },
    }).as('duplicateOrg');

    orgPage.visitCreate();
    
    orgPage
      .enterOrgName('Existing Org')
      .submitOrgForm();

    cy.wait('@duplicateOrg');

    cy.contains('Organization name already exists').should('be.visible');
  });
});



