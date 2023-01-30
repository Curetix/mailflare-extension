import { MantineProvider } from "@mantine/core";
import type { EmotionCache } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import type { PropsWithChildren } from "react";

interface Props extends PropsWithChildren {
  emotionCache?: EmotionCache;
}

export function ThemeProvider({ emotionCache, children }: Props) {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS emotionCache={emotionCache}>
      <NotificationsProvider>{children}</NotificationsProvider>
    </MantineProvider>
  );
}
