import { ActionIcon, Container, Divider, Group, Modal, Text } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAtom } from "jotai";
import { ParseResultType, parseDomain } from "parse-domain";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import AliasList from "~components/AliasList";
import Login from "~components/Login";
import Settings from "~components/Settings";
import { popupHeight, popupWidth } from "~const";
import { ThemeProvider } from "~popup/Theme";
import { queryClient } from "~utils/cloudflare";
import { apiTokenAtom, devToolsAtom, hostnameAtom } from "~utils/state";
import { extensionLocalStorageInterface as storage } from "~utils/storage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Popup() {
  const [token] = useAtom(apiTokenAtom);
  const [devToolsEnabled] = useAtom(devToolsAtom);
  const [hostname, setHostname] = useAtom(hostnameAtom);

  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  useEffect(() => {
    browser.tabs.query({ active: true }).then(([tab]) => {
      if (tab && tab.url) {
        const url = new URL(tab.url);
        const parsed = parseDomain(url.hostname);
        if (parsed.type === ParseResultType.Listed) {
          setHostname(parsed);
        }
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {devToolsEnabled && <ReactQueryDevtools initialIsOpen={false} />}
        <Container w={popupWidth} h={popupHeight} p={0}>
          <Modal
            opened={settingsModalOpened}
            onClose={() => setSettingsModalOpened(false)}
            title="Settings"
            fullScreen
            scrollAreaComponent={Modal.NativeScrollArea}>
            <Settings />
          </Modal>
          <Group position="apart" px="md" py="sm">
            <Text fw="bold" size="md">
              MailFlare
            </Text>
            <ActionIcon variant="subtle" size="md" onClick={() => setSettingsModalOpened(true)}>
              <IconSettings size={16} />
            </ActionIcon>
          </Group>
          <Divider />
          {token ? <AliasList /> : <Login />}
        </Container>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default Popup;
