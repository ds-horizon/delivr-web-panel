/**
 * Mock Server Types - Mirrors the types from app/.server/services/Codepush/types.ts
 */

export type Organization = {
  id: string;
  displayName: string;
  role: "Owner" | "Collaborator";
};

export type Collaborator = {
  isCurrentAccount: boolean;
  permission: "Owner" | "Collaborator";
};

export type App = {
  name: string;
  collaborators: Record<string, Collaborator>;
  deployments: string[];
};

export type Deployment = {
  id: string;
  name: string;
  key: string;
  packageId: null | string;
  appId: string;
  createdTime: string;
  createdAt: string;
  updatedAt: string;
};

export type Package = {
  appVersion: string;
  blobUrl: string;
  description: string;
  isDisabled: boolean;
  isMandatory: boolean;
  label: string;
  originalDeployment: string | null;
  originalLabel: string | null;
  packageHash: string;
  releasedBy: string;
  releaseMethod: string;
  rollout: number;
  size: number;
  uploadTime: number;
  active: number | null;
  downloaded: number | null;
  failed: number | null;
  installed: number | null;
  totalActive: number | null;
  isBundlePatchingEnabled?: boolean;
};

export type AccessKey = {
  createdTime: number;
  expires: number;
  description: null | string;
  friendlyName: string;
  name: string;
  id: string;
  scope: "All" | "Write" | "Read";
};

export type OwnerTermsStatusResponse = {
  accountId: string;
  email: string;
  termsAccepted: boolean;
  isCurrentVersion: boolean;
  currentRequiredVersion: string;
  isOwner: boolean;
  ownerAppCount: number;
  termsVersion: string | null;
  acceptedTime?: number;
  message?: string;
};

/**
 * Mock Server State
 */
export type MockState = {
  organizations: Organization[];
  apps: Record<string, App[]>; // Key: orgId
  deployments: Record<string, Deployment[]>; // Key: appId
  packages: Record<string, Package[]>; // Key: deploymentId
  accessKeys: AccessKey[];
  users: Record<string, {
    id: string;
    email: string;
    name: string;
    termsAccepted: boolean;
  }>;
};

