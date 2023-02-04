import { ColorScheme, ColorSchemeProvider, MantineProvider } from "@mantine/core";
import type { EmotionCache } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { NotificationsProvider } from "@mantine/notifications";
import type { PropsWithChildren } from "react";
import { useState } from "react";

interface Props extends PropsWithChildren {
  emotionCache?: EmotionCache;
}

export function ThemeProvider({ emotionCache, children }: Props) {
  const preferredColorScheme = useColorScheme("dark");
  const [colorScheme, setColorScheme] = useState<ColorScheme>(preferredColorScheme);
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        theme={{ colorScheme, primaryColor: "orange" }}
        withGlobalStyles
        withNormalizeCSS
        emotionCache={emotionCache}>
        <NotificationsProvider>{children}</NotificationsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
