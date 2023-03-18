import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Checkbox,
  Group,
  Loader,
  ScrollArea,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import {
  IconClipboard,
  IconEdit,
  IconListCheck,
  IconPlaylistAdd,
  IconPlaylistX,
  IconRefresh,
  IconTrash,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useState } from "react";

import AliasCreateModal from "~components/AliasCreateModal";
import AliasDeleteModal from "~components/AliasDeleteModal";
import AliasEditModal from "~components/AliasEditModal";
import { emailRuleNamePrefix, popupHeight } from "~const";
import {
  CloudflareApiBaseUrl,
  CloudflareEmailRule,
  CloudflareListEmailDestinationsResponse,
  CloudflareListEmailRulesResponse,
  CloudflareListZonesResponse,
  destinationsAtom,
  destinationsStatusAtom,
  emailRulesAtom,
  emailRulesStatusAtom,
  zonesAtom,
  zonesStatusAtom,
} from "~utils/cloudflare";
import { apiTokenAtom, ruleFilterAtom, selectedZoneIdAtom } from "~utils/state";

// popupHeight - header - divider - padding - select - button group - gap
const aliasListHeight = popupHeight - 52 - 1 - 16 * 2 - 36 - 26 - 10 * 2;

function AliasList() {
  const queryClient = useQueryClient();
  const clipboard = useClipboard();

  const [destinations, setDestinations] = useAtom(destinationsAtom);
  const [zones, setZones] = useAtom(zonesAtom);
  const [accountId, setAccountId] = useAtom(accountIdAtom);
  const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom);

  const [token] = useAtom(apiTokenAtom);
  const [ruleFilter] = useAtom(ruleFilterAtom);

  const [aliasSelectEnabled, setAliasSelectEnabled] = useState(false);
  const [selectedAliases, setSelectedAliases] = useState<CloudflareEmailRule[]>([]);
  const [aliasCreateModalOpened, setAliasCreateModalOpened] = useState(false);
  const [aliasEditModalOpened, setAliasEditModalOpened] = useState(false);
  const [aliasDeleteModalOpened, setAliasDeleteModalOpened] = useState(false);
  const [aliasToDelete, setAliasToDelete] = useState<CloudflareEmailRule>(null);

  const {
    status: zonesStatus,
    error: zonesError,
    isFetching: zonesFetching,
  } = useQuery(
    ["zones"],
    async () => {
      const response = await fetch(`${CloudflareApiBaseUrl}/zones`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json: CloudflareListZonesResponse = await response.json();
      if (response.ok && json.success) {
        await setZones(json.result);
        if (json.result.length > 0) {
          await setAccountId(json.result[0].account.id);
        } else {
          await setAccountId(null);
          await setSelectedZoneId(null);
        }
        return json.result;
      }
      console.error(json);
      throw new Error(json.errors[0].message);
    },
    { enabled: token !== null, retry: 1 },
  );

  const {
    status: destinationsStatus,
    error: destinationsError,
    isFetching: destinationsFetching,
  } = useQuery(
    ["destinations"],
    async () => {
      const response = await fetch(
        `${CloudflareApiBaseUrl}/accounts/${accountId}/email/routing/addresses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json: CloudflareListEmailDestinationsResponse = await response.json();
      if (response.ok && json.success) {
        await setDestinations(json.result);
        return json.result;
      }
      console.error(json);
      throw new Error(json.errors[0].message);
    },
    { enabled: accountId !== null, retry: 1 },
  );

  const {
    status: rulesStatus,
    error: rulesError,
    data: rules,
    isFetching: rulesFetching,
  } = useQuery(
    ["emailRules", selectedZoneId],
    async ({ queryKey }) => {
      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${queryKey[1]}/email/routing/rules`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const json: CloudflareListEmailRulesResponse = await response.json();
      if (response.ok && json.success) {
        const rules = json.result.filter(
          (r) =>
            (!ruleFilter || r.name.toLowerCase().startsWith(emailRuleNamePrefix)) &&
            r.matchers[0].type === "literal" &&
            r.actions[0].type === "forward",
        );
        // Filter selectedAliases in case something was deleted
        setSelectedAliases(selectedAliases.filter((s) => rules.includes(s)));
        return rules;
      }
      console.error(json);
      throw new Error(json.errors[0].message);
    },
    { enabled: !!zones && zones.length > 0 && !!selectedZoneId, retry: 1 },
  );

  function getAliasBadge(rule: CloudflareEmailRule) {
    const destination = destinations.find((d) => rule.actions[0].value[0] === d.email);
    if (!destination || destination.verified === null) {
      return (
        <Badge color="red" variant="filled" size="xs">
          Invalid
        </Badge>
      );
    }
    if (!rule.name.startsWith(emailRuleNamePrefix)) {
      return (
        <Badge color="blue" size="xs">
          External
        </Badge>
      );
    }
    if (!rule.enabled) {
      return (
        <Badge color="red" size="xs">
          Disabled
        </Badge>
      );
    }
  }

  return (
    <Stack p="md" spacing="xs">
      <AliasCreateModal
        opened={aliasCreateModalOpened}
        onClose={() => setAliasCreateModalOpened(false)}
      />

      <AliasEditModal
        opened={aliasEditModalOpened}
        onClose={() => setAliasEditModalOpened(false)}
      />

      <AliasDeleteModal
        opened={aliasDeleteModalOpened}
        onClose={() => setAliasDeleteModalOpened(false)}
      />

      {/* DOMAIN SELECTOR */}
      <Select
        value={selectedZoneId}
        onChange={setSelectedZoneId}
        disabled={zones.length === 0}
        rightSection={zonesFetching ? <Loader size="xs" /> : undefined}
        dropdownPosition="bottom"
        data={zones.map((z) => ({
          value: z.id,
          label: z.name,
        }))}
        placeholder="Domain"
        searchable={zones.length > 5}
      />

      {/* ACTION BUTTONS */}
      <Button.Group>
        <Button
          variant="light"
          compact
          fullWidth
          leftIcon={aliasSelectEnabled ? <IconPlaylistX size={16} /> : <IconListCheck size={16} />}
          onClick={() => {
            setSelectedAliases([]);
            setAliasSelectEnabled(!aliasSelectEnabled);
          }}>
          {aliasSelectEnabled ? "Stop Select" : "Select"}
        </Button>
        {aliasSelectEnabled && (
          <>
            <Button
              variant="light"
              compact
              fullWidth
              leftIcon={<IconEdit size={16} />}
              disabled={selectedAliases.length === 0}
              onClick={() => {}}>
              Edit
            </Button>
            <Button
              variant="light"
              color="red"
              compact
              fullWidth
              leftIcon={<IconTrash size={16} />}
              disabled={selectedAliases.length === 0}
              onClick={() => {
                setAliasDeleteModalOpened(true);
              }}>
              Delete
            </Button>
          </>
        )}
        {!aliasSelectEnabled && (
          <>
            <Button
              variant="light"
              compact
              fullWidth
              leftIcon={<IconPlaylistAdd size={16} />}
              disabled={zones.length === 0 || selectedZoneId === null}
              onClick={() => setAliasCreateModalOpened(true)}>
              Create
            </Button>
            <Button
              variant="light"
              compact
              fullWidth
              leftIcon={<IconRefresh size={16} />}
              loading={rulesFetching}
              loaderProps={{ size: 16 }}
              onClick={() => queryClient.invalidateQueries(["emailRules", selectedZoneId])}>
              Refresh
            </Button>
          </>
        )}
      </Button.Group>

      {/* ALIAS LIST AREA */}
      <ScrollArea h={aliasListHeight}>
        <Stack spacing="xs">
          {zonesStatus === "success" && zones.length === 0 && (
            <Alert title="Oh no!" color="red">
              No domains for this Cloudflare account or API token.
            </Alert>
          )}

          {zonesStatus === "error" && (
            <Alert title="Oh no!" color="red">
              {`Something went wrong while loading your domains: ${zonesError}`}
            </Alert>
          )}

          {!!selectedZoneId && rulesStatus === "loading" && (
            <Center>
              <Loader height={aliasListHeight - 5} />
            </Center>
          )}

          {rulesStatus === "success" && rules.length === 0 && (
            <Alert title="Bummer!" color="yellow">
              There are no aliases for this domain yet.
            </Alert>
          )}

          {rulesStatus === "error" && (
            <Alert title="Oh no!" color="red">
              {`Something went wrong while loading your aliases: ${rulesError}`}
            </Alert>
          )}

          {/* ALIAS LIST */}
          {rulesStatus === "success" &&
            rules.map((r) => (
              <Card
                p="xs"
                radius="sm"
                withBorder
                key={r.tag}
                onClick={() => {
                  if (aliasSelectEnabled) {
                    if (!selectedAliases.includes(r)) {
                      setSelectedAliases([...selectedAliases, r]);
                    } else {
                      setSelectedAliases(selectedAliases.filter((rr) => rr.tag !== r.tag));
                    }
                  }
                }}>
                <Group position="apart">
                  <Group spacing="xs">
                    {aliasSelectEnabled && (
                      <Checkbox
                        size="xs"
                        checked={selectedAliases.includes(r)}
                        onChange={(event) => {
                          if (event.currentTarget.checked) {
                            setSelectedAliases([...selectedAliases, r]);
                          } else {
                            setSelectedAliases(selectedAliases.filter((rr) => rr.tag !== r.tag));
                          }
                        }}
                      />
                    )}

                    <Text weight={500} truncate style={{ width: aliasSelectEnabled ? 230 : 260 }}>
                      {r.matchers[0].value}
                    </Text>
                  </Group>

                  <Button.Group>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        clipboard.copy(r.matchers[0].value);
                        showNotification({
                          color: "green",
                          message: "Email address was copied to the clipboard.",
                          autoClose: 2000,
                        });
                      }}>
                      <IconClipboard size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        // aliasEditForm.setValues(() => ({
                        //   id: r.tag,
                        //   zoneId: selectedZoneId,
                        //   alias: r.matchers[0].value,
                        //   description: r.name.replace(emailRuleNamePrefix, "").trim(),
                        //   destination: r.actions[0].value[0],
                        //   enabled: r.enabled,
                        // }));
                        setAliasEditModalOpened(true);
                      }}>
                      <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={() => {
                        setAliasToDelete(r);
                        setAliasDeleteModalOpened(true);
                      }}>
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Button.Group>
                </Group>

                <Group position="apart" ml={aliasSelectEnabled ? 26 : 0}>
                  <Text
                    size="sm"
                    color="dimmed"
                    truncate
                    style={{ width: aliasSelectEnabled ? 240 : 265 }}>
                    {r.name.replace(emailRuleNamePrefix, "").trim() || "(no description)"}
                  </Text>
                  {getAliasBadge(r)}
                </Group>
              </Card>
            ))}
        </Stack>
      </ScrollArea>
    </Stack>
  );
}

export default AliasList;
