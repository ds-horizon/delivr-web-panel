import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";

const createDeployment: AuthenticatedActionFunction = async ({
  user,
  params,
  request,
}) => {
  const body = await request.json();
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

  // Use proxy only in mock mode
  if (process.env.OAUTH_TEST_MODE === "true") {
    const backendUrl = process.env.DELIVR_BACKEND_URL || "http://localhost:3001";
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
