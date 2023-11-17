import type { Settings } from "~utils/state";
import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetStyle,
} from "plasmo";

import { IconMailPlus } from "@tabler/icons-react";
import { useState } from "react";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { sendToBackground } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import cssText from "data-text:./email-input.style.css";

import { StorageKeys } from "~utils/state";

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
};

const storage = new Storage({
  area: "local",
});

// @ts-ignore
export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () => {
  const settings = await storage.get<Settings>(StorageKeys.MailflareSettings);

  if (!settings || !settings.showCreateButton) {
    return null;
  }

  return document.querySelector(`input[type="email"]`);
};

// Use this to optimize unmount lookups
export const getShadowHostId = () => "mailflare-email-input-button";

/**
 * Simulate the entry of a value into an element by using events.
 * Dispatches a keydown, keypress, and keyup event, then fires the `input` and `change` events before removing focus.
 * Modified from: https://github.com/bitwarden/clients/blob/master/apps/browser/src/autofill/content/autofill.js#L1092
 */
function setValueForElementByEvent(el: HTMLInputElement, valueToSet: string) {
  el.value = valueToSet;
  el.dispatchEvent(new KeyboardEvent("keydown"));
  el.dispatchEvent(new KeyboardEvent("keypress"));
  el.dispatchEvent(new KeyboardEvent("keyup"));
  el.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
  el.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
  el.blur();
  el.value !== valueToSet && (el.value = valueToSet);
}

export default function Inline(props: PlasmoCSUIProps) {
  const [isLoading, setIsLoading] = useState(false);
  const clipboard = useClipboard();
  const [opened, { close, open }] = useDisclosure(false);
  const [error, setError] = useState<string>();

  async function generateAlias() {
    setIsLoading(true);
    const response = await sendToBackground({
      name: "generate-alias",
      body: {
        hostname: window.location.hostname,
      },
    });
    setIsLoading(false);
    console.log(response);
    if (response.success) {
      clipboard.copy(response.data);
      const element = props.anchor?.element as HTMLInputElement;
      if (element) {
        setValueForElementByEvent(element, response.data);
      }
    } else {
      setError(response.message);
    }
  }

  return (
    <html>
      <div
        className="dropdown dropdown-end dropdown-hover"
        data-theme="light"
        style={{
          position: "absolute",
          top: (props.anchor!.element.clientHeight - 32) / 2,
          left:
            props.anchor!.element.clientWidth - 32 - (props.anchor!.element.clientHeight - 32) / 2,
        }}>
        <label
          tabIndex={0}
          className={`btn btn-square ${!!error ? "btn-error" : "btn-warning"} btn-sm ${
            (isLoading || !!error) && "btn-disabled"
          }`}
          onClick={() => {
            return generateAlias();
          }}>
          {isLoading ? (
            <span className="loading loading-spinner text-white"></span>
          ) : (
            <IconMailPlus color="white" />
          )}
        </label>
        <div
          tabIndex={0}
          className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-56">
          {error ? `Error: ${error}` : "Create a new MailFlare Alias"}
        </div>
      </div>
    </html>
  );
}
