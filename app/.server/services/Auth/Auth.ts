import { Authenticator } from "remix-auth";
import { GoogleStrategy } from "remix-auth-google";

import { SessionStorageService } from "../SessionStorage";

import { getAuthenticatorCallbackUrl } from "./Auth.utils";
import { AuthenticatorRoutes, User, UserReturnType } from "./Auth.interface";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
  TypedResponse,
} from "@remix-run/node";
import { env } from "../config";
import { CodepushService } from "../Codepush";
import { redirectTo } from "../Cookie";

export enum SocialsProvider {
  GOOGLE = "google",
}

type AuthRequest =
  | LoaderFunctionArgs["request"]
  | ActionFunctionArgs["request"];

export class Auth {
  static authenticator = new Authenticator<User>(
    SessionStorageService.sessionStorage,
    {
      sessionKey: SessionStorageService.sessionKey,
    }
  );

  constructor() {
    // In test mode, don't initialize real Google OAuth
    const isTestMode = env.NODE_ENV === 'test' || env.OAUTH_TEST_MODE === 'true';
    
    if (!isTestMode) {
      // Initialize real Google OAuth strategy
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
    } else {
      // Register a mock strategy so remix-auth doesn't throw "Strategy not found"
      // This strategy will never actually be called - we handle auth in authenticate() and callback()
      Auth.authenticator.use(
        new GoogleStrategy(
          {
            clientID: "mock-client-id",
            clientSecret: "mock-client-secret",
            callbackURL: "http://localhost:3000/auth/google/callback",
          },
          async () => {
            // This should never be called in test mode - return mock user as fallback
            return {
              authenticated: true,
              user: {
                id: 'mock-user',
                email: 'mock@test.com',
                name: 'Mock User',
                createdTime: Date.now(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            };
          }
        )
      );
    }
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

  async callback(provider: SocialsProvider, request: AuthRequest) {
    const isTestMode = env.NODE_ENV === 'test' || env.OAUTH_TEST_MODE === 'true';
    const redirectUri = await redirectTo.parse(request.headers.get("Cookie"));
    
    // In test mode, handle mock OAuth callback
    if (isTestMode) {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      
      if (error) {
        // Handle test OAuth error
        return redirect(`${AuthenticatorRoutes.LOGIN}?error=${error}`);
      }
      
      if (code && code.startsWith('mock-auth-code')) {
        // Create test session with mock user
        const session = await SessionStorageService.sessionStorage.getSession(
          request.headers.get("Cookie")
        );
        
        const mockUser: User = {
          authenticated: true,
          user: {
            id: 'test-user-id',
            email: 'test@delivr.com',
            name: 'Test User',
            createdTime: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        };
        
        session.set('_session', mockUser);
        
        const cookieHeader = await SessionStorageService.sessionStorage.commitSession(session);
        
        const finalRedirect = redirectUri ?? "/dashboard";
        
        return redirect(finalRedirect, {
          headers: {
            "Set-Cookie": cookieHeader,
          },
        });
      }
    }
    
    // Use real OAuth authenticator
    return Auth.authenticator.authenticate(provider, request, {
      failureRedirect: AuthenticatorRoutes.LOGIN,
      successRedirect: redirectUri ?? "/dashboard",
    });
  }

  async authenticate(provider: SocialsProvider, request: AuthRequest) {
    const isTestMode = env.NODE_ENV === 'test' || env.OAUTH_TEST_MODE === 'true';
    
    // In test mode, redirect to mock callback
    if (isTestMode) {
      const url = new URL(request.url);
      const callbackUrl = `${url.origin}/auth/google/callback?code=mock-auth-code-${Date.now()}&state=mock-state`;
      return redirect(callbackUrl);
    }
    
    // Use real OAuth authenticator
    return Auth.authenticator.authenticate(provider, request);
  }

  async isAuthenticated(
    request: AuthRequest
  ): Promise<User | TypedResponse<never>> {
    const apiKey = request.headers.get("api-key") ?? "";

    if (apiKey.length) {
      const { data } = await CodepushService.getUserByAccessKey(apiKey);
      return { ...data, authenticated: true };
    }

    try {
      return await Auth.authenticator.authenticate(
        SocialsProvider.GOOGLE,
        request,
        {
          throwOnError: true,
        }
      );
    } catch (e) {
      return redirect(AuthenticatorRoutes.LOGIN, {
        headers: {
          "Set-Cookie": await redirectTo.serialize(
            new URL(request.url).pathname
          ),
        },
      });
    }
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
