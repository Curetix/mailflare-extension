import { version } from "../package.json";

const isWebApp = !!import.meta && !!import.meta.env && !!import.meta.env.MODE;
const isExtension = !isWebApp;

const popupWidth = 400;
const popupHeight = 600;
const extensionName = "MailFlare";
const extensionVersion = version;
const emailRuleNamePrefix = `${extensionName.toLowerCase()}:`;

export {
  isWebApp,
  isExtension,
  popupWidth,
  popupHeight,
  extensionName,
  emailRuleNamePrefix,
  extensionVersion,
};
