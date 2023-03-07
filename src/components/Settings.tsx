import { Button, Divider, Group, ScrollArea, Stack, Switch, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/dist/hook";

import { StorageKey, extensionName, extensionVersion, popupHeight } from "~const";

function Settings() {
  const queryClient = useQueryClient();
  const storage = new Storage();

  const [destinations, setDestinations] = useStorage<object[]>(StorageKey.Destinations, []);
  const [zones, setZones] = useStorage<object[]>(StorageKey.Zones, []);

  const [theme, setTheme] = useStorage<string>(StorageKey.Theme, "dark");
  const [onlyShowExtensionRules, setOnlyShowExtensionRules] = useStorage<boolean>(
    StorageKey.OnlyShowExtensionRules,
    true,
  );
  const [reactQueryDevtoolsEnabled, setReactQueryDevtoolsEnabled] = useStorage<boolean>(
    StorageKey.ReactQueryDevtoolsEnabled,
    false,
  );
  const [copyAliasAfterCreation, setCopyAliasAfterCreation] = useStorage<boolean>(
    StorageKey.CopyAliasAfterCreation,
    true,
  );
  const [showCreateButton, setShowCreateButton] = useStorage<boolean>(
    StorageKey.ShowCreateButton,
    true,
  );

  const clearCache = async () => {
    await setZones([]);
    await setDestinations([]);
    await queryClient.invalidateQueries(["zones"]);
    await queryClient.invalidateQueries(["destinations"]);
    showNotification({
      color: "green",
      message: "Deleted cached data",
      autoClose: 3000,
    });
  };

  const logout = async () => {
    await storage.clear(true);
    await queryClient.invalidateQueries();
    showNotification({
      color: "green",
      message: "Goodbye",
      autoClose: 3000,
    });
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
          checked={onlyShowExtensionRules === true}
          onChange={() => setOnlyShowExtensionRules(!onlyShowExtensionRules)}
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
          checked={copyAliasAfterCreation === true}
          onChange={() => setCopyAliasAfterCreation(!copyAliasAfterCreation)}
        />
      ),
    },
    {
      title: "Show Quick-Create button",
      description:
        "Show a button inside email input fields to quickly create an alias for the current site",
      action: (
        <Switch
          onLabel="ON"
          offLabel="OFF"
          color="green"
          size="lg"
          checked={showCreateButton === true}
          onChange={() => setShowCreateButton(!showCreateButton)}
        />
      ),
    },
    {
      title: "Clear Cache",
      description: "Clear locally cached data like Cloudflare zones and destination addresses",
      action: <Button onClick={() => clearCache()}>Clear</Button>,
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
          checked={reactQueryDevtoolsEnabled === true}
          onChange={() => setReactQueryDevtoolsEnabled(!reactQueryDevtoolsEnabled)}
        />
      ),
    });
  }

  return (
    <ScrollArea h={popupHeight - 2 * 20 - 28 - 16}>
      <Stack spacing="xs" pr={15}>
        {settingsItems.map((item, index) => (
          <>
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
          </>
        ))}
      </Stack>
    </ScrollArea>
  );
}

export default Settings;
