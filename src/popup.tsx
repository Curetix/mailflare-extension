import { useEffect } from "react";
import { useAtom } from "jotai";
import browser from "webextension-polyfill";

import App from "~app";
import { hostnameAtom } from "~utils/state";

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

  return <App />;
}
