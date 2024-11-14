import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import { authenticateLoaderRequest } from "~/utils/authenticate";

export const loader = authenticateLoaderRequest(async ({ user, params }) => {
  const { data, status } = await CodepushService.getReleasesForDeployentsForApp(
    {
      userId: user.user.id,
      appId: params.app ?? "",
      deploymentName: params.deploymentName ?? "",
    }
  );
  return json(data, { status });
});
