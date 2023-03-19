import { Button, Divider, Group, ScrollArea, Stack, Switch, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { extensionName, extensionVersion, popupHeight } from "~const";
import {
  copyAliasAtom,
  devToolsAtom,
  ruleFilterAtom,
  // showCreateButtonAtom,
  themeAtom,
} from "~utils/state";

function Settings() {
  const queryClient = useQueryClient();

  const [theme, setTheme] = useAtom(themeAtom);
  const [ruleFilter, setRuleFilter] = useAtom(ruleFilterAtom);
  const [devToolsEnabled, setDevToolsEnabled] = useAtom(devToolsAtom);
  const [copyAlias, setCopyAlias] = useAtom(copyAliasAtom);
  // const [showCreateButton, setShowCreateButton] = useAtom(showCreateButtonAtom);

  const clearCache = async () => {
    await queryClient.invalidateQueries(["zones"]);
    await queryClient.invalidateQueries(["destinations"]);
    showNotification({
      color: "green",
      message: "Deleted cached data",
      autoClose: 3000,
    });
  };

  const logout = async () => {
    // TODO: reset storage
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
          checked={devToolsEnabled}
          onChange={() => setDevToolsEnabled(!devToolsEnabled)}
        />
      ),
    });
  }

  return (
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
  );
}

export default Settings;
