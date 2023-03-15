import type { EmotionCache } from "@mantine/core";
import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import type { PropsWithChildren } from "react";

import { useStorage } from "@plasmohq/storage/dist/hook";

import { StorageKey } from "~utils/storage";

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
        theme={{ colorScheme, primaryColor: "blue" }}
        withGlobalStyles
        withNormalizeCSS
        emotionCache={emotionCache}>
        <Notifications />
        {children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
