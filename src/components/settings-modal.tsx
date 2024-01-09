import type { ReactNode } from "react";

import { IconExternalLink } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { useI18nContext } from "~i18n/i18n-react";
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

import { extensionName, extensionVersion, isExtension, isWebApp, popupHeight } from "~const";
import { useCloudflare } from "~lib/cloudflare/use-cloudflare";
import { apiTokenAtom, selectedZoneIdAtom, settingsAtom } from "~utils/state";
import { extensionStoragePersister } from "~utils/storage";

type SettingsModalProps = {
  opened: boolean;
  onClose: () => void;
};

type SettingsItem = {
  title: string;
  description: string;
  action: ReactNode;
  requiresAuth?: boolean;
  hide?: boolean;
};

function SettingsModal({ opened, onClose }: SettingsModalProps) {
  const { LL } = useI18nContext();
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
      message: LL.REFRESH_DATA_SUCCESS(),
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
      message: LL.LOGOUT_SUCCESS(),
      autoClose: 3000,
    });
    onClose();
  };

  const settingsItems: SettingsItem[] = [
    {
      title: LL.THEME(),
      description: LL.THEME_DESC(),
      action: (
        <Switch
          onLabel={LL.THEME_DARK()}
          offLabel={LL.THEME_LIGHT()}
          size="lg"
          color="green"
          checked={colorScheme === "dark"}
          onChange={() => toggleColorScheme()}
        />
      ),
    },
    {
      title: LL.RULE_FILTER(),
      description: LL.RULE_FILTER_DESC(),
      hide: !apiToken,
      action: (
        <Switch
          onLabel={LL.ON()}
          offLabel={LL.OFF()}
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
      title: LL.COPY_ALIAS(),
      description: LL.COPY_ALIAS_DESC(),
      hide: !apiToken,
      action: (
        <Switch
          onLabel={LL.ON()}
          offLabel={LL.OFF()}
          color="green"
          size="lg"
          checked={settings.copyAlias}
          onChange={(event) => setSettings({ ...settings, copyAlias: event.currentTarget.checked })}
        />
      ),
    },
    {
      title: LL.QUICK_CREATE_BUTTON(),
      description: LL.QUICK_CREATE_BUTTON_DESC(),
      hide: !apiToken || isWebApp,
      action: (
        <Switch
          onLabel={LL.ON()}
          offLabel={LL.OFF()}
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
      title: LL.REFRESH_DATA(),
      description: LL.REFRESH_DATA_DESC(),
      hide: !apiToken,
      action: (
        <Button
          loading={zones.isFetching || emailDestinations.isFetching}
          onClick={() => clearCache()}>
          {LL.REFRESH()}
        </Button>
      ),
    },
    {
      title: LL.LOGOUT(),
      description: LL.LOGOUT_DESC(),
      hide: !apiToken,
      action: (
        <Button color="red" onClick={() => logout()}>
          {LL.LOGOUT()}
        </Button>
      ),
    },
    {
      title: LL.DOCS(),
      description: LL.DOCS_DESC(),
      action: (
        <Button
          component="a"
          href="https://developers.cloudflare.com/email-routing/"
          target="_blank"
          rightSection={<IconExternalLink />}>
          {LL.OPEN()}
        </Button>
      ),
    },
    {
      title: LL.INFO(),
      description: `${extensionName} v${extensionVersion}`,
      action: (
        <Button
          component="a"
          href="https://github.com/curetix/mailflare-extension"
          target="_blank"
          color="gray"
          rightSection={<IconExternalLink />}>
          {LL.GITHUB()}
        </Button>
      ),
    },
    {
      title: LL.DEVTOOLS(),
      description: LL.DEVTOOLS_DESC(),
      hide: process.env.NODE_ENV !== "development",
      action: (
        <Switch
          onLabel={LL.ON()}
          offLabel={LL.OFF()}
          size="lg"
          checked={settings.devTools}
          onChange={(event) => setSettings({ ...settings, devTools: event.currentTarget.checked })}
        />
      ),
    },
  ];

  return (
    <Modal opened={opened} onClose={() => onClose()} title="Settings" fullScreen={isExtension}>
      <ScrollArea h={popupHeight - 2 * 20 - 28 - 16}>
        <Stack gap="xs" pr={15}>
          {settingsItems.map(
            (item, index) =>
              !item.hide && (
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
              ),
          )}
        </Stack>
      </ScrollArea>
    </Modal>
  );
}

export default SettingsModal;
