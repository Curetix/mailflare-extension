import type { LocaleDetector } from "typesafe-i18n/detectors";

import { useEffect } from "react";
import { useAtom } from "jotai";
import browser from "webextension-polyfill";

import App from "~app";
import { popupHeight, popupWidth } from "~const";
import { hostnameAtom } from "~utils/state";

const detectBrowserLocale: LocaleDetector = () => {
  return [browser.i18n.getUILanguage()];
};

const detectors = [detectBrowserLocale];

// noinspection JSUnusedGlobalSymbols
export default function Popup() {
  const [, setHostname] = useAtom(hostnameAtom);

  useEffect(() => {
    browser.tabs.query({ active: true }).then(([tab]) => {
      if (tab && tab.url) {
        const url = new URL(tab.url);
        setHostname(url.hostname);
      }
    });
  }, []);

  return (
    <div style={{ height: popupHeight, width: popupWidth }}>
      <App localeDetectors={detectors} />
    </div>
  );
}
