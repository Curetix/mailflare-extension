import { version } from "../package.json";

const popupWidth = 400;
const popupHeight = 600;
const extensionName = "MailFlare";
const extensionVersion = version;
const emailRuleNamePrefix = `${extensionName.toLowerCase()}:`;

export { popupWidth, popupHeight, extensionName, emailRuleNamePrefix, extensionVersion };

export enum StorageKey {
  ApiToken = "apiToken",
  Destinations = "destination",
  Zones = "zones",
  AccountIdentifier = "accountIdentifier",
  SelectedZoneId = "selectedZoneId",
  AliasSettings = "aliasSettings",
  Theme = "theme",
  OnlyShowExtensionRules = "onlyShowExtensionRules",
  ReactQueryDevtoolsEnabled = "reactQueryDevtoolsEnabled",
}
