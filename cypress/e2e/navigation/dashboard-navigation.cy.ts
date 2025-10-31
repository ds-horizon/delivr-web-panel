import { DashboardPage, OrgPage, AppPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';

describe('Dashboard Navigation', () => {
  let dashboardPage: DashboardPage;
  let orgPage: OrgPage;
  let appPage: AppPage;

  beforeEach(() => {
    dashboardPage = new DashboardPage();
    orgPage = new OrgPage();
    appPage = new AppPage();

    // ⚡ Login with session caching (only logs in once!)
    AuthHelper.login();

    // Mock backend API responses
    cy.intercept('GET', '**/tenants', {
      statusCode: 200,
      body: {
        tenants: [
          { name: 'Test Organization 1', collaborators: {} },
          { name: 'Test Organization 2', collaborators: {} }
        ]
      }
    }).as('getTenants');
  });

  it('should display sidebar navigation', () => {
    dashboardPage.visit();

    cy.get('[data-testid="sidebar"]').should('be.visible');
    cy.get('[data-testid="sidebar"]').within(() => {
      cy.contains('Dashboard').should('be.visible');
      cy.contains('Organizations').should('be.visible');
      cy.contains('Tokens').should('be.visible');
    });
  });

  it('should navigate to organizations page', () => {
    dashboardPage.visit();

    cy.get('[data-testid="nav-organizations"]').click();

    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="org-list"]').should('be.visible');
  });

  it('should navigate to tokens page', () => {
    dashboardPage.visit();

    cy.get('[data-testid="nav-tokens"]').click();

    cy.url().should('include', '/dashboard/tokens');
  });

  it('should highlight active nav item', () => {
    dashboardPage.visit();

    cy.get('[data-testid="nav-organizations"]').should('have.class', 'active');

    cy.get('[data-testid="nav-tokens"]').click();

    cy.get('[data-testid="nav-tokens"]').should('have.class', 'active');
    cy.get('[data-testid="nav-organizations"]').should('not.have.class', 'active');
  });

  it('should display user menu', () => {
    dashboardPage.visit();

    cy.get('[data-testid="user-menu"]').should('be.visible');
    cy.get('[data-testid="user-menu"]').should('contain', 'Test User');
  });

  it('should open user dropdown', () => {
    dashboardPage.visit();

    dashboardPage.openUserMenu();

    cy.get('[data-testid="user-dropdown"]').should('be.visible');
    cy.contains('Profile').should('be.visible');
    cy.contains('Settings').should('be.visible');
    cy.contains('Logout').should('be.visible');
  });

  it('should logout from user menu', () => {
    dashboardPage.visit();

    dashboardPage.clickLogout();

    cy.url().should('include', '/login');
    AuthHelper.verifyLoggedOut();
  });

  it('should display breadcrumb navigation', () => {
    const orgName = 'Test Organization 1';
    orgPage.visit(orgName);

    cy.get('[data-testid="breadcrumb"]').should('be.visible');
    cy.get('[data-testid="breadcrumb"]').should('contain', 'Dashboard');
    cy.get('[data-testid="breadcrumb"]').should('contain', orgName);
  });

  it('should navigate using breadcrumbs', () => {
    const orgName = 'Test Organization 1';
    const appName = 'MyTestApp';

    // Mock app details
    cy.intercept('GET', `**/api/v1/${orgName}/apps/${appName}`, {
      fixture: 'apps.json',
    }).as('getAppDetails');

    appPage.visit(orgName, appName);

    // Click on org in breadcrumb
    cy.get('[data-testid="breadcrumb"]').contains(orgName).click();

    cy.url().should('include', orgName);
    cy.url().should('not.include', appName);
  });

  it('should display search bar', () => {
    dashboardPage.visit();

    cy.get('[data-testid="search-input"]').should('be.visible');
  });

  it('should search organizations', () => {
    dashboardPage.visit();

    cy.wait('@getOrganizations');

    dashboardPage.searchOrganizations('Test Organization 1');

    cy.contains('Test Organization 1').should('be.visible');
    cy.contains('Test Organization 2').should('not.be.visible');
  });

  it('should show logo and link to home', () => {
    dashboardPage.visit();

    cy.get('[data-testid="logo"]').should('be.visible');
    cy.get('[data-testid="logo"]').click();

    cy.url().should('eq', `${Cypress.config('baseUrl')}/dashboard`);
  });

  it('should display notifications icon', () => {
    dashboardPage.visit();

    cy.get('[data-testid="notifications-icon"]').should('be.visible');
  });

  it('should open notifications panel', () => {
    dashboardPage.visit();

    cy.get('[data-testid="notifications-icon"]').click();

    cy.get('[data-testid="notifications-panel"]').should('be.visible');
  });

  it('should be responsive and show mobile menu', () => {
    cy.viewport('iphone-x');

    dashboardPage.visit();

    // Verify mobile menu button is visible
    cy.get('[data-testid="mobile-menu-btn"]').should('be.visible');

    // Open mobile menu
    cy.get('[data-testid="mobile-menu-btn"]').click();

    // Verify sidebar is visible
    cy.get('[data-testid="sidebar"]').should('be.visible');
  });

  it('should collapse/expand sidebar', () => {
    dashboardPage.visit();

    // Click collapse button
    cy.get('[data-testid="collapse-sidebar-btn"]').click();

    // Verify sidebar is collapsed
    cy.get('[data-testid="sidebar"]').should('have.class', 'collapsed');

    // Click expand button
    cy.get('[data-testid="expand-sidebar-btn"]').click();

    // Verify sidebar is expanded
    cy.get('[data-testid="sidebar"]').should('not.have.class', 'collapsed');
  });

  it('should navigate back using browser back button', () => {
    const orgName = 'Test Organization 1';

    dashboardPage.visit();
    orgPage.visit(orgName);

    // Verify we're on org page
    cy.url().should('include', orgName);

    // Go back
    cy.go('back');

    // Verify we're back on dashboard
    cy.url().should('eq', `${Cypress.config('baseUrl')}/dashboard`);
  });

  it('should navigate forward using browser forward button', () => {
    const orgName = 'Test Organization 1';

    dashboardPage.visit();
    orgPage.visit(orgName);
    cy.go('back');

    // Verify we're on dashboard
    cy.url().should('not.include', orgName);

    // Go forward
    cy.go('forward');

    // Verify we're back on org page
    cy.url().should('include', orgName);
  });

  it('should show loading spinner during navigation', () => {
    // Mock delayed response
    cy.intercept('GET', '**/api/v1/tenants', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000);
      });
    }).as('slowGetOrgs');

    dashboardPage.visit();

    cy.get('[data-testid="loading"]').should('be.visible');

    cy.wait('@slowGetOrgs');

    cy.get('[data-testid="loading"]').should('not.exist');
  });

  it('should maintain scroll position when navigating back', () => {
    dashboardPage.visit();

    cy.wait('@getOrganizations');

    // Scroll down
    cy.scrollTo('bottom');

    // Get scroll position
    cy.window().then((win) => {
      const scrollY = win.scrollY;

      // Navigate away
      cy.visit('/dashboard/tokens');

      // Navigate back
      cy.visit('/dashboard');

      // Verify scroll position is restored (approximately)
      cy.window().its('scrollY').should('be.gte', scrollY - 50);
    });
  });
});



