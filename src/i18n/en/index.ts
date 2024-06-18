import type { BaseTranslation } from "../i18n-types";

const en = {
  // General
  YES: "Yes",
  NO: "No",
  SAVE: "Save",
  OPEN: "Open",
  REFRESH: "Refresh",
  COPY: "Copy",
  INFO: "Info",
  SUCCESS: "Success",
  ERROR: "Error",
  ALIAS: "Alias",
  NOT_FOUND: "Not found",
  UPDATED_TITLE: "Updated",
  UPDATED_DESCRIPTION: "MailFlare was updated to version {newVersion}",

  // Login
  INSTRUCTIONS: "Instructions",
  CLOUDFlARE_TOKEN_LABEL: "Cloudflare API Token",
  CLOUDFLARE_TOKEN_PLACEHOLDER: "Paste your Cloudflare API token here",
  CLOUDFLARE_LOGIN_ERROR: "Token could not be verified. Is it correct?",
  CLOUDFLARE_TOKEN_STEP_1: "Open https://dash.cloudflare.com/profile/api-tokens",
  CLOUDFLARE_TOKEN_STEP_2: "Click \"Create Token\", select \"Create Custom Token\"",
  CLOUDFLARE_TOKEN_STEP_3: "Choose a name, like \"Email Extension\"",
  CLOUDFLARE_TOKEN_STEP_4: "Configure the following permissions:",
  CLOUDFLARE_TOKEN_STEP_5: "Set \"Account Resources\" to your account",
  CLOUDFLARE_TOKEN_STEP_6: "Set \"Zone Resources\" to \"All zones\" or select the zone you want to use",
  CLOUDFLARE_TOKEN_STEP_7: "Configure \"Client IP Address Filtering\" and \"TTL\" if you want to",
  CLOUDFLARE_TOKEN_STEP_8: "Click \"Continue to summary\" and then \"Create token\"",
  CLOUDFLARE_TOKEN_STEP_9: "Paste the generated token above",

  // Settings
  SETTINGS: "Settings",
  ON: "ON",
  OFF: "OFF",
  THEME: "Theme",
  THEME_DESC: "Toggle between theme modes",
  THEME_DARK: "Dark",
  THEME_LIGHT: "Light",
  THEME_AUTO: "Auto",
  LANGUAGE: "Language",
  LANGUAGE_DESC: "Choose a language for the UI",
  LANGUAGE_ENGLISH: "🇬🇧 English",
  LANGUAGE_GERMAN: "🇩🇪 German (Deutsch)",
  LANGUAGE_DUTCH: "🇳🇱 Dutch (Nederlands)",
  LANGUAGE_CHINESE: "🇨🇳 Chinese (中文)",
  RULE_FILTER: "Rule Filter",
  RULE_FILTER_DESC: "Only show email rules created by this extension",
  COPY_ALIAS: "Copy Alias",
  COPY_ALIAS_DESC: "Copy alias to clipboard after creating it",
  QUICK_CREATE_BUTTON: "Show Quick-Create Button",
  QUICK_CREATE_BUTTON_DESC:
    "Show a button inside email input fields to quickly create an alias for the current site",
  REFRESH_DATA: "Refresh data",
  REFRESH_DATA_DESC: "Refresh Cloudflare domains and email destinations",
  REFRESH_DATA_SUCCESS: "Refreshed successfully",
  LOGOUT: "Logout",
  LOGOUT_DESC: "Clear all data and settings",
  LOGOUT_SUCCESS: "Goodbye",
  LOGOUT_TITLE: "Confirm Logout",
  LOGOUT_CONFIRM: "Do you want to log out? All local data will be deleted, but your aliases will of course keep working.",
  DOCS: "Cloudflare Docs",
  DOCS_DESC: "For more information about Email Routing",
  GITHUB: "GitHub",
  DEVTOOLS: "Dev Tools",
  DEVTOOLS_DESC: "Enable development tools",

  // Alias List
  DOMAIN: "Domain",
  INVALID: "Invalid",
  EXTERNAL: "External",
  DISABLED: "Disabled",
  CREATE: "Create",
  EDIT: "Edit",
  DELETE: "Delete",
  SELECT: "Select",
  STOP_SELECT: "Stop Select",
  SEARCH: "Search",
  STOP_SEARCH: "Hide Search",
  SEARCH_PLACEHOLDER: "Search aliases",
  NO_ZONES_TITLE: "Bummer!",
  NO_ZONES: "No domains for this Cloudflare account or API token.",
  ZONES_ERROR_TITLE: "Oh no!",
  ZONES_ERROR: "Something went wrong while loading your domains: {error}",
  EMAIL_ROUTING_NOT_ENABLED_TITLE: "Oh no!",
  EMAIL_ROUTING_NOT_ENABLED: "Email Routing is either disabled or not configured properly for this domain. Please check the configuration here: ",
  EMAIL_ROUTING_DASHBOARD: "Cloudflare Dashboard",
  NO_RULES_TITLE: "Bummer!",
  NO_RULES: "There are no aliases for this domain or this filter.",
  RULES_ERROR_TITLE: "Oh no!",
  RULES_ERROR: "Something went wrong while loading your aliases: {error}",

  // Alias Card
  COPY_SUCCESS: "Email address was copied to the clipboard",
  NO_ALIAS_DESCRIPTION: "(no description)",

  // Create Alias Modal
  CREATE_MODAL_TITLE: "Create alias",
  INVALID_DOMAIN: "Invalid domain",
  INVALID_FORMAT: "Invalid alias format",
  INVALID_LENGTH: "Must be between 3 and 25 characters",
  INVALID_WORD_COUNT: "Must be between 1 and 5",
  INVALID_CUSTOM_ALIAS: "Must be at least 3 characters",
  INVALID_PREFIX_FORMAT: "Invalid prefix format",
  INVALID_CUSTOM_PREFIX: "Must be at least 1 character",
  INVALID_DESTINATION: "Invalid destination",
  DOMAIN_NOT_FOUND: "Could not find the domain",
  CONFLICT: "Conflict",
  ALIAS_ALREADY_EXISTS: "This alias already exists",
  ALIAS_GENERATION_ERROR:
    "Could not generate a unique alias after 3 attempts. Try again with changed settings.",
  ALIAS_CREATED: "The alias was created",
  ALIAS_CREATED_AND_COPIED: "The alias was created and copied to the clipboard",
  ALIAS_CREATION_ERROR: "Could not create alias",
  MODAL_CLOSE_BLOCKED: "Cannot be closed right now",
  ZONES_LOADING_ERROR: "Error loading domains",
  ALIAS_FORMAT: "Format",
  ALIAS_FORMAT_CHARS: "Random characters",
  ALIAS_FORMAT_WORDS: "Random words",
  ALIAS_FORMAT_DOMAIN: "Domain",
  ALIAS_FORMAT_CUSTOM: "Custom",
  NUMBER_OF_CHARS: "Number of characters",
  NUMBER_OF_WORDS: "Number of words",
  CUSTOM_ALIAS: "Custom alias",
  ALIAS_DESCRIPTION: "Description",
  ALIAS_DESCRIPTION_PLACEHOLDER: "Alias description (optional)",
  PREFIX: "Prefix",
  PREFIX_NONE: "None",
  PREFIX_DOMAIN_WITHOUT_EXTENSION: "Domain without extension",
  PREFIX_DOMAIN_WITH_EXTENSION: "Base domain",
  PREFIX_FULL_DOMAIN: "Full domain",
  PREFIX_CUSTOM: "Custom",
  PREFIX_CUSTOM_LABEL: "Custom alias prefix",
  ALIAS_FORMAT_DOMAIN_TYPE: "Domain Format",
  GENERATED_ALIAS: "Generated alias",
  GENERATED_ALIAS_UNAVAILABLE: "Unavailable",
  DESTINATION: "Destination",
  DESTINATIONS_LOADING_ERROR: "Error loading destinations",
  DESTINATION_NOT_VERIFIED: "This address is not verified, ou will not receive emails.",
  SAVE_SETTINGS: "Save settings",
  DELETE_SUCCESS: "The alias was deleted",
  DELETE_SUCCESS_MULTIPLE: "The selected aliases were deleted",
  DELETE_ERROR: "Error deleting alias {alias}: {error}",
  DELETE_TITLE: "Delete alias",
  DELETE_QUESTION_1: "You are about to delete the alias",
  DELETE_QUESTION_2: "Do you want to proceed?",
  DELETE_MULTIPLE_TITLE: "Delete aliases",
  DELETE_MULTIPLE_QUESTION: "You are about to delete {count} aliases.",
  UPDATE_ERROR: "Error saving alias {alias}: {error}",
  UPDATE_SUCCESS: "The alias was saved",
  UPDATE_SUCCESS_MULTIPLE: "The selected aliases were saved",
  ENABLED: "Enabled",
  UPDATE_TITLE: "Edit alias",
  UPDATE_MULTIPLE_TITLE: "Edit aliases",
  KEEP_DESTINATIONS: "Keep original destinations",

  // BGSW and Content Scripts
  BG_ERROR_NOT_LOGGED_IN: "Not logged in",
  BG_ERROR_NO_DOMAIN: "No domain selected",
  BG_ERROR_INVALID_DOMAIN: "Selected domain not found",
  BG_ERROR_NO_DESTINATION: "No destination selected",
  BG_ERROR_CUSTOM: "Cannot generate an alias when the (prefix) format is set to Custom",
  BG_ALERT_LOADING: "Creating new alias",
  BG_ALERT_CREATED: "Alias created: {alias}",
  CONTEXT_MENU_ENTRY_TEXT: "Create new MailFlare Alias and copy it",
  QUICK_CREATE_BUTTON_TOOLTIP_TEXT: "Create a new MailFlare Alias",

  // Permissions Modal
  PERMISSION_MISSING_TITLE: "Missing Permission",
  PERMISSION_MISSING_MESSAGE:
    "This extension requires a browser permission to access the Cloudflare API. Please click the button below to request the permission, otherwise the extension will not work.",
  REQUEST_PERMISSION: "Request Permission",
  PERMISSION_REQUEST_ERROR_TITLE: "Permission not granted",
  PERMISSION_REQUEST_ERROR_MESSAGE: "There was an error during the permission request.",
} satisfies BaseTranslation;

export default en;
