import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import { isExtension } from "~const";
import type { Alias } from "~utils/alias";
import { deleteEmailAtom, emailRulesStatusAtom } from "~utils/cloudflare";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToDelete: Alias | null;
};

export default function AliasDeleteModal({ opened, onClose, aliasToDelete }: Props) {
  const [, emailRulesDispatch] = useAtom(emailRulesStatusAtom);
  const [deleteMutation, mutate] = useAtom(deleteEmailAtom);

  async function deleteAlias() {
    if (!aliasToDelete) {
      showNotification({
        color: "red",
        title: "Error",
        message: "Could not delete the alias",
        autoClose: false,
      });
      return;
    }

    return mutate([
      aliasToDelete.toEmailRule(),
      {
        onSuccess: () => {
          emailRulesDispatch({ type: "refetch" });
          showNotification({
            color: "green",
            title: "Success!",
            message: "The alias was deleted!",
            autoClose: 3000,
          });
          onClose();
        },
        onError: () => {
          showNotification({
            color: "red",
            title: "Error",
            message: "Could not delete the alias",
            autoClose: false,
          });
        },
      },
    ]);
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
      title="Delete Alias"
      fullScreen={isExtension}>
      <Stack spacing="xs">
        <>
          <Text>You are about to delete the alias</Text>
          <Text fw={700}>{aliasToDelete?.address}</Text>
          <Text>Do you want to proceed?</Text>
        </>
        <Button.Group>
          <Button fullWidth disabled={deleteMutation.isLoading} onClick={() => onClose()}>
            No
          </Button>
          <Button
            color="red"
            fullWidth
            loading={deleteMutation.isLoading}
            onClick={() => deleteAlias()}>
            Yes
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}
