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

export type AccessKeyRequest = BaseHeader;

export type AccessKeyResponse = {
  accessKeys: AccessKey[];
};
