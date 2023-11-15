import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";

import { Storage } from "@plasmohq/storage";

import { isWebApp } from "~const";
import { StorageKeys } from "~utils/state";

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

export const extensionStoragePersister: Persister = {
  persistClient: async (client: PersistedClient) => {
    await extensionLocalStorage.set(StorageKeys.QueryCache, client);
  },
  restoreClient: async () => {
    return await extensionLocalStorage.get<PersistedClient>(StorageKeys.QueryCache);
  },
  removeClient: async () => {
    await extensionLocalStorage.remove(StorageKeys.QueryCache);
  },
};
