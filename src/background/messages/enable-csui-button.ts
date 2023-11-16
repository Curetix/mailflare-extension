import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { Settings } from "~utils/state";

import { Storage } from "@plasmohq/storage";

import { StorageKeys } from "~utils/state";

const storage = new Storage({
  area: "local",
});

const handler: PlasmoMessaging.MessageHandler<null, boolean> = async (req, res) => {
  const settings = await storage.get<Settings>(StorageKeys.MailflareSettings);
  return res.send(!!settings && settings.showCreateButton);
};

export default handler;
