import { Button, Modal, Stack, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useCallback, useEffect, useState } from "react";
import { useI18nContext } from "~/i18n/i18n-react";

const permissions: chrome.permissions.Permissions = {
  origins: ["*://api.cloudflare.com/*"],
};

export function PermissionsCheck() {
  const { LL } = useI18nContext();
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (typeof chrome === "undefined" || typeof chrome.permissions === "undefined") return;

    chrome.permissions.contains(permissions).then((contains) => {
      if (!contains) setOpened(true);
    });
  }, []);

  const requestPermissions = useCallback(
    () =>
      chrome.permissions
        .request(permissions)
        .then(() => setOpened(false))
        .catch(() =>
          showNotification({
            color: "red",
            title: LL.PERMISSION_REQUEST_ERROR_TITLE(),
            message: LL.PERMISSION_REQUEST_ERROR_MESSAGE(),
            autoClose: false,
          }),
        ),
    [LL],
  );

  return (
    <Modal
      opened={opened}
      onClose={() => setOpened(false)}
      title={LL.PERMISSION_MISSING_TITLE()}
      fullScreen
      radius={0}>
      <Stack>
        <Text size="sm">{LL.PERMISSION_MISSING_MESSAGE()}</Text>
        <Button onClick={() => requestPermissions()}>{LL.REQUEST_PERMISSION()}</Button>
      </Stack>
    </Modal>
  );
}
