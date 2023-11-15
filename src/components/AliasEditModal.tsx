import type { Alias } from "~utils/alias";

import { useEffect } from "react";
import { Button, Modal, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import { emailRuleNamePrefix, isExtension } from "~const";
import { useCloudflare } from "~lib/cloudflare/use-cloudflare";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToEdit: Alias | null;
};

export default function AliasEditModal({ opened, onClose, aliasToEdit }: Props) {
  const { selectedZoneId, emailDestinations, emailRules, updateEmailRule } = useCloudflare();

  const aliasEditForm = useForm({
    initialValues: {
      id: "",
      zoneId: "",
      alias: "",
      description: "",
      destination: "",
      enabled: true,
    },
    validate: {
      destination: (value) =>
        value.trim().length === 0 || !emailDestinations.data?.find((d) => d.email === value),
    },
  });

  useEffect(() => {
    if (!!aliasToEdit) {
      aliasEditForm.setValues({
        id: aliasToEdit.tag,
        zoneId: selectedZoneId!,
        alias: aliasToEdit.address,
        description: aliasToEdit.name.replace(emailRuleNamePrefix, "").trim(),
        destination: aliasToEdit.destination,
        enabled: aliasToEdit.enabled,
      });
    }
  }, [aliasToEdit]);

  async function saveAlias(variables: typeof aliasEditForm.values) {
    if (!aliasToEdit) {
      showNotification({
        color: "red",
        title: "Error",
        message: "Could not save the alias",
        autoClose: false,
      });
      return;
    }

    const updated = aliasToEdit;
    updated.name = variables.description;
    updated.destination = variables.destination;
    updated.enabled = variables.enabled;

    return updateEmailRule.mutate(
      { rule: updated.toEmailRule(), zoneId: selectedZoneId },
      {
        onSuccess: () => {
          emailRules.refetch();
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
    );
  }

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (updateEmailRule.isPending) {
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
      fullScreen={isExtension}>
      <form onSubmit={aliasEditForm.onSubmit((values) => saveAlias(values))}>
        <Stack gap="xs" mih={400}>
          <TextInput label="Alias" disabled {...aliasEditForm.getInputProps("alias")} />
          <TextInput
            label="Description"
            placeholder="Alias description (optional)"
            {...aliasEditForm.getInputProps("description")}
          />
          <Select
            label="Destination"
            data={
              emailDestinations.data?.map((z) => ({
                value: z.email,
                label: z.email,
              })) || []
            }
            allowDeselect={false}
            {...aliasEditForm.getInputProps("destination")}
            error={
              ((!emailDestinations.data || emailDestinations.isError) &&
                (emailDestinations.error?.toString() || "Error loading destinations")) ||
              (aliasEditForm.values.destination &&
                !emailDestinations.data?.find((d) => d.email === aliasEditForm.values.destination)
                  ?.verified &&
                "This address is not verified. You will not receive emails.") ||
              false
            }
          />

          <Switch
            label="Enabled"
            {...aliasEditForm.getInputProps("enabled", { type: "checkbox" })}
          />
          <Button type="submit" loading={updateEmailRule.isPending}>
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
