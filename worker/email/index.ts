import { Mailjet } from "~email/services/mailjet";
import { EmailService } from "~email/services/service.interface";
import { Env } from "~env";
import { CloudflareApiClient } from "shared/cloudflare";

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

export const EmailServices = ["mailjet"];

function checkEnv(env: Env) {
  if (!env.cloudflareAccountId) {
    throw new Error("Cloudflare account ID not provided!");
  }
  if (!env.cloudflareApiToken) {
    throw new Error("Cloudflare API token not provided!");
  }
  if (!env.emailService || !EmailServices.includes(env.emailService)) {
    throw new Error("Invalid email service provided!");
  }
  if (env.emailService === "mailjet" && (!env.mailjetApiKey || !env.mailjetApiSecret)) {
    throw new Error("Not all variables for the email service provided!");
  }
}

export default async function email(
  message: ForwardableEmailMessage,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  checkEnv(env);

  const apiClient = new CloudflareApiClient(env.cloudflareApiToken);

  // Check if sender is valid
  const allowedSenders = await apiClient.getDestinations(env.cloudflareAccountId);
  if (
    !allowedSenders.success ||
    !allowedSenders.result.find((d) => d.email.toLowerCase() === message.from.toLowerCase())
  ) {
    await message.setReject("Sender is not allowed.");
    return;
  }

  // Parse alias into sender and recipient
  const parsed = parseEmailRecipient(message.to);

  if (parsed === null) {
    await message.setReject("Invalid recipient.");
    return;
  }

  const zones = await apiClient.getZones();
  const zone = zones.result?.find(
    (z) => z.name.toLowerCase() === parsed.from.split("@")[1].toLowerCase(),
  );

  if (!zone) {
    await message.setReject("Zone not found.");
    return;
  }

  const rules = await apiClient.getEmailRules(zone.id);
  const rule = rules.result?.find((r) => r.name.toLowerCase() === parsed.from.toLowerCase());

  if (!rule) {
    await message.setReject("Alias not found.");
    return;
  }

  let service: EmailService;
  if (env.emailService === "mailjet") {
    service = new Mailjet(env.mailjetApiKey!, env.mailjetApiSecret!);
  } else {
    throw new Error("Error while sending the email");
  }
}
