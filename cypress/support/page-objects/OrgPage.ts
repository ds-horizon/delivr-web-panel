/**
 * Organization Page Object Model
 */

export class OrgPage {
  // Selectors
  private selectors = {
    orgName: '[data-testid="org-name"]',
    orgNameInput: '[data-testid="org-name-input"]',
    submitOrgBtn: '[data-testid="submit-org-btn"]',
    cancelBtn: '[data-testid="cancel-btn"]',
    createAppBtn: '[data-testid="create-app-btn"]',
    appList: '[data-testid="app-list"]',
    appCard: '[data-testid="app-card"]',
    deleteOrgBtn: '[data-testid="delete-org-btn"]',
    confirmDeleteBtn: '[data-testid="confirm-delete-btn"]',
    manageTab: '[data-testid="manage-tab"]',
    settingsTab: '[data-testid="settings-tab"]',
  };

  /**
   * Visit organization creation page
   */
  visitCreate() {
    cy.visit('/dashboard/create');
    return this;
  }

  /**
   * Visit specific organization page
   */
  visit(orgName: string) {
    cy.visit(`/dashboard/${orgName}/apps`);
    return this;
  }

  /**
   * Enter organization name
   */
  enterOrgName(name: string) {
    cy.get(this.selectors.orgNameInput).clear().type(name);
    return this;
  }

  /**
   * Submit organization form
   */
  submitOrgForm() {
    cy.get(this.selectors.submitOrgBtn).click();
    return this;
  }

  /**
   * Create organization
   */
  createOrg(name: string) {
    this.enterOrgName(name);
    this.submitOrgForm();
    return this;
  }

  /**
   * Click create app button
   */
  clickCreateApp() {
    cy.get(this.selectors.createAppBtn).click();
    return this;
  }

  /**
   * Verify organization name
   */
  verifyOrgName(name: string) {
    cy.get(this.selectors.orgName).should('contain', name);
    return this;
  }

  /**
   * Verify app exists
   */
  verifyAppExists(appName: string) {
    cy.get(this.selectors.appCard).contains(appName).should('be.visible');
    return this;
  }

  /**
   * Click on app
   */
  clickApp(appName: string) {
    cy.contains(appName).click();
    return this;
  }

  /**
   * Navigate to manage tab
   */
  goToManageTab() {
    cy.get(this.selectors.manageTab).click();
    return this;
  }

  /**
   * Delete organization
   */
  deleteOrg() {
    cy.get(this.selectors.deleteOrgBtn).click();
    cy.get(this.selectors.confirmDeleteBtn).click();
    return this;
  }

  /**
   * Get app count
   */
  getAppCount() {
    return cy.get(this.selectors.appCard).its('length');
  }

  /**
   * Verify no apps message
   */
  verifyNoApps() {
    cy.contains('No apps found').should('be.visible');
    return this;
  }
}





