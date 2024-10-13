import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetStyle,
} from "plasmo";
import type { Settings } from "~utils/state";

import cssText from "data-text:./content-scripts.css";
import { useClipboard } from "@mantine/hooks";
import { sendToBackground } from "@plasmohq/messaging";
import { Storage } from "@plasmohq/storage";
import { IconMailPlus } from "@tabler/icons-react";
import { useRef, useState } from "react";

import { detectLocale, i18n } from "~i18n/i18n-util";
import { loadLocale } from "~i18n/i18n-util.sync";
import { detectBrowserLocale, setValueForElementByEvent } from "~utils/background";
import { StorageKeys } from "~utils/state";

const locale = detectLocale(detectBrowserLocale);
loadLocale(locale);
const LL = i18n()[locale];

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

// noinspection JSUnusedGlobalSymbols
export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
};

const storage = new Storage({
  area: "local",
});

//@ts-expect-error
export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () => {
  const settings = await storage.get<Settings>(StorageKeys.MailflareSettings);

  if (!settings || !settings.showCreateButton) {
    return null;
  }

  return document.querySelector(`input[type="email"]`);
};

// Use this to optimize unmount lookups
export const getShadowHostId = () => "mailflare-email-input-button";

// noinspection JSUnusedGlobalSymbols
export default function Inline(props: PlasmoCSUIProps) {
  const [isLoading, setIsLoading] = useState(false);
  const clipboard = useClipboard();
  const [error, setError] = useState<string>();
  const [isSuccess, setIsSuccess] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();

  if (!props.anchor?.element) return;

  const buttonSize = 32;
  const { clientWidth: inputElementWidth, clientHeight: inputElementHeight } = props.anchor.element;

  async function generateAlias() {
    clearTimeout(timeout.current);
    setError(undefined);
    setIsSuccess(false);

    setIsLoading(true);
    const response = await sendToBackground({
      name: "generate-alias",
      body: {
        hostname: window.location.hostname,
      },
    });
    setIsLoading(false);

    console.debug("[MailFlare] Response from background worker:", response);

    if (response.success) {
      clipboard.copy(response.data);
      const element = props.anchor?.element as HTMLInputElement;
      if (element) {
        setValueForElementByEvent(element, response.data);
      }

      setIsSuccess(true);
      timeout.current = setTimeout(() => setIsSuccess(false), 5000);
    } else {
      setError(response.message);
    }
  }

  return (
    <div data-theme="mantine">
      <div
        className="dropdown dropdown-end dropdown-hover"
        style={{
          position: "absolute",
          top: (inputElementHeight - buttonSize) / 2,
          left: inputElementWidth - buttonSize - (inputElementHeight - buttonSize) / 2,
        }}>
        {/* biome-ignore lint/a11y/noLabelWithoutControl: <explanation> */}
        <label
          className={`btn btn-square btn-sm ${
            isSuccess ? "btn-success" : error ? "btn-error" : "btn-primary"
          }`}
          onClick={() => generateAlias()}
          onKeyDown={() => generateAlias()}>
          {isLoading ? (
            <span className="loading loading-spinner text-white" />
          ) : (
            <IconMailPlus color="white" />
          )}
        </label>
        <div className="dropdown-content z-[1] p-2 shadow bg-base-100 rounded-box w-56">
          {LL.QUICK_CREATE_BUTTON_TOOLTIP_TEXT()}
        </div>
      </div>
    </div>
  );
}
