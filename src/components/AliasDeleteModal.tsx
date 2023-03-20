import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import { CloudflareEmailRule, deleteEmailAtom, emailRulesStatusAtom } from "~utils/cloudflare";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToDelete: CloudflareEmailRule;
};

export default function AliasDeleteModal({ opened, onClose, aliasToDelete }: Props) {
  const [, emailRulesDispatch] = useAtom(emailRulesStatusAtom);
  const [deleteMutation, mutate] = useAtom(deleteEmailAtom);

  async function deleteAlias() {
    return mutate([
      aliasToDelete,
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
      fullScreen>
      <Stack spacing="xs">
        <>
          <Text>You are about to delete the alias</Text>
          <Text fw={700}>{aliasToDelete?.matchers[0].value}</Text>
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
