import type { AliasSettings } from "~utils/state";

import { Storage } from "@plasmohq/storage";

import { detectLocale, i18n } from "~i18n/i18n-util";
import { loadLocale } from "~i18n/i18n-util.sync";
import { CloudflareApiClient } from "~lib/cloudflare/api";
import { Alias } from "~utils/alias";
import { detectBrowserLocale, sendTabMessage } from "~utils/background";
import { StorageKeys } from "~utils/state";

const storage = new Storage({
  area: "local",
});

const locale = detectLocale(detectBrowserLocale);
loadLocale(locale);
const LL = i18n()[locale];

export async function generateAliasInBackground(hostname: string): Promise<Alias> {
  const apiToken = await storage.get<string>(StorageKeys.ApiToken);
  const zoneId = await storage.get<string>(StorageKeys.ZoneId);
  const aliasSettings = await storage.get<AliasSettings>(StorageKeys.AliasSettings);

  if (!apiToken) {
    throw new Error(LL.BG_ERROR_NOT_LOGGED_IN());
  }
  if (!zoneId) {
    throw new Error(LL.BG_ERROR_NO_DOMAIN());
  }
  if (!aliasSettings?.destination) {
    throw new Error(LL.BG_ERROR_NO_DESTINATION());
  }
  if (aliasSettings.format === "custom" || aliasSettings.prefixFormat === "custom") {
    throw new Error(LL.BG_ERROR_CUSTOM());
  }

  const apiClient = new CloudflareApiClient(apiToken);

  const zones = await apiClient.getZones();
  const zone = zones.success ? zones.result.find((z) => z.id === zoneId) : undefined;

  if (!zone) {
    throw new Error(LL.BG_ERROR_INVALID_DOMAIN());
  }

  const alias = Alias.fromOptions(
    {
      ...aliasSettings,
      hostname,
    },
    zone.name,
    aliasSettings.destination,
    hostname
  );

  const result = await apiClient.createEmailRule(zoneId, alias.toEmailRule());

  if (!result.success) {
    throw new Error(result.errors[0].message);
  }

  console.log("Created new alias in background:", alias.address);
  return alias;
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.debug("Context menu click:", info, tab);

  if (info.menuItemId !== "mailflare-generate") return;

  const loadingAlertId = Date.now();
  await sendTabMessage(tab?.id, {
    command: "showAlert",
    alert: {
      id: loadingAlertId,
      message: LL.BG_ALERT_LOADING(),
      isLoading: true,
    },
  });

  try {
    const alias = await generateAliasInBackground(new URL(info.pageUrl!).hostname);
    await sendTabMessage(tab?.id, {
      command: "showAlert",
      alert: {
        id: Date.now(),
        type: "success",
        message: LL.BG_ALERT_CREATED({ alias: alias.address }),
        timeout: 5000,
      },
    });
    await sendTabMessage(tab?.id, {
      command: "copyText",
      text: alias.toString(),
    });
  } catch (error: any) {
    await sendTabMessage(tab?.id, {
      command: "showAlert",
      alert: { id: Date.now(), type: "error", message: error.message },
    });
  } finally {
    await sendTabMessage(tab?.id, {
      command: "dismissAlert",
      id: loadingAlertId,
    });
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    title: LL.CONTEXT_MENU_ENTRY_TEXT(),
    contexts: ["page", "editable"],
    id: "mailflare-generate",
  });
});
