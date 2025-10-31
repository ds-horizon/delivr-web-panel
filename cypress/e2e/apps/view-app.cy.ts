import { AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';

describe('View App Details', () => {
  let appPage: AppPage;
  const testOrgName = 'Test Organization';
  const testAppName = 'MyTestApp';

  beforeEach(() => {
    appPage = new AppPage();

    // ⚡ Login with session caching
    AuthHelper.login();

    // Mock app details API
    cy.intercept('GET', `**/api/v1/${testOrgName}/apps/${testAppName}`, {
      body: {
        id: 'app-001',
        name: testAppName,
        platform: 'React-Native',
        os: 'iOS',
        organizationId: 'org-001',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    }).as('getAppDetails');

    // Mock deployments
    cy.intercept('GET', `**/api/v1/${testAppName}/deployments`, {
      fixture: 'deployments.json',
    }).as('getDeployments');

    // Mock releases
    cy.intercept('GET', `**/api/v1/${testOrgName}/${testAppName}/*/releases`, {
      fixture: 'releases.json',
    }).as('getReleases');
  });

  it('should display app details correctly', () => {
    appPage.visit(testOrgName, testAppName);

    cy.wait('@getAppDetails');

    // Verify app information is displayed
    appPage.verifyAppName(testAppName);
    cy.contains('React-Native').should('be.visible');
    cy.contains('iOS').should('be.visible');
  });

  it('should display app navigation tabs', () => {
    appPage.visit(testOrgName, testAppName);

    // Verify tabs are visible
    cy.get('[data-testid="deployments-tab"]').should('be.visible');
    cy.get('[data-testid="releases-tab"]').should('be.visible');
    cy.get('[data-testid="collaborators-tab"]').should('be.visible');
  });

  it('should switch between tabs', () => {
    appPage.visit(testOrgName, testAppName);

    // Click on deployments tab
    appPage.goToDeploymentsTab();
    cy.url().should('include', 'deployments');

    // Click on releases tab
    appPage.goToReleasesTab();
    cy.url().should('include', 'releases');

    // Click on collaborators tab
    appPage.goToCollaboratorsTab();
    cy.url().should('include', 'collaborators');
  });

  it('should display deployments list', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.wait('@getDeployments');

    // Verify deployments are displayed
    appPage.verifyDeploymentExists('Production');
    appPage.verifyDeploymentExists('Staging');
  });

  it('should display create deployment button', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.get('[data-testid="create-deployment-btn"]').should('be.visible');
  });

  it('should display create release button', () => {
    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.get('[data-testid="create-release-btn"]').should('be.visible');
  });

  it('should display app metadata', () => {
    appPage.visit(testOrgName, testAppName);

    // Verify metadata is shown
    cy.contains('Created').should('be.visible');
    cy.contains('Last Updated').should('be.visible');
    cy.contains('Platform').should('be.visible');
    cy.contains('OS').should('be.visible');
  });

  it('should handle app not found error', () => {
    // Mock 404 error
    cy.intercept('GET', '**/api/v1/*/apps/NonExistentApp', {
      statusCode: 404,
      body: {
        error: 'App not found',
      },
    }).as('appNotFound');

    cy.visit(`/dashboard/${testOrgName}/NonExistentApp`);

    cy.wait('@appNotFound');

    // Verify error message
    cy.contains('App not found').should('be.visible');
  });

  it('should display empty state when no deployments', () => {
    // Mock empty deployments
    cy.intercept('GET', `**/api/v1/${testAppName}/deployments`, {
      body: {
        deployments: [],
      },
    }).as('getEmptyDeployments');

    appPage.visit(testOrgName, testAppName);
    appPage.goToDeploymentsTab();

    cy.wait('@getEmptyDeployments');

    // Verify empty state
    cy.contains('No deployments found').should('be.visible');
    cy.contains('Create your first deployment').should('be.visible');
  });

  it('should display empty state when no releases', () => {
    // Mock empty releases
    cy.intercept('GET', `**/api/v1/${testOrgName}/${testAppName}/*/releases`, {
      body: {
        releases: [],
      },
    }).as('getEmptyReleases');

    appPage.visit(testOrgName, testAppName);
    appPage.goToReleasesTab();

    cy.wait('@getEmptyReleases');

    // Verify empty state
    cy.contains('No releases found').should('be.visible');
  });

  it('should show loading state while fetching app details', () => {
    // Mock delayed response
    cy.intercept('GET', `**/api/v1/${testOrgName}/apps/${testAppName}`, (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowGetApp');

    appPage.visit(testOrgName, testAppName);

    // Verify loading indicator
    cy.get('[data-testid="loading"]').should('be.visible');

    cy.wait('@slowGetApp');

    // Verify loading is gone
    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should refresh data when navigating back to app', () => {
    appPage.visit(testOrgName, testAppName);

    cy.wait('@getAppDetails');

    // Navigate away
    cy.visit('/dashboard');

    // Navigate back
    appPage.visit(testOrgName, testAppName);

    // Verify API is called again
    cy.wait('@getAppDetails');
  });

  it('should display breadcrumb navigation', () => {
    appPage.visit(testOrgName, testAppName);

    // Verify breadcrumb exists
    cy.get('[data-testid="breadcrumb"]').should('be.visible');
    cy.get('[data-testid="breadcrumb"]').should('contain', testOrgName);
    cy.get('[data-testid="breadcrumb"]').should('contain', testAppName);
  });
});



