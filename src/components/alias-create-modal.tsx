import type { CloudflareEmailRule } from "~lib/cloudflare/cloudflare.types";
import type { AliasFormat, AliasPrefixFormat } from "~utils/state";

import {
  ActionIcon,
  Button,
  Flex,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useClipboard } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconRefresh } from "@tabler/icons-react";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";

import type { ComboboxData } from "@mantine/core/lib/components/Combobox/Combobox.types";
import { emailRuleNamePrefix, isExtension } from "~const";
import { useI18nContext } from "~i18n/i18n-react";
import { useCloudflare } from "~lib/cloudflare/use-cloudflare";
import { useFullscreenModal } from "~utils";
import { generateAliasAddress } from "~utils/alias";
import {
  AliasFormats,
  AliasPrefixFormats,
  aliasSettingsAtom,
  hostnameAtom,
  settingsAtom,
} from "~utils/state";

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
  const [aliasPreview, setAliasPreview] = useState<string | null>(null);

  const aliasCreateForm = useForm({
    initialValues: {
      zoneId: "",
      format: "characters" as AliasFormat,
      characterCount: 5,
      wordCount: 2,
      separator: "_",
      customAlias: "",
      description: "",
      prefixFormat: "none" as AliasPrefixFormat,
      customPrefix: "",
      destination: "",
      preview: "",
    },
    validate: {
      zoneId: (value) =>
        value.trim() === "" || !zones.data?.find((z) => z.id === selectedZoneId)
          ? LL.INVALID_DOMAIN()
          : null,
      format: (value) => (!AliasFormats.includes(value) ? LL.INVALID_FORMAT() : null),
      characterCount: (value, values) =>
        values.format === "characters" && (value < 3 || value > 25) ? LL.INVALID_LENGTH() : null,
      wordCount: (value, values) =>
        values.format === "words" && (value < 1 || value > 5) ? LL.INVALID_WORD_COUNT() : null,
      customAlias: (value, values) =>
        values.format === "custom" && value.trim().length < 3 ? LL.INVALID_CUSTOM_ALIAS() : null,
      prefixFormat: (value) =>
        !AliasPrefixFormats.includes(value) ? LL.INVALID_PREFIX_FORMAT() : null,
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

    if (aliasSettings) {
      aliasCreateForm.setValues({
        ...aliasSettings,
      });
    }

    if (selectedZoneId) {
      aliasCreateForm.setValues({
        zoneId: selectedZoneId,
      });
    }

    if (hostname) {
      aliasCreateForm.setValues({
        description: hostname,
      });
    } else {
      aliasCreateForm.setValues({
        prefixFormat: "none",
      });
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    resetForm();
  }, [aliasSettings, hostname]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const value = aliasCreateForm.values.zoneId;
    if (value && value !== selectedZoneId) {
      setSelectedZoneId(aliasCreateForm.values.zoneId);
    }
  }, [aliasCreateForm.values.zoneId]);

  function saveAliasSettings() {
    const { values } = aliasCreateForm;
    return setAliasSettings({
      format: values.format,
      characterCount: values.characterCount,
      wordCount: values.wordCount,
      separator: values.separator,
      prefixFormat: values.prefixFormat,
      destination: values.destination,
    });
  }

  function createAliasPreview() {
    const zone = zones.data?.find((z) => z.id === aliasCreateForm.values.zoneId);
    if (!zone) return null;

    if (aliasCreateForm.values.format === "custom") {
      return `${aliasCreateForm.values.customAlias}@${zone.name}`;
    }

    let aliasAddress = "";
    for (let i = 0; i < 3; i++) {
      aliasAddress = `${generateAliasAddress({
        format: aliasCreateForm.values.format,
        characterCount: aliasCreateForm.values.characterCount,
        wordCount: aliasCreateForm.values.wordCount,
        separator: aliasCreateForm.values.separator,
        customPrefix: aliasCreateForm.values.customPrefix,
        prefixFormat: aliasCreateForm.values.prefixFormat as
          | "fullDomain"
          | "domainWithExtension"
          | "domainWithoutExtension"
          | "custom"
          | "none",
        hostname,
      })}@${zone.name}`;

      if (!emailRules.data?.find((r) => r.matchers[0].value === aliasAddress)) {
        break;
      }
    }
    return aliasAddress;
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setAliasPreview(createAliasPreview());
  }, [
    hostname,
    zones.data,
    emailRules.data,
    aliasCreateForm.values.zoneId,
    aliasCreateForm.values.format,
    aliasCreateForm.values.customAlias,
    aliasCreateForm.values.characterCount,
    aliasCreateForm.values.wordCount,
    aliasCreateForm.values.separator,
    aliasCreateForm.values.prefixFormat,
    aliasCreateForm.values.customPrefix,
  ]);

  const doesAliasPreviewAlreadyExist = useMemo<boolean>(() => {
    return emailRules.data?.find((r) => r.matchers[0].value === aliasPreview) !== undefined;
  }, [aliasPreview, emailRules.data]);

  function createAlias(variables: typeof aliasCreateForm.values) {
    const zone = zones.data?.find((z) => z.id === variables.zoneId);

    if (!zone || !aliasPreview) {
      showNotification({
        color: "red",
        title: LL.ERROR(),
        message: LL.DOMAIN_NOT_FOUND(),
        autoClose: false,
      });
      return;
    }

    if (emailRules.data?.find((r) => r.matchers[0].value === aliasPreview)) {
      showNotification({
        color: "red",
        title: LL.CONFLICT(),
        message: LL.ALIAS_ALREADY_EXISTS(),
        autoClose: false,
      });
      return;
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
          value: aliasPreview,
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
            clipboard.copy(data?.matchers[0].value);
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

  const aliasFormatData = useMemo<ComboboxData>(() => {
    const domainOption = isExtension
      ? [
          {
            value: "domain",
            label: LL.ALIAS_FORMAT_DOMAIN(),
            disabled: !hostname,
          },
        ]
      : [];

    return [
      {
        value: "characters",
        label: LL.ALIAS_FORMAT_CHARS(),
      },
      {
        value: "words",
        label: LL.ALIAS_FORMAT_WORDS(),
      },
      ...domainOption,
      {
        value: "custom",
        label: LL.ALIAS_FORMAT_CUSTOM(),
      },
    ];
  }, [LL, hostname]);

  const prefixFormatData = useMemo<ComboboxData>(() => {
    const domainOptions = isExtension
      ? [
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
        ]
      : [];

    if (isExtension && aliasCreateForm.values.format === "domain") {
      return domainOptions;
    }

    return [
      {
        value: "none",
        label: LL.PREFIX_NONE(),
      },
      ...domainOptions,
      {
        value: "custom",
        label: LL.PREFIX_CUSTOM(),
      },
    ];
  }, [LL, hostname, aliasCreateForm.values.format]);

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
        <Stack gap={8}>
          <Select
            label={LL.DOMAIN()}
            data={
              zones.data?.map((z) => ({
                value: z.id,
                label: z.name,
              })) || []
            }
            error={
              !zones.data || zones.isError
                ? zones.error?.toString() || LL.ZONES_LOADING_ERROR()
                : undefined
            }
            searchable
            allowDeselect={false}
            {...aliasCreateForm.getInputProps("zoneId")}
          />
          <Select
            label={LL.ALIAS_FORMAT()}
            data={aliasFormatData}
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

          {aliasCreateForm.values.format !== "custom" && (
            <Select
              label={
                aliasCreateForm.values.format === "domain"
                  ? LL.ALIAS_FORMAT_DOMAIN_TYPE()
                  : LL.PREFIX()
              }
              data={prefixFormatData}
              allowDeselect={false}
              {...aliasCreateForm.getInputProps("prefixFormat")}
            />
          )}

          {aliasCreateForm.values.format !== "custom" &&
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
            searchable
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

          <TextInput
            variant="filled"
            label={LL.GENERATED_ALIAS()}
            error={doesAliasPreviewAlreadyExist ? LL.ALIAS_ALREADY_EXISTS() : undefined}
            value={aliasPreview || "Unavailable"}
            readOnly
            rightSection={
              aliasCreateForm.values.format === "characters" ||
              aliasCreateForm.values.format === "words" ? (
                <ActionIcon variant="light" onClick={() => setAliasPreview(createAliasPreview())}>
                  <IconRefresh style={{ width: "70%", height: "70%" }} stroke={1.5} />
                </ActionIcon>
              ) : undefined
            }
          />

          <Flex dir="col" gap={8}>
            <Button
              color="gray"
              disabled={!aliasCreateForm.isValid()}
              onClick={() => saveAliasSettings()}>
              {LL.SAVE_SETTINGS()}
            </Button>

            <Button
              flex={1}
              type="submit"
              loading={createEmailRule.isPending}
              disabled={
                doesAliasPreviewAlreadyExist ||
                aliasPreview?.startsWith("@") ||
                !aliasCreateForm.isValid()
              }>
              {LL.CREATE()}
            </Button>
          </Flex>
        </Stack>
      </form>
    </Modal>
  );
}
