import { createRoute, redirect } from "@tanstack/react-router";
import { appLayoutRoute } from "./_layout";
import { AliasList } from "~/components/alias-list";
import { isAuthenticated } from "../_auth";

export function HomeRoute() {
  return <AliasList />;
}

export const homeRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/app",
  component: HomeRoute,
  beforeLoad: async () => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      throw redirect({
        to: "/app/login",
      });
    }
  },
});
