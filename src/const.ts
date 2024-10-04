import { version } from "../package.json";

const isWebApp = import.meta.env.MODE === "web";
const isExtension = !isWebApp;

const extensionName = "MailFlare";
const extensionVersion = version;
const emailRuleNamePrefix = `${extensionName.toLowerCase()}:`;

export { isWebApp, isExtension, extensionName, emailRuleNamePrefix, extensionVersion };
