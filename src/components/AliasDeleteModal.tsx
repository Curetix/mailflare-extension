import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import {
  CloudflareApiBaseUrl,
  CloudflareCreateEmailRuleResponse,
  CloudflareEmailRule,
} from "~utils/cloudflare";
import { apiTokenAtom, selectedZoneIdAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToDelete: CloudflareEmailRule;
};

export default function AliasDeleteModal({ opened, onClose, aliasToDelete }: Props) {
  const queryClient = useQueryClient();

  const [token] = useAtom(apiTokenAtom);

  const [selectedZoneId] = useAtom(selectedZoneIdAtom);

  const deleteMutation = useMutation(
    async (variables: { id: string; zoneId: string }) => {
      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${variables.zoneId}/email/routing/rules/${variables.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      const json: CloudflareCreateEmailRuleResponse = await response.json();
      if (response.ok && json.success) {
        showNotification({
          color: "green",
          title: "Success!",
          message: "The alias was deleted!",
          autoClose: 3000,
        });
        return json.result;
      }
      console.error(json);
      showNotification({
        color: "red",
        title: "Error",
        message: json.errors[0].message,
        autoClose: false,
      });
      throw new Error(json.errors[0].message);
    },
    {
      onSuccess: (data, variables) => {
        onClose();
        return queryClient.invalidateQueries({ queryKey: ["emailRules", variables.zoneId] });
      },
    },
  );

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
            onClick={() => {
              deleteMutation.mutate({ id: aliasToDelete?.tag, zoneId: selectedZoneId! });
            }}>
            Yes
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}
