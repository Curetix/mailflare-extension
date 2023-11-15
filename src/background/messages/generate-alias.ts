import type { PlasmoMessaging } from "@plasmohq/messaging";
import type { AliasSettings } from "~utils/state";

import { Storage } from "@plasmohq/storage";

import { CloudflareApiClient } from "~lib/cloudflare/api";
import { Alias } from "~utils/alias";
import { StorageKeys } from "~utils/state";

const storage = new Storage({
  area: "local",
});

type Request = {
  hostname: string;
};

type Response = {
  success: boolean;
  message: string;
  data?: any;
};

const handler: PlasmoMessaging.MessageHandler<Request, Response> = async (req, res) => {
  const apiToken = await storage.get<string>(StorageKeys.ApiToken);
  const zoneId = await storage.get<string>(StorageKeys.ZoneId);
  const aliasSettings = await storage.get<AliasSettings>(StorageKeys.AliasSettings);

  console.log(req.body);

  if (!apiToken) {
    return res.send({
      success: false,
      message: "Not logged in",
    });
  }
  if (!zoneId) {
    return res.send({
      success: false,
      message: "No domain selected",
    });
  }
  if (!aliasSettings.destination) {
    return res.send({
      success: false,
      message: "No destination selected",
    });
  }

  const apiClient = new CloudflareApiClient(apiToken);

  const zones = await apiClient.getZones();
  const zone = zones.success ? zones.result.find((z) => z.id === zoneId) : undefined;

  if (!zone) {
    return res.send({
      success: false,
      message: "Domain not found",
      data: zones,
    });
  }

  const alias = Alias.fromOptions(
    {
      ...aliasSettings,
      hostname: req.body!.hostname,
    },
    zone.name,
    aliasSettings.destination,
    req.body!.hostname,
  );

  const result = await apiClient.createEmailRule(zoneId, alias.toEmailRule());

  return res.send({
    success: result.success,
    message: result.success ? "Alias created" : "Error",
    data: result.success ? alias.address : result.errors,
  });
};

export default handler;
