const popupWidth = 400;
const popupHeight = 600;
const emailRuleNamePrefix = "mailflare:";

export { popupWidth, popupHeight, emailRuleNamePrefix };

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
