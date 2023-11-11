import type { Alias } from "~utils/alias";

import { Button, Modal, Select, Stack, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import { isExtension } from "~const";
import { destinationsStatusAtom, editEmailRuleAtom, emailRulesStatusAtom } from "~utils/cloudflare";
import { selectedZoneIdAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: (clear?: boolean) => void;
  selectedAliases: Alias[];
};

export default function AliasBulkEditModal({ opened, onClose, selectedAliases }: Props) {
  const [, emailRulesDispatch] = useAtom(emailRulesStatusAtom);
  const [destinations] = useAtom(destinationsStatusAtom);
  const [editMutation, mutate] = useAtom(editEmailRuleAtom);
  const [selectedZoneId] = useAtom(selectedZoneIdAtom);

  const aliasEditForm = useForm({
    initialValues: {
      destination: "",
      enabled: true,
    },
    validate: {
      destination: (value) =>
        value.trim().length === 0 || !destinations.data?.find((d) => d.email === value),
    },
  });

  async function saveSelectedAliases(values: typeof aliasEditForm.values) {
    await Promise.all(
      selectedAliases.map((a) => {
        try {
          a.enabled = values.enabled;
          if (values.destination !== "") {
            a.forwardTo = values.destination;
          }
          return mutate([{ rule: a.toEmailRule(), zoneId: selectedZoneId }]);
        } catch (error) {
          showNotification({
            color: "red",
            title: "Error",
            message: `Error saving alias ${a.address}: ${error}`,
            autoClose: false,
          });
        }
      }),
    );
    // TODO: handle errors
    showNotification({
      color: "green",
      title: "Success!",
      message: "The selected aliases were updated!",
      autoClose: 3000,
    });
    emailRulesDispatch({ type: "refetch" });
    onClose(true);
  }

  return (
    <Modal
      opened={opened}
      onClose={() => {
        if (editMutation.isPending) {
          showNotification({
            color: "red",
            message: "Cannot be closed right now.",
            autoClose: 2000,
          });
        } else {
          onClose();
        }
      }}
      title="Edit Aliases"
      fullScreen={isExtension}>
      <form onSubmit={aliasEditForm.onSubmit((values) => saveSelectedAliases(values))}>
        <Stack gap="xs" mih={400}>
          <Select
            label="Destination"
            placeholder="Keep original destinations"
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
          <Button type="submit" loading={editMutation.isPending}>
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
