import { redirect } from "@remix-run/node";
import { SessionStorageService } from "~/.server/services/SessionStorage";

export const loader = async () => {
  if (process.env.OAUTH_TEST_MODE !== "true") {
    return redirect("/login");
  }

  const session = await SessionStorageService.sessionStorage.getSession();
  // Minimal mock user compatible with the app's expectations
  const mockUser = {
    user: { id: "test-user-playwright" },
    authenticated: true,
  };
  session.set(SessionStorageService.sessionKey, mockUser);

  const cookie = await SessionStorageService.sessionStorage.commitSession(session);
  return redirect("/dashboard", { headers: { "Set-Cookie": cookie } });
};


