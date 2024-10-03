import { createRoute, redirect } from "@tanstack/react-router";
import { appLayoutRoute } from "./_layout";
import { Login } from "~/components/login";
import { isAuthenticated } from "../_auth";

export function LoginRoute() {
  return <Login />;
}

export const loginRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/app/login",
  component: LoginRoute,
  beforeLoad: async () => {
    const authenticated = await isAuthenticated();
    if (authenticated) {
      throw redirect({
        to: "/app",
      });
    }
  },
});
