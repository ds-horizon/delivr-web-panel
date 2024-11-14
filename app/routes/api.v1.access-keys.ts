import { json } from "@remix-run/react";
import { AxiosError } from "axios";
import { CodepushService } from "~/.server/services/Codepush";
import {
  authenticateActionRequest,
  AuthenticatedActionFunction,
  authenticateLoaderRequest,
} from "~/utils/authenticate";

const createToken: AuthenticatedActionFunction = async ({ user, request }) => {
  try {
    const body = await request.json();
    const { data, status } = await CodepushService.createAccessKey({
      userId: user.user.id,
      name: body.name ?? "",
    });
    return json(data, { status });
  } catch (e) {
    return json(
      { message: (e as AxiosError)?.response?.data ?? "Something Went Wrong" },
      { status: 500 }
    );
  }
};

export const loader = authenticateLoaderRequest(async ({ user }) => {
  try {
    const { data, status } = await CodepushService.getAccessKeys({
      userId: user.user.id,
    });
    return json(data, { status });
  } catch (e) {
    return json({ message: "Something Went Wrong" }, { status: 500 });
  }
});

export const action = authenticateActionRequest({ POST: createToken });
