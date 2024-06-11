import type { Translation } from "../i18n-types";

const nl = {
  // General
  YES: "Ja",
  NO: "Nee",
  SAVE: "Opslaan",
  OPEN: "Open",
  REFRESH: "Ververs",
  COPY: "Kopiëren",
  INFO: "Info",
  SUCCESS: "Success",
  ERROR: "Fout",
  ALIAS: "Alias",
  NOT_FOUND: "Niet gevonden",
  UPDATED_TITLE: "Geüpdatet",
  UPDATED_DESCRIPTION: "MailFlare is geüpdatet naar versie {newVersion}",

  // Login
  INSTRUCTIONS: "Instructies",
  CLOUDFlARE_TOKEN_LABEL: "Cloudflare API Token",
  CLOUDFLARE_TOKEN_PLACEHOLDER: "Plak je Cloudflare API token hier",
  CLOUDFLARE_LOGIN_ERROR: "Token kon niet worden geverifieerd. Is het correct?",
  CLOUDFLARE_TOKEN_STEP_1: "Open https://dash.cloudflare.com/profile/api-tokens",
  CLOUDFLARE_TOKEN_STEP_2: 'Klik "Create Token", en selecteer "Create Custom Token"',
  CLOUDFLARE_TOKEN_STEP_3: 'Kies een naam, bijvoorbeeld "Email Extensie"',
  CLOUDFLARE_TOKEN_STEP_4: "Wijzig de volgende permissies:",
  CLOUDFLARE_TOKEN_STEP_4_1: "Account | Email Routing Addresses | Read",
  CLOUDFLARE_TOKEN_STEP_4_2: "Zone | Email Routing Rules | Edit",
  CLOUDFLARE_TOKEN_STEP_4_3: "Zone | Zone | Read",
  CLOUDFLARE_TOKEN_STEP_5: 'Zet "Account Resources" naar jouw account',
  CLOUDFLARE_TOKEN_STEP_6:
    'Zet "Zone Resources" naar "All zones" of selecteer de zone die je wilt gebruiken',
  CLOUDFLARE_TOKEN_STEP_7: 'Wijzig "Client IP Address Filtering" en "TTL" als u dat wilt gebruiken',
  CLOUDFLARE_TOKEN_STEP_8: 'Klik "Continue to summary" en then "Create token"',
  CLOUDFLARE_TOKEN_STEP_9: "Plak de gegenereerde token hierboven",

  // Settings
  ON: "AAN",
  OFF: "UIT",
  THEME: "Thema",
  THEME_DESC: "kies een thema voor de UI",
  THEME_DARK: "Donker",
  THEME_LIGHT: "Licht",
  THEME_AUTO: "Auto",
  LANGUAGE: "Taal",
  LANGUAGE_DESC: "kies een taal voor de extensie",
  LANGUAGE_ENGLISH: "🇬🇧 Engels (English)",
  LANGUAGE_GERMAN: "🇩🇪 German (Deutsch)",
  LANGUAGE_DUTCH: "🇳🇱 Nederlands",
  LANGUAGE_CHINESE: "🇨🇳 Chinees (中文)",
  RULE_FILTER: "Regel Filter",
  RULE_FILTER_DESC: "Toon alleen email regels die door deze extensie zijn gemaakt",
  COPY_ALIAS: "Kopieer Alias",
  COPY_ALIAS_DESC: "Kopieer alias naar klembord na het maken ervan",
  QUICK_CREATE_BUTTON: "Toon Quick-Create Knop",
  QUICK_CREATE_BUTTON_DESC:
    "Toon een knop in email invoervelden om snel een alias te maken voor de huidige site",
  REFRESH_DATA: "Ververs data",
  REFRESH_DATA_DESC: "Ververs Cloudflare domeinen en email bestemmingen",
  REFRESH_DATA_SUCCESS: "Succesvol ververst",
  LOGOUT: "Uitloggen",
  LOGOUT_DESC: "Wis alle data en instellingen",
  LOGOUT_SUCCESS: "Uitgelogd",
  LOGOUT_TITLE: "Uitschrijving bevestigen",
  LOGOUT_CONFIRM: "Wilt u uitloggen? Alle lokale gegevens worden verwijderd, maar je aliassen blijven werken.",
  DOCS: "Documentatie",
  DOCS_DESC: "Bekijk de documentatie voor hulp en informatie",
  GITHUB: "GitHub",
  DEVTOOLS: "Dev Tools",
  DEVTOOLS_DESC: "Toon de ontwikkelaarstools voor debugging en inspectie",

  // Alias List
  DOMAIN: "Domein",
  INVALID: "Ongeldig",
  EXTERNAL: "Extern",
  DISABLED: "Uitgeschakeld",
  CREATE: "Aanmaken",
  EDIT: "Bewerken",
  DELETE: "Verwijderen",
  SELECT: "Selecteren",
  STOP_SELECT: "Selecteren stoppen",
  SEARCH: "Zoeken",
  STOP_SEARCH: "Zoeken stoppen",
  SEARCH_PLACEHOLDER: "Zoek naar aliassen",
  NO_ZONES_TITLE: "Jammer!",
  NO_ZONES: "Geen domeinen gevonden voor dit Cloudflare account of API token.",
  ZONES_ERROR_TITLE: "Oeps!",
  ZONES_ERROR: "Er is iets misgegaan bij het laden van je domeinen: {error}",
  NO_RULES_TITLE: "Jammer!",
  NO_RULES: "Geen aliassen gevonden voor dit domein of filter.",
  RULES_ERROR_TITLE: "Oeps!",
  RULES_ERROR: "Er is iets misgegaan bij het laden van je aliassen: {error}",

  // Alias Card
  COPY_SUCCESS: "Alias gekopieerd",
  NO_ALIAS_DESCRIPTION: "(Geen beschrijving)",

  // Create Alias Modal
  CREATE_MODAL_TITLE: "Maak een nieuwe alias",
  INVALID_DOMAIN: "Ongeldig domein",
  INVALID_FORMAT: "Ongeldig formaat",
  INVALID_LENGTH: "Moet tussen 3 tot 25 karakters zijn",
  INVALID_WORD_COUNT: "Moet tussen 1 tot 5 woorden zijn",
  INVALID_CUSTOM_ALIAS: "Moet minimaal 3 karakters zijn",
  INVALID_PREFIX_FORMAT: "Ongeldig formaat",
  INVALID_CUSTOM_PREFIX: "Moet minimaal 3 karakters zijn",
  INVALID_DESTINATION: "Ongeldige bestemming",
  DOMAIN_NOT_FOUND: "Domein niet gevonden",
  CONFLICT: "Conflict",
  ALIAS_ALREADY_EXISTS: "Deze alias bestaat al",
  ALIAS_GENERATION_ERROR:
    "Er is een fout opgetreden bij het genereren van de alias. Probeer het opnieuw.",
  ALIAS_CREATED: "De alias is aangemaakt",
  ALIAS_CREATED_AND_COPIED: "De alias is aangemaakt en gekopieerd naar het klembord",
  ALIAS_CREATION_ERROR: "Er is een fout opgetreden bij het aanmaken van de alias",
  MODAL_CLOSE_BLOCKED: "Kan niet worden gesloten op dit moment",
  ZONES_LOADING_ERROR: "Fout bij het laden van de domeinen",
  ALIAS_FORMAT: "Formaat",
  ALIAS_FORMAT_CHARS: "Willekeurige karakters",
  ALIAS_FORMAT_WORDS: "Willekeurige woorden",
  ALIAS_FORMAT_DOMAIN: "Domein",
  ALIAS_FORMAT_CUSTOM: "Aangepast",
  NUMBER_OF_CHARS: "Aantal karakters",
  NUMBER_OF_WORDS: "Aantal woorden",
  CUSTOM_ALIAS: "Aangepaste alias",
  ALIAS_DESCRIPTION: "Beschrijving",
  ALIAS_DESCRIPTION_PLACEHOLDER: "Alias beschrijving (optioneel)",
  PREFIX: "Voorvoegsel",
  PREFIX_NONE: "Geen",
  PREFIX_DOMAIN_WITHOUT_EXTENSION: "Domein zonder extensie",
  PREFIX_DOMAIN_WITH_EXTENSION: "Basisdomein",
  PREFIX_FULL_DOMAIN: "Volledig domein",
  PREFIX_CUSTOM: "Aangepast",
  PREFIX_CUSTOM_LABEL: "Aangepast voorvoegsel",
  ALIAS_FORMAT_DOMAIN_TYPE: "Domein formaat",
  GENERATED_ALIAS: "Gegenereerde alias",
  DESTINATION: "Bestemming",
  DESTINATIONS_LOADING_ERROR: "Fout bij het laden van de bestemmingen",
  DESTINATION_NOT_VERIFIED: "Bestemming niet geverifieerd",
  SAVE_SETTINGS: "Instellingen opslaan",
  DELETE_SUCCESS: "De alias is verwijderd",
  DELETE_SUCCESS_MULTIPLE: "De geselecteerde aliassen zijn verwijderd",
  DELETE_ERROR: "Fout bij het verwijderen van de alias {alias}: {error}",
  DELETE_TITLE: "Alias verwijderen",
  DELETE_QUESTION_1: "Je staat op het punt om de alias te verwijderen",
  DELETE_QUESTION_2: "Wil je doorgaan?",
  DELETE_MULTIPLE_TITLE: "Verwijder aliassen",
  DELETE_MULTIPLE_QUESTION: "Je staat op het punt om {count} aliassen te verwijderen",
  UPDATE_ERROR: "Fout bij het opslaan van de alias {alias}: {error}",
  UPDATE_SUCCESS: "De alias is opgeslagen",
  UPDATE_SUCCESS_MULTIPLE: "De geselecteerde aliassen zijn opgeslagen",
  ENABLED: "Ingeschakeld",
  UPDATE_MULTIPLE_TITLE: "Update aliassen",
  KEEP_DESTINATIONS: "Behoud de huidige bestemmingen",

  // BGSW and Content Scripts
  BG_ERROR_NOT_LOGGED_IN: "Niet ingelogd",
  BG_ERROR_NO_DOMAIN: "Geen domein geselecteerd",
  BG_ERROR_INVALID_DOMAIN: "Ongeldig domein",
  BG_ERROR_NO_DESTINATION: "Geen bestemming geselecteerd",
  BG_ERROR_CUSTOM: "Kan geen alias generenen met aangepaste voorvoegsels",
  BG_ALERT_LOADING: "Laden...",
  BG_ALERT_CREATED: "Alias aangemaakt: {alias}",
  CONTEXT_MENU_ENTRY_TEXT: "Maak een MailFlare Alias",
  QUICK_CREATE_BUTTON_TOOLTIP_TEXT: "Maak een MailFlare Alias",

  // Permissions Modal
  PERMISSION_MISSING_TITLE: "Toestemming vereist",
  PERMISSION_MISSING_MESSAGE:
    "De extensie heeft toestemming nodig om te functioneren. Klik op de knop hieronder om toestemming te verlenen.",
  REQUEST_PERMISSION: "Toestemming aanvragen",
  PERMISSION_REQUEST_ERROR_TITLE: "Toestemming aanvraag mislukt",
  PERMISSION_REQUEST_ERROR_MESSAGE:
    "Er is een fout opgetreden bij het aanvragen van toestemming: {error}",
} satisfies Translation;

export default nl;
