import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
} from "~/utils/authenticate";
import { isTestMode, getBackendUrl } from "~/utils/test-mode";

const promoteRelease: AuthenticatedActionFunction = async ({
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
    const sourceDeployment = params.deploymentName ?? "";
    const targetDeployment = params.targetDeployment ?? "";

    // Mock backend expects POST /apps/:appId/deployments/:source/promote/:target
    const resp = await fetch(
      `${backendUrl}/apps/${appId}/deployments/${sourceDeployment}/promote/${targetDeployment}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
        },
        body: JSON.stringify({
          appVersion: body.appVersion ?? "",
          description: body.description ?? "",
          isDisabled: body.isDisabled ?? true,
          isMandatory: body.isDisabled ?? false,
          label: body.label ?? "",
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
  const { data, status } = await CodepushService.promoteReleaseFromDeployment({
    userId: user.user.id,
    appId: params.app ?? "",
    appVersion: body.appVersion ?? "",
    description: body.description ?? "",
    isDisabled: body.isDisabled ?? true,
    isMandatory: body.isDisabled ?? false,
    sourceDeployment: params.deploymentName ?? "",
    targetDeployment: params.targetDeployment ?? "",
    label: body.label ?? "",
    tenant: body.tenant ?? "",
  });

  return json(data, { status });
};

export const action = authenticateActionRequest({ POST: promoteRelease });
