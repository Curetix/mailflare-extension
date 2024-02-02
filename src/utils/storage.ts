import type { PersistedClient, Persister } from "@tanstack/react-query-persist-client";
import type { AsyncStorage } from "jotai/vanilla/utils/atomWithStorage";

import { Storage } from "@plasmohq/storage";

import { isWebApp } from "~const";
import { StorageKeys } from "~utils/state";

export const extensionLocalStorage = new Storage({
  area: "local",
  allCopied: isWebApp,
});

export const extensionLocalStorageInterface: AsyncStorage<any> = {
  getItem: async (key: string, initialValue: any) => {
    return (await extensionLocalStorage.get<any>(key)) || initialValue;
  },
  setItem: async (key: string, newValue: any) => {
    await extensionLocalStorage.set(key, newValue);
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
