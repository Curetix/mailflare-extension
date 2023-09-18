import type { MantineThemeOverride } from "@mantine/core";
import type { PropsWithChildren } from "react";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

export function ThemeProvider({ children }: PropsWithChildren) {
  const theme: MantineThemeOverride = {
    primaryColor: "blue",
  };

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      {children}
    </MantineProvider>
  );
}
