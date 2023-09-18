import { IconSettings } from "@tabler/icons-react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { useState } from "react";
import { ActionIcon, Container, Divider, Group, Text } from "@mantine/core";
import { useAtom } from "jotai";

import AliasList from "~components/AliasList";
import Login from "~components/Login";
import SettingsModal from "~components/SettingsModal";
import { isExtension, popupHeight, popupWidth } from "~const";
import { ThemeProvider } from "~theme";
import { queryClient } from "~utils/cloudflare";
import { apiTokenAtom, devToolsAtom } from "~utils/state";
import { extensionStoragePersister } from "~utils/storage";

import "@mantine/core/styles.css";

export default function App() {
  const [token] = useAtom(apiTokenAtom);
  const [devToolsEnabled] = useAtom(devToolsAtom);

  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  return (
    <ThemeProvider>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister: extensionStoragePersister }}>
        {devToolsEnabled && <ReactQueryDevtools initialIsOpen={false} />}
        <Container
          w={isExtension ? popupWidth : undefined}
          h={isExtension ? popupHeight : "100%"}
          maw={600}
          p={0}>
          <SettingsModal
            opened={settingsModalOpened}
            onClose={() => setSettingsModalOpened(false)}
          />
          <Group justify="space-between" px="md" py="sm">
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
