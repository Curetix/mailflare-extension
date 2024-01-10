import type { Alias } from "~utils/alias";

import { useI18nContext } from "~i18n/i18n-react";
import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";

import { isExtension } from "~const";
import { useCloudflare } from "~lib/cloudflare/use-cloudflare";

type Props = {
  opened: boolean;
  onClose: (clear?: boolean) => void;
  selectedAliases: Alias[];
};

export default function AliasBulkDeleteModal({ opened, onClose, selectedAliases }: Props) {
  const { LL } = useI18nContext();
  const { selectedZoneId, deleteEmailRule } = useCloudflare();

  async function deleteSelectedAliases() {
    await Promise.all(
      selectedAliases.map(async (a) => {
        try {
          await deleteEmailRule.mutateAsync({
            rule: a.toEmailRule(),
            zoneId: selectedZoneId,
          });
        } catch (error) {
          showNotification({
            color: "red",
            title: LL.ERROR(),
            message: LL.DELETE_ERROR({ alias: a.address, error }),
            autoClose: false,
          });
        }
      }),
    );
    showNotification({
      color: "green",
      title: LL.SUCCESS(),
      message: LL.DELETE_SUCCESS_MULTIPLE(),
      autoClose: 3000,
    });
    onClose(true);
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
      title={LL.DELETE_MULTIPLE_TITLE()}
      fullScreen={isExtension}>
      <Stack gap="xs">
        <Text>{LL.DELETE_MULTIPLE_QUESTION({ count: selectedAliases.length })}</Text>
        <Text>{LL.DELETE_QUESTION_2()}</Text>
        <Button.Group>
          <Button fullWidth disabled={deleteEmailRule.isPending} onClick={() => onClose()}>
            {LL.NO()}
          </Button>
          <Button
            color="red"
            fullWidth
            loading={deleteEmailRule.isPending}
            onClick={() => deleteSelectedAliases()}>
            {LL.YES()}
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}
