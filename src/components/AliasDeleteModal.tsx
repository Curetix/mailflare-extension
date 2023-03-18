import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { CloudflareApiBaseUrl, CloudflareCreateEmailRuleResponse } from "~utils/cloudflare";
import { apiTokenAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function AliasDeleteModal({ opened, onClose }: Props) {
  const queryClient = useQueryClient();

  const [token] = useAtom(apiTokenAtom);

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
        {/*{selectedAliases.length === 0 ? (*/}
        {/*  <Text>*/}
        {/*    Do you want to delete the alias {aliasToDelete?.matchers[0].value}? This cannot be*/}
        {/*    undone.*/}
        {/*  </Text>*/}
        {/*) : (*/}
        {/*  <Text>*/}
        {/*    Do you want to delete {selectedAliases.length} aliases? This cannot be undone.*/}
        {/*  </Text>*/}
        {/*)}*/}
        {/*<Button.Group>*/}
        {/*  <Button*/}
        {/*    fullWidth*/}
        {/*    disabled={deleteMutation.isLoading}*/}
        {/*    onClick={() => {*/}
        {/*      setAliasDeleteModalOpened(false);*/}
        {/*      setAliasToDelete(null);*/}
        {/*    }}>*/}
        {/*    No*/}
        {/*  </Button>*/}
        {/*  <Button*/}
        {/*    color="red"*/}
        {/*    fullWidth*/}
        {/*    loading={deleteMutation.isLoading}*/}
        {/*    onClick={() => {*/}
        {/*      if (selectedAliases.length > 0) {*/}
        {/*        selectedAliases.forEach((a) =>*/}
        {/*          deleteMutation.mutate({ id: a.tag, zoneId: selectedZoneId }),*/}
        {/*        );*/}
        {/*      } else {*/}
        {/*        setAliasDeleteModalOpened(false);*/}
        {/*        deleteMutation.mutate({ id: aliasToDelete?.tag, zoneId: selectedZoneId });*/}
        {/*      }*/}
        {/*    }}>*/}
        {/*    Yes*/}
        {/*  </Button>*/}
        {/*</Button.Group>*/}
      </Stack>
    </Modal>
  );
}
