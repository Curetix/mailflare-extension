import { Button, Select, Stack, Switch, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";

import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/dist/hook";

import { StorageKey } from "~const";

function Settings() {
  const queryClient = useQueryClient();
  const storage = new Storage();

  const [destinations, setDestinations] = useStorage<object[]>(StorageKey.Destinations, []);
  const [zones, setZones] = useStorage<object[]>(StorageKey.Zones, []);

  const [theme, setTheme] = useStorage<string>(StorageKey.Theme, "dark");
  const [onlyShowExtensionRules, setOnlyShowExtensionRules] = useStorage<boolean>(
    StorageKey.OnlyShowExtensionRules,
    true,
  );
  const [reactQueryDevtoolsEnabled, setReactQueryDevtoolsEnabled] = useStorage<boolean>(
    StorageKey.ReactQueryDevtoolsEnabled,
    false,
  );

  const clearCache = async () => {
    await setZones([]);
    await setDestinations([]);
    await queryClient.invalidateQueries({ queryKey: ["zones"] });
    await queryClient.invalidateQueries({ queryKey: ["destinations"] });
    showNotification({
      color: "green",
      message: "Deleted cached data",
      autoClose: 3000,
    });
  };

  const logout = async () => {
    await storage.clear();
    await queryClient.invalidateQueries();
    showNotification({
      color: "green",
      message: "Goodbye",
      autoClose: 3000,
    });
  };

  return (
    <Stack spacing="sm">
      <Select
        label="Theme"
        value={theme}
        onChange={(value) => setTheme(value)}
        data={[
          {
            value: "dark",
            label: "Dark",
          },
          {
            value: "light",
            label: "Light",
          },
        ]}
      />
      <Switch
        label="Only show aliases created through this extension"
        checked={onlyShowExtensionRules === true}
        onChange={() => setOnlyShowExtensionRules(!onlyShowExtensionRules)}
      />
      {process.env.NODE_ENV === "development" && (
        <Switch
          label="Enable react-query devtools"
          checked={reactQueryDevtoolsEnabled === true}
          onChange={() => setReactQueryDevtoolsEnabled(!reactQueryDevtoolsEnabled)}
        />
      )}
      <Button onClick={() => clearCache()}>Clear caches</Button>
      <Button color="red" onClick={() => logout()}>
        Logout
      </Button>
    </Stack>
  );
}

export default Settings;
