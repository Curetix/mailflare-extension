import { ActionIcon, Container, Divider, Group, Modal, Text } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useAtom } from "jotai";
import { ParseResultType, parseDomain } from "parse-domain";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";

import AliasList from "~components/AliasList";
import Login from "~components/Login";
import SettingsModal from "~components/SettingsModal";
import { popupHeight, popupWidth } from "~const";
import { ThemeProvider } from "~popup/Theme";
import { queryClient } from "~utils/cloudflare";
import { apiTokenAtom, devToolsAtom, hostnameAtom } from "~utils/state";
import { extensionStoragePersister } from "~utils/storage";

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
        } else {
          setHostname(null);
        }
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: extensionStoragePersister }}>
        {devToolsEnabled && <ReactQueryDevtools initialIsOpen={false} />}
        <Container w={popupWidth} h={popupHeight} p={0}>
          <SettingsModal
            opened={settingsModalOpened}
            onClose={() => setSettingsModalOpened(false)}
          />
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
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}

export default Popup;
