import { ActionFunction } from "@remix-run/node";
import { authenticateActionRequest } from "~/utils/authenticate";
import { CodepushService } from "~/.server/services/Codepush";

export const action: ActionFunction = authenticateActionRequest({
  POST: async ({ request, params, user }) => {
    const { org, app, deploymentName } = params;
    
    if (!org || !app || !deploymentName) {
      return new Response(
        JSON.stringify({ message: "Missing required parameters" }),
        { status: 400 }
      );
    }

    try {
      const userId = user.user.id;

      // Use proxy only in mock mode
      if (process.env.OAUTH_TEST_MODE === "true") {
        const backendUrl = process.env.DELIVR_BACKEND_URL || "http://localhost:3001";
        
        // Parse the multipart form data
        const formData = await request.formData();
        
        // Create new FormData for forwarding to mock backend
        const forwardFormData = new FormData();
        
        // Copy all fields from the original form data
        for (const [key, value] of formData.entries()) {
          forwardFormData.append(key, value);
        }
        
        // Forward to mock backend
        const appIdentifier = `${org}/${app}`;
        const resp = await fetch(
          `${backendUrl}/apps/${appIdentifier}/deployments/${deploymentName}/release`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${userId}`,
            },
            body: forwardFormData,
          }
        );

        const ct = resp.headers.get("content-type") || "";
        if (ct.includes("application/json")) {
          const data = await resp.json();
          return new Response(JSON.stringify(data), {
            status: resp.status,
            headers: { "Content-Type": "application/json" },
          });
        }
        return new Response(await resp.text(), { status: resp.status });
      }

      // Real dashboard path (unchanged)
      const formData = await request.formData();
      const packageFile = formData.get("package") as File;
      const packageInfoStr = formData.get("packageInfo") as string;
      
      if (!packageFile || !packageInfoStr) {
        return new Response(
          JSON.stringify({ message: "Missing package file or package info" }),
          { status: 400 }
        );
      }

      const packageInfo = JSON.parse(packageInfoStr);

      // Use CodepushService for consistent API handling
      const result = await CodepushService.createRelease({
        userId: user.user.id,
        tenant: org, // org is the tenant ID
        appId: app,
        deploymentName,
        packageFile,
        packageInfo,
      });

      // Check if CodepushService returned an error response
      if (result.error) {
        // Return the original error status and data from CodePush server
        return new Response(JSON.stringify(result.data), {
          status: result.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Success case
      return new Response(JSON.stringify(result.data), {
        status: result.status,
        headers: { "Content-Type": "application/json" },
      });
      
    } catch (error) {
      console.error("Release creation error:", error);
      
      // Handle unexpected errors (network issues, etc.)
      const errorMessage = error instanceof Error ? error.message : "Failed to create release";
      
      return new Response(
        JSON.stringify({ 
          message: errorMessage,
          details: errorMessage
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  },
});
