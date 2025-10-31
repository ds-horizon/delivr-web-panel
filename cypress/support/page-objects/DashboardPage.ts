/**
 * Dashboard Page Object Model
 */

export class DashboardPage {
  // Selectors
  private selectors = {
    sidebar: '[data-testid="sidebar"]',
    header: '[data-testid="header"]',
    createOrgBtn: '[data-testid="create-org-btn"]',
    orgList: '[data-testid="org-list"]',
    orgCard: '[data-testid="org-card"]',
    userMenu: '[data-testid="user-menu"]',
    logoutBtn: '[data-testid="logout-btn"]',
    searchInput: '[data-testid="search-input"]',
  };

  /**
   * Visit the dashboard
   */
  visit() {
    cy.visit('/dashboard');
    cy.wait(500); // Ensure Mantine CSS is fully loaded
    return this;
  }

  /**
   * Click create organization button
   */
  clickCreateOrg() {
    cy.get(this.selectors.createOrgBtn).click();
    return this;
  }

  /**
   * Verify organization exists
   */
  verifyOrgExists(orgName: string) {
    cy.get(this.selectors.orgCard).contains(orgName).should('be.visible');
    return this;
  }

  /**
   * Click on organization
   */
  clickOrganization(orgName: string) {
    cy.contains(orgName).click();
    return this;
  }

  /**
   * Open user menu
   */
  openUserMenu() {
    cy.get(this.selectors.userMenu).click();
    return this;
  }

  /**
   * Click logout
   */
  clickLogout() {
    this.openUserMenu();
    cy.get(this.selectors.logoutBtn).click();
    return this;
  }

  /**
   * Search organizations
   */
  searchOrganizations(searchTerm: string) {
    cy.get(this.selectors.searchInput).clear().type(searchTerm);
    return this;
  }

  /**
   * Verify dashboard is displayed
   */
  verifyDashboard() {
    cy.url().should('include', '/dashboard');
    cy.get(this.selectors.sidebar).should('be.visible');
    cy.get(this.selectors.header).should('be.visible');
    return this;
  }

  /**
   * Get organization count
   */
  getOrgCount() {
    return cy.get(this.selectors.orgCard).its('length');
  }
}




