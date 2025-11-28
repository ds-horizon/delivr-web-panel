import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";
import { isTestMode, getBackendUrl } from "~/utils/test-mode";

const addCollabarator: AuthenticatedActionFunction = async ({
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
    const email = body.email ?? "";
    const tenant = body.tenant ?? "";

    // Mock backend expects POST /apps/:appName/collaborators/:email with tenant header
    const resp = await fetch(
      `${backendUrl}/apps/${appId}/collaborators/${encodeURIComponent(email)}`,
      {
        method: "POST",
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
  const { data, status } = await CodepushService.addCollaboratorForApp({
    userId: user.user.id,
    appId: params.app ?? "",
    email: body.email ?? "",
    tenant: body.tenant ?? "",
  });
  return json(data, { status });
};

const removeCollabarator: AuthenticatedActionFunction = async ({
  user,
  params,
  request,
}) => {
  const userId = user.user.id;
  // DELETE requests typically don't have a body, get email from headers
  const email = request.headers.get("email") ?? "";
  const tenant = request.headers.get("tenant") ?? "";

  // Use proxy in test mode
  if (isTestMode()) {
    const backendUrl = getBackendUrl();
    const appId = params.app ?? "";

    // Mock backend expects DELETE /apps/:appName/collaborators/:email with tenant header
    const resp = await fetch(
      `${backendUrl}/apps/${appId}/collaborators/${encodeURIComponent(email)}`,
      {
        method: "DELETE",
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
  const { data, status } = await CodepushService.removeCollaboratorForApp({
    userId: user.user.id,
    appId: params.app ?? "",
    email: email,
    tenant: tenant,
  });
  return json(data, { status });
};

const updateCollabarator: AuthenticatedActionFunction = async ({
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
    const email = body.email ?? "";
    const tenant = body.tenant ?? "";
    const role = body.role ?? "Collaborator";

    // Mock backend expects PATCH /apps/:appName/collaborators/:email with tenant header
    const resp = await fetch(
      `${backendUrl}/apps/${appId}/collaborators/${encodeURIComponent(email)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userId}`,
          ...(tenant ? { tenant } : {}),
        },
        body: JSON.stringify({ role }),
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
    await CodepushService.updateCollaboratorPermissionForApp({
      userId: user.user.id,
      appId: params.app ?? "",
      email: body.email ?? "",
      tenant: body.tenant ?? "",
      role: body.role ?? "Collaborator",
    });
  return json(data, { status });
};

export const loader = authenticateLoaderRequest(
  async ({ user, params, request }) => {
    const userId = user.user.id;

    // Use proxy in test mode
    if (isTestMode()) {
      const backendUrl = getBackendUrl();
      const tenant = request.headers.get("tenant") ?? "";
      const appId = params.app ?? "";

      // Mock backend expects /apps/:appName/collaborators with tenant header
      const resp = await fetch(
        `${backendUrl}/apps/${appId}/collaborators`,
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
    const { data, status } = await CodepushService.getCollaboratorForApp({
      userId: user.user.id,
      appId: params.app ?? "",
      tenant: request.headers.get("tenant") ?? "",
    });
    return json(data, { status });
  }
);

export const action = authenticateActionRequest({
  POST: addCollabarator,
  PATCH: updateCollabarator,
  DELETE: removeCollabarator,
});
