import { Fragment, type ReactNode } from "react";
import type { Locales } from "~/i18n/i18n-types";
import { useQueryClient } from "@tanstack/react-query";
import { useI18nContext } from "~/i18n/i18n-react";
import { loadLocaleAsync } from "~/i18n/i18n-util.async";
import {
  TbDeviceDesktop,
  TbExternalLink,
  TbMoon,
  TbMoonFilled,
  TbSun,
  TbSunFilled,
} from "react-icons/tb";
import { useTheme } from "next-themes";
import { useAtom } from "jotai";
import { apiTokenAtom, settingsAtom } from "~/utils/state";
import { extensionName, extensionVersion, isWebApp } from "~/const";
import { LogoutDialog } from "~/components/dialogs/logout";
import { useCloudflare } from "~/lib/cloudflare/use-cloudflare";
import { Button, Stack, Flex, Separator, Text } from "@chakra-ui/react";
import { Icon } from "lucide-react";
import { Select } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { toaster } from "~/components/ui/toaster";

type SettingsItem = {
  key: string;
  title: string;
  description?: string;
  action: ReactNode;
  requiresAuth?: boolean;
  hide?: boolean;
};

export function SettingsList() {
  const { LL, locale, setLocale } = useI18nContext();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const { zones, emailDestinations } = useCloudflare();

  const [apiToken] = useAtom(apiTokenAtom);
  const [settings, setSettings] = useAtom(settingsAtom);

  const onLocaleSelected = async (value: string | null) => {
    const locale = value as Locales;
    localStorage.setItem("lang", locale);
    await loadLocaleAsync(locale);
    setLocale(locale);
  };

  const settingsItems: SettingsItem[] = [
    {
      key: "theme",
      title: LL.THEME(),
      description: LL.THEME_DESC(),
      action: (
        <div />
        // <ToggleGroup.Root
        //   value={[theme ?? "light"]}
        //   onValueChange={({ value }) => setTheme(value[0])}>
        //   <ToggleGroup.Item value="light" aria-label={LL.THEME_LIGHT()}>
        //     <Icon asChild>{theme === "light" ? <TbSunFilled /> : <TbSun />}</Icon>
        //   </ToggleGroup.Item>

        //   <ToggleGroup.Item value="dark" aria-label={LL.THEME_DARK()}>
        //     <Icon asChild>{theme === "dark" ? <TbMoonFilled /> : <TbMoon />}</Icon>
        //   </ToggleGroup.Item>

        //   <ToggleGroup.Item value="system" aria-label={LL.THEME_AUTO()}>
        //     <Icon asChild>
        //       <TbDeviceDesktop />
        //     </Icon>
        //   </ToggleGroup.Item>
        // </ToggleGroup.Root>
      ),
    },
    {
      key: "locale",
      title: LL.LANGUAGE(),
      description: LL.LANGUAGE_DESC(),
      action: (
        <Select
          value={locale}
          onValueChange={(value) => onLocaleSelected(value)}
          maxWidth="200px"
          items={[
            { value: "en", label: LL.LANGUAGE_ENGLISH() },
            { value: "de", label: LL.LANGUAGE_GERMAN() },
            { value: "nl", label: LL.LANGUAGE_DUTCH() },
            { value: "zh", label: LL.LANGUAGE_CHINESE() },
          ]}
        />
      ),
    },
    {
      key: "filter",
      title: LL.RULE_FILTER(),
      description: LL.RULE_FILTER_DESC(),
      hide: !apiToken,
      action: (
        <Switch
          checked={settings.ruleFilter}
          onCheckedChange={({ checked }) => setSettings({ ...settings, ruleFilter: checked })}>
          {settings.ruleFilter ? LL.ON() : LL.OFF()}
        </Switch>
      ),
    },
    {
      key: "copy",
      title: LL.COPY_ALIAS(),
      description: LL.COPY_ALIAS_DESC(),
      hide: !apiToken,
      action: (
        <Switch
          checked={settings.copyAlias}
          onCheckedChange={({ checked }) => setSettings({ ...settings, copyAlias: checked })}>
          {settings.copyAlias ? LL.ON() : LL.OFF()}
        </Switch>
      ),
    },
    {
      key: "create-button",
      title: LL.QUICK_CREATE_BUTTON(),
      description: LL.QUICK_CREATE_BUTTON_DESC(),
      hide: !apiToken || isWebApp,
      action: (
        <Switch
          checked={settings.showCreateButton}
          onCheckedChange={({ checked }) =>
            setSettings({ ...settings, showCreateButton: checked })
          }>
          {settings.showCreateButton ? LL.ON() : LL.OFF()}
        </Switch>
      ),
    },
    {
      key: "refresh",
      title: LL.REFRESH_DATA(),
      description: LL.REFRESH_DATA_DESC(),
      hide: !apiToken,
      action: (
        <Button
          // loading={zones.isFetching || emailDestinations.isFetching}
          onClick={async () => {
            await queryClient.invalidateQueries();
            toaster.create({
              type: "success",
              description: LL.REFRESH_DATA_SUCCESS(),
              duration: 3000,
            });
          }}>
          {LL.REFRESH()}
        </Button>
      ),
    },
    {
      key: "logout",
      title: LL.LOGOUT(),
      description: LL.LOGOUT_DESC(),
      hide: !apiToken,
      action: (
        <LogoutDialog>
          <Button colorPalette="red">{LL.LOGOUT()}</Button>
        </LogoutDialog>
      ),
    },
    {
      key: "docs-link",
      title: LL.DOCS(),
      description: LL.DOCS_DESC(),
      action: (
        <Button variant="ghost" asChild>
          <a
            href="https://developers.cloudflare.com/email-routing/"
            target="_blank"
            rel="noreferrer">
            {LL.OPEN()}
            <TbExternalLink size={16} />
          </a>
        </Button>
      ),
    },
    {
      key: "info",
      title: LL.INFO(),
      description: `${extensionName} v${extensionVersion}`,
      action: (
        <Button variant="ghost" asChild>
          <a href="https://github.com/curetix/mailflare-extension" target="_blank" rel="noreferrer">
            {LL.GITHUB()}
            <TbExternalLink size={16} />
          </a>
        </Button>
      ),
    },
  ];

  const visibleItems = settingsItems.filter((item) => !item.hide);

  return (
    <Stack gap={2}>
      {visibleItems.map((item, index) => (
        <Fragment key={item.key}>
          <Flex justify="space-between" align="center" gap={2}>
            <Stack gap={0} flex={1}>
              <Text>{item.title}</Text>
              <Text fontSize="sm" color="fg.subtle">
                {item.description}
              </Text>
            </Stack>
            {item.action}
          </Flex>
          {index < visibleItems.length - 1 && <Separator />}
        </Fragment>
      ))}
    </Stack>
  );
}
