import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";
import { isTestMode, getBackendUrl } from "~/utils/test-mode";

const createToken: AuthenticatedActionFunction = async ({ user, request }) => {
  const userId = user.user.id;
  const body = await request.json();

  // Use proxy in test mode
  if (isTestMode()) {
    const backendUrl = getBackendUrl();

    const resp = await fetch(`${backendUrl}/accessKeys`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify({
        name: body.name ?? "",
        friendlyName: body.name ?? "",
        ttl: body.ttl || null,
      }),
    });

    const ct = resp.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const data = await resp.json();
      return json(data, { status: resp.status });
    }
    return new Response(await resp.text(), { status: resp.status });
  }

  // Real dashboard path (unchanged)
  const { data, status } = await CodepushService.createAccessKey({
    userId: user.user.id,
    name: body.name ?? "",
    access: body.access ?? "",
  });
  return json(data, { status });
};

const deleteToken: AuthenticatedActionFunction = async ({ user, request }) => {
  const userId = user.user.id;
  const tokenName = request.headers.get("name") ?? "";

  // Use proxy in test mode
  if (isTestMode()) {
    const backendUrl = getBackendUrl();

    const resp = await fetch(`${backendUrl}/accessKeys/${encodeURIComponent(tokenName)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
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
  const { data, status } = await CodepushService.deleteAccessKey({
    userId: user.user.id,
    name: tokenName,
  });
  return json(data, { status });
};

export const loader = authenticateLoaderRequest(async ({ user }) => {
  const userId = user.user.id;

  // Use proxy in test mode
  if (isTestMode()) {
    const backendUrl = getBackendUrl();

    const resp = await fetch(`${backendUrl}/accessKeys`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`,
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
  const { data, status } = await CodepushService.getAccessKeys({
    userId: user.user.id,
  });
  return json(data, { status });
});

export const action = authenticateActionRequest({
  POST: createToken,
  DELETE: deleteToken,
});
