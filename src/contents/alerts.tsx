// noinspection JSUnusedGlobalSymbols

import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo";
import type { ContentScriptAlert, TabMessage } from "~/utils/background";

import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import cssText from "data-text:./content-scripts.css";

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
};

export function Inline() {
  const [alerts, setAlerts] = useState<ContentScriptAlert[]>([]);

  const removeAlert = (id: number) => setAlerts((current) => current.filter((a) => a.id !== id));

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    async function onMessageListener(msg: TabMessage) {
      console.log("[MailFlare] Received tab message:", msg);
      switch (msg.command) {
        case "copyText":
          await window.navigator.clipboard.writeText(msg.text);
          break;
        case "clearClipboard":
          await window.navigator.clipboard.writeText("\u0000");
          break;
        case "showAlert":
          setAlerts((current) => [msg.alert, ...current]);
          if (msg.alert.timeout) {
            setTimeout(() => removeAlert(msg.alert.id), msg.alert.timeout);
          }
          break;
        case "dismissAlert":
          removeAlert(msg.id);
          break;
        default:
      }
    }

    chrome.runtime.onMessage.addListener(onMessageListener);

    return () => chrome.runtime.onMessage.removeListener(onMessageListener);
  }, []);

  return (
    <div data-theme="mantine">
      <div className="toast toast-center">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`alert ${alert.type ? (`alert-${alert.type}` as const) : ""}`}>
            {alert.isLoading && <span className="loading loading-spinner loading-sm" />}
            <span>{alert.message}</span>
            <div>
              <button
                type="button"
                className="btn btn-square btn-sm btn-ghost"
                onClick={() => removeAlert(alert.id)}>
                <IconX size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
