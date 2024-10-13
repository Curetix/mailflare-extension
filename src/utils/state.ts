import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { extensionLocalStorageInterface as storage } from "~utils/storage";

enum StorageKeys {
  MailflareSettings = "mailflare-settings",
  AliasSettings = "alias-settings",
  ZoneId = "zone-id",
  ApiToken = "api-token",
  QueryCache = "query-cache",
  Version = "version",
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
const AliasFormats = ["characters", "words", "domain", "custom"] as const;
type AliasFormat = (typeof AliasFormats)[number];

const AliasPrefixFormats = [
  "none",
  "domainWithoutExtension",
  "domainWithExtension",
  "fullDomain",
  "custom",
] as const;
type AliasPrefixFormat = (typeof AliasPrefixFormats)[number];

type AliasSettings = {
  domain?: string;
  format?: AliasFormat;
  characterCount?: number;
  wordCount?: number;
  separator?: string;
  prefixFormat?: AliasPrefixFormat;
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
  type AliasFormat,
  type AliasPrefixFormat,
  AliasFormats,
  AliasPrefixFormats,
  StorageKeys,
  apiTokenAtom,
  settingsAtom,
  aliasSettingsAtom,
  selectedZoneIdAtom,
  hostnameAtom,
  aliasSearchAtom,
};
