import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import { authenticateLoaderRequest } from "~/utils/authenticate";

export const loader = authenticateLoaderRequest(async ({ user }) => {
  // Return mock data in test mode
  if (process.env.OAUTH_TEST_MODE === 'true' || process.env.NODE_ENV === 'test') {
    return json({
      accountId: user.user.id,
      email: user.user.email,
      termsAccepted: true,
      isCurrentVersion: true,
      currentRequiredVersion: '1.0.0',
      isOwner: true,
      ownerAppCount: 1,
      termsVersion: '1.0.0',
      acceptedTime: Date.now(),
    }, { status: 200 });
  }

  try {
    const { data, status } = await CodepushService.getOwnerTermsStatus({
      userId: user.user.id,
    });
    return json(data, { status });
  } catch (error) {
    console.error('Error fetching owner terms status:', error);
    return json(
      { error: "Failed to fetch terms status" },
      { status: 500 }
    );
  }
});
