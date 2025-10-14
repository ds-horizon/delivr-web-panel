import axios, { AxiosResponse } from "axios";
import { User } from "../Auth/Auth.interface";
import { env } from "../config";
import {
  AcceptTermsRequest,
  AcceptTermsResponse,
  AccessKeyRequest,
  AccessKeyResponse,
  AddCollabaratorsRequest,
  AddCollabaratorsResponse,
  AppsRequest,
  AppsResponse,
  BaseHeader,
  CollabaratorsRequest,
  CollabaratorsResponse,
  CreateAccessKeyRequest,
  CreateAccessKeyResponse,
  CreateAppRequest,
  CreateAppResponse,
  CreateDeploymentsRequest,
  CreateDeploymentsResponse,
  CreateReleaseRequest,
  CreateReleaseResponse,
  DeleteAccessKeyRequest,
  DeleteAccessKeyResponse,
  DeleteAppRequest,
  DeleteAppResponse,
  DeleteDeploymentsRequest,
  DeleteDeploymentsResponse,
  DeleteTenantResponse,
  DeploymentsReleaseRequest,
  DeploymentsReleaseResponse,
  DeploymentsRequest,
  DeploymentsResponse,
  OwnerTermsStatusRequest,
  OwnerTermsStatusResponse,
  PromoteReleaseToDeploymentRequest,
  PromoteReleaseToDeploymentResponse,
  RemoveCollabaratorsRequest,
  RemoveCollabaratorsResponse,
  TenantsRequest,
  TenantsResponse,
  UpdateCollabaratorsRequest,
  UpdateCollabaratorsResponse,
  UpdateDeploymentsReleaseRequest,
  UpdatePackageRequest,
} from "./types";
import {
  createMockTenantsResponse,
  createMockAppsResponse,
  createMockDeploymentsResponse,
  createMockCollaboratorsResponse,
  createMockAccessKeysResponse,
  createMockReleasesResponse,
  createMockCreateAppResponse,
  createMockCreateDeploymentResponse,
  createMockCreateReleaseResponse,
  createMockAddCollaboratorResponse,
  createMockUpdateCollaboratorResponse,
  createMockRemoveCollaboratorResponse,
  createMockDeleteAppResponse,
  createMockDeleteDeploymentResponse,
  createMockDeleteTenantResponse,
  createMockCreateAccessKeyResponse,
  createMockDeleteAccessKeyResponse,
  createMockPromoteReleaseResponse,
} from "./mockData";

class Codepush {
  private __client = axios.create({
    baseURL: env.DOTA_SERVER_URL,
    timeout: 10000,
  });

  async getUser(token: string): Promise<User> {
    if (!env.DOTA_SERVER_URL.length) {
      return Promise.resolve({
        authenticated: true,
        user: {
          createdTime: Date.now(),
          name: "Dummy User",
          email: "dummy_user@dream11.com",
          id: "id_1",
          createdAt: "2024-10-30T08:41:07.000Z",
          updatedAt: "2024-10-30T08:41:07.000Z",
        },
      });
    }

    const { data } = await this.__client.get<
      null,
      { status: number; data: User }
    >("/authenticated", {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    return data;
  }

  getUserByAccessKey(key: string) {
    return this.__client.get<null, AxiosResponse<Omit<User, "authenticated">>>(
      "/accountByaccessKeyName",
      {
        headers: {
          accessKeyName: key,
        },
      }
    );
  }

  async getTenants(userId: string) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockTenantsResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: TenantsRequest = {
      userId,
    };

    return this.__client.get<null, AxiosResponse<TenantsResponse>>("/tenants", {
      headers,
    });
  }

  async getAppsForTenants(data: AppsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockAppsResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: AppsRequest = data;

    return this.__client.get<null, AxiosResponse<AppsResponse>>("/apps", {
      headers,
    });
  }

  async createAppForTenant(data: CreateAppRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockCreateAppResponse(data.name);
      return { data: mockResponse, status: 201 };
    }

    const headers: CreateAppRequest = data;

    const payload = data.orgId?.length
      ? {
          orgId: data.orgId,
        }
      : {
          orgName: data.orgName,
        };

    return this.__client.post<null, AxiosResponse<CreateAppResponse>>(
      "/apps",
      {
        name: data.name,
        organisation: payload,
      },
      {
        headers,
      }
    );
  }

  async deleteTenant(data: AppsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockDeleteTenantResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: Omit<AppsRequest, "userId"> = data;

    return this.__client.delete<null, AxiosResponse<DeleteTenantResponse>>(
      `/tenants/${encodeURIComponent(data.tenant)}`,
      {
        headers,
      }
    );
  }

  async getDeployentsForApp(data: DeploymentsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockDeploymentsResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: DeploymentsRequest = data;

    return this.__client.get<null, AxiosResponse<DeploymentsResponse>>(
      `/apps/${encodeURIComponent(data.appId)}/deployments`,
      {
        headers,
      }
    );
  }

  async deleteDeployentsForApp(data: DeleteDeploymentsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockDeleteDeploymentResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: DeleteDeploymentsRequest = data;

    return this.__client.delete<null, AxiosResponse<DeleteDeploymentsResponse>>(
      `/apps/${encodeURIComponent(data.appId)}/deployments/${encodeURIComponent(
        data.deploymentName
      )}`,
      {
        headers,
      }
    );
  }

  async getCollaboratorForApp(data: CollabaratorsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockCollaboratorsResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: CollabaratorsRequest = data;

    return this.__client.get<null, AxiosResponse<CollabaratorsResponse>>(
      `/apps/${encodeURIComponent(data.appId)}/collaborators`,
      {
        headers,
      }
    );
  }

  async deleteAppForTenant(data: DeleteAppRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockDeleteAppResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: Omit<DeleteAppRequest, "appId"> = data;

    return this.__client.delete<null, AxiosResponse<DeleteAppResponse>>(
      `/apps/${encodeURIComponent(data.appId)}`,
      {
        headers,
      }
    );
  }

  async addCollaboratorForApp(data: AddCollabaratorsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockAddCollaboratorResponse();
      return { data: mockResponse, status: 201 };
    }

    const headers: AddCollabaratorsRequest = data;

    return this.__client.post<null, AxiosResponse<AddCollabaratorsResponse>>(
      `/apps/${encodeURIComponent(
        data.appId
      )}/collaborators/${encodeURIComponent(data.email)}`,
      {},
      {
        headers,
      }
    );
  }

  async removeCollaboratorForApp(data: RemoveCollabaratorsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockRemoveCollaboratorResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: RemoveCollabaratorsRequest = data;

    return this.__client.delete<
      null,
      AxiosResponse<RemoveCollabaratorsResponse>
    >(
      `/apps/${encodeURIComponent(
        data.appId
      )}/collaborators/${encodeURIComponent(data.email)}`,
      {
        headers,
      }
    );
  }

  async updateCollaboratorPermissionForApp(data: UpdateCollabaratorsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockUpdateCollaboratorResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: UpdateCollabaratorsRequest = data;

    return this.__client.patch<
      null,
      AxiosResponse<UpdateCollabaratorsResponse>
    >(
      `/apps/${encodeURIComponent(
        data.appId
      )}/collaborators/${encodeURIComponent(data.email)}`,
      {
        role: data.role,
      },
      {
        headers,
      }
    );
  }

  async createDeployentsForApp(data: CreateDeploymentsRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockCreateDeploymentResponse(data.name);
      return { data: mockResponse, status: 201 };
    }

    const headers: BaseHeader = data;

    return this.__client.post<null, AxiosResponse<CreateDeploymentsResponse>>(
      `/apps/${encodeURIComponent(data.appId)}/deployments`,
      {
        name: data.name,
      },
      {
        headers,
      }
    );
  }

  async getReleasesForDeployentsForApp(data: DeploymentsReleaseRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockReleasesResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: DeploymentsReleaseRequest = data;

    return this.__client.get<null, AxiosResponse<DeploymentsReleaseResponse>>(
      `/apps/${encodeURIComponent(data.appId)}/deployments/${encodeURIComponent(
        data.deploymentName
      )}`,
      {
        headers,
      }
    );
  }

  async updateReleaseForDeployentForApp(data: UpdateDeploymentsReleaseRequest) {
    const headers: Pick<UpdateDeploymentsReleaseRequest, "tenant" | "userId"> =
      data;
    const body: UpdatePackageRequest = { ...data };

    return this.__client.patch<null, AxiosResponse<DeploymentsReleaseResponse>>(
      `/apps/${encodeURIComponent(data.appId)}/deployments/${encodeURIComponent(
        data.deploymentName
      )}/release`,
      {
        packageInfo: body,
      },
      {
        headers,
      }
    );
  }

  async getAccessKeys(data: AccessKeyRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockAccessKeysResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: AccessKeyRequest = data;

    return this.__client.get<null, AxiosResponse<AccessKeyResponse>>(
      `/accessKeys`,
      {
        headers,
      }
    );
  }

  async createAccessKey(data: CreateAccessKeyRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockCreateAccessKeyResponse(data.name);
      return { data: mockResponse, status: 201 };
    }

    const headers: AccessKeyRequest = data;

    return this.__client.post<null, AxiosResponse<CreateAccessKeyResponse>>(
      `/accessKeys`,
      {
        friendlyName: data.name,
        scope: data.access,
      },
      {
        headers,
      }
    );
  }

  async deleteAccessKey(data: DeleteAccessKeyRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockDeleteAccessKeyResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: BaseHeader = data;

    return this.__client.delete<null, AxiosResponse<DeleteAccessKeyResponse>>(
      `/accessKeys/${encodeURIComponent(data.name)}`,
      {
        headers,
      }
    );
  }

  async promoteReleaseFromDeployment(data: PromoteReleaseToDeploymentRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock data
      const mockResponse = createMockPromoteReleaseResponse();
      return { data: mockResponse, status: 200 };
    }

    const headers: Pick<
      PromoteReleaseToDeploymentRequest,
      "userId" | "tenant"
    > = data;

    return this.__client.post<
      null,
      AxiosResponse<PromoteReleaseToDeploymentResponse>
    >(
      `apps/${encodeURIComponent(data.appId)}/deployments/${encodeURIComponent(
        data.sourceDeployment
      )}/promote/${encodeURIComponent(data.targetDeployment)}`,
      {
        packageInfo: {
          appVersion: data.appVersion,
          label: data.label,
          rollout: 1,
          description: data.description,
          isDisabled: data.isDisabled,
          isMandatory: data.isMandatory,
        },
      },
      {
        headers,
      }
    );
  }

  async createRelease(data: CreateReleaseRequest) {
    if (!env.DOTA_SERVER_URL.length) {
      // Development mode - return mock response
      const mockResponse = createMockCreateReleaseResponse(data);
      return { data: mockResponse, status: 201 };
    }

    // Create multipart form data for CodePush server
    const formData = new FormData();
    formData.append("package", data.packageFile);
    formData.append("packageInfo", JSON.stringify(data.packageInfo));

    const headers = {
      "userId": data.userId,
      "tenant": data.tenant,
      "Accept": "application/vnd.code-push.v1+json",
    };

    try {
      // Use axios client for consistency (configured with baseURL)
      const response = await this.__client.post<CreateReleaseResponse>(
        `/apps/${encodeURIComponent(data.appId)}/deployments/${encodeURIComponent(data.deploymentName)}/release`,
        formData,
        { headers }
      );

      return { data: response.data, status: response.status };
    } catch (error: any) {
      // Handle axios errors to preserve original status codes and messages
      if (error.response) {
        // Server responded with error status (4xx, 5xx)
        return {
          data: error.response.data,
          status: error.response.status,
          error: true
        };
      } else if (error.request) {
        // Network error - no response received
        throw new Error("Network error: Unable to reach CodePush server");
      } else {
        // Other error
        throw error;
      }
    }
  }

  async getOwnerTermsStatus(data: OwnerTermsStatusRequest) {
    const headers: Pick<OwnerTermsStatusRequest, "userId"> = data;

    return this.__client.get<null, AxiosResponse<OwnerTermsStatusResponse>>(
      "/account/ownerTermsStatus",
      {
        headers,
      }
    );
  }

  async acceptTerms(data: AcceptTermsRequest) {
    const headers: Pick<AcceptTermsRequest, "userId"> = data;

    return this.__client.post<
      Pick<AcceptTermsRequest, "termsVersion">,
      AxiosResponse<AcceptTermsResponse>
    >(
      "/account/acceptTerms",
      {
        termsVersion: data.termsVersion,
      },
      {
        headers,
      }
    );
  }
}

export const CodepushService = new Codepush();
