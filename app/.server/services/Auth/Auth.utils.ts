import type { SocialsProvider } from "remix-auth-socials";

export const getAuthenticatorCallbackUrl = (provider: SocialsProvider) => {
  return `/auth/${provider}/callback`;
};
