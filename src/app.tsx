import type { LocaleDetector } from "typesafe-i18n/detectors";
import { ActionIcon, Divider, Flex, Group, Text } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAtom } from "jotai";
import { useState } from "react";
import { AliasList } from "~/components/alias-list";
import { Login } from "~/components/login";
import { SettingsModal } from "~/components/settings-modal";
import { Providers } from "~/providers";
import { apiTokenAtom } from "~/utils/state";
import { PermissionsCheck } from "~/components/permissions-check";
import { UpdateCheck } from "~/components/update-check";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

type AppProps = {
  localeDetectors?: LocaleDetector[];
};

export function App({ localeDetectors }: AppProps) {
  const [token] = useAtom(apiTokenAtom);
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  return (
    <Providers localeDetectors={localeDetectors}>
      <UpdateCheck />
      <PermissionsCheck />
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
