import { createBrowserHistory, createHashHistory, createRouter } from "@tanstack/react-router";
import { rootRoute } from "./_root";
import { homeRoute } from "./app/home";
import { settingsRoute } from "./app/settings";
import { loginRoute } from "./app/login";
import { isWebApp } from "~/const";
import { landingRoute } from "./landing";
import { createAliasRoute } from "./app/create";
import { appLayoutRoute } from "./app/_layout";
import { demoRoute } from "./demo";

// Use hash history for the extension and normal browser history for the web app
const history = isWebApp ? createBrowserHistory() : createHashHistory();

const routeTree = rootRoute.addChildren([
  landingRoute,
  demoRoute,
  appLayoutRoute,
  homeRoute,
  loginRoute,
  settingsRoute,
  createAliasRoute,
]);

export const router = createRouter({ routeTree, history });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
