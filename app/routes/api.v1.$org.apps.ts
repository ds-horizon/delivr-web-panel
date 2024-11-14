import { json } from "@remix-run/react";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";

const createDeployment: AuthenticatedActionFunction = async ({
  user,
  params,
  request,
}) => {
  try {
    const body = await request.json();
    const { data, status } = await CodepushService.createAppForTenant({
      userId: user.user.id,
      orgId: params.org ?? "",
      name: body.name ?? "",
    });
    return json(data, { status });
  } catch (e) {
    return json({ message: "Something Went Wrong" }, { status: 500 });
  }
};

export const loader = authenticateLoaderRequest(async ({ user, params }) => {
  try {
    const { data, status } = await CodepushService.getAppsForTenants({
      userId: user.user.id,
      tenant: params.org ?? "",
    });
    return json(data, { status });
  } catch (e) {
    return json({ message: "Something Went Wrong" }, { status: 500 });
  }
});

export const action = authenticateActionRequest({ POST: createDeployment });
