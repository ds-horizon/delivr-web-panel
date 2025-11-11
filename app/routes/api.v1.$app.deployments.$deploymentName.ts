import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";
import { isTestMode, getBackendUrl } from "~/utils/test-mode";

const updateRelease: AuthenticatedActionFunction = async ({
  user,
  request,
  params,
}) => {
  const userId = user.user.id;
  const body = await request.json();

  // Use proxy in test mode
  if (isTestMode()) {
    const backendUrl = getBackendUrl();
    const appId = params.app ?? "";
    const deploymentName = params.deploymentName ?? "";
    const tenant = body.tenant ?? "";

    // Mock backend expects PATCH /apps/:appId/deployments/:deploymentName/release
    const resp = await fetch(
      `${backendUrl}/apps/${appId}/deployments/${deploymentName}/release`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
          ...(tenant ? { tenant } : {}),
        },
        body: JSON.stringify({
          appVersion: body.appVersion ?? "",
          description: body.description ?? "",
          isDisabled: body.isDisabled ?? true,
          isMandatory: body.isMandatory ?? false,
          label: body.label ?? "",
          rollout: body.rollout ?? 0,
        }),
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
  const { data, status } =
    await CodepushService.updateReleaseForDeployentForApp({
      userId: user.user.id,
      appId: params.app ?? "",
      deploymentName: params.deploymentName ?? "",
      appVersion: body.appVersion ?? "",
      description: body.description ?? "",
      isDisabled: body.isDisabled ?? true,
      isMandatory: body.isMandatory ?? false,
      label: body.label ?? "",
      rollout: body.rollout ?? 0,
      tenant: body.tenant ?? "",
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
    const deploymentName = params.deploymentName ?? "";

    // Mock backend expects /apps/:appId/deployments/:deploymentName with tenant header
    const resp = await fetch(
      `${backendUrl}/apps/${appId}/deployments/${deploymentName}`,
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
  const { data, status } = await CodepushService.getReleasesForDeployentsForApp(
    {
      userId: user.user.id,
      appId: params.app ?? "",
      deploymentName: params.deploymentName ?? "",
      tenant: request.headers.get("tenant") ?? "",
    }
  );
  return json(data, { status });
});

export const action = authenticateActionRequest({ PATCH: updateRelease });
