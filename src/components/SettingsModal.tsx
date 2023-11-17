import { IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  Button,
  Divider,
  Flex,
  Modal,
  ScrollArea,
  Stack,
  Switch,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";

import { extensionName, extensionVersion, isExtension, popupHeight } from "~const";
import { useCloudflare } from "~lib/cloudflare/use-cloudflare";
import { apiTokenAtom, selectedZoneIdAtom, settingsAtom } from "~utils/state";
import { extensionStoragePersister } from "~utils/storage";

type Props = {
  opened: boolean;
  onClose: () => void;
};

function SettingsModal({ opened, onClose }: Props) {
  const queryClient = useQueryClient();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const { zones, emailDestinations } = useCloudflare();

  const [apiToken, setToken] = useAtom(apiTokenAtom);
  const [settings, setSettings] = useAtom(settingsAtom);

  const [, setSelectedZoneId] = useAtom(selectedZoneIdAtom);

  const clearCache = async () => {
    await queryClient.invalidateQueries();
    showNotification({
      color: "green",
      message: "Refreshed successfully",
      autoClose: 3000,
    });
  };

  const logout = async () => {
    await setToken(RESET);
    await setSelectedZoneId(RESET);
    await queryClient.invalidateQueries();
    await extensionStoragePersister.removeClient();
    showNotification({
      color: "green",
      message: "Goodbye",
      autoClose: 3000,
    });
    onClose();
  };

  const settingsItems = [
    {
      title: "Theme",
      description: "Toggle between theme modes",
      action: (
        <Switch
          onLabel="DARK"
          offLabel="LIGHT"
          size="lg"
          color="green"
          checked={colorScheme === "dark"}
          onChange={() => toggleColorScheme()}
        />
      ),
    },
    {
      title: "Rule Filter",
      description: "Only show email rules created by this extension",
      requiresAuth: true,
      action: (
        <Switch
          onLabel="ON"
          offLabel="OFF"
          size="lg"
          color="green"
          checked={settings.ruleFilter}
          onChange={(event) =>
            setSettings({ ...settings, ruleFilter: event.currentTarget.checked })
          }
        />
      ),
    },
    {
      title: "Copy Alias",
      description: "Copy alias to clipboard after creating it",
      requiresAuth: true,
      action: (
        <Switch
          onLabel="ON"
          offLabel="OFF"
          color="green"
          size="lg"
          checked={settings.copyAlias}
          onChange={(event) => setSettings({ ...settings, copyAlias: event.currentTarget.checked })}
        />
      ),
    },
    {
      title: "Show Quick-Create Button",
      description:
        "Show a button inside email input fields to quickly create an alias for the current site",
      requiresAuth: true,
      action: (
        <Switch
          onLabel="ON"
          offLabel="OFF"
          color="green"
          size="lg"
          checked={settings.showCreateButton}
          onChange={(event) =>
            setSettings({ ...settings, showCreateButton: event.currentTarget.checked })
          }
        />
      ),
    },
    {
      title: "Refresh data",
      description: "Refresh Cloudflare domains and email destinations",
      requiresAuth: true,
      action: (
        <Button
          loading={zones.isFetching || emailDestinations.isFetching}
          onClick={() => clearCache()}>
          Refresh
        </Button>
      ),
    },
    {
      title: "Logout",
      description: "Clear all data and settings",
      requiresAuth: true,
      action: (
        <Button color="red" onClick={() => logout()}>
          Logout
        </Button>
      ),
    },
    {
      title: "Cloudflare Docs",
      description: "For more information about Email Routing",
      action: (
        <Button
          component="a"
          href="https://developers.cloudflare.com/email-routing/"
          target="_blank"
          rightSection={<IconExternalLink />}>
          Open
        </Button>
      ),
    },
    {
      title: "Info",
      description: `${extensionName} v${extensionVersion}`,
      action: (
        <Button
          component="a"
          href="https://github.com/curetix/mailflare-extension"
          target="_blank"
          color="gray"
          rightSection={<IconExternalLink />}>
          GitHub
        </Button>
      ),
    },
  ];

  if (process.env.NODE_ENV === "development") {
    settingsItems.push({
      title: "Dev Tools",
      description: "Enable development tools",
      action: (
        <Switch
          onLabel="ON"
          offLabel="OFF"
          size="lg"
          checked={settings.devTools}
          onChange={(event) => setSettings({ ...settings, devTools: event.currentTarget.checked })}
        />
      ),
    });
  }

  return (
    <Modal opened={opened} onClose={() => onClose()} title="Settings" fullScreen={isExtension}>
      <ScrollArea h={popupHeight - 2 * 20 - 28 - 16}>
        <Stack gap="xs" pr={15}>
          {settingsItems.map((item, index) =>
            (item.requiresAuth && apiToken) || !item.requiresAuth ? (
              <Stack gap="xs" key={index}>
                <Flex justify="space-between" align="center">
                  <div>
                    <Text>{item.title}</Text>
                    <Text size="xs" c="dimmed">
                      {item.description}
                    </Text>
                  </div>
                  {item.action}
                </Flex>
                {index < settingsItems.length - 1 && <Divider />}
              </Stack>
            ) : null,
          )}
        </Stack>
      </ScrollArea>
    </Modal>
  );
}

export default SettingsModal;
