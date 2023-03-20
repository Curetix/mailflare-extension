import { Button, Modal, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";
import { useEffect } from "react";

import { emailRuleNamePrefix } from "~const";
import {
  CloudflareEmailRule,
  destinationsStatusAtom,
  editEmailRuleAtom,
  emailRulesStatusAtom,
} from "~utils/cloudflare";
import { selectedZoneIdAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToEdit: CloudflareEmailRule;
};

export default function AliasEditModal({ opened, onClose, aliasToEdit }: Props) {
  const [destinations] = useAtom(destinationsStatusAtom);
  const [, emailRulesDispatch] = useAtom(emailRulesStatusAtom);
  const [editMutation, mutate] = useAtom(editEmailRuleAtom);

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

  async function saveAlias(variables: typeof aliasEditForm.values) {
    const original = aliasToEdit;
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

    return mutate([
      updated,
      {
        onSuccess: () => {
          emailRulesDispatch({ type: "refetch" });
          aliasEditForm.reset();
          showNotification({
            color: "green",
            title: "Success!",
            message: "The alias was updated!",
            autoClose: 3000,
          });
          onClose();
        },
        onError: () => {
          showNotification({
            color: "red",
            title: "Error",
            message: "Could not save the alias.",
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
      <form onSubmit={aliasEditForm.onSubmit((values) => saveAlias(values))}>
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
