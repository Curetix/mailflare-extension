import type {
  PlasmoCSConfig,
  PlasmoCSUIProps,
  PlasmoGetOverlayAnchor,
  PlasmoGetStyle,
} from "plasmo";

import { IconMailPlus } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { ActionIcon, MantineProvider, Popover, Text } from "@mantine/core";
import { useClipboard, useDisclosure } from "@mantine/hooks";
import { sendToBackground } from "@plasmohq/messaging";
import cssText from "data-text:@mantine/core/styles.css";

import "@mantine/core/styles.css";

export const getStyle: PlasmoGetStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};

export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
};

// @ts-ignore
export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () => {
  const enabled: boolean = await sendToBackground({
    name: "enable-csui-button",
  });

  if (!enabled) {
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

  useEffect(() => {
    sendToBackground({
      name: "enable-csui-button",
    }).then(console.log);
  }, []);

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
    <MantineProvider>
      <Popover position="top" withArrow opened={opened || !!error}>
        <Popover.Target>
          <ActionIcon
            variant={!!error ? "filled" : "gradient"}
            gradient={{ from: "orange", to: "yellow", deg: 150 }}
            color="red"
            size="lg"
            aria-label="Settings"
            style={{
              position: "absolute",
              top: (props.anchor!.element.clientHeight - 34) / 2,
              left:
                props.anchor!.element.clientWidth -
                34 -
                (props.anchor!.element.clientHeight - 34) / 2,
            }}
            loading={isLoading}
            disabled={!!error}
            onClick={() => {
              return generateAlias();
            }}
            onMouseEnter={open}
            onMouseLeave={close}>
            <IconMailPlus color="white" />
          </ActionIcon>
        </Popover.Target>

        <Popover.Dropdown>
          <Text size="sm">{error ? `Error: ${error}` : "Create a new MailFlare Alias"}</Text>
        </Popover.Dropdown>
      </Popover>
    </MantineProvider>
  );
}
