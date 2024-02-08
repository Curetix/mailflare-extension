import type { LocaleDetector } from "typesafe-i18n/detectors";

import { IconSettings } from "@tabler/icons-react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";
import { ActionIcon, Divider, Flex, Group, Text } from "@mantine/core";
import { useAtom } from "jotai";

import AliasList from "~components/alias-list";
import Login from "~components/login";
import SettingsModal from "~components/settings-modal";
import Providers from "~providers";
import { apiTokenAtom, settingsAtom } from "~utils/state";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import UpdateCheck from "~components/update-check";

type AppProps = {
  localeDetectors?: LocaleDetector[];
};

export default function App({ localeDetectors }: AppProps) {
  const [token] = useAtom(apiTokenAtom);
  const [{ devTools }] = useAtom(settingsAtom);
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  return (
    <Providers localeDetectors={localeDetectors}>
      {devTools && <ReactQueryDevtools initialIsOpen={false} />}
      <UpdateCheck />
      <Flex direction="column" h="100%" maw={600} m="auto">
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
        {token ? <AliasList flex={1} mih={0} /> : <Login />}
      </Flex>
    </Providers>
  );
}
