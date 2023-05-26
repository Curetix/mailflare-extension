import { QueryClient } from "@tanstack/query-core";
import { atom } from "jotai";
import { atomsWithMutation, atomsWithQuery } from "jotai-tanstack-query";

import { emailRuleNamePrefix, isWebApp } from "~const";
import type {
  CloudflareBaseResponse,
  CloudflareCreateEmailRuleResponse,
  CloudflareEmailRule,
  CloudflareListEmailDestinationsResponse,
  CloudflareListEmailRulesResponse,
  CloudflareListZonesResponse,
} from "~types/cloudflare.types";
import { aliasSearchAtom, apiTokenAtom, ruleFilterAtom, selectedZoneIdAtom } from "~utils/state";

const CloudflareApiBaseUrl = isWebApp
  ? import.meta.env.DEV
    ? "http://localhost:3001/api"
    : "/api"
  : "https://api.cloudflare.com/client/v4";

export { CloudflareApiBaseUrl };

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

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const queryClientAtom = atom(queryClient);

export const [, zonesStatusAtom] = atomsWithQuery(
  (get) => ({
    queryKey: ["zones"],
    queryFn: async () => {
      const response = await fetch(`${CloudflareApiBaseUrl}/zones`, {
        headers: {
          Authorization: `Bearer ${get(apiTokenAtom)}`,
        },
      });
      const json: CloudflareListZonesResponse = await response.json();
      if (response.ok && json.success) {
        return json.result;
      }
      throw new Error(json.errors[0].message);
    },
    enabled: !!get(apiTokenAtom),
    placeholderData: [],
    retry: false,
  }),
  (get) => get(queryClientAtom),
);

const accountIdAtom = atom((get) => {
  const zones = get(zonesStatusAtom);
  if (!zones.isSuccess || !zones.data || zones.data.length === 0) return null;
  return zones.data[0].account.id;
});

export const [, destinationsStatusAtom] = atomsWithQuery(
  (get) => ({
    queryKey: ["destinations", get(accountIdAtom)],
    queryFn: async ({ queryKey }) => {
      if (!queryKey[1]) throw new Error("No account identifier provided.");

      const response = await fetch(
        `${CloudflareApiBaseUrl}/accounts/${queryKey[1]}/email/routing/addresses`,
        {
          headers: {
            Authorization: `Bearer ${get(apiTokenAtom)}`,
          },
        },
      );
      const json: CloudflareListEmailDestinationsResponse = await response.json();
      if (response.ok && json.success) {
        return json.result;
      }
      throw new Error(json.errors[0].message);
    },
    enabled: !!get(accountIdAtom),
    placeholderData: [],
    retry: false,
  }),
  (get) => get(queryClientAtom),
);

export const [, emailRulesStatusAtom] = atomsWithQuery(
  (get) => ({
    queryKey: ["emailRules", get(selectedZoneIdAtom)],
    queryFn: async ({ queryKey }) => {
      if (!queryKey[1]) throw new Error("No zone identifier provided.");

      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${queryKey[1]}/email/routing/rules`,
        {
          headers: {
            Authorization: `Bearer ${get(apiTokenAtom)}`,
          },
        },
      );
      const json: CloudflareListEmailRulesResponse = await response.json();
      if (response.ok && json.success) {
        return json.result;
      }
      throw new Error(json.errors[0].message);
    },
    enabled: !!get(selectedZoneIdAtom),
    placeholderData: [],
    retry: false,
  }),
  (get) => get(queryClientAtom),
);

export const filteredAliasesAtom = atom<Alias[]>((get) => {
  const rules = get(emailRulesStatusAtom);
  if (!rules.isSuccess || !rules.data || rules.data.length === 0) return [];
  const search = get(aliasSearchAtom);
  return rules.data
    .filter((r) => r.matchers[0].type === "literal" && r.actions[0].type === "forward")
    .map((r) => new Alias(r))
    .filter((r) => !get(ruleFilterAtom) || !r.isExternal)
    .filter(
      (r) =>
        search === "" ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.address.toLowerCase().includes(search.toLowerCase()),
    );
});

export const [, createEmailRuleAtom] = atomsWithMutation(
  (get) => ({
    mutationFn: async ({
      zoneId,
      rule,
    }: {
      zoneId: string;
      rule: Omit<CloudflareEmailRule, "tag">;
    }) => {
      const response = await fetch(`${CloudflareApiBaseUrl}/zones/${zoneId}/email/routing/rules`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${get(apiTokenAtom)}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rule),
      });
      const json: CloudflareCreateEmailRuleResponse = await response.json();
      if (response.ok && json.success) {
        return json;
      }
      throw new Error(json.errors[0].message);
    },
  }),
  (get) => get(queryClientAtom),
);

export const [, editEmailRuleAtom] = atomsWithMutation(
  (get) => ({
    mutationFn: async (rule: CloudflareEmailRule) => {
      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${get(selectedZoneIdAtom)}/email/routing/rules/${rule.tag}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${get(apiTokenAtom)}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rule),
        },
      );
      const json: CloudflareCreateEmailRuleResponse = await response.json();
      if (response.ok && json.success) {
        return json;
      }
      throw new Error(json.errors[0].message);
    },
  }),
  (get) => get(queryClientAtom),
);

export const [, deleteEmailAtom] = atomsWithMutation(
  (get) => ({
    mutationFn: async (rule: CloudflareEmailRule) => {
      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${get(selectedZoneIdAtom)}/email/routing/rules/${rule.tag}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${get(apiTokenAtom)}`,
            "Content-Type": "application/json",
          },
        },
      );
      const json: CloudflareBaseResponse<null> = await response.json();
      if (response.ok && json.success) {
        return json;
      }
      throw new Error(json.errors[0].message);
    },
  }),
  (get) => get(queryClientAtom),
);
