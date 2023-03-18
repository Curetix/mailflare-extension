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
