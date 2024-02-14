/**
 * Utils for the background service worker and content scripts.
 */

import type { LocaleDetector } from "typesafe-i18n/detectors";

export type TabMessage =
  | {
      command: "copyText";
      text: string;
    }
  | { command: "clearClipboard" }
  | { command: "showAlert"; alert: ContentScriptAlert }
  | { command: "dismissAlert"; id: number };

export type ContentScriptAlert = {
  id: number;
  type?: "info" | "success" | "error";
  message: string;
  timeout?: number;
  isLoading?: boolean;
};

export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

export async function sendTabMessage(tabId: number | undefined, message: TabMessage) {
  if (!tabId) return;
  return chrome.tabs.sendMessage(tabId, message);
}

export const detectBrowserLocale: LocaleDetector = () => {
  return [chrome.i18n.getUILanguage()];
};

/**
 * Simulate the entry of a value into an element by using events.
 * Dispatches a keydown, keypress, and keyup event, then fires the `input` and `change` events before removing focus.
 * Modified from: https://github.com/bitwarden/clients/blob/master/apps/browser/src/autofill/content/autofill.js#L1092
 */
export function setValueForElementByEvent(el: HTMLInputElement, valueToSet: string) {
  el.value = valueToSet;
  el.dispatchEvent(new KeyboardEvent("keydown"));
  el.dispatchEvent(new KeyboardEvent("keypress"));
  el.dispatchEvent(new KeyboardEvent("keyup"));
  el.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  el.blur();
  el.value !== valueToSet && (el.value = valueToSet);
}
