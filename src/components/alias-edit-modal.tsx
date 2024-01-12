import type { Alias } from "~utils/alias";

import { useI18nContext } from "~i18n/i18n-react";
import { useEffect } from "react";
import { Button, Modal, Select, Stack, Switch, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";

import { emailRuleNamePrefix, isExtension } from "~const";
import { useCloudflare } from "~lib/cloudflare/use-cloudflare";

type Props = {
  opened: boolean;
  onClose: () => void;
  aliasToEdit: Alias | null;
};

export default function AliasEditModal({ opened, onClose, aliasToEdit }: Props) {
  const { LL } = useI18nContext();
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
        title: LL.ERROR(),
        message: LL.UPDATE_ERROR({ alias: "", error: LL.NOT_FOUND() }),
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
          aliasEditForm.reset();
          showNotification({
            color: "green",
            title: LL.SUCCESS(),
            message: LL.UPDATE_SUCCESS(),
            autoClose: 3000,
          });
          onClose();
        },
        onError: (error) => {
          showNotification({
            color: "red",
            title: LL.ERROR(),
            message: LL.UPDATE_ERROR({ alias: updated.address, error }),
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
            message: LL.MODAL_CLOSE_BLOCKED(),
            autoClose: 2000,
          });
        } else {
          onClose();
        }
      }}
      title="Edit Alias"
      fullScreen={isExtension}>
      <form onSubmit={aliasEditForm.onSubmit((values) => saveAlias(values))}>
        <Stack gap="xs">
          <TextInput label={LL.ALIAS()} disabled {...aliasEditForm.getInputProps("alias")} />
          <TextInput
            label={LL.ALIAS_DESCRIPTION()}
            placeholder={LL.ALIAS_DESCRIPTION_PLACEHOLDER()}
            {...aliasEditForm.getInputProps("description")}
          />
          <Select
            label={LL.DESTINATION()}
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
                (emailDestinations.error?.toString() || LL.DESTINATIONS_LOADING_ERROR())) ||
              (aliasEditForm.values.destination &&
                !emailDestinations.data?.find((d) => d.email === aliasEditForm.values.destination)
                  ?.verified &&
                LL.DESTINATION_NOT_VERIFIED()) ||
              false
            }
          />

          <Switch
            label={LL.ENABLED()}
            {...aliasEditForm.getInputProps("enabled", { type: "checkbox" })}
          />
          <Button type="submit" loading={updateEmailRule.isPending}>
            {LL.SAVE()}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
