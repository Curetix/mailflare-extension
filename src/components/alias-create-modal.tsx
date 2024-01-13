import type { CloudflareEmailRule } from "~lib/cloudflare/cloudflare.types";

import { useI18nContext } from "~i18n/i18n-react";
import { useEffect } from "react";
import { Button, Modal, NumberInput, Select, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";

import { emailRuleNamePrefix } from "~const";
import { useCloudflare } from "~lib/cloudflare/use-cloudflare";
import { useFullscreenModal } from "~utils";
import { generateAliasAddress } from "~utils/alias";
import { aliasSettingsAtom, hostnameAtom, settingsAtom } from "~utils/state";

type Props = {
  opened: boolean;
  onClose: () => void;
};

export default function AliasCreateModal({ opened, onClose }: Props) {
  const { LL } = useI18nContext();
  const clipboard = useClipboard();
  const isFullscreen = useFullscreenModal();

  const {
    selectedZoneId,
    setSelectedZoneId,
    zones,
    emailDestinations,
    emailRules,
    createEmailRule,
  } = useCloudflare();

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
          ? LL.INVALID_DOMAIN()
          : null,
      format: (value) =>
        !["characters", "words", "custom"].includes(value) ? LL.INVALID_FORMAT() : null,
      characterCount: (value, values) =>
        values.format === "characters" && (value < 3 || value > 25) ? LL.INVALID_LENGTH() : null,
      wordCount: (value, values) =>
        values.format === "words" && (value < 1 || value > 5) ? LL.INVALID_WORD_COUNT() : null,
      customAlias: (value, values) =>
        values.format === "custom" && value.trim().length < 3 ? LL.INVALID_CUSTOM_ALIAS() : null,
      prefixFormat: (value) =>
        !["none", "domainWithoutExtension", "domainWithExtension", "fullDomain", "custom"].includes(
          value,
        )
          ? LL.INVALID_PREFIX_FORMAT()
          : null,
      customPrefix: (value, values) =>
        values.prefixFormat === "custom" && value.trim().length < 1
          ? LL.INVALID_CUSTOM_PREFIX()
          : null,
      destination: (value) =>
        value.trim().length === 0 || !emailDestinations.data?.find((d) => d.email === value)
          ? LL.INVALID_DESTINATION()
          : null,
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

  function saveAliasSettings() {
    const { values } = aliasCreateForm;
    return setAliasSettings({
      format: values.format as "characters" | "words" | "custom",
      characterCount: values.characterCount,
      wordCount: values.wordCount,
      separator: values.separator,
      prefixFormat: values.prefixFormat as
        | "none"
        | "custom"
        | "domainWithoutExtension"
        | "domainWithExtension"
        | "fullDomain",
      destination: values.destination,
    });
  }

  async function createAlias(variables: typeof aliasCreateForm.values) {
    const zone = zones.data?.find((z) => z.id === variables.zoneId);

    if (!zone) {
      showNotification({
        color: "red",
        title: LL.ERROR(),
        message: LL.DOMAIN_NOT_FOUND(),
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
          title: LL.CONFLICT(),
          message: LL.ALIAS_ALREADY_EXISTS(),
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
          prefixFormat: variables.prefixFormat as
            | "fullDomain"
            | "domainWithExtension"
            | "domainWithoutExtension"
            | "custom"
            | "none",
          hostname,
        })}@${zone.name}`;

        if (!emailRules.data?.find((r) => r.matchers[0].value === aliasAddress)) {
          break;
        } else if (attempts === 3) {
          showNotification({
            color: "red",
            title: LL.CONFLICT(),
            message: LL.ALIAS_GENERATION_ERROR(),
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
    return createEmailRule.mutate(
      { zoneId: zone.id, rule },
      {
        onSuccess: (data) => {
          resetForm();
          setSelectedZoneId(variables.zoneId);
          saveAliasSettings();
          if (copyAlias) {
            clipboard.copy(data.matchers[0].value);
          }
          showNotification({
            color: "green",
            title: LL.SUCCESS(),
            message: copyAlias ? LL.ALIAS_CREATED_AND_COPIED() : LL.ALIAS_CREATED(),
            autoClose: 3000,
          });
          onClose();
        },
        onError: () => {
          showNotification({
            color: "red",
            title: LL.ERROR(),
            message: LL.ALIAS_CREATION_ERROR(),
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
        if (createEmailRule.isPending) {
          showNotification({
            color: "red",
            message: LL.MODAL_CLOSE_BLOCKED(),
            autoClose: 2000,
          });
        } else {
          onClose();
        }
      }}
      title={LL.CREATE_MODAL_TITLE()}
      fullScreen={isFullscreen}>
      <form onSubmit={aliasCreateForm.onSubmit((values) => createAlias(values))}>
        <Stack gap="xs">
          <Select
            label={LL.DOMAIN()}
            data={
              zones.data?.map((z) => ({
                value: z.id,
                label: z.name,
              })) || []
            }
            searchable={zones.isSuccess && zones.data.length > 5}
            error={
              !zones.data || zones.isError
                ? zones.error?.toString() || LL.ZONES_LOADING_ERROR()
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
                label: LL.ALIAS_FORMAT_CHARS(),
              },
              {
                value: "words",
                label: LL.ALIAS_FORMAT_WORDS(),
              },
              {
                value: "custom",
                label: LL.ALIAS_FORMAT_CUSTOM(),
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
              label={LL.NUMBER_OF_CHARS()}
              {...aliasCreateForm.getInputProps("characterCount")}
            />
          )}

          {aliasCreateForm.values.format === "words" && (
            <NumberInput
              defaultValue={3}
              min={1}
              max={5}
              label={LL.NUMBER_OF_WORDS()}
              {...aliasCreateForm.getInputProps("wordCount")}
            />
          )}

          {aliasCreateForm.values.format === "custom" && (
            <TextInput
              label={LL.CUSTOM_ALIAS()}
              minLength={1}
              {...aliasCreateForm.getInputProps("customAlias")}
            />
          )}

          <TextInput
            label={LL.ALIAS_DESCRIPTION()}
            placeholder={LL.ALIAS_DESCRIPTION_PLACEHOLDER()}
            {...aliasCreateForm.getInputProps("description")}
          />

          {(aliasCreateForm.values.format === "characters" ||
            aliasCreateForm.values.format === "words") && (
            <Select
              label={LL.PREFIX()}
              data={[
                {
                  value: "none",
                  label: LL.PREFIX_NONE(),
                },
                {
                  value: "domainWithoutExtension",
                  label: LL.PREFIX_DOMAIN_WITHOUT_EXTENSION(),
                  disabled: !hostname,
                },
                {
                  value: "domainWithExtension",
                  label: LL.PREFIX_DOMAIN_WITH_EXTENSION(),
                  disabled: !hostname,
                },
                {
                  value: "fullDomain",
                  label: LL.PREFIX_FULL_DOMAIN(),
                  disabled: !hostname,
                },
                {
                  value: "custom",
                  label: LL.PREFIX_CUSTOM(),
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
                label={LL.PREFIX_CUSTOM_LABEL()}
                {...aliasCreateForm.getInputProps("customPrefix")}
              />
            )}

          <Select
            label={LL.DESTINATION()}
            data={
              emailDestinations.data?.map((z) => ({
                value: z.email,
                label: z.email,
              })) || []
            }
            allowDeselect={false}
            {...aliasCreateForm.getInputProps("destination")}
            error={
              ((!emailDestinations.data || emailDestinations.isError) &&
                (emailDestinations.error?.toString() || LL.DESTINATIONS_LOADING_ERROR())) ||
              (aliasCreateForm.values.destination &&
                !emailDestinations.data?.find((d) => d.email === aliasCreateForm.values.destination)
                  ?.verified &&
                LL.DESTINATION_NOT_VERIFIED()) ||
              false
            }
          />

          <Button
            type="submit"
            loading={createEmailRule.isPending}
            disabled={!aliasCreateForm.isValid()}>
            {LL.CREATE()}
          </Button>

          <Button
            color="gray"
            disabled={!aliasCreateForm.isValid()}
            onClick={() => saveAliasSettings()}>
            {LL.SAVE_SETTINGS()}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
