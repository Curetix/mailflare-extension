import type { Alias } from "~/utils/alias";

import { Button, Modal, Select, Stack, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useI18nContext } from "~/i18n/i18n-react";

import { useCloudflare } from "~/lib/cloudflare/use-cloudflare";
import { useFullscreenModal } from "~/utils";

type Props = {
  opened: boolean;
  onClose: (clear?: boolean) => void;
  selectedAliases: Alias[];
};

export function AliasBulkEditModal({ opened, onClose, selectedAliases }: Props) {
  const { LL } = useI18nContext();
  const { selectedZoneId, emailDestinations, updateEmailRule } = useCloudflare();
  const isFullscreen = useFullscreenModal();

  const aliasEditForm = useForm({
    initialValues: {
      destination: "",
      enabled: true,
    },
    validate: {
      destination: (value) =>
        value !== null &&
        value.trim() !== "" &&
        !emailDestinations.data?.find((d) => d.email === value)
          ? LL.INVALID_DESTINATION()
          : null,
    },
  });

  async function saveSelectedAliases(values: typeof aliasEditForm.values) {
    await Promise.all(
      selectedAliases.map(async (a) => {
        try {
          a.enabled = values.enabled;
          if (values.destination !== null && values.destination.trim() !== "") {
            a.destination = values.destination;
          }
          await updateEmailRule.mutateAsync({
            rule: a.toEmailRule(),
            zoneId: selectedZoneId,
          });
        } catch (error) {
          showNotification({
            color: "red",
            title: LL.ERROR(),
            message: LL.UPDATE_ERROR({ alias: a.address, error }),
            autoClose: false,
          });
        }
      }),
    );
    // TODO: handle errors
    showNotification({
      color: "green",
      title: LL.SUCCESS(),
      message: LL.UPDATE_SUCCESS_MULTIPLE(),
      autoClose: 3000,
    });
    onClose(true);
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
      title={LL.UPDATE_MULTIPLE_TITLE()}
      fullScreen={isFullscreen}>
      <form onSubmit={aliasEditForm.onSubmit((values) => saveSelectedAliases(values))}>
        <Stack gap="xs">
          <Select
            label={LL.DESTINATION()}
            placeholder={LL.KEEP_DESTINATIONS()}
            data={
              emailDestinations.data?.map((z) => ({
                value: z.email,
                label: z.email,
              })) || []
            }
            searchable
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
