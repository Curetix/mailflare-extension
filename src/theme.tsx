import type { ColorScheme, EmotionCache } from "@mantine/core";
import type { PropsWithChildren } from "react";

import { ColorSchemeProvider, MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useAtom } from "jotai";

import { themeAtom } from "~utils/state";

interface Props extends PropsWithChildren {
  emotionCache?: EmotionCache;
}

export function ThemeProvider({ emotionCache, children }: Props) {
  const [colorScheme, setColorScheme] = useAtom(themeAtom);
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
