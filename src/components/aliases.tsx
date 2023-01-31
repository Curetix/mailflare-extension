import {
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Group,
  Loader,
  Modal,
  ScrollArea,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconClipboard, IconPencil, IconPlus } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useStorage } from "@plasmohq/storage/dist/hook";

import {
  CloudflareApiBaseUrl,
  CloudflareEmailRule,
  CloudflareListEmailRulesResponse,
  CloudflareListZonesResponse,
  CloudflareZone,
} from "~cloudflare";

const aliasListHeight = 400;
const ruleNamePrefix = "flaremail:";

function Aliases() {
  const queryClient = useQueryClient();
  const clipboard = useClipboard();

  const [storedToken] = useStorage<string>("apiToken", null);
  const [storedZones, setStoredZones] = useStorage<CloudflareZone[]>("zones", []);
  const [selectedZoneId, setSelectedZoneId] = useStorage<string>("selectedZoneId", "");
  const [onlyShowExtensionRules, setOnlyShowExtensionRules] = useStorage<boolean>(
    "onlyShowExtensionRules",
    false,
  );

  const [aliasEditModalOpened, setAliasEditModalOpened] = useState(false);
  const [aliasEditRule, setAliasEditRule] = useState<CloudflareEmailRule>(null);
  const [aliasCreateModalOpened, setAliasCreateModalOpened] = useState(false);

  const {
    status: zonesStatus,
    error: zonesError,
    data: zones,
  } = useQuery(
    ["zones"],
    async () => {
      const response = await fetch(`${CloudflareApiBaseUrl}/zones`, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      });
      const json: CloudflareListZonesResponse = await response.json();
      if (response.ok && json.success) {
        await setStoredZones(json.result);
        if (selectedZoneId === "" && json.result.length > 0) {
          await setSelectedZoneId(json.result[0].id);
        }
        return json.result;
      }
      console.error(json);
      throw new Error(json.errors[0].message);
    },
    { enabled: storedToken !== null, retry: 1, initialData: storedZones },
  );

  const {
    status: rulesStatus,
    error: rulesError,
    data: rules,
  } = useQuery(
    ["emailRules", selectedZoneId],
    async ({ queryKey }) => {
      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${queryKey[1]}/email/routing/rules`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        },
      );
      const json: CloudflareListEmailRulesResponse = await response.json();
      if (response.ok && json.success) {
        if (onlyShowExtensionRules) {
          return json.result.filter(
            (r) =>
              r.name.toLowerCase().startsWith(ruleNamePrefix) &&
              r.matchers[0].type === "literal" &&
              r.actions[0].type === "forward",
          );
        }
        return json.result;
      }
      console.error(json);
      throw new Error(json.errors[0].message);
    },
    { enabled: !!zones && zones.length > 0 && selectedZoneId !== "", retry: 1 },
  );

  const createMutation = useMutation(
    ({ zoneId, rule }: { zoneId: string; rule: CloudflareEmailRule }) => {
      return fetch(`${CloudflareApiBaseUrl}/zones/${zoneId}/email/routing/rules`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rule),
      });
    },
    {
      onSuccess: (data, { zoneId, rule }) => {
        return queryClient.invalidateQueries({ queryKey: ["emailRules", zoneId] });
      },
    },
  );

  return (
    <Stack miw={400} mih={aliasListHeight} p="lg" spacing="xs">
      <Text fw="bold" size="lg">
        Aliases
      </Text>

      <Select
        value={selectedZoneId}
        onChange={setSelectedZoneId}
        data={storedZones.map((z) => ({
          value: z.id,
          label: z.name,
          description: z.id,
        }))}
      />

      <Modal
        opened={aliasCreateModalOpened}
        onClose={() => {
          setAliasCreateModalOpened(false);
        }}
        title="Create alias"
        fullScreen></Modal>

      <Modal
        opened={aliasEditModalOpened}
        onClose={() => {
          setAliasEditModalOpened(false);
          setAliasEditRule(null);
        }}
        title="Edit Alias"
        fullScreen>
        {aliasEditRule?.name}
      </Modal>

      <ScrollArea style={{ height: aliasListHeight }}>
        {zonesStatus === "error" && (
          <Alert title="Oh no!" color="red">
            {`Something went wrong while loading your domains: ${zonesError}`}
          </Alert>
        )}

        {rulesStatus === "loading" && (
          <Center>
            <Loader height={aliasListHeight} />
          </Center>
        )}

        {rulesStatus === "success" && (
          <Stack spacing="xs" pb={5}>
            {rules.map((r) => (
              <Card shadow="xs" p="xs" radius="sm" withBorder key={r.tag}>
                <Group position="apart">
                  <Text weight={500}>
                    {r.matchers[0].type === "all"
                      ? `*@${zones.find((z) => z.id === selectedZoneId).name}`
                      : r.matchers[0].value}
                  </Text>{" "}
                  {r.matchers[0].type !== "all" && (
                    <Button.Group>
                      <Button
                        variant="outline"
                        compact
                        size="xs"
                        onClick={() => {
                          clipboard.copy(r.matchers[0].value);
                          showNotification({
                            message: "Email address was copied to the clipboard.",
                            autoClose: 2000,
                          });
                        }}>
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        compact
                        size="xs"
                        onClick={() => {
                          setAliasEditRule(r);
                          setAliasEditModalOpened(true);
                        }}>
                        Edit
                      </Button>
                    </Button.Group>
                  )}
                </Group>

                <Text size="sm" color="dimmed">
                  {r.name === "" && r.matchers[0].type === "all"
                    ? "Catch-All"
                    : r.name.replace(ruleNamePrefix, "").trim()}
                </Text>
              </Card>
            ))}
          </Stack>
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
      </ScrollArea>

      <Button
        variant="outline"
        fullWidth
        disabled={rulesStatus !== "success"}
        onClick={() => setAliasCreateModalOpened(true)}>
        Create alias
      </Button>
    </Stack>
  );
}

export default Aliases;
