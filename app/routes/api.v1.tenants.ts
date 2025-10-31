import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import { authenticateLoaderRequest } from "~/utils/authenticate";

export const loader = authenticateLoaderRequest(async ({ user }) => {
  // Return mock data in test mode
  if (process.env.OAUTH_TEST_MODE === 'true' || process.env.NODE_ENV === 'test') {
    return json({
      organisations: [
        { 
          id: 'test-org-1',
          displayName: 'Test Organization',
          role: 'Owner'
        }
      ]
    }, { status: 200 });
  }

  const { data, status } = await CodepushService.getTenants(user.user.id);
  return json(data, { status });
});
