/**
 * App Page Object Model
 */

export class AppPage {
  // Selectors
  private selectors = {
    appName: '[data-testid="app-name"]',
    appNameInput: '[data-testid="app-name-input"]',
    platformSelect: '[data-testid="platform-select"]',
    osSelect: '[data-testid="os-select"]',
    submitAppBtn: '[data-testid="submit-app-btn"]',
    cancelBtn: '[data-testid="cancel-btn"]',
    createDeploymentBtn: '[data-testid="create-deployment-btn"]',
    createReleaseBtn: '[data-testid="create-release-btn"]',
    deploymentList: '[data-testid="deployment-list"]',
    releaseList: '[data-testid="release-list"]',
    collaboratorsTab: '[data-testid="collaborators-tab"]',
    deploymentsTab: '[data-testid="deployments-tab"]',
    releasesTab: '[data-testid="releases-tab"]',
    deleteAppBtn: '[data-testid="delete-app-btn"]',
    confirmDeleteBtn: '[data-testid="confirm-delete-btn"]',
  };

  /**
   * Visit app creation page
   */
  visitCreate(orgName: string) {
    cy.visit(`/dashboard/create/app?org=${orgName}`);
    return this;
  }

  /**
   * Visit specific app page
   */
  visit(orgName: string, appName: string) {
    cy.visit(`/dashboard/${orgName}/${appName}`);
    return this;
  }

  /**
   * Enter app name
   */
  enterAppName(name: string) {
    cy.get(this.selectors.appNameInput).clear().type(name);
    return this;
  }

  /**
   * Select platform
   */
  selectPlatform(platform: string) {
    cy.get(this.selectors.platformSelect).select(platform);
    return this;
  }

  /**
   * Select OS
   */
  selectOS(os: string) {
    cy.get(this.selectors.osSelect).select(os);
    return this;
  }

  /**
   * Submit app form
   */
  submitAppForm() {
    cy.get(this.selectors.submitAppBtn).click();
    return this;
  }

  /**
   * Create app
   */
  createApp(name: string, platform: string, os: string) {
    this.enterAppName(name);
    this.selectPlatform(platform);
    this.selectOS(os);
    this.submitAppForm();
    return this;
  }

  /**
   * Click create deployment
   */
  clickCreateDeployment() {
    cy.get(this.selectors.createDeploymentBtn).click();
    return this;
  }

  /**
   * Click create release
   */
  clickCreateRelease() {
    cy.get(this.selectors.createReleaseBtn).click();
    return this;
  }

  /**
   * Navigate to collaborators tab
   */
  goToCollaboratorsTab() {
    cy.get(this.selectors.collaboratorsTab).click();
    return this;
  }

  /**
   * Navigate to deployments tab
   */
  goToDeploymentsTab() {
    cy.get(this.selectors.deploymentsTab).click();
    return this;
  }

  /**
   * Navigate to releases tab
   */
  goToReleasesTab() {
    cy.get(this.selectors.releasesTab).click();
    return this;
  }

  /**
   * Verify app name
   */
  verifyAppName(name: string) {
    cy.get(this.selectors.appName).should('contain', name);
    return this;
  }

  /**
   * Verify deployment exists
   */
  verifyDeploymentExists(deploymentName: string) {
    cy.get(this.selectors.deploymentList).contains(deploymentName).should('be.visible');
    return this;
  }

  /**
   * Verify release exists
   */
  verifyReleaseExists(releaseLabel: string) {
    cy.get(this.selectors.releaseList).contains(releaseLabel).should('be.visible');
    return this;
  }

  /**
   * Delete app
   */
  deleteApp() {
    cy.get(this.selectors.deleteAppBtn).click();
    cy.get(this.selectors.confirmDeleteBtn).click();
    return this;
  }

  /**
   * Click on deployment
   */
  clickDeployment(deploymentName: string) {
    cy.contains(deploymentName).click();
    return this;
  }

  /**
   * Click on release
   */
  clickRelease(releaseLabel: string) {
    cy.contains(releaseLabel).click();
    return this;
  }
}





