import type { PlasmoCSConfig, PlasmoGetInlineAnchor, PlasmoGetStyle } from "plasmo";

import { IconMailPlus } from "@tabler/icons-react";
import { useState } from "react";
import { ActionIcon, Button, MantineProvider } from "@mantine/core";
import { sendToBackground } from "@plasmohq/messaging";
import cssText from "data-text:@mantine/core/styles.css";

import "@mantine/core/styles.css";

import { useClipboard } from "@mantine/hooks";

export const getStyle = () => {
  const style = document.createElement("style");
  style.textContent = cssText;
  return style;
};
export const config: PlasmoCSConfig = {
  matches: ["https://*/*"],
};

export const getInlineAnchor: PlasmoGetInlineAnchor = () =>
  // export const getOverlayAnchor: PlasmoGetOverlayAnchor = async () =>
  document.querySelector(`input[type="email"]`)!;

// Use this to optimize unmount lookups
export const getShadowHostId = () => "mailflare-email-input-button";

const PlasmoInline = () => {
  const [isLoading, setIsLoading] = useState(false);
  const clipboard = useClipboard();

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
    }
  }

  return (
    <MantineProvider>
      <ActionIcon
        variant="gradient"
        gradient={{ from: "orange", to: "yellow", deg: 150 }}
        size="lg"
        aria-label="Settings"
        style={{
          position: "absolute",
          top: -38,
          right: 10,
        }}
        loading={isLoading}
        onClick={() => {
          return generateAlias();
        }}>
        <IconMailPlus color="white" />
      </ActionIcon>
    </MantineProvider>
  );
};

export default PlasmoInline;
