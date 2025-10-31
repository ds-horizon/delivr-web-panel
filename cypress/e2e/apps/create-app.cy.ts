import { DashboardPage, OrgPage, AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';
import { ApiHelper } from '../../support/helpers/api-helper';

describe('Create App', () => {
  let orgPage: OrgPage;
  let appPage: AppPage;
  const testOrgName = 'Test Organization';

  beforeEach(() => {
    orgPage = new OrgPage();
    appPage = new AppPage();

    // ⚡ Login with session caching (only logs in once!)
    AuthHelper.login();

    // Mock backend API responses
    cy.intercept('GET', '**/tenants', {
      statusCode: 200,
      body: {
        tenants: [
          {
            name: testOrgName,
            collaborators: { 'test@delivr.com': { permission: 'Owner' } }
          }
        ]
      }
    }).as('getTenants');

    cy.intercept('GET', `**/apps`, {
      statusCode: 200,
      body: {
        apps: []
      }
    }).as('getApps');
  });

  it('should create a new app successfully', () => {
    // Mock create app API
    ApiHelper.mockCreateApp();

    // Visit organization page
    orgPage.visit(testOrgName);
    
    // Click create app button
    orgPage.clickCreateApp();

    // Fill app form
    const appName = `TestApp-${Date.now()}`;
    appPage
      .enterAppName(appName)
      .selectPlatform('React-Native')
      .selectOS('iOS')
      .submitAppForm();

    // Wait for API call
    cy.wait('@createApp');

    // Verify app was created
    cy.url().should('include', appName);
    appPage.verifyAppName(appName);
  });

  it('should create Android app', () => {
    ApiHelper.mockCreateApp();

    appPage.visitCreate(testOrgName);

    const appName = `AndroidApp-${Date.now()}`;
    appPage.createApp(appName, 'React-Native', 'Android');

    cy.wait('@createApp');
    appPage.verifyAppName(appName);
  });

  it('should show validation error for empty app name', () => {
    appPage.visitCreate(testOrgName);

    // Try to submit without app name
    appPage.submitAppForm();

    // Verify validation error
    cy.contains('App name is required').should('be.visible');
  });

  it('should show validation error for invalid app name', () => {
    appPage.visitCreate(testOrgName);

    // Try with invalid characters
    appPage.enterAppName('Invalid@App#Name!');
    appPage.submitAppForm();

    // Verify validation error
    cy.contains('App name can only contain letters, numbers, and hyphens').should('be.visible');
  });

  it('should validate platform selection', () => {
    appPage.visitCreate(testOrgName);

    appPage.enterAppName('TestApp');
    // Don't select platform
    appPage.submitAppForm();

    cy.contains('Platform is required').should('be.visible');
  });

  it('should validate OS selection', () => {
    appPage.visitCreate(testOrgName);

    appPage.enterAppName('TestApp');
    appPage.selectPlatform('React-Native');
    // Don't select OS
    appPage.submitAppForm();

    cy.contains('Operating system is required').should('be.visible');
  });

  it('should cancel app creation', () => {
    appPage.visitCreate(testOrgName);

    appPage.enterAppName('TestApp');
    appPage.selectPlatform('React-Native');

    // Click cancel
    cy.get('[data-testid="cancel-btn"]').click();

    // Verify redirected back to organization page
    cy.url().should('include', testOrgName);
    cy.url().should('not.include', 'create');
  });

  it('should show error message on API failure', () => {
    // Mock API error
    cy.intercept('POST', '**/api/v1/*/apps', {
      statusCode: 500,
      body: {
        error: 'Failed to create app',
      },
    }).as('createAppError');

    appPage.visitCreate(testOrgName);

    appPage.createApp('TestApp', 'React-Native', 'iOS');

    cy.wait('@createAppError');

    // Verify error message
    cy.contains('Failed to create app').should('be.visible');
  });

  it('should not allow duplicate app names', () => {
    // Mock duplicate name error
    cy.intercept('POST', '**/api/v1/*/apps', {
      statusCode: 409,
      body: {
        error: 'App name already exists in this organization',
      },
    }).as('duplicateApp');

    appPage.visitCreate(testOrgName);

    appPage.createApp('ExistingApp', 'React-Native', 'iOS');

    cy.wait('@duplicateApp');

    cy.contains('App name already exists').should('be.visible');
  });

  it('should create multiple apps in the same organization', () => {
    ApiHelper.mockCreateApp();

    // Create first app
    appPage.visitCreate(testOrgName);
    appPage.createApp('App1', 'React-Native', 'iOS');
    cy.wait('@createApp');

    // Create second app
    orgPage.visit(testOrgName);
    orgPage.clickCreateApp();
    appPage.createApp('App2', 'React-Native', 'Android');
    cy.wait('@createApp');

    // Verify both apps exist
    orgPage.visit(testOrgName);
    orgPage.verifyAppExists('App1');
    orgPage.verifyAppExists('App2');
  });

  it('should display app creation form with proper fields', () => {
    appPage.visitCreate(testOrgName);

    // Verify form fields are present
    cy.get('[data-testid="app-name-input"]').should('be.visible');
    cy.get('[data-testid="platform-select"]').should('be.visible');
    cy.get('[data-testid="os-select"]').should('be.visible');
    cy.get('[data-testid="submit-app-btn"]').should('be.visible');
    cy.get('[data-testid="cancel-btn"]').should('be.visible');
  });

  it('should auto-format app name (replace spaces with hyphens)', () => {
    appPage.visitCreate(testOrgName);

    // Type name with spaces
    cy.get('[data-testid="app-name-input"]').type('My Test App');

    // Verify it's auto-formatted
    cy.get('[data-testid="app-name-input"]').should('have.value', 'My-Test-App');
  });

  it('should show loading state during app creation', () => {
    // Mock delayed API response
    cy.intercept('POST', '**/api/v1/*/apps', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowCreateApp');

    appPage.visitCreate(testOrgName);
    appPage.createApp('TestApp', 'React-Native', 'iOS');

    // Verify loading indicator
    cy.get('[data-testid="loading"]').should('be.visible');

    cy.wait('@slowCreateApp');

    // Verify loading is gone
    cy.get('[data-testid="loading"]').should('not.exist');
  });
});

