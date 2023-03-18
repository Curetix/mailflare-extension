import { Button, Modal, NumberInput, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";

import { emailRuleNamePrefix } from "~const";
import {
  CloudflareApiBaseUrl,
  CloudflareCreateEmailRuleResponse,
  CloudflareEmailRule,
  destinationsAtom,
  emailRulesAtom,
  emailRulesStatusAtom,
} from "~utils/cloudflare";
import { apiTokenAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function AliasEditModal({ opened, onClose }: Props) {
  const queryClient = useQueryClient();

  const [destinations] = useAtom(destinationsAtom);
  const [token] = useAtom(apiTokenAtom);

  const aliasEditForm = useForm({
    initialValues: {
      id: "",
      zoneId: "",
      alias: "",
      description: "",
      destination: "",
      enabled: true,
    },
  });

  const editMutation = useMutation(
    async (variables: typeof aliasEditForm.values) => {
      const original = emailRules.find((r) => r.tag === variables.id);

      if (!original) {
        throw new Error("Could not find the alias to be edited.");
      }

      const updated: CloudflareEmailRule = {
        ...original,
        name: original.name.startsWith(emailRuleNamePrefix)
          ? `${emailRuleNamePrefix}${variables.description}`
          : variables.destination,
        actions: [
          {
            type: "forward",
            value: [variables.destination],
          },
        ],
        enabled: variables.enabled,
      };
      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${variables.zoneId}/email/routing/rules/${variables.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updated),
        },
      );
      const json: CloudflareCreateEmailRuleResponse = await response.json();
      if (response.ok && json.success) {
        // TODO: close here
        aliasEditForm.reset();
        showNotification({
          color: "green",
          title: "Success!",
          message: "The alias was updated!",
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
        if (editMutation.isLoading) {
          showNotification({
            color: "red",
            message: "Cannot be closed right now.",
            autoClose: 2000,
          });
        } else {
          onClose();
        }
      }}
      title="Edit Alias"
      fullScreen>
      <form onSubmit={aliasEditForm.onSubmit((values) => editMutation.mutate(values))}>
        <Stack spacing="xs">
          <TextInput label="Alias" disabled {...aliasEditForm.getInputProps("alias")} />
          <TextInput
            label="Description"
            placeholder="Alias description (optional)"
            {...aliasEditForm.getInputProps("description")}
          />
          <Select
            label="Destination"
            data={destinations.map((z) => ({
              value: z.email,
              label: z.email,
            }))}
            {...aliasEditForm.getInputProps("destination")}
            error={
              aliasEditForm.values.destination &&
              !destinations.find((d) => d.email === aliasEditForm.values.destination)?.verified
                ? "This address is not verified. You will not receive emails."
                : false
            }
          />

          <Switch
            label="Enabled"
            {...aliasEditForm.getInputProps("enabled", { type: "checkbox" })}
          />
          <Button type="submit" loading={editMutation.status === "loading"}>
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
