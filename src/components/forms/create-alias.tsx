import { Button, Field, HStack, IconButton, Input, NumberInput, Stack } from "@chakra-ui/react";
import { useForm } from "@tanstack/react-form";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { TbRefresh } from "react-icons/tb";
import { emailRuleNamePrefix, isExtension } from "~/const";
import { useI18nContext } from "~/i18n/i18n-react";
import type { CloudflareEmailRule } from "~/lib/cloudflare/cloudflare.types";
import { useCloudflare } from "~/lib/cloudflare/use-cloudflare";
import { generateAliasAddress } from "~/utils/alias";
import type { AliasFormat, AliasPrefixFormat } from "~/utils/state";
import {
  AliasFormats,
  AliasPrefixFormats,
  aliasSettingsAtom,
  hostnameAtom,
  settingsAtom,
} from "~/utils/state";
import { toaster } from "../ui/toaster";

export function AliasCreateForm() {
  const { LL } = useI18nContext();
  // const clipboard = useClipboard();

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

  const {
    Field: FormField,
    handleSubmit,
    ...form
  } = useForm({
    defaultValues: {
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
    onSubmit: async ({ value }) => {
      console.log(value);
    },
    // validate: {
    //   zoneId: (value) =>
    //     value.trim() === "" || !zones.data?.find((z) => z.id === selectedZoneId)
    //       ? LL.INVALID_DOMAIN()
    //       : null,
    //   format: (value) => (!AliasFormats.includes(value) ? LL.INVALID_FORMAT() : null),
    //   characterCount: (value, values) =>
    //     values.format === "characters" && (value < 3 || value > 25) ? LL.INVALID_LENGTH() : null,
    //   wordCount: (value, values) =>
    //     values.format === "words" && (value < 1 || value > 5) ? LL.INVALID_WORD_COUNT() : null,
    //   customAlias: (value, values) =>
    //     values.format === "custom" && value.trim().length < 3 ? LL.INVALID_CUSTOM_ALIAS() : null,
    //   prefixFormat: (value) =>
    //     !AliasPrefixFormats.includes(value) ? LL.INVALID_PREFIX_FORMAT() : null,
    //   customPrefix: (value, values) =>
    //     values.prefixFormat === "custom" && value.trim().length < 1
    //       ? LL.INVALID_CUSTOM_PREFIX()
    //       : null,
    //   destination: (value) =>
    //     value.trim().length === 0 || !emailDestinations.data?.find((d) => d.email === value)
    //       ? LL.INVALID_DESTINATION()
    //       : null,
    // },
  });
  const values = form.useStore((state) => state.values);

  function resetForm() {
    form.reset();

    // if (aliasSettings) {
    //   form.setValues({
    //     ...aliasSettings,
    //   });
    // }

    // if (selectedZoneId) {
    //   form.setValues({
    //     zoneId: selectedZoneId,
    //   });
    // }

    // if (hostname) {
    //   form.setValues({
    //     description: hostname,
    //   });
    // } else {
    //   form.setValues({
    //     prefixFormat: "none",
    //   });
    // }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    resetForm();
  }, [aliasSettings, hostname]);

  useEffect(() => {
    if (values.zoneId === "" && selectedZoneId !== null) {
      form.setFieldValue("zoneId", selectedZoneId);
    }
  }, [selectedZoneId, values.zoneId]);

  useEffect(() => {
    if (values.destination === "" && emailDestinations.data && emailDestinations.data.length > 0) {
      form.setFieldValue("destination", emailDestinations.data[0].email);
    }
  }, [emailDestinations, values.destination, aliasSettings.destination]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (values.zoneId && values.zoneId !== selectedZoneId) {
      setSelectedZoneId(values.zoneId);
    }
  }, [values.zoneId]);

  function saveAliasSettings() {
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
    const zone = zones.data?.find((z) => z.id === values.zoneId);
    if (!zone) return null;

    if (values.format === "custom") {
      if (values.customAlias.trim() === "") {
        return null;
      }

      return `${values.customAlias}@${zone.name}`;
    }

    let aliasAddress = "";
    for (let i = 0; i < 3; i++) {
      aliasAddress = `${generateAliasAddress({
        format: values.format,
        characterCount: values.characterCount,
        wordCount: values.wordCount,
        separator: values.separator,
        customPrefix: values.customPrefix,
        prefixFormat: values.prefixFormat as
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
    values.zoneId,
    values.format,
    values.customAlias,
    values.characterCount,
    values.wordCount,
    values.separator,
    values.prefixFormat,
    values.customPrefix,
  ]);

  const doesAliasPreviewAlreadyExist = useMemo<boolean>(() => {
    return emailRules.data?.find((r) => r.matchers[0].value === aliasPreview) !== undefined;
  }, [aliasPreview, emailRules.data]);

  function createAlias(variables: typeof values) {
    const zone = zones.data?.find((z) => z.id === variables.zoneId);

    if (!zone || !aliasPreview) {
      toaster.error({
        title: LL.ERROR(),
        description: LL.DOMAIN_NOT_FOUND(),
        duration: Number.POSITIVE_INFINITY,
      });
      return;
    }

    if (emailRules.data?.find((r) => r.matchers[0].value === aliasPreview)) {
      toaster.error({
        title: LL.CONFLICT(),
        description: LL.ALIAS_ALREADY_EXISTS(),
        duration: Number.POSITIVE_INFINITY,
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
            // clipboard.copy(data?.matchers[0].value);
          }
          toaster.success({
            title: LL.SUCCESS(),
            description: copyAlias ? LL.ALIAS_CREATED_AND_COPIED() : LL.ALIAS_CREATED(),
            duration: 3000,
          });
          //   onClose();
        },
        onError: () => {
          toaster.error({
            title: LL.ERROR(),
            description: LL.ALIAS_CREATION_ERROR(),
            duration: Number.POSITIVE_INFINITY,
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

    if (isExtension && values.format === "domain") {
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
  }, [LL, hostname, values.format]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
      <Stack>
        <Field.Root>
          <Field.Label>{LL.DOMAIN()}</Field.Label>
          <FormField name="zoneId">
            {({ state, handleChange, handleBlur }) => (
              <SimpleSelect
                items={
                  zones.data?.map((z) => ({
                    value: z.id,
                    label: z.name,
                  })) || []
                }
                value={state.value}
                onValueChange={(value) => handleChange(value)}
                onBlur={handleBlur}
              />
            )}
          </FormField>
          <Field.ErrorText>
            {!zones.data || zones.isError
              ? zones.error?.toString() || LL.ZONES_LOADING_ERROR()
              : undefined}
          </Field.ErrorText>
        </Field.Root>

        <Field.Root>
          <Field.Label>{LL.ALIAS_FORMAT()}</Field.Label>
          <FormField name="format">
            {({ state, handleChange, handleBlur }) => (
              <SimpleSelect
                items={aliasFormatData}
                value={state.value}
                onValueChange={(value) => handleChange(value)}
                onBlur={handleBlur}
              />
            )}
          </FormField>
        </Field.Root>

        {values.format === "characters" && (
          <Field.Root>
            <Field.Label>{LL.NUMBER_OF_CHARS()}</Field.Label>
            <FormField name="characterCount">
              {({ state, handleChange, handleBlur }) => (
                <NumberInput
                  min={3}
                  max={25}
                  value={state.value.toString()}
                  onValueChange={({ value }) => handleChange(Number.parseInt(value))}
                  onBlur={handleBlur}
                />
              )}
            </FormField>
          </Field.Root>
        )}

        {values.format === "words" && (
          <Field.Root>
            <Field.Label>{LL.NUMBER_OF_WORDS()}</Field.Label>
            <FormField name="wordCount">
              {({ state, handleChange, handleBlur }) => (
                <NumberInput
                  value={state.value.toString()}
                  onValueChange={({ value }) => handleChange(Number.parseInt(value))}
                  onBlur={handleBlur}
                />
              )}
            </FormField>
          </Field.Root>
        )}

        {values.format === "custom" && (
          <Field.Root>
            <Field.Label>{LL.CUSTOM_ALIAS()}</Field.Label>
            <FormField name="customAlias">
              {({ state, handleChange, handleBlur }) => (
                <Input
                  minLength={1}
                  value={state.value.toString()}
                  onChange={(event) => handleChange(event.currentTarget.value)}
                  onBlur={handleBlur}
                />
              )}
            </FormField>
          </Field.Root>
        )}

        <Field.Root>
          <Field.Label>{LL.ALIAS_DESCRIPTION()}</Field.Label>
          <FormField name="description">
            {({ state, handleChange, handleBlur }) => (
              <Input
                placeholder={LL.ALIAS_DESCRIPTION_PLACEHOLDER()}
                minLength={1}
                value={state.value.toString()}
                onChange={(event) => handleChange(event.currentTarget.value)}
                onBlur={handleBlur}
              />
            )}
          </FormField>
        </Field.Root>

        {values.format !== "custom" && (
          <Field.Root>
            <Field.Label>
              {values.format === "domain" ? LL.ALIAS_FORMAT_DOMAIN_TYPE() : LL.PREFIX()}
            </Field.Label>
            <FormField name="prefixFormat">
              {({ state, handleChange, handleBlur }) => (
                <SimpleSelect
                  items={prefixFormatData}
                  value={state.value}
                  onValueChange={(value) => handleChange(value)}
                  onBlur={handleBlur}
                />
              )}
            </FormField>
          </Field.Root>
        )}

        {values.format !== "custom" && values.prefixFormat === "custom" && (
          <Field.Root>
            <Field.Label>{LL.PREFIX_CUSTOM_LABEL()}</Field.Label>
            <FormField name="customPrefix">
              {({ state, handleChange, handleBlur }) => (
                <Input
                  minLength={1}
                  value={state.value.toString()}
                  onChange={(event) => handleChange(event.currentTarget.value)}
                  onBlur={handleBlur}
                />
              )}
            </FormField>
          </Field.Root>
        )}

        <Field.Root>
          <Field.Label>{LL.DESTINATION()}</Field.Label>
          <FormField name="destination">
            {({ state, handleChange, handleBlur }) => (
              <SimpleSelect
                items={
                  emailDestinations.data?.map((z) => ({
                    value: z.email,
                    label: z.email,
                  })) || []
                }
                value={state.value}
                onValueChange={(value) => handleChange(value)}
                onBlur={handleBlur}
              />
            )}
          </FormField>
          <Field.ErrorText>
            {((!emailDestinations.data || emailDestinations.isError) &&
              (emailDestinations.error?.toString() || LL.DESTINATIONS_LOADING_ERROR())) ||
              (values.destination &&
                !emailDestinations.data?.find((d) => d.email === values.destination)?.verified &&
                LL.DESTINATION_NOT_VERIFIED())}
          </Field.ErrorText>
        </Field.Root>

        <Field.Root invalid={doesAliasPreviewAlreadyExist}>
          <Field.Label>{LL.GENERATED_ALIAS()}</Field.Label>
          <HStack>
            <Input value={aliasPreview || LL.GENERATED_ALIAS_UNAVAILABLE()} readOnly />
            {(values.format === "characters" || values.format === "words") && (
              <IconButton variant="subtle" onClick={() => setAliasPreview(createAliasPreview())}>
                <TbRefresh />
              </IconButton>
            )}
          </HStack>

          <Field.ErrorText>
            {doesAliasPreviewAlreadyExist ? LL.ALIAS_ALREADY_EXISTS() : undefined}
          </Field.ErrorText>
        </Field.Root>

        <HStack>
          <Button
            colorPalette="gray"
            disabled={!form.state.isValid}
            onClick={() => saveAliasSettings()}>
            {LL.SAVE_SETTINGS()}
          </Button>

          <Button
            flex={1}
            type="submit"
            // loading={createEmailRule.isPending}
            disabled={
              doesAliasPreviewAlreadyExist || aliasPreview?.startsWith("@") || !form.state.isValid
            }>
            {LL.CREATE()}
          </Button>
        </HStack>
      </Stack>
    </form>
  );
}
