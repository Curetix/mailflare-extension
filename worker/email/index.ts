import { CloudflareApiClient } from "shared/cloudflare";

import { Env } from "~env";

export function parseEmailRecipient(original: string): { from: string; to: string } | null {
  // regex to match alias-reply address in the pattern of john+alice=example.com@doe.net
  const pattern = /([a-z0-9.]+)\+([a-z0-9.]+=[a-z0-9.]+)@([a-z0-9.]+)/i;
  const match = original.match(pattern);
  if (match === null) {
    return null;
  }
  const from = `${match[1]}@${match[3]}`;
  const to = match[2].replace("=", "@");
  return { from, to };
}

export default async function email(
  message: ForwardableEmailMessage,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  const apiClient = new CloudflareApiClient(env.cloudflareApiToken);
  const allowedSenders = await apiClient.getDestinations(env.cloudflareAccountId);

  if (
    !allowedSenders.success ||
    !allowedSenders.result.find((d) => d.email.toLowerCase() === message.from.toLowerCase())
  ) {
    await message.setReject("Sender is not allowed.");
    return;
  }

  const parsed = parseEmailRecipient(message.to);

  if (parsed === null) {
    await message.setReject("Invalid recipient.");
    return;
  }

  const zones = await apiClient.getZones();
  const zone = zones.result?.find((z) => z.name.endsWith(`@${parsed.from.split("@")[1]}`));

  if (!zones.success || !zone) {
    await message.setReject("Zone not found.");
    return;
  }
}
