import { Storage } from "@plasmohq/storage";
import { SecureStorage } from "@plasmohq/storage/dist/secure";

export enum StorageKey {
  ApiToken = "apiToken",
  Destinations = "destination",
  Zones = "zones",
  AccountIdentifier = "accountIdentifier",
  SelectedZoneId = "selectedZoneId",
  AliasSettings = "aliasSettings",
  Theme = "theme",
  OnlyShowExtensionRules = "onlyShowExtensionRules",
  CopyAliasAfterCreation = "copyAliasAfterCreation",
  ShowCreateButton = "showCreateButton",
  ReactQueryDevtoolsEnabled = "reactQueryDevtoolsEnabled",
}

const extensionLocalStorage = new Storage({
  area: "local",
});

const extensionSyncStorage = new Storage({
  area: "sync",
});

export const secureStoragePassword = "892XBriLjpRdGsGxV5PwinE5Hc8mWate";
const extensionSecureStorage = new SecureStorage({
  area: "local",
});
extensionSecureStorage.setPassword(secureStoragePassword);

export { extensionLocalStorage, extensionSyncStorage, extensionSecureStorage };
