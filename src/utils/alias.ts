import type { CloudflareEmailRule } from "~lib/cloudflare/cloudflare.types";
import type { AliasSettings } from "~utils/state";

import psl from "psl";
import { generate as randomWords } from "random-words";

import { emailRuleNamePrefix } from "~const";
import { randomString } from "~utils";

type GenerateAliasOptions = Omit<AliasSettings, "destination"> & {
  customPrefix?: string;
  hostname?: string;
};

export function generateAliasAddress({
  format = "characters",
  characterCount = 5,
  wordCount = 2,
  separator = "_",
  prefixFormat = "none",
  customPrefix,
  hostname,
}: GenerateAliasOptions): string {
  let prefix = "";
  if (prefixFormat === "custom" && customPrefix) {
    prefix = customPrefix.trim();
  } else if (hostname && psl.isValid(hostname)) {
    // Cast type to ParsedDomain since we just checked if it's valid, this should never be an issue
    const parsedHostname = psl.parse(hostname) as psl.ParsedDomain;

    if (prefixFormat === "domainWithoutExtension" && parsedHostname.sld) {
      prefix = parsedHostname.sld;
    } else if (prefixFormat === "domainWithExtension" && parsedHostname?.domain) {
      prefix = parsedHostname.domain;
    } else if (prefixFormat === "fullDomain") {
      prefix = hostname;
    }
  }
  prefix = prefix.trim() !== "" ? `${prefix}${separator}` : "";
  switch (format) {
    case "characters":
      return `${prefix}${randomString(characterCount)}`.toLowerCase();
    case "words":
      return `${prefix}${randomWords({ exactly: wordCount, join: separator })}`.toLowerCase();
    default:
      throw new Error("Invalid alias type.");
  }
}

export class Alias {
  address: string;
  destination: string;
  enabled: boolean;
  name: string;
  isExternal: boolean;
  priority?: number;
  tag?: string;

  constructor(
    address: string,
    destination: string,
    name: string,
    enabled = true,
    isExternal?: boolean,
  ) {
    this.address = address;
    this.destination = destination;
    this.enabled = enabled;
    this.name = name.replace(emailRuleNamePrefix, "");
    this.isExternal =
      isExternal !== undefined ? isExternal : !name.toLowerCase().startsWith(emailRuleNamePrefix);
  }

  toString() {
    return this.address;
  }

  static fromCustomAddress(address: string, destination: string, name: string) {
    return new Alias(address, destination, name, true, false);
  }

  static fromOptions(
    addressOptions: GenerateAliasOptions,
    domain: string,
    destination: string,
    name: string,
  ) {
    const address = `${generateAliasAddress(addressOptions)}@${domain}`;
    return new Alias(address, destination, name, true, false);
  }

  static fromCloudflareEmailRule(rule: CloudflareEmailRule) {
    if (rule.matchers[0].type !== "literal" || rule.actions[0].type !== "forward") {
      throw new Error("Rule is not supported by the Alias class");
    }

    const alias = new Alias(
      rule.matchers[0].value,
      rule.actions[0].value[0],
      rule.name,
      rule.enabled,
    );
    alias.tag = rule.tag;
    alias.priority = rule.priority;
    return alias;
  }

  toEmailRule(): CloudflareEmailRule {
    return {
      tag: this.tag || "",
      name: this.isExternal ? this.name : `${emailRuleNamePrefix}${this.name}`,
      enabled: this.enabled,
      priority: this.priority || Math.round(Date.now() / 1000),
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
          value: [this.destination],
        },
      ],
    };
  }
}
