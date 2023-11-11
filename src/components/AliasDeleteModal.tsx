import type { Alias } from "~utils/alias";

import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import { isExtension } from "~const";
import { deleteEmailAtom, emailRulesStatusAtom } from "~utils/cloudflare";
import { selectedZoneIdAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToDelete: Alias | null;
};

export default function AliasDeleteModal({ opened, onClose, aliasToDelete }: Props) {
  const [, emailRulesDispatch] = useAtom(emailRulesStatusAtom);
  const [deleteMutation, mutate] = useAtom(deleteEmailAtom);
  const [selectedZoneId] = useAtom(selectedZoneIdAtom);

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
      { rule: aliasToDelete.toEmailRule(), zoneId: selectedZoneId },
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
        if (deleteMutation.isPending) {
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
      <Stack gap="xs">
        <>
          <Text>You are about to delete the alias</Text>
          <Text fw={700}>{aliasToDelete?.address}</Text>
          <Text>Do you want to proceed?</Text>
        </>
        <Button.Group>
          <Button fullWidth disabled={deleteMutation.isPending} onClick={() => onClose()}>
            No
          </Button>
          <Button
            color="red"
            fullWidth
            loading={deleteMutation.isPending}
            onClick={() => deleteAlias()}>
            Yes
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}
