import { showNotification } from "@mantine/notifications";
import { useEffect } from "react";
import { useI18nContext } from "~i18n/i18n-react";

import { extensionVersion } from "~const";
import { StorageKeys } from "~utils/state";
import { extensionLocalStorage as storage } from "~utils/storage";

export default function UpdateCheck() {
  const { LL } = useI18nContext();

  useEffect(() => {
    storage.get(StorageKeys.Version).then((value) => {
      if (value !== extensionVersion) {
        showNotification({
          color: "green",
          title: LL.UPDATED_TITLE(),
          message: LL.UPDATED_DESCRIPTION({ newVersion: extensionVersion }),
          autoClose: false,
        });
      }
      return storage.set(StorageKeys.Version, extensionVersion);
    });
  }, [LL]);

  return <></>;
}
