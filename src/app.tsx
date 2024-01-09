import { IconSettings } from "@tabler/icons-react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ActionIcon, Container, Divider, Group, Text } from "@mantine/core";
import { useAtom } from "jotai";

import AliasList from "~components/alias-list";
import Login from "~components/login";
import SettingsModal from "~components/settings-modal";
import { isExtension, popupHeight, popupWidth } from "~const";
import Providers from "~providers";
import { apiTokenAtom, settingsAtom } from "~utils/state";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

export default function App() {
  const [token] = useAtom(apiTokenAtom);
  const [{ devTools }] = useAtom(settingsAtom);
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  return (
    <Providers>
      {devTools && <ReactQueryDevtools initialIsOpen={false} />}
      <Container
        w={isExtension ? popupWidth : undefined}
        h={isExtension ? popupHeight : "100%"}
        maw={600}
        p={0}>
        <SettingsModal opened={settingsModalOpened} onClose={() => setSettingsModalOpened(false)} />
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
    </Providers>
  );
}
