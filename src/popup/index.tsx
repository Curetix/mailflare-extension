import { ActionIcon, Container, Divider, Group, Modal, Text } from "@mantine/core";
import { IconSettings } from "@tabler/icons-react";
import { QueryClient } from "@tanstack/query-core";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useAtom } from "jotai";
import { useState } from "react";

import AliasList from "~components/AliasList";
import Login from "~components/Login";
import Settings from "~components/Settings";
import { popupHeight, popupWidth } from "~const";
import { ThemeProvider } from "~popup/Theme";
import { apiTokenAtom, devToolsAtom } from "~utils/storage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Popup() {
  const [token] = useAtom(apiTokenAtom);
  const [devToolsEnabled] = useAtom(devToolsAtom);
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {devToolsEnabled && <ReactQueryDevtools initialIsOpen={false} />}
        <Container w={popupWidth} h={popupHeight} p={0}>
          <Modal
            opened={settingsModalOpened}
            onClose={() => setSettingsModalOpened(false)}
            title="Settings"
            fullScreen
            scrollAreaComponent={Modal.NativeScrollArea}>
            <Settings />
          </Modal>
          <Group position="apart" px="md" py="sm">
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
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default Popup;
