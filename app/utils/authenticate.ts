import {
  ActionFunction,
  ActionFunctionArgs,
  LoaderFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { AuthenticatorService } from "~/.server/services/Auth/Auth";
import { User } from "~/.server/services/Auth/Auth.interface";

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

type AuthenticatedActionFunction = (
  args: AuthenticatedRequestArgs<ActionFunctionArgs>
) => ReturnType<ActionFunction>;

export const authenticateActionRequest = (cb: AuthenticatedActionFunction) => {
  return async (args: LoaderFunctionArgs) => {
    const user = await AuthenticatorService.isAuthenticated(args.request);
    return cb({ ...args, user });
  };
};
