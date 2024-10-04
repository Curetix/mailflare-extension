import type { LocaleDetector } from "typesafe-i18n/detectors";
import { Providers } from "~/providers";
import { router } from "~/routes/_router";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "~/components/ui/toaster";

type AppProps = {
  localeDetectors?: LocaleDetector[];
};

export function App({ localeDetectors }: AppProps) {
  return (
    <Providers localeDetectors={localeDetectors}>
      <Toaster />
      <RouterProvider router={router} />
    </Providers>
  );
}
