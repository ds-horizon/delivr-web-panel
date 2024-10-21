import { Authenticator } from "remix-auth";
import { GoogleStrategy, SocialsProvider } from "remix-auth-socials";

import { SessionStorageService } from "../SessionStorage";

import { getAuthenticatorCallbackUrl } from "./Auth.utils";
import { AuthenticatorRoutes, UserReturnType } from "./Auth.interface";
import { DataFunctionArgs } from "@remix-run/node";
import { env } from "../config";

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
          // return await userDTO.findOrCreate(args.profile);
          return args;
        }
      )
    );
  }

  async getUser(request: DataFunctionArgs["request"]): Promise<UserReturnType> {
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

  callback(provider: SocialsProvider, request: DataFunctionArgs["request"]) {
    return Auth.authenticator.authenticate(provider, request, {
      failureRedirect: AuthenticatorRoutes.LOGIN,
      successRedirect: "/console/releases",
    });
  }

  async authenticate(
    provider: SocialsProvider,
    request: DataFunctionArgs["request"]
  ) {
    return Auth.authenticator.authenticate(provider, request);
  }

  async isAuthenticated(request: DataFunctionArgs["request"]) {
    return await Auth.authenticator.isAuthenticated(request, {
      failureRedirect: AuthenticatorRoutes.LOGIN,
    });
  }

  async logout(request: DataFunctionArgs["request"]) {
    return await Auth.authenticator.logout(request, {
      redirectTo: AuthenticatorRoutes.LOGIN,
    });
  }
}

const AuthenticatorService = new Auth();

export { AuthenticatorService };
