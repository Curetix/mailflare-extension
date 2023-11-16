import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { extensionLocalStorageInterface as storage } from "~utils/storage";

export enum StorageKeys {
  MailflareSettings = "mailflare-settings",
  AliasSettings = "alias-settings",
  ZoneId = "zone-id",
  ApiToken = "api-token",
  QueryCache = "query-cache",
}

/*
 * General Settings
 */
type Settings = {
  ruleFilter: boolean;
  copyAlias: boolean;
  devTools: boolean;
  showCreateButton: boolean;
  theme: "dark" | "light";
};
const settingsAtom = atomWithStorage<Settings>(
  StorageKeys.MailflareSettings,
  {
    ruleFilter: true,
    copyAlias: true,
    devTools: false,
    showCreateButton: false,
    theme: "light",
  },
  storage,
);
settingsAtom.debugLabel = "settingsAtom";

/*
 * Alias Settings
 */
type AliasSettings = {
  format?: "characters" | "words" | "custom";
  characterCount?: number;
  wordCount?: number;
  separator?: string;
  prefixFormat?:
    | "fullDomain"
    | "domainWithExtension"
    | "domainWithoutExtension"
    | "custom"
    | "none";
  destination?: string;
};
const aliasSettingsAtom = atomWithStorage<AliasSettings>(StorageKeys.AliasSettings, {}, storage);
aliasSettingsAtom.debugLabel = "aliasSettingsAtom";

/*
 * Cloudflare
 */
const selectedZoneIdAtom = atomWithStorage<string | null>(StorageKeys.ZoneId, null, storage);
selectedZoneIdAtom.debugLabel = "selectedZoneIdAtom";

const apiTokenAtom = atomWithStorage<string | null>(StorageKeys.ApiToken, null, storage);
apiTokenAtom.debugLabel = "apiTokenAtom";

/*
 * Normal State
 */
const hostnameAtom = atom<string>("");
hostnameAtom.debugLabel = "hostnameAtom";

const aliasSearchAtom = atom<string>("");
aliasSearchAtom.debugLabel = "aliasSearchAtom";

export {
  type Settings,
  type AliasSettings,
  apiTokenAtom,
  settingsAtom,
  aliasSettingsAtom,
  selectedZoneIdAtom,
  hostnameAtom,
  aliasSearchAtom,
};
