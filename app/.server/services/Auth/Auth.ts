import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";

import { SessionStorageService } from "../SessionStorage";

import { getAuthenticatorCallbackUrl } from "./Auth.utils";
import { AuthenticatorRoutes, UserReturnType } from "./Auth.interface";
import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { env } from "../config";
import { CodepushService } from "../Codepush";

export enum SocialsProvider {
  GOOGLE = "google",
}

type AuthRequest =
  | LoaderFunctionArgs["request"]
  | ActionFunctionArgs["request"];

export class Auth {
  static authenticator = new Authenticator(
    SessionStorageService.sessionStorage,
    {
      sessionKey: SessionStorageService.sessionKey,
    }
  );

  constructor() {
    Auth.authenticator.use(
      new GoogleStrategy(
        {
          clientID: env.GOOGLE_CLIENT_ID ?? "",
          clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
          callbackURL: getAuthenticatorCallbackUrl(SocialsProvider.GOOGLE),
          prompt: "consent",
        },
        async (args) => {
          return CodepushService.getUser(args.extraParams.id_token);
        }
      )
    );
  }

  async getUser(request: AuthRequest): Promise<UserReturnType> {
    const session = await SessionStorageService.sessionStorage.getSession(
      request.headers.get("Cookie")
    );

    const user = session.get("_session") ?? null;

    if (user) {
      try {
        const currentUser = "hello";
        session.set("_session", currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
        session.unset("_session");
        const cookieHeader =
          await SessionStorageService.sessionStorage.commitSession(session);
        return {
          redirect: true,
          url: AuthenticatorRoutes.LOGIN,
          cookieHeader,
        };
      }
    }

    return { user: session.get("_session") ?? null, session };
  }

  callback(provider: SocialsProvider, request: AuthRequest) {
    return Auth.authenticator.authenticate(provider, request, {
      failureRedirect: AuthenticatorRoutes.LOGIN,
      successRedirect: "/dashboard",
    });
  }

  async authenticate(provider: SocialsProvider, request: AuthRequest) {
    return Auth.authenticator.authenticate(provider, request);
  }

  async isAuthenticated(request: AuthRequest) {
    return await Auth.authenticator.isAuthenticated(request, {
      failureRedirect: AuthenticatorRoutes.LOGIN,
    });
  }

  async isLoggedIn(request: AuthRequest) {
    return await Auth.authenticator.isAuthenticated(request, {
      successRedirect: "/dashboard",
    });
  }

  async logout(request: AuthRequest) {
    return await Auth.authenticator.logout(request, {
      redirectTo: AuthenticatorRoutes.LOGIN,
    });
  }
}

const AuthenticatorService = new Auth();

export { AuthenticatorService };
