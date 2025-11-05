import { json } from "@remix-run/node";
import { CodepushService } from "~/.server/services/Codepush";
import { CreateAppRequest } from "~/.server/services/Codepush/types";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";

const createDeployment: AuthenticatedActionFunction = async ({
  user,
  request,
  params,
}) => {
  const userId = user.user.id;
  const { org } = params;

  // Use proxy only in mock mode
  if (process.env.OAUTH_TEST_MODE === "true") {
    const backendUrl = process.env.DELIVR_BACKEND_URL || "http://localhost:3001";
    const bodyText = await request.text();
    const bodyData = JSON.parse(bodyText);

    // If org is "new", use the tenant creation endpoint
    if (org === "new") {
      const resp = await fetch(`${backendUrl}/api/v1/new/apps`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: bodyText,
      });

      const ct = resp.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const data = await resp.json();
        return json(data, { status: resp.status });
      }
      return new Response(await resp.text(), { status: resp.status });
    }

    // For existing org, POST to /apps with tenantId in body
    const appPayload = {
      name: bodyData.name,
      tenantId: org,
    };

    const resp = await fetch(`${backendUrl}/apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify(appPayload),
    });

    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await resp.json();
      return json(data, { status: resp.status });
    }
    return new Response(await resp.text(), { status: resp.status });
  }

  // Real dashboard path (unchanged)
  const body = await request.json();

  const payload: CreateAppRequest = body.orgId?.length
    ? {
        userId: user.user.id,
        orgId: (body.orgId as string) ?? "",
        name: (body.name as string) ?? "",
      }
    : {
        userId: user.user.id,
        orgName: (body.orgName as string) ?? "",
        name: (body.name as string) ?? "",
      };

  const { data, status } = await CodepushService.createAppForTenant(payload);
  return json(data, { status });
};

export const loader = authenticateLoaderRequest(async ({ user, params }) => {
  const userId = user.user.id;

  // Use proxy only in mock mode
  if (process.env.OAUTH_TEST_MODE === "true") {
    const backendUrl = process.env.DELIVR_BACKEND_URL || "http://localhost:3001";
    const { org } = params;

    const resp = await fetch(`${backendUrl}/apps`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
        tenant: org, // Mock backend expects tenant header
      },
    });

    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await resp.json();
      return json(data, { status: resp.status });
    }
    return new Response(await resp.text(), { status: resp.status });
  }

  // Real dashboard path (unchanged)
  const { data, status } = await CodepushService.getAppsForTenants({
    userId: user.user.id,
    tenant: params.org ?? "",
  });
  return json(data, { status });
});

export const action = authenticateActionRequest({ POST: createDeployment });
