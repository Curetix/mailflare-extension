import type { Alias } from "~utils/alias";

import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useI18nContext } from "~i18n/i18n-react";

import { useCloudflare } from "~lib/cloudflare/use-cloudflare";
import { useFullscreenModal } from "~utils";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToDelete: Alias | null;
};

export default function AliasDeleteModal({ opened, onClose, aliasToDelete }: Props) {
  const { LL } = useI18nContext();
  const { selectedZoneId, deleteEmailRule } = useCloudflare();
  const isFullscreen = useFullscreenModal();

  async function deleteAlias() {
    if (!aliasToDelete) {
      showNotification({
        color: "red",
        title: LL.ERROR(),
        message: LL.DELETE_ERROR({ alias: "", error: LL.NOT_FOUND() }),
        autoClose: false,
      });
      return;
    }

    return deleteEmailRule.mutate(
      { rule: aliasToDelete.toEmailRule(), zoneId: selectedZoneId },
      {
        onSuccess: () => {
          showNotification({
            color: "green",
            title: LL.SUCCESS(),
            message: LL.DELETE_SUCCESS(),
            autoClose: 3000,
          });
          onClose();
        },
        onError: (error) => {
          showNotification({
            color: "red",
            title: LL.ERROR(),
            message: LL.DELETE_ERROR({ alias: aliasToDelete.address, error }),
            autoClose: false,
          });
        },
      },
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (deleteEmailRule.isPending) {
          showNotification({
            color: "red",
            message: LL.MODAL_CLOSE_BLOCKED(),
            autoClose: 2000,
          });
        } else {
          onClose();
        }
      }}
      title={LL.DELETE_TITLE()}
      fullScreen={isFullscreen}>
      <Stack gap="xs">
        <Text>{LL.DELETE_QUESTION_1()}</Text>
        <Text fw={700} style={{ lineBreak: "anywhere" }}>
          {aliasToDelete?.address}
        </Text>
        <Text>{LL.DELETE_QUESTION_2()}</Text>
        <Button.Group>
          <Button fullWidth disabled={deleteEmailRule.isPending} onClick={() => onClose()}>
            {LL.NO()}
          </Button>
          <Button
            color="red"
            fullWidth
            loading={deleteEmailRule.isPending}
            onClick={() => deleteAlias()}>
            {LL.YES()}
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}
