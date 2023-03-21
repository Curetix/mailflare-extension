import type { PersistedClient, Persister } from "@tanstack/query-persist-client-core";

import { Storage } from "@plasmohq/storage";

export const extensionLocalStorage = new Storage({
  area: "local",
});

export const extensionLocalStorageInterface = {
  getItem: async (key: string) => {
    return await extensionLocalStorage.get<any>(key);
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
