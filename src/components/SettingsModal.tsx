import { Button, Divider, Group, Modal, ScrollArea, Stack, Switch, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { RESET } from "jotai/utils";

import { extensionName, extensionVersion, isExtension, popupHeight } from "~const";
import { destinationsStatusAtom, zonesStatusAtom } from "~utils/cloudflare";
import {
  apiTokenAtom,
  copyAliasAtom,
  devToolsAtom,
  ruleFilterAtom,
  selectedZoneIdAtom,
  themeAtom,
} from "~utils/state";
import { extensionStoragePersister } from "~utils/storage";

type Props = {
  opened: boolean;
  onClose: () => void;
};

function SettingsModal({ opened, onClose }: Props) {
  const queryClient = useQueryClient();

  const [zones, zonesDispatch] = useAtom(zonesStatusAtom);
  const [destinations, destinationsDispatch] = useAtom(destinationsStatusAtom);

  const [, setToken] = useAtom(apiTokenAtom);
  const [theme, setTheme] = useAtom(themeAtom);
  const [ruleFilter, setRuleFilter] = useAtom(ruleFilterAtom);
  const [devToolsEnabled, setDevToolsEnabled] = useAtom(devToolsAtom);
  const [copyAlias, setCopyAlias] = useAtom(copyAliasAtom);
  // const [showCreateButton, setShowCreateButton] = useAtom(showCreateButtonAtom);

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
    setToken(RESET);
    setSelectedZoneId(RESET);
    await queryClient.invalidateQueries();
    extensionStoragePersister.removeClient();
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
          checked={theme === "dark"}
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
        />
      ),
    },
    {
      title: "Rule Filter",
      description: "Only show email rules created by this extension",
      action: (
        <Switch
          onLabel="ON"
          offLabel="OFF"
          size="lg"
          color="green"
          checked={ruleFilter}
          onChange={() => setRuleFilter(!ruleFilter)}
        />
      ),
    },
    {
      title: "Copy Alias",
      description: "Copy alias to clipboard after creating it",
      action: (
        <Switch
          onLabel="ON"
          offLabel="OFF"
          color="green"
          size="lg"
          checked={copyAlias}
          onChange={() => setCopyAlias(!copyAlias)}
        />
      ),
    },
    // {
    //   title: "Show Quick-Create button",
    //   description:
    //     "Show a button inside email input fields to quickly create an alias for the current site",
    //   action: (
    //     <Switch
    //       onLabel="ON"
    //       offLabel="OFF"
    //       color="green"
    //       size="lg"
    //       checked={showCreateButton === true}
    //       onChange={() => setShowCreateButton(!showCreateButton)}
    //     />
    //   ),
    // },
    {
      title: "Refresh data",
      description: "Refresh Cloudflare domains and email destinations",
      action: (
        <Button loading={zones.isFetching || destinations.isFetching} onClick={() => clearCache()}>
          Refresh
        </Button>
      ),
    },
    {
      title: "Logout",
      description: "Clear all data and settings",
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
          rightIcon={<IconExternalLink />}>
          Open
        </Button>
      ),
    },
    {
      title: "Info",
      description: `${extensionName} v${extensionVersion}`,
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
          checked={devToolsEnabled}
          onChange={() => setDevToolsEnabled(!devToolsEnabled)}
        />
      ),
    });
  }

  return (
    <Modal
      opened={opened}
      onClose={() => onClose()}
      title="Settings"
      fullScreen={isExtension}
      scrollAreaComponent={Modal.NativeScrollArea}>
      <ScrollArea h={popupHeight - 2 * 20 - 28 - 16}>
        <Stack spacing="xs" pr={15}>
          {settingsItems.map((item, index) => (
            <Stack spacing="xs" key={index}>
              <Group position="apart" noWrap spacing="xl">
                <div>
                  <Text>{item.title}</Text>
                  <Text size="xs" color="dimmed">
                    {item.description}
                  </Text>
                </div>
                {item.action}
              </Group>
              {index < settingsItems.length - 1 && <Divider />}
            </Stack>
          ))}
        </Stack>
      </ScrollArea>
    </Modal>
  );
}

export default SettingsModal;
