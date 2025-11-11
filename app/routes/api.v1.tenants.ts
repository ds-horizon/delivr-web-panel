import { json } from "@remix-run/node";
import { authenticateLoaderRequest } from "~/utils/authenticate";
import { CodepushService } from "~/.server/services/Codepush";
import { isTestMode, getBackendUrl } from "~/utils/test-mode";

export const loader = authenticateLoaderRequest(async ({ user }) => {
  const userId = (user as any).user.id;

  // Use proxy in test mode
  if (isTestMode()) {
    const backendUrl = getBackendUrl();

    try {
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
    } catch (error) {
      console.error("Error fetching from mock server:", error);
      return json(
        {
          message: `Failed to connect to mock server at ${backendUrl}. Is it running? Error: ${error instanceof Error ? error.message : String(error)}`,
        },
        { status: 500 }
      );
    }
  }

  // Real dashboard path (unchanged)
  const { data, status } = await CodepushService.getTenants(userId);
  return json(data, { status });
});