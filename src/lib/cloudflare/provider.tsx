import type { ReactNode } from "react";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";

import { isWebApp } from "~const";
import { CloudflareApiClient } from "~lib/cloudflare";
import { apiTokenAtom } from "~utils/state";

const CloudflareApiContext = createContext<CloudflareApiClient | null>(null);

export function CloudflareApiProvider({ children }: { children: ReactNode }) {
  const [apiToken] = useAtom(apiTokenAtom);

  const api = useRef<CloudflareApiClient | null>(null);
  useEffect(() => {
    if (apiToken) {
      api.current = new CloudflareApiClient(
        apiToken,
        isWebApp ? (import.meta.env.DEV ? "http://localhost:4001/api" : "/api") : undefined,
      );
    }
  }, [apiToken]);

  return (
    <CloudflareApiContext.Provider value={api.current}>{children}</CloudflareApiContext.Provider>
  );
}

export function useCloudflareApi() {
  return useContext(CloudflareApiContext);
}
