import { Button, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect } from "react";

import { emailRuleNamePrefix } from "~const";
import { generateAlias } from "~utils/alias";
import {
  CloudflareApiBaseUrl,
  CloudflareCreateEmailRuleResponse,
  CloudflareEmailRule,
  destinationsStatusAtom,
  zonesStatusAtom,
} from "~utils/cloudflare";
import {
  aliasSettingsAtom,
  apiTokenAtom,
  copyAliasAtom,
  hostnameAtom,
  selectedZoneIdAtom,
} from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function AliasCreateModal({ opened, onClose }: Props) {
  const queryClient = useQueryClient();
  const clipboard = useClipboard();

  const [destinations] = useAtom(destinationsStatusAtom);
  const [zones] = useAtom(zonesStatusAtom);

  const [token] = useAtom(apiTokenAtom);
  const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom);
  const [aliasSettings, setAliasSettings] = useAtom(aliasSettingsAtom);
  const [copyAlias] = useAtom(copyAliasAtom);

  const [hostname] = useAtom(hostnameAtom);

  const aliasCreateForm = useForm({
    initialValues: {
      zoneId: selectedZoneId,
      format: "characters",
      characterCount: 5,
      wordCount: 2,
      separator: "_",
      customAlias: "",
      description: "",
      prefixFormat: "none",
      destination: "",
    },
  });

  useEffect(() => {
    if (!!aliasSettings) {
      aliasCreateForm.setValues({
        ...aliasSettings,
      });
    }
  }, [aliasSettings]);

  const createMutation = useMutation(
    async (variables: typeof aliasCreateForm.values) => {
      let alias: string;
      if (variables.format === "custom") {
        alias = variables.customAlias;
      } else {
        let prefix = "";
        if (hostname !== null) {
          if (variables.prefixFormat === "domainWithoutExtension" && hostname.domain) {
            prefix = hostname.domain;
          } else if (variables.prefixFormat === "domainWithExtension") {
            prefix = `${hostname.domain}.${hostname.topLevelDomains.join(".")}`;
          } else if (variables.prefixFormat === "fullDomain") {
            prefix = hostname.hostname;
          }
        }

        alias = generateAlias(
          variables.format === "words" ? "words" : "characters",
          variables.characterCount,
          variables.wordCount,
          variables.separator,
          prefix,
        );
      }
      const zone = zones.data?.find((z) => z.id === variables.zoneId);

      if (!zone) {
        throw new Error("Could not find the domains zone.");
      }

      alias = `${alias}@${zone.name}`;

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
            value: alias,
          },
        ],
        enabled: true,
        name: `${emailRuleNamePrefix}${variables.description}`,
        priority: Math.round(Date.now() / 1000),
      };

      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${variables.zoneId}/email/routing/rules`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rule),
        },
      );
      const json: CloudflareCreateEmailRuleResponse = await response.json();
      if (response.ok && json.success) {
        await setSelectedZoneId(variables.zoneId);
        await setAliasSettings({
          format: variables.format,
          characterCount: variables.characterCount,
          wordCount: variables.wordCount,
          separator: variables.separator,
          prefixFormat: variables.prefixFormat,
          destination: variables.destination,
        });
        if (copyAlias) {
          clipboard.copy(alias);
        }
        showNotification({
          color: "green",
          title: "Success!",
          message: "The alias was created and copied to your clipboard!",
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
        if (createMutation.isLoading) {
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
      fullScreen>
      <form onSubmit={aliasCreateForm.onSubmit((values) => createMutation.mutate(values))}>
        <Stack spacing="xs">
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
            {...aliasCreateForm.getInputProps("format")}
          />

          {aliasCreateForm.values.format === "characters" && (
            <NumberInput
              defaultValue={5}
              min={1}
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
              ]}
              {...aliasCreateForm.getInputProps("prefixFormat")}
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
            loading={createMutation.isLoading}
            disabled={aliasCreateForm.values.destination === ""}>
            Create
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
