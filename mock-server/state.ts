/**
 * Mock Server State Management
 * Manages in-memory state for testing
 */

import { MockState, Organization, App, Deployment, AccessKey } from './types';

/**
 * Initial state with default test data
 */
export const initialState: MockState = {
  organizations: [
    {
      id: 'test-org-1',
      displayName: 'Test Organization',
      role: 'Owner'
    }
  ],
  apps: {},
  deployments: {},
  packages: {},
  accessKeys: [],
  users: {
    'test-user-id': {
      id: 'test-user-id',
      email: 'test@delivr.com',
      name: 'Test User',
      termsAccepted: true
    }
  }
};

/**
 * Current state (mutable)
 */
let currentState: MockState = JSON.parse(JSON.stringify(initialState));

/**
 * State management functions
 */
export const state = {
  /**
   * Get current state
   */
  get(): MockState {
    return currentState;
  },

  /**
   * Reset state to initial values
   */
  reset(): void {
    currentState = JSON.parse(JSON.stringify(initialState));
    console.log('🔄 Mock state reset to initial values');
  },

  /**
   * Add organization
   */
  addOrganization(org: Organization): Organization {
    currentState.organizations.push(org);
    console.log('➕ Added organization:', org.displayName);
    return org;
  },

  /**
   * Get organizations
   */
  getOrganizations(): Organization[] {
    return currentState.organizations;
  },

  /**
   * Delete organization
   */
  deleteOrganization(orgId: string): boolean {
    const index = currentState.organizations.findIndex(o => o.id === orgId);
    if (index !== -1) {
      const deleted = currentState.organizations.splice(index, 1)[0];
      // Also delete apps for this org
      delete currentState.apps[orgId];
      console.log('🗑️  Deleted organization:', deleted.displayName);
      return true;
    }
    return false;
  },

  /**
   * Add app to organization
   */
  addApp(orgId: string, app: App): App {
    if (!currentState.apps[orgId]) {
      currentState.apps[orgId] = [];
    }
    currentState.apps[orgId].push(app);
    console.log('➕ Added app:', app.name, 'to org:', orgId);
    return app;
  },

  /**
   * Get apps for organization
   */
  getApps(orgId: string): App[] {
    return currentState.apps[orgId] || [];
  },

  /**
   * Delete app
   */
  deleteApp(orgId: string, appName: string): boolean {
    if (!currentState.apps[orgId]) return false;
    
    const index = currentState.apps[orgId].findIndex(a => a.name === appName);
    if (index !== -1) {
      const deleted = currentState.apps[orgId].splice(index, 1)[0];
      // Also delete deployments for this app
      delete currentState.deployments[appName];
      console.log('🗑️  Deleted app:', deleted.name);
      return true;
    }
    return false;
  },

  /**
   * Add deployment to app
   */
  addDeployment(appId: string, deployment: Deployment): Deployment {
    if (!currentState.deployments[appId]) {
      currentState.deployments[appId] = [];
    }
    currentState.deployments[appId].push(deployment);
    console.log('➕ Added deployment:', deployment.name, 'to app:', appId);
    return deployment;
  },

  /**
   * Get deployments for app
   */
  getDeployments(appId: string): Deployment[] {
    return currentState.deployments[appId] || [];
  },

  /**
   * Delete deployment
   */
  deleteDeployment(appId: string, deploymentName: string): boolean {
    if (!currentState.deployments[appId]) return false;
    
    const index = currentState.deployments[appId].findIndex(d => d.name === deploymentName);
    if (index !== -1) {
      const deleted = currentState.deployments[appId].splice(index, 1)[0];
      console.log('🗑️  Deleted deployment:', deleted.name);
      return true;
    }
    return false;
  },

  /**
   * Add access key
   */
  addAccessKey(key: AccessKey): AccessKey {
    currentState.accessKeys.push(key);
    console.log('➕ Added access key:', key.friendlyName);
    return key;
  },

  /**
   * Get all access keys
   */
  getAccessKeys(): AccessKey[] {
    return currentState.accessKeys;
  },

  /**
   * Delete access key
   */
  deleteAccessKey(name: string): boolean {
    const index = currentState.accessKeys.findIndex(k => k.name === name);
    if (index !== -1) {
      const deleted = currentState.accessKeys.splice(index, 1)[0];
      console.log('🗑️  Deleted access key:', deleted.friendlyName);
      return true;
    }
    return false;
  },

  /**
   * Get user by ID
   */
  getUser(userId: string) {
    return currentState.users[userId];
  },

  /**
   * Add collaborator to app
   */
  addCollaborator(orgId: string, appName: string, email: string, permission: 'Owner' | 'Collaborator' = 'Collaborator'): boolean {
    const apps = currentState.apps[orgId];
    if (!apps) return false;

    const app = apps.find(a => a.name === appName);
    if (!app) return false;

    app.collaborators[email] = {
      isCurrentAccount: false,
      permission
    };
    console.log('➕ Added collaborator:', email, 'to app:', appName);
    return true;
  },

  /**
   * Remove collaborator from app
   */
  removeCollaborator(orgId: string, appName: string, email: string): boolean {
    const apps = currentState.apps[orgId];
    if (!apps) return false;

    const app = apps.find(a => a.name === appName);
    if (!app) return false;

    if (app.collaborators[email]) {
      delete app.collaborators[email];
      console.log('🗑️  Removed collaborator:', email, 'from app:', appName);
      return true;
    }
    return false;
  },

  /**
   * Update collaborator permission
   */
  updateCollaborator(orgId: string, appName: string, email: string, permission: 'Owner' | 'Collaborator'): boolean {
    const apps = currentState.apps[orgId];
    if (!apps) return false;

    const app = apps.find(a => a.name === appName);
    if (!app || !app.collaborators[email]) return false;

    app.collaborators[email].permission = permission;
    console.log('✏️  Updated collaborator:', email, 'permission to', permission);
    return true;
  }
};

