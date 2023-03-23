import type { EmailMessage, ExecutionContext } from "@cloudflare/workers-types";

export interface Env {}

function parseEmailRecipient(original: string): { from: string; to: string } | null {
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
export default {
  async email(message: EmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    const allowedSenders: string[] = [];
    const aliases = [];

    if (allowedSenders.indexOf(message.from.toLowerCase()) < 0) {
      await message.setReject("Sender is not allowed.");
    }

    const parsed = parseEmailRecipient(message.to);

    if (parsed === null) {
      await message.setReject("Invalid recipient.");
    }
  },
};
