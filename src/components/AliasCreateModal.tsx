import type { CloudflareEmailRule } from "~lib/cloudflare.types";

import { useEffect } from "react";
import { Button, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import { emailRuleNamePrefix, isExtension } from "~const";
import { generateAliasAddress } from "~utils/alias";
import {
  createEmailRuleAtom,
  destinationsStatusAtom,
  emailRulesStatusAtom,
  zonesStatusAtom,
} from "~utils/cloudflare";
import { aliasSettingsAtom, hostnameAtom, selectedZoneIdAtom, settingsAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function AliasCreateModal({ opened, onClose }: Props) {
  const clipboard = useClipboard();

  const [destinations] = useAtom(destinationsStatusAtom);
  const [zones] = useAtom(zonesStatusAtom);
  const [createMutation, mutate] = useAtom(createEmailRuleAtom);
  const [emailRules, emailRulesDispatch] = useAtom(emailRulesStatusAtom);

  const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom);
  const [aliasSettings, setAliasSettings] = useAtom(aliasSettingsAtom);
  const [{ copyAlias }] = useAtom(settingsAtom);

  const [hostname] = useAtom(hostnameAtom);

  const aliasCreateForm = useForm({
    initialValues: {
      zoneId: "",
      format: "characters",
      characterCount: 5,
      wordCount: 2,
      separator: "_",
      customAlias: "",
      description: "",
      prefixFormat: "none",
      customPrefix: "",
      destination: "",
    },
    validate: {
      zoneId: (value) =>
        value.trim() === "" || !zones.data?.find((z) => z.id === selectedZoneId)
          ? "Invalid domain"
          : null,
      format: (value) =>
        !["characters", "words", "custom"].includes(value) ? "Invalid alias format" : null,
      characterCount: (value, values) =>
        values.format === "characters" && (value < 3 || value > 25)
          ? "Must be between 3 and 25"
          : null,
      wordCount: (value, values) =>
        values.format === "words" && (value < 1 || value > 5) ? "Must be between 1 and 5" : null,
      customAlias: (value, values) =>
        values.format === "custom" && value.trim().length < 3
          ? "Must be at least 3 characters"
          : null,
      prefixFormat: (value) =>
        !["none", "domainWithoutExtension", "domainWithExtension", "fullDomain", "custom"].includes(
          value,
        )
          ? "Invalid format"
          : null,
      customPrefix: (value, values) =>
        values.prefixFormat === "custom" && value.trim().length < 1
          ? "Must be at least 1 character."
          : null,
      destination: (value) =>
        value.trim().length === 0 || !destinations.data?.find((d) => d.email === value),
    },
  });

  function resetForm() {
    aliasCreateForm.reset();

    if (!!aliasSettings) {
      aliasCreateForm.setValues({
        ...aliasSettings,
      });
    }

    if (!!selectedZoneId) {
      aliasCreateForm.setValues({
        zoneId: selectedZoneId,
      });
    }

    if (!!hostname) {
      aliasCreateForm.setValues({
        description: hostname,
      });
    } else {
      aliasCreateForm.setValues({
        prefixFormat: "none",
      });
    }
  }

  useEffect(() => {
    resetForm();
  }, [aliasSettings, selectedZoneId, hostname]);

  async function createAlias(variables: typeof aliasCreateForm.values) {
    const zone = zones.data?.find((z) => z.id === variables.zoneId);

    if (!zone) {
      showNotification({
        color: "red",
        title: "Error",
        message: "Could not find the domain.",
        autoClose: false,
      });
      return;
    }

    let aliasAddress: string;
    if (variables.format === "custom") {
      aliasAddress = `${variables.customAlias}@${zone.name}`;

      if (emailRules.data?.find((r) => r.matchers[0].value === aliasAddress)) {
        showNotification({
          color: "red",
          title: "Conflict",
          message: "This alias already exists.",
          autoClose: false,
        });
        return;
      }
    } else {
      let attempts = 0;
      while (true) {
        attempts += 1;

        aliasAddress = `${generateAliasAddress({
          format: variables.format === "words" ? "words" : "characters",
          characterCount: variables.characterCount,
          wordCount: variables.wordCount,
          separator: variables.separator,
          customPrefix: variables.customPrefix,
          hostname,
        })}@${zone.name}`;

        if (!emailRules.data?.find((r) => r.matchers[0].value === aliasAddress)) {
          break;
        } else if (attempts === 3) {
          showNotification({
            color: "red",
            title: "Conflict",
            message:
              "Could not generate a unique alias after 3 attempts. Try again with changed settings.",
            autoClose: false,
          });
          return;
        }
      }
    }

    const rule: Omit<CloudflareEmailRule, "tag"> = {
      actions: [
        {
          type: "forward",
          value: [variables.destination],
        },
      ],
      matchers: [
        {
          field: "to",
          type: "literal",
          value: aliasAddress,
        },
      ],
      enabled: true,
      name: `${emailRuleNamePrefix}${variables.description}`,
      priority: Math.round(Date.now() / 1000),
    };
    return mutate([
      { zoneId: zone.id, rule },
      {
        onSuccess: (data) => {
          resetForm();
          setSelectedZoneId(variables.zoneId);
          emailRulesDispatch({ type: "refetch" });
          setAliasSettings({
            format: variables.format as "characters" | "words",
            characterCount: variables.characterCount,
            wordCount: variables.wordCount,
            separator: variables.separator,
            prefixFormat: variables.prefixFormat as
              | "none"
              | "custom"
              | "domainWithoutExtension"
              | "domainWithExtension"
              | "fullDomain",
            destination: variables.destination,
          });
          if (copyAlias) {
            clipboard.copy(data.matchers[0].value);
          }
          showNotification({
            color: "green",
            title: "Success",
            message: copyAlias
              ? "The alias was created and copied to the clipboard."
              : "This alias was created.",
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
        if (createMutation.isPending) {
          showNotification({
            color: "red",
            message: "Cannot be closed right now.",
            autoClose: 2000,
          });
        } else {
          onClose();
        }
      }}
      title="Create alias"
      fullScreen={isExtension}>
      <form onSubmit={aliasCreateForm.onSubmit((values) => createAlias(values))}>
        <Stack gap="xs">
          <Select
            label="Domain"
            data={
              zones.data?.map((z) => ({
                value: z.id,
                label: z.name,
              })) || []
            }
            searchable={zones.isSuccess && zones.data.length > 5}
            error={
              !zones.data || zones.isError
                ? zones.error?.toString() || "Could not load domains"
                : undefined
            }
            allowDeselect={false}
            {...aliasCreateForm.getInputProps("zoneId")}
          />
          <Select
            label="Format"
            data={[
              {
                value: "characters",
                label: "Random characters",
              },
              {
                value: "words",
                label: "Random words",
              },
              {
                value: "custom",
                label: "Custom",
              },
            ]}
            allowDeselect={false}
            {...aliasCreateForm.getInputProps("format")}
          />

          {aliasCreateForm.values.format === "characters" && (
            <NumberInput
              defaultValue={5}
              min={3}
              max={25}
              label="Number of characters"
              {...aliasCreateForm.getInputProps("characterCount")}
            />
          )}

          {aliasCreateForm.values.format === "words" && (
            <NumberInput
              defaultValue={3}
              min={1}
              max={5}
              label="Number of words"
              {...aliasCreateForm.getInputProps("wordCount")}
            />
          )}

          {aliasCreateForm.values.format === "custom" && (
            <TextInput
              label="Custom alias"
              minLength={1}
              {...aliasCreateForm.getInputProps("customAlias")}
            />
          )}

          <TextInput
            label="Description"
            placeholder="Alias description (optional)"
            {...aliasCreateForm.getInputProps("description")}
          />

          {(aliasCreateForm.values.format === "characters" ||
            aliasCreateForm.values.format === "words") && (
            <Select
              label="Prefix"
              data={[
                {
                  value: "none",
                  label: "None",
                },
                {
                  value: "domainWithoutExtension",
                  label: "Domain without extension",
                  disabled: hostname === null,
                },
                {
                  value: "domainWithExtension",
                  label: "Base Domain",
                  disabled: hostname === null,
                },
                {
                  value: "fullDomain",
                  label: "Full domain",
                  disabled: hostname === null,
                },
                {
                  value: "custom",
                  label: "Custom",
                },
              ]}
              allowDeselect={false}
              {...aliasCreateForm.getInputProps("prefixFormat")}
            />
          )}

          {(aliasCreateForm.values.format === "characters" ||
            aliasCreateForm.values.format === "words") &&
            aliasCreateForm.values.prefixFormat === "custom" && (
              <TextInput
                label="Custom alias prefix"
                {...aliasCreateForm.getInputProps("customPrefix")}
              />
            )}

          <Select
            label="Destination"
            data={
              destinations.data?.map((z) => ({
                value: z.email,
                label: z.email,
              })) || []
            }
            allowDeselect={false}
            {...aliasCreateForm.getInputProps("destination")}
            error={
              ((!destinations.data || destinations.isError) &&
                (destinations.error?.toString() || "Error loading destinations")) ||
              (aliasCreateForm.values.destination &&
                !destinations.data?.find((d) => d.email === aliasCreateForm.values.destination)
                  ?.verified &&
                "This address is not verified. You will not receive emails.") ||
              false
            }
          />

          <Button
            type="submit"
            loading={createMutation.isPending}
            disabled={aliasCreateForm.values.destination === ""}>
            Create
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
