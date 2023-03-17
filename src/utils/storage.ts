import { atomWithStorage, unstable_NO_STORAGE_VALUE } from "jotai/utils";

import { Storage } from "@plasmohq/storage";

import type { CloudflareEmailDestination, CloudflareZone } from "~utils/cloudflare";

const extensionLocalStorage = new Storage({
  area: "local",
});

const storage = {
  getItem: async (key: string) => {
    const value = await extensionLocalStorage.get<any>(key);
    return value || unstable_NO_STORAGE_VALUE;
  },
  setItem: async (key: string, newValue: any) => {
    return extensionLocalStorage.set(key, newValue);
  },
  removeItem: async (key: string) => {
    return extensionLocalStorage.remove(key);
  },
};

// Settings
const apiTokenAtom = atomWithStorage<string>("apiToken", null, storage);
const themeAtom = atomWithStorage<"dark" | "light">("theme", "light", storage);
const ruleFilterAtom = atomWithStorage<boolean>("ruleFilter", true, storage);
const copyAliasAtom = atomWithStorage<boolean>("copyAliasAfterCreation", true, storage);
const showCreateButtonAtom = atomWithStorage<boolean>("showCreateButton", true, storage);
const devToolsAtom = atomWithStorage<boolean>("devToolsEnabled", false, storage);
const aliasSettingsAtom = atomWithStorage<{
  format?: string;
  characterCount?: number;
  wordCount?: number;
  separator?: string;
  prefixFormat?: string;
  destination?: string;
}>("aliasSettings", {}, storage);

// Cached data
const destinationsAtom = atomWithStorage<CloudflareEmailDestination[]>("destination", [], storage);
const zonesAtom = atomWithStorage<CloudflareZone[]>("zones", [], storage);
const accountIdAtom = atomWithStorage<string>("accountId", null, storage);
const selectedZoneIdAtom = atomWithStorage<string>("selectedZoneId", null, storage);

export {
  apiTokenAtom,
  themeAtom,
  ruleFilterAtom,
  copyAliasAtom,
  showCreateButtonAtom,
  devToolsAtom,
  aliasSettingsAtom,
  destinationsAtom,
  zonesAtom,
  accountIdAtom,
  selectedZoneIdAtom,
};
