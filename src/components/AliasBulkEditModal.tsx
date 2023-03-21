import { Button, Modal, Select, Stack, Switch } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import {
  CloudflareEmailRule,
  destinationsStatusAtom,
  editEmailRuleAtom,
  emailRulesStatusAtom,
} from "~utils/cloudflare";

type Props = {
  opened: boolean;
  onClose: (clear?: boolean) => void;
  selectedAliases: CloudflareEmailRule[];
};

export default function AliasBulkEditModal({ opened, onClose, selectedAliases }: Props) {
  const [, emailRulesDispatch] = useAtom(emailRulesStatusAtom);
  const [destinations] = useAtom(destinationsStatusAtom);
  const [editMutation, mutate] = useAtom(editEmailRuleAtom);

  const aliasEditForm = useForm({
    initialValues: {
      destination: "",
      enabled: true,
    },
  });

  async function saveSelectedAliases(values: typeof aliasEditForm.values) {
    await Promise.all(
      selectedAliases.map((a) => {
        a.enabled = values.enabled;
        if (values.destination !== "") {
          a.actions[0].value[0] = values.destination;
        }
        return mutate([a]);
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
      title="Edit Aliases"
      fullScreen>
      <form onSubmit={aliasEditForm.onSubmit((values) => saveSelectedAliases(values))}>
        <Stack spacing="xs">
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
          <Button type="submit" loading={editMutation.isLoading}>
            Save
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
