// noinspection JSUnusedGlobalSymbols

import { useAtom } from "jotai";
import { useEffect } from "react";

import App from "~app";
import { popupHeight, popupWidth } from "~const";
import { detectBrowserLocale } from "~utils/background";
import { hostnameAtom } from "~utils/state";

const detectors = [detectBrowserLocale];

export default function Popup() {
  const [, setHostname] = useAtom(hostnameAtom);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    chrome.tabs.query({ active: true }).then(([tab]) => {
      if (tab?.url) {
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
