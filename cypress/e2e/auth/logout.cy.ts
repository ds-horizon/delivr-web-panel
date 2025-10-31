import { DashboardPage } from '../../support/page-objects';
import { AuthHelper } from '../../support/helpers/auth-helper';

describe('Logout Flow', () => {
  let dashboardPage: DashboardPage;

  beforeEach(() => {
    dashboardPage = new DashboardPage();
    AuthHelper.login();
  });

  it('should logout successfully from user menu', () => {
    // Visit dashboard
    dashboardPage.visit();

    // Click on user menu (PJ avatar)
    cy.get('[data-testid="user-menu"]').click();

    // Verify dropdown is visible
    cy.get('[data-testid="user-dropdown"]').should('be.visible');

    // Click logout button
    cy.get('[data-testid="logout-btn"]').click();

    // Verify user is logged out and redirected to login
    cy.url().should('include', '/login');

    // Verify session cookie is cleared
    cy.getCookie('_session').should('not.exist');
  });

  it('should not allow accessing dashboard after logout', () => {
    // Visit dashboard
    dashboardPage.visit();

    // Logout
    cy.get('[data-testid="user-menu"]').click();
    cy.get('[data-testid="logout-btn"]').click();

    // Try to access dashboard
    cy.visit('/dashboard');

    // Should redirect back to login
    cy.url().should('include', '/login');
  });
});
