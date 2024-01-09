import type { ReactNode } from "react";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import TypesafeI18n from "~i18n/i18n-react";
import { useEffect, useState } from "react";

import { loadLocale } from "~i18n/i18n-util.sync";
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

export default function Providers({ children }: { children: ReactNode }) {
  const locale = "en";
  const [localesLoaded, setLocalesLoaded] = useState(false);

  useEffect(() => {
    loadLocale(locale);
    setLocalesLoaded(true);
  }, [locale]);

  if (!localesLoaded) {
    return null;
  }

  return (
    <TypesafeI18n locale={locale}>
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
