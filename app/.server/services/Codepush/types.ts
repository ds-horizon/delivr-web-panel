type Organization = {
  id: string;
  displayName: string;
  role: "Owner" | "Collabarator";
};

type Collaborator = {
  isCurrentAccount: boolean;
  permission: Organization["role"];
};

type Apps = {
  name: string;
  collaborators: Record<string, Collaborator>;
  deployments: string[];
};

type Deployment = {
  id: string;
  name: string;
  key: string;
  packageId: null | string;
  appId: string;
  createdTime: string;
  createdAt: string;
  updatedAt: string;
};

type Package = {
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
};

type AccessKey = {
  createdTime: number;
  expires: number;
  description: null;
  friendlyName: string;
  name: string;
  id: string;
};

type BaseHeader = {
  userId: string;
};

export type TenantsResponse = {
  organisations: Organization[];
};

export type TenantsRequest = BaseHeader;

export type AppsRequest = BaseHeader & {
  tenant: string;
};

export type AppsResponse = {
  apps: Apps[];
};

export type DeploymentsRequest = BaseHeader & {
  appId: string;
};

export type DeploymentsResponse = {
  deployments: Deployment[];
};

export type DeploymentsReleaseRequest = BaseHeader & {
  appId: string;
  deploymentName: string;
};

export type DeploymentsReleaseResponse = {
  deployment: {
    name: string;
    key: string;
    package: Package;
    packageHistory: Package[];
  };
};

export type AccessKeyRequest = BaseHeader;

export type AccessKeyResponse = {
  accessKeys: AccessKey[];
};

export type CreateAccessKeyRequest = BaseHeader & {
  name: string;
};

export type CreateAccessKeyResponse = {
  accessKey: {
    friendlyName: string;
    description: string;
    name: string;
    createdBy: string;
    createdTime: number;
    expires: number;
  };
};
