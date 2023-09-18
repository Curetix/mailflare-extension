import type { CloudflareEmailRule } from "~lib/cloudflare.types";

import { generate as randomWords } from "random-words";

import { emailRuleNamePrefix } from "~const";

export function randomString(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

export function generateAlias(
  format: "characters" | "words" = "characters",
  characterCount = 5,
  wordCount = 2,
  separator = "_",
  prefix?: string,
): string {
  const aliasPrefix = prefix && prefix.trim() !== "" ? `${prefix}${separator}` : "";
  switch (format) {
    case "characters":
      return `${aliasPrefix}${randomString(characterCount)}`;
    case "words":
      return `${aliasPrefix}${randomWords({ exactly: wordCount, join: separator })}`;
    default:
      throw new Error("Invalid alias type.");
  }
}

export class Alias {
  address: string;
  forwardTo: string;
  enabled: boolean;
  name: string;
  priority: number;
  tag: string;
  isExternal: boolean = false;

  constructor(rule: CloudflareEmailRule) {
    if (rule.matchers[0].type !== "literal" || rule.actions[0].type !== "forward") {
      throw new Error("Rule is not supported by the Alias class");
    }
    if (!rule.name.toLowerCase().startsWith(emailRuleNamePrefix)) {
      this.isExternal = true;
    }
    this.tag = rule.tag;
    this.name = rule.name.replace(emailRuleNamePrefix, "");
    this.enabled = rule.enabled;
    this.priority = rule.priority;
    this.address = rule.matchers[0].value;
    this.forwardTo = rule.actions[0].value[0];
  }

  toString() {
    return this.address;
  }

  toEmailRule(): CloudflareEmailRule {
    return {
      tag: this.tag,
      name: this.isExternal ? this.name : `${emailRuleNamePrefix}${this.name}`,
      enabled: this.enabled,
      priority: this.priority,
      matchers: [
        {
          type: "literal",
          field: "to",
          value: this.address,
        },
      ],
      actions: [
        {
          type: "forward",
          value: [this.forwardTo],
        },
      ],
    };
  }
}
