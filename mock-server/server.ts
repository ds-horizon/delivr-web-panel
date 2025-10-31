/**
 * Mock Server for Delivr Backend API
 * Simulates the backend API for testing purposes
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { state } from './state';
import { Organization, App, Deployment, AccessKey } from './types';

const app = express();
const PORT = process.env.MOCK_SERVER_PORT || 3011;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'userId', 'tenant', 'name', 'email', 'deploymentName']
}));

app.use(express.json());

/**
 * Logging middleware
 */
app.use((req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers.userid as string;
  const tenant = req.headers.tenant as string;
  console.log(`\n📥 ${req.method} ${req.path}`, {
    userId: userId || '(none)',
    tenant: tenant || '(none)',
    params: req.params,
    query: req.query,
    body: Object.keys(req.body).length > 0 ? req.body : '(empty)'
  });
  next();
});

/**
 * Authentication middleware - checks userId header
 */
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers.userid as string;
  
  if (!userId) {
    console.log('❌ Authentication failed: No userId header');
    return res.status(401).json({ message: 'Authentication failed' });
  }
  
  // Attach user to request
  (req as any).userId = userId;
  next();
};

// ========================================
// HEALTH CHECK
// ========================================

app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    message: 'Mock server is running'
  });
});

// ========================================
// ORGANIZATIONS / TENANTS
// ========================================

/**
 * GET /tenants
 * Get all organizations for user
 */
app.get('/tenants', requireAuth, (req: Request, res: Response) => {
  const organizations = state.getOrganizations();
  
  res.json({
    organisations: organizations // Note: British spelling to match backend
  });
});

/**
 * DELETE /tenants/:tenant
 * Delete an organization
 */
app.delete('/tenants/:tenant', requireAuth, (req: Request, res: Response) => {
  const { tenant } = req.params;
  
  const deleted = state.deleteOrganization(tenant);
  
  if (deleted) {
    res.json({ status: 'success' });
  } else {
    res.status(404).json({ message: 'Organization not found' });
  }
});

// ========================================
// ACCOUNT / TERMS
// ========================================

/**
 * GET /account/ownerTermsStatus
 * Get owner terms status for user
 */
app.get('/account/ownerTermsStatus', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const user = state.getUser(userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const organizations = state.getOrganizations();
  const ownerOrgs = organizations.filter(o => o.role === 'Owner');
  
  res.json({
    accountId: user.id,
    email: user.email,
    termsAccepted: user.termsAccepted,
    isCurrentVersion: true,
    currentRequiredVersion: '1.0.0',
    isOwner: ownerOrgs.length > 0,
    ownerAppCount: ownerOrgs.reduce((count, org) => {
      return count + state.getApps(org.id).length;
    }, 0),
    termsVersion: user.termsAccepted ? '1.0.0' : null,
    acceptedTime: user.termsAccepted ? Date.now() : undefined
  });
});

/**
 * POST /account/acceptOwnerTerms
 * Accept owner terms
 */
app.post('/account/acceptOwnerTerms', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { termsVersion } = req.body;
  
  const user = state.getUser(userId);
  if (user) {
    user.termsAccepted = true;
  }
  
  res.json({
    message: 'Terms accepted',
    termsAcceptance: {
      id: `terms-${Date.now()}`,
      accountId: userId,
      email: user?.email || 'test@delivr.com',
      termsVersion: termsVersion || '1.0.0',
      acceptedTime: Date.now()
    }
  });
});

// ========================================
// APPS
// ========================================

/**
 * GET /apps
 * Get all apps for an organization
 * Requires: tenant header
 */
app.get('/apps', requireAuth, (req: Request, res: Response) => {
  const tenant = req.headers.tenant as string;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  const apps = state.getApps(tenant);
  
  res.json({
    apps: apps
  });
});

/**
 * POST /apps
 * Create a new app for an organization
 * Body: { name: string, orgId?: string, orgName?: string }
 */
app.post('/apps', requireAuth, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { name, orgId, orgName } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'name is required' });
  }
  
  const targetOrgId = orgId || orgName;
  
  if (!targetOrgId) {
    return res.status(400).json({ message: 'orgId or orgName is required' });
  }
  
  // Check if org exists
  const organizations = state.getOrganizations();
  const org = organizations.find(o => o.id === targetOrgId || o.displayName === targetOrgId);
  
  if (!org) {
    // Create new organization if it doesn't exist
    const newOrg: Organization = {
      id: targetOrgId,
      displayName: orgName || targetOrgId,
      role: 'Owner'
    };
    state.addOrganization(newOrg);
  }
  
  // Create app with default deployments
  const newApp: App = {
    name,
    collaborators: {
      [userId]: {
        isCurrentAccount: true,
        permission: 'Owner'
      }
    },
    deployments: ['Production', 'Staging']
  };
  
  state.addApp(org?.id || targetOrgId, newApp);
  
  // Create default deployments
  ['Production', 'Staging'].forEach(deploymentName => {
    const deployment: Deployment = {
      id: `${name}-${deploymentName}-${Date.now()}`,
      name: deploymentName,
      key: `mock-key-${deploymentName}-${Date.now()}`,
      packageId: null,
      appId: name,
      createdTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    state.addDeployment(name, deployment);
  });
  
  res.status(201).json({
    app: newApp
  });
});

/**
 * DELETE /apps/:app
 * Delete an app
 * Requires: tenant header
 */
app.delete('/apps/:app', requireAuth, (req: Request, res: Response) => {
  const { app } = req.params;
  const tenant = req.headers.tenant as string;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  const deleted = state.deleteApp(tenant, app);
  
  if (deleted) {
    res.json({ status: 'success' });
  } else {
    res.status(404).json({ message: 'App not found' });
  }
});

// ========================================
// DEPLOYMENTS
// ========================================

/**
 * GET /deployments
 * Get all deployments for an app
 * Requires: tenant header
 */
app.get('/deployments', requireAuth, (req: Request, res: Response) => {
  const tenant = req.headers.tenant as string;
  const appId = req.query.appId as string;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  if (!appId) {
    return res.status(400).json({ message: 'appId query parameter required' });
  }
  
  const deployments = state.getDeployments(appId);
  
  res.json({
    deployments: deployments
  });
});

/**
 * POST /deployments
 * Create a new deployment for an app
 * Requires: tenant header
 * Body: { appId: string, name: string }
 */
app.post('/deployments', requireAuth, (req: Request, res: Response) => {
  const tenant = req.headers.tenant as string;
  const { appId, name } = req.body;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  if (!appId || !name) {
    return res.status(400).json({ message: 'appId and name are required' });
  }
  
  const newDeployment: Deployment = {
    id: `${appId}-${name}-${Date.now()}`,
    name,
    key: `mock-key-${name}-${Date.now()}`,
    packageId: null,
    appId,
    createdTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  state.addDeployment(appId, newDeployment);
  
  res.status(201).json({
    deployments: newDeployment
  });
});

/**
 * DELETE /deployments
 * Delete a deployment
 * Requires: tenant, deploymentName headers
 */
app.delete('/deployments', requireAuth, (req: Request, res: Response) => {
  const tenant = req.headers.tenant as string;
  const deploymentName = req.headers.deploymentname as string;
  const appId = req.query.appId as string;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  if (!deploymentName) {
    return res.status(400).json({ message: 'deploymentName header required' });
  }
  
  if (!appId) {
    return res.status(400).json({ message: 'appId query parameter required' });
  }
  
  const deleted = state.deleteDeployment(appId, deploymentName);
  
  if (deleted) {
    res.json({ deployment: { name: deploymentName } });
  } else {
    res.status(404).json({ message: 'Deployment not found' });
  }
});

// ========================================
// ACCESS KEYS / TOKENS
// ========================================

/**
 * GET /access-keys
 * Get all access keys for user
 */
app.get('/access-keys', requireAuth, (req: Request, res: Response) => {
  const accessKeys = state.getAccessKeys();
  
  res.json({
    accessKeys: accessKeys
  });
});

/**
 * POST /access-keys
 * Create a new access key
 * Body: { name: string, access: "All" | "Write" | "Read" }
 */
app.post('/access-keys', requireAuth, (req: Request, res: Response) => {
  const { name, access } = req.body;
  
  if (!name || !access) {
    return res.status(400).json({ message: 'name and access are required' });
  }
  
  if (!['All', 'Write', 'Read'].includes(access)) {
    return res.status(400).json({ message: 'access must be All, Write, or Read' });
  }
  
  const newKey: AccessKey = {
    id: `key-${Date.now()}`,
    name: `key_${name}_${Date.now()}`,
    friendlyName: name,
    description: null,
    scope: access,
    createdTime: Date.now(),
    expires: Date.now() + (365 * 24 * 60 * 60 * 1000) // 1 year
  };
  
  state.addAccessKey(newKey);
  
  res.status(201).json({
    accessKey: {
      friendlyName: newKey.friendlyName,
      description: newKey.description,
      name: newKey.name,
      createdBy: (req as any).userId,
      createdTime: newKey.createdTime,
      expires: newKey.expires
    }
  });
});

/**
 * DELETE /access-keys
 * Delete an access key
 * Requires: name header
 */
app.delete('/access-keys', requireAuth, (req: Request, res: Response) => {
  const name = req.headers.name as string;
  
  if (!name) {
    return res.status(400).json({ message: 'name header required' });
  }
  
  const deleted = state.deleteAccessKey(name);
  
  if (deleted) {
    res.json({ name });
  } else {
    res.status(404).json({ message: 'Access key not found' });
  }
});

// ========================================
// COLLABORATORS
// ========================================

/**
 * GET /collaborators
 * Get all collaborators for an app
 * Requires: tenant header
 */
app.get('/collaborators', requireAuth, (req: Request, res: Response) => {
  const tenant = req.headers.tenant as string;
  const appId = req.query.appId as string;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  if (!appId) {
    return res.status(400).json({ message: 'appId query parameter required' });
  }
  
  const apps = state.getApps(tenant);
  const app = apps.find(a => a.name === appId);
  
  if (!app) {
    return res.status(404).json({ message: 'App not found' });
  }
  
  res.json({
    collaborators: app.collaborators
  });
});

/**
 * POST /collaborators
 * Add a collaborator to an app
 * Requires: tenant header
 * Body: { appId: string, email: string }
 */
app.post('/collaborators', requireAuth, (req: Request, res: Response) => {
  const tenant = req.headers.tenant as string;
  const { appId, email } = req.body;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  if (!appId || !email) {
    return res.status(400).json({ message: 'appId and email are required' });
  }
  
  const added = state.addCollaborator(tenant, appId, email, 'Collaborator');
  
  if (added) {
    const apps = state.getApps(tenant);
    const app = apps.find(a => a.name === appId);
    
    res.status(201).json({
      collaborators: app!.collaborators
    });
  } else {
    res.status(404).json({ message: 'App not found' });
  }
});

/**
 * PATCH /collaborators
 * Update a collaborator's permission
 * Requires: tenant header
 * Body: { appId: string, email: string, role: "Owner" | "Collaborator" }
 */
app.patch('/collaborators', requireAuth, (req: Request, res: Response) => {
  const tenant = req.headers.tenant as string;
  const { appId, email, role } = req.body;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  if (!appId || !email || !role) {
    return res.status(400).json({ message: 'appId, email, and role are required' });
  }
  
  const updated = state.updateCollaborator(tenant, appId, email, role);
  
  if (updated) {
    const apps = state.getApps(tenant);
    const app = apps.find(a => a.name === appId);
    
    res.json({
      collaborators: app!.collaborators
    });
  } else {
    res.status(404).json({ message: 'App or collaborator not found' });
  }
});

/**
 * DELETE /collaborators
 * Remove a collaborator from an app
 * Requires: tenant, email headers
 */
app.delete('/collaborators', requireAuth, (req: Request, res: Response) => {
  const tenant = req.headers.tenant as string;
  const email = req.headers.email as string;
  const appId = req.query.appId as string;
  
  if (!tenant) {
    return res.status(400).json({ message: 'tenant header required' });
  }
  
  if (!email) {
    return res.status(400).json({ message: 'email header required' });
  }
  
  if (!appId) {
    return res.status(400).json({ message: 'appId query parameter required' });
  }
  
  const removed = state.removeCollaborator(tenant, appId, email);
  
  if (removed) {
    const apps = state.getApps(tenant);
    const app = apps.find(a => a.name === appId);
    
    res.json({
      collaborators: app!.collaborators
    });
  } else {
    res.status(404).json({ message: 'App or collaborator not found' });
  }
});

// ========================================
// TEST UTILITIES
// ========================================

/**
 * POST /test/reset
 * Reset state to initial values (for testing)
 */
app.post('/test/reset', (req: Request, res: Response) => {
  state.reset();
  res.json({
    message: 'State reset to initial values',
    timestamp: Date.now()
  });
});

/**
 * GET /test/state
 * Get current state (for debugging)
 */
app.get('/test/state', (req: Request, res: Response) => {
  res.json(state.get());
});

// ========================================
// ERROR HANDLING
// ========================================

// 404 handler
app.use((req: Request, res: Response) => {
  console.log(`❌ 404: ${req.method} ${req.path}`);
  res.status(404).json({
    message: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`🚀 Mock Server running on http://localhost:${PORT}`);
  console.log('🚀 ========================================\n');
  console.log('📊 Available endpoints:');
  console.log('   GET    /health');
  console.log('   GET    /tenants');
  console.log('   DELETE /tenants/:tenant');
  console.log('   GET    /account/ownerTermsStatus');
  console.log('   POST   /account/acceptOwnerTerms');
  console.log('   GET    /apps');
  console.log('   POST   /apps');
  console.log('   DELETE /apps/:app');
  console.log('   GET    /deployments');
  console.log('   POST   /deployments');
  console.log('   DELETE /deployments');
  console.log('   GET    /access-keys');
  console.log('   POST   /access-keys');
  console.log('   DELETE /access-keys');
  console.log('   GET    /collaborators');
  console.log('   POST   /collaborators');
  console.log('   PATCH  /collaborators');
  console.log('   DELETE /collaborators');
  console.log('   POST   /test/reset');
  console.log('   GET    /test/state');
  console.log('\n🔑 All endpoints require userId header (except /health and /test/*)');
  console.log('🔑 Some endpoints require tenant header\n');
});

export default app;

