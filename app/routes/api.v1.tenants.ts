import { json } from "@remix-run/node";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { CodepushService } from "~/.server/services/Codepush";

export const loader = authenticateLoaderRequest(async ({ user }) => {
  const userId = (user as any).user.id;

  // Use proxy only in mock mode
  if (process.env.OAUTH_TEST_MODE === "true") {
    const backendUrl =
      process.env.DELIVR_BACKEND_URL || "http://localhost:3001";

    const resp = await fetch(`${backendUrl}/tenants`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userId}`, // mock expects Bearer
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
  const { data, status } = await CodepushService.getTenants(userId);
  return json(data, { status });
});