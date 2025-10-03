import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
} from "~/utils/authenticate";

const acceptTerms: AuthenticatedActionFunction = async ({
  user,
  request,
}) => {
  try {
    const body = await request.json();
    const isInvalidVersion = !body.termsVersion || typeof body.termsVersion !== 'string';
    
    if (isInvalidVersion) {
      return json(
        { error: "termsVersion is required and must be a string" },
        { status: 400 }
      );
    }

    // Validate terms version format (basic validation)
    if (body.termsVersion.length > 50) {
      return json(
        { error: "termsVersion is too long" },
        { status: 400 }
      );
    }

    const { data, status } = await CodepushService.acceptTerms({
      userId: user.user.id,
      termsVersion: body.termsVersion,
    });
    
    return json(data, { status });
  } catch (error) {
    console.error('Error accepting terms:', error);
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    
    return json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const action = authenticateActionRequest({ POST: acceptTerms });
