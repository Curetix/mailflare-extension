import { Storage } from "@plasmohq/storage";
import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

import { isWebApp } from "~const";

export const extensionLocalStorage = new Storage({
  area: "local",
  allCopied: isWebApp,
});

export const extensionLocalStorageInterface = {
  getItem: async (key: string) => {
    return (await extensionLocalStorage.get<any>(key)) || undefined;
  },
  setItem: async (key: string, newValue: any) => {
    return extensionLocalStorage.set(key, newValue);
  },
  removeItem: async (key: string) => {
    return extensionLocalStorage.remove(key);
  },
};

const persistedClientKey = "reactQueryCache";
export const extensionStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await extensionLocalStorage.set(persistedClientKey, client);
  },
  restoreClient: async () => {
    return await extensionLocalStorage.get<PersistedClient>(persistedClientKey);
  },
  removeClient: async () => {
    await extensionLocalStorage.remove(persistedClientKey);
  },
};
