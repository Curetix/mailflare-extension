import type { LocaleDetector } from "typesafe-i18n/detectors";
import { useAtom } from "jotai";
import { useState } from "react";
// import { AliasList } from "~/components/alias-list";
// import { Login } from "~/components/login";
// import { SettingsModal } from "~/components/settings-modal";
import { Providers } from "~/providers";
// import { apiTokenAtom } from "~/utils/state";
// import { PermissionsCheck } from "~/components/permissions-check";
// import { UpdateCheck } from "~/components/update-check";
import { Flex, Group, Text } from "@chakra-ui/react";

type AppProps = {
  localeDetectors?: LocaleDetector[];
};

export function App({ localeDetectors }: AppProps) {
  // const [token] = useAtom(apiTokenAtom);
  // const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  return (
    <Providers localeDetectors={localeDetectors}>
      {/* <UpdateCheck />
      <PermissionsCheck /> */}
      <Flex direction="column" h="100%" maxW={600} m="auto">
        {/* <SettingsModal opened={settingsModalOpened} onClose={() => setSettingsModalOpened(false)} /> */}
        <Group justify="space-between" px="md" py="sm">
          <Text fontWeight="bold" fontSize="md">
            MailFlare
          </Text>
          {/* <ActionIcon variant="subtle" size="md" onClick={() => setSettingsModalOpened(true)}>
            <IconSettings size={16} />
          </ActionIcon> */}
        </Group>
        {/* {token ? <AliasList flex={1} mih={0} /> : <Login />} */}
      </Flex>
    </Providers>
  );
}
