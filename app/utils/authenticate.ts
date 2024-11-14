import {
  ActionFunction,
  ActionFunctionArgs,
  json,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { AuthenticatorService } from "~/.server/services/Auth/Auth";
import { User } from "~/.server/services/Auth/Auth.interface";

export enum ActionMethods {
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

type AuthenticatedRequestArgs<T> = T & { user: User };

type AuthenticatedLoaderFunction = (
  args: AuthenticatedRequestArgs<LoaderFunctionArgs>
) => ReturnType<LoaderFunction>;

export const authenticateLoaderRequest = (cb?: AuthenticatedLoaderFunction) => {
  return async (args: LoaderFunctionArgs) => {
    const user = await AuthenticatorService.isAuthenticated(args.request);
    return cb?.({ ...args, user }) ?? user;
  };
};

export type AuthenticatedActionFunction = (
  args: AuthenticatedRequestArgs<ActionFunctionArgs>
) => ReturnType<ActionFunction>;

type AuthenticatedActionFunctionArgs = Partial<
  Record<ActionMethods, AuthenticatedActionFunction>
>;

export const authenticateActionRequest = (
  cb: AuthenticatedActionFunctionArgs
) => {
  return async (args: ActionFunctionArgs) => {
    const method = args.request.method as ActionMethods;

    if (!cb[method]) {
      return json(
        { message: `${args.request.method} not allowed` },
        { status: 405 }
      );
    }

    const user = await AuthenticatorService.isAuthenticated(args.request);
    return cb[method]({ ...args, user });
  };
};
