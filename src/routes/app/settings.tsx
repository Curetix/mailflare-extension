import { createRoute } from "@tanstack/react-router";
import { appLayoutRoute } from "./_layout";
import { SettingsList } from "~/components/settings-modal";

export function SettingsRoute() {
  return <SettingsList />;
}

export const settingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: "/app/settings",
  component: SettingsRoute,
});
