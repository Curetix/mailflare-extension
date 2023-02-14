import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import type { EmotionCache } from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import type { PropsWithChildren } from "react";

import { useStorage } from "@plasmohq/storage/dist/hook";

import { StorageKey } from "~const";

interface Props extends PropsWithChildren {
  emotionCache?: EmotionCache;
}

export function ThemeProvider({ emotionCache, children }: Props) {
  const [colorScheme, setColorScheme] = useStorage<"dark" | "light">(StorageKey.Theme);
  const toggleColorScheme = async (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        theme={{ colorScheme, primaryColor: "yellow" }}
        withGlobalStyles
        withNormalizeCSS
        emotionCache={emotionCache}>
        <NotificationsProvider>{children}</NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
