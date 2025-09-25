import { ActionFunction } from "@remix-run/node";
import { authenticateActionRequest } from "~/utils/authenticate";
import { env } from "~/.server/services/config";

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
      // Parse the multipart form data
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
      
      // We need an access key to call the CodePush server
      // TODO: Get access key from user session or create one
      // For now, we'll need to handle this properly
      
      if (!env.CODEPUSH_SERVER_URL) {
        // Development mode - return mock response
        const mockResponse = {
          package: {
            label: `v${Date.now()}`,
            appVersion: packageInfo.appVersion,
            description: packageInfo.description || "",
            packageHash: "mock-hash-" + Date.now(),
            blobUrl: "mock-blob-url",
            size: packageFile.size,
            rollout: packageInfo.rollout || 100,
            isMandatory: packageInfo.isMandatory || false,
            isDisabled: packageInfo.isDisabled || false,
            uploadTime: Date.now(),
          },
        };

        return new Response(JSON.stringify(mockResponse), {
          status: 201,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      // Create multipart form data for CodePush server
      const codePushFormData = new FormData();
      codePushFormData.append("package", packageFile);
      codePushFormData.append("packageInfo", packageInfoStr);

      // Get tenant ID from org parameter
      const tenantId = org; // Assuming org is the tenant ID

      // Make direct call to CodePush server using userId header authentication
      const codePushResponse = await fetch(
        `${env.CODEPUSH_SERVER_URL}/apps/${app}/deployments/${deploymentName}/release`,
        {
          method: "POST",
          headers: {
            "userId": user.user.id,
            "tenant": tenantId,
            "Accept": "application/vnd.code-push.v1+json",
          },
          body: codePushFormData,
        }
      );

      if (!codePushResponse.ok) {
        const errorText = await codePushResponse.text();
        console.error("CodePush server error:", errorText);
        
        // Try to parse the error text as JSON first, fallback to plain text
        let errorResponse;
        try {
          errorResponse = JSON.parse(errorText);
        } catch {
          errorResponse = errorText;
        }
        
        return new Response(
          JSON.stringify({ 
            message: errorText || `CodePush server error: ${codePushResponse.status} ${codePushResponse.statusText}`,
            details: errorText,
            originalError: errorResponse
          }),
          { status: codePushResponse.status, headers: { "Content-Type": "application/json" } }
        );
      }

      const responseData = await codePushResponse.json();
      return new Response(JSON.stringify(responseData), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
      
    } catch (error) {
      console.error("Release creation error:", error);
      return new Response(
        JSON.stringify({ 
          message: "Failed to create release", 
          error: error instanceof Error ? error.message : "Unknown error" 
        }),
        { status: 500 }
      );
    }
  },
});
