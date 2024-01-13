import type { MantineThemeOverride } from "@mantine/core";
import type { PropsWithChildren, ReactNode } from "react";
import type { LocaleDetector } from "typesafe-i18n/detectors";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import TypesafeI18n from "~i18n/i18n-react";
import { useEffect, useMemo, useState } from "react";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { localStorageDetector } from "typesafe-i18n/detectors";

import { detectLocale } from "~i18n/i18n-util";
import { loadLocaleAsync } from "~i18n/i18n-util.async";
import { extensionStoragePersister } from "~utils/storage";

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

export default function Providers({ localeDetectors, children }: ProvidersProps) {
  const detectors = useMemo(() => [localStorageDetector, ...(localeDetectors || [])], []);
  const detectedLocale = useMemo(
    () => detectLocale(localStorageDetector, ...detectors),
    [detectors],
  );
  const [localesLoaded, setLocalesLoaded] = useState(false);
  const theme: MantineThemeOverride = {
    primaryColor: "blue",
  };

  useEffect(() => {
    loadLocaleAsync(detectedLocale).then(() => setLocalesLoaded(true));
  }, []);

  if (!localesLoaded) {
    return null;
  }

  return (
    <MantineProvider theme={theme}>
      <Notifications />
      <TypesafeI18n locale={detectedLocale}>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: extensionStoragePersister }}>
          {children}
        </PersistQueryClientProvider>
      </TypesafeI18n>
    </MantineProvider>
  );
}
