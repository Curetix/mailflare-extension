import { useEffect } from "react";
import { useAtom } from "jotai";
import { parseDomain, ParseResultType } from "parse-domain";
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
        const parsed = parseDomain(url.hostname);
        if (parsed.type === ParseResultType.Listed) {
          setHostname(parsed);
        } else {
          setHostname(null);
        }
      }
    });
  }, []);

  return <App />;
}
