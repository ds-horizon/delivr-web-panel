import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";

import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";

export const loader = authenticateLoaderRequest();

const deleteTenant: AuthenticatedActionFunction = async ({ user, params }) => {
  const userId = user.user.id;
  const tenantId = params.org ?? "";

  // Use proxy in test mode
  if (process.env.OAUTH_TEST_MODE === "true") {
    const backendUrl = process.env.DELIVR_BACKEND_URL || "http://localhost:3001";

    const resp = await fetch(`${backendUrl}/tenants/${tenantId}`, {
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
  const { data, status } = await CodepushService.deleteTenant({
    userId: user.user.id,
    tenant: tenantId,
  });
  return json(data, { status });
};

export const action = authenticateActionRequest({ DELETE: deleteTenant });
