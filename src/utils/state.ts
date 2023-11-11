import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import { extensionLocalStorageInterface as storage } from "~utils/storage";

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
const settingsAtom = atomWithStorage<Settings>("mailflare-settings", {
  ruleFilter: true,
  copyAlias: true,
  devTools: false,
  showCreateButton: false,
  theme: "light",
});

/*
 * Alias Settings
 */
type AliasSettings = {
  format?: string;
  characterCount?: number;
  wordCount?: number;
  separator?: string;
  prefixFormat?: string;
  destination?: string;
};
const aliasSettingsAtom = atomWithStorage<AliasSettings>("alias-settings", {}, storage);

/*
 * Cloudflare
 */
const selectedZoneIdAtom = atomWithStorage<string | null>("zone-id", null, storage);
const apiTokenAtom = atomWithStorage<string | null>("api-token", null, storage);

/*
 * Normal State
 */
const hostnameAtom = atom<string>("");
const aliasSearchAtom = atom<string>("");

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
