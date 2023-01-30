import { Alert, Card, Center, Loader, Select, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";

import { useStorage } from "@plasmohq/storage/dist/hook";

import {
  CloudflareApiBaseUrl,
  CloudflareListEmailRulesResponse,
  CloudflareListZonesResponse,
  CloudflareZone,
} from "~cloudflare";

function Aliases() {
  const [storedToken] = useStorage<string>("apiToken", null);
  const [storedZones, setStoredZones] = useStorage<CloudflareZone[]>("zones", []);
  const [selectedZoneId, setSelectedZoneId] = useStorage<string>("", "");

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
        // TODO: option to show all
        return json.result.filter(
          (r) =>
            r.name.toLowerCase().startsWith("flaremail: ") &&
            r.matchers[0].type === "literal" &&
            r.actions[0].type === "forward",
        );
      }
      console.error(json);
      throw new Error(json.errors[0].message);
    },
    { enabled: !!zones && zones.length > 0 && selectedZoneId !== "", retry: 1 },
  );

  return (
    <Stack miw={400} mih={400} p="lg" spacing="xs">
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

      {zonesStatus === "error" && (
        <Alert title="Oh no!" color="red">
          {"Something went wrong while loading your domains: " + zonesError}
        </Alert>
      )}

      {rulesStatus === "success" &&
        rules.map((r) => (
          <Card shadow="xs" p="xs" radius="sm" withBorder key={r.tag}>
            <Text weight={500}>{r.matchers[0].value}</Text>
            <Text size="sm" color="dimmed">
              {r.name.replace("flaremail:", "").trim()}
            </Text>
          </Card>
        ))}

      {rulesStatus === "loading" && (
        <Center>
          <Loader />
        </Center>
      )}

      {rulesStatus === "success" && rules.length === 0 && (
        <Alert title="Bummer!" color="yellow">
          There are no aliases for this domain yet.
        </Alert>
      )}

      {rulesStatus === "error" && (
        <Alert title="Oh no!" color="red">
          {"Something went wrong while loading your aliases: " + rulesError}
        </Alert>
      )}
    </Stack>
  );
}

export default Aliases;
