import type { ReactNode } from "react";
import type { LocaleDetector } from "typesafe-i18n/detectors";
import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useEffect, useMemo, useState } from "react";
import { localStorageDetector } from "typesafe-i18n/detectors";
import TypesafeI18n from "~/i18n/i18n-react";
import { detectLocale } from "~/i18n/i18n-util";
import { loadLocaleAsync } from "~/i18n/i18n-util.async";
import { extensionStoragePersister } from "~/utils/storage";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "~/utils/theme";
import { ThemeProvider } from "next-themes";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

type ProvidersProps = {
  localeDetectors?: LocaleDetector[];
  children: ReactNode;
};

export function Providers({ localeDetectors, children }: ProvidersProps) {
  const detectors = useMemo(
    () => [localStorageDetector, ...(localeDetectors || [])],
    [localeDetectors],
  );
  const detectedLocale = useMemo(
    () => detectLocale(localStorageDetector, ...detectors),
    [detectors],
  );
  const [localesLoaded, setLocalesLoaded] = useState(false);

  useEffect(() => {
    loadLocaleAsync(detectedLocale).then(() => setLocalesLoaded(true));
  }, [detectedLocale]);

  if (!localesLoaded) {
    return null;
  }

  return (
    <ThemeProvider attribute="class">
      <ChakraProvider value={system}>
        <TypesafeI18n locale={detectedLocale}>
          <PersistQueryClientProvider
            client={queryClient}
            persistOptions={{ persister: extensionStoragePersister }}>
            {children}
          </PersistQueryClientProvider>
        </TypesafeI18n>
      </ChakraProvider>
    </ThemeProvider>
  );
}
