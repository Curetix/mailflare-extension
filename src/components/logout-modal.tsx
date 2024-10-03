import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useI18nContext } from "~/i18n/i18n-react";

import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai/index";
import { RESET } from "jotai/utils";
import { useFullscreenModal } from "~/utils";
import { apiTokenAtom, selectedZoneIdAtom } from "~/utils/state";
import { extensionStoragePersister } from "~/utils/storage";

type Props = {
  opened: boolean;
  onClose: () => void;
  onLogout?: () => void;
};

export function LogoutModal({ opened, onClose, onLogout }: Props) {
  const { LL } = useI18nContext();
  const queryClient = useQueryClient();
  const isFullscreen = useFullscreenModal();

  const [, setToken] = useAtom(apiTokenAtom);
  const [, setSelectedZoneId] = useAtom(selectedZoneIdAtom);

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
    if (onLogout) onLogout();
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title={LL.LOGOUT_TITLE()} fullScreen={isFullscreen}>
      <Stack gap="xs">
        <Text>{LL.LOGOUT_CONFIRM()}</Text>
        <Button.Group>
          <Button fullWidth onClick={onClose}>
            {LL.NO()}
          </Button>
          <Button color="red" fullWidth onClick={logout}>
            {LL.YES()}
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}
