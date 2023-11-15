import type { Alias } from "~utils/alias";

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
  const { selectedZoneId, deleteEmailRule } = useCloudflare();

  async function deleteSelectedAliases() {
    await Promise.all(
      selectedAliases.map(async (a) => {
        try {
          deleteEmailRule.mutate({
            rule: a.toEmailRule(),
            zoneId: selectedZoneId,
          });
        } catch (error) {
          showNotification({
            color: "red",
            title: "Error",
            message: `Error deleting alias ${a.address}: ${error}`,
            autoClose: false,
          });
        }
      }),
    );
    showNotification({
      color: "green",
      title: "Success!",
      message: "The selected aliases were deleted!",
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
            message: "Cannot be closed right now.",
            autoClose: 2000,
          });
        } else {
          onClose();
        }
      }}
      title="Delete Aliases"
      fullScreen={isExtension}>
      <Stack gap="xs">
        <Text>You are about to delete {selectedAliases.length} aliases.</Text>
        <Text>Do you want to proceed?</Text>
        <Button.Group>
          <Button fullWidth disabled={deleteEmailRule.isPending} onClick={() => onClose()}>
            No
          </Button>
          <Button
            color="red"
            fullWidth
            loading={deleteEmailRule.isPending}
            onClick={() => deleteSelectedAliases()}>
            Yes
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}
