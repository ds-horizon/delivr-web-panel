import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";
import { isTestMode, getBackendUrl } from "~/utils/test-mode";

const createDeployment: AuthenticatedActionFunction = async ({
  user,
  params,
  request,
}) => {
  const userId = user.user.id;
  const body = await request.json();

  // Use proxy in test mode
  if (isTestMode()) {
    const backendUrl = getBackendUrl();
    const appId = params.app ?? "";
    const tenant = body.tenant ?? "";

    const resp = await fetch(
      `${backendUrl}/apps/${appId}/deployments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
          ...(tenant ? { tenant } : {}),
        },
        body: JSON.stringify({ name: body.name ?? "" }),
      }
    );

    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await resp.json();
      return json(data, { status: resp.status });
    }
    return new Response(await resp.text(), { status: resp.status });
  }

  // Real dashboard path (unchanged)
  const { data, status } = await CodepushService.createDeployentsForApp({
    userId: user.user.id,
    appId: params.app ?? "",
    name: body.name ?? "",
    tenant: request.headers.get("tenant") ?? "",
  });
  return json(data, { status });
};

const deleteDeployment: AuthenticatedActionFunction = async ({
  user,
  params,
  request,
}) => {
  const { data, status } = await CodepushService.deleteDeployentsForApp({
    userId: user.user.id,
    appId: params.app ?? "",
    tenant: request.headers.get("tenant") ?? "",
    deploymentName: request.headers.get("deploymentName") ?? "",
  });
  return json(data, { status });
};

export const loader = authenticateLoaderRequest(async ({ user, params, request }) => {
  const userId = user.user.id;

  // Use proxy in test mode
  if (isTestMode()) {
    const backendUrl = getBackendUrl();
    const tenant = request.headers.get("tenant") ?? "";
    const appId = params.app ?? "";

    // Mock backend expects /apps/:appName/deployments with tenant header
    const resp = await fetch(
      `${backendUrl}/apps/${appId}/deployments`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
          ...(tenant ? { tenant } : {}),
        },
      }
    );

    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await resp.json();
      return json(data, { status: resp.status });
    }
    return new Response(await resp.text(), { status: resp.status });
  }

  // Real dashboard path (unchanged)
  const { data, status } = await CodepushService.getDeployentsForApp({
    userId: user.user.id,
    appId: params.app ?? "",  
    tenant: request.headers.get("tenant") ?? "",
  });
  return json(data, { status });
});

export const action = authenticateActionRequest({
  POST: createDeployment,
  DELETE: deleteDeployment,
});
