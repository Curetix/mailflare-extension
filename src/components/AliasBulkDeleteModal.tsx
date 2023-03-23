import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import { Alias, deleteEmailAtom, emailRulesStatusAtom } from "~utils/cloudflare";

type Props = {
  opened: boolean;
  onClose: (clear?: boolean) => void;
  selectedAliases: Alias[];
};

export default function AliasBulkDeleteModal({ opened, onClose, selectedAliases }: Props) {
  const [, emailRulesDispatch] = useAtom(emailRulesStatusAtom);
  const [deleteMutation, mutate] = useAtom(deleteEmailAtom);

  async function deleteSelectedAliases() {
    await Promise.all(selectedAliases.map((a) => mutate([a.toEmailRule()])));
    // TODO: handle errors
    emailRulesDispatch({ type: "refetch" });
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
        if (deleteMutation.isLoading) {
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
      fullScreen>
      <Stack spacing="xs">
        <Text>You are about to delete {selectedAliases.length} aliases.</Text>
        <Text>Do you want to proceed?</Text>
        <Button.Group>
          <Button fullWidth disabled={deleteMutation.isLoading} onClick={() => onClose()}>
            No
          </Button>
          <Button
            color="red"
            fullWidth
            loading={deleteMutation.isLoading}
            onClick={() => deleteSelectedAliases()}>
            Yes
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}
