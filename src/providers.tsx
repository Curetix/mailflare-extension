import type { ReactNode } from "react";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import TypesafeI18n from "~i18n/i18n-react";
import { useEffect, useState } from "react";
import { localStorageDetector } from "typesafe-i18n/detectors";

import { detectLocale } from "~i18n/i18n-util";
import { loadLocaleAsync } from "~i18n/i18n-util.async";
import { ThemeProvider } from "~theme";
import { extensionStoragePersister } from "~utils/storage";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const detectedLocale = detectLocale(localStorageDetector);

export default function Providers({ children }: { children: ReactNode }) {
  const [localesLoaded, setLocalesLoaded] = useState(false);

  useEffect(() => {
    loadLocaleAsync(detectedLocale).then(() => setLocalesLoaded(true));
  }, []);

  if (!localesLoaded) {
    return null;
  }

  return (
    <TypesafeI18n locale={detectedLocale}>
      <ThemeProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{ persister: extensionStoragePersister }}>
          {children}
        </PersistQueryClientProvider>
      </ThemeProvider>
    </TypesafeI18n>
  );
}
