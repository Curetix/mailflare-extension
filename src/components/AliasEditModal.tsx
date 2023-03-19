import { Button, Modal, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect } from "react";

import { emailRuleNamePrefix } from "~const";
import {
  CloudflareApiBaseUrl,
  CloudflareCreateEmailRuleResponse,
  CloudflareEmailRule,
  destinationsStatusAtom,
  emailRulesStatusAtom,
} from "~utils/cloudflare";
import { apiTokenAtom, selectedZoneIdAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToEdit: CloudflareEmailRule;
};

export default function AliasEditModal({ opened, onClose, aliasToEdit }: Props) {
  const queryClient = useQueryClient();

  const [destinations] = useAtom(destinationsStatusAtom);
  const [emailRules] = useAtom(emailRulesStatusAtom);
  const [token] = useAtom(apiTokenAtom);

  const [selectedZoneId] = useAtom(selectedZoneIdAtom);

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

  useEffect(() => {
    if (!!aliasToEdit) {
      aliasEditForm.setValues({
        id: aliasToEdit.tag,
        zoneId: selectedZoneId!,
        alias: aliasToEdit.matchers[0].value,
        description: aliasToEdit.name.replace(emailRuleNamePrefix, "").trim(),
        destination: aliasToEdit.actions[0].value[0],
        enabled: aliasToEdit.enabled,
      });
    }
  }, [aliasToEdit]);

  const editMutation = useMutation(
    async (variables: typeof aliasEditForm.values) => {
      const original = emailRules.data?.find((r) => r.tag === variables.id);

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
        onClose();
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
            data={
              destinations.data?.map((z) => ({
                value: z.email,
                label: z.email,
              })) || []
            }
            {...aliasEditForm.getInputProps("destination")}
            error={
              ((!destinations.data || destinations.isError) &&
                (destinations.error?.toString() || "Error loading destinations")) ||
              (aliasEditForm.values.destination &&
                !destinations.data?.find((d) => d.email === aliasEditForm.values.destination)
                  ?.verified &&
                "This address is not verified. You will not receive emails.") ||
              false
            }
          />

          <Switch
            label="Enabled"
            {...aliasEditForm.getInputProps("enabled", { type: "checkbox" })}
          />
          <Button type="submit" loading={editMutation.isLoading}>
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
