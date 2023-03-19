import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import type { ParseResultListed } from "parse-domain";

import { extensionLocalStorageInterface as storage } from "~utils/storage";

// Settings
const apiTokenAtom = atomWithStorage<string | null>("apiToken", null, storage);
const themeAtom = atomWithStorage<"dark" | "light">("theme", "light", storage);
const ruleFilterAtom = atomWithStorage<boolean>("ruleFilter", true, storage);
const copyAliasAtom = atomWithStorage<boolean>("copyAliasAfterCreation", true, storage);
// const showCreateButtonAtom = atomWithStorage<boolean>("showCreateButton", true, storage);
const devToolsAtom = atomWithStorage<boolean>("devToolsEnabled", false, storage);
const aliasSettingsAtom = atomWithStorage<{
  format?: string;
  characterCount?: number;
  wordCount?: number;
  separator?: string;
  prefixFormat?: string;
  destination?: string;
}>("aliasSettings", {}, storage);

const selectedZoneIdAtom = atomWithStorage<string | null>("selectedZoneId", null, storage);

// State data
const hostnameAtom = atom<ParseResultListed | null>(null);

export {
  apiTokenAtom,
  themeAtom,
  ruleFilterAtom,
  copyAliasAtom,
  // showCreateButtonAtom,
  devToolsAtom,
  aliasSettingsAtom,
  selectedZoneIdAtom,
  hostnameAtom,
};
