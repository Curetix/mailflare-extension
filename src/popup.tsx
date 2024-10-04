import { useAtom } from "jotai";
import { useEffect } from "react";
import { App } from "~/app";
import { detectBrowserLocale } from "~/utils/background";
import { hostnameAtom } from "~/utils/state";

const detectors = [detectBrowserLocale];

export default function Popup() {
  const [, setHostname] = useAtom(hostnameAtom);

  useEffect(() => {
    chrome.tabs.query({ active: true }).then(([tab]) => {
      if (tab?.url) {
        const url = new URL(tab.url);
        if (url.hostname !== "newtab") {
          setHostname(url.hostname);
        }
      }
    });
  }, []);

  return (
    <div style={{ height: 400, width: 600 }}>
      <App localeDetectors={detectors} />
    </div>
  );
}
