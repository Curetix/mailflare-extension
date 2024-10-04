import { createRoute, redirect } from "@tanstack/react-router";
import { appLayoutRoute } from "./_layout";
import { isAuthenticated } from "../_auth";
import { AliasCreateForm } from "~/components/forms/create-alias";

export function CreateAliasRoute() {
  return <AliasCreateForm />;
}

export const createAliasRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/app/create",
  component: CreateAliasRoute,
  beforeLoad: async () => {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      throw redirect({
        to: "/app/login",
      });
    }
  },
});
