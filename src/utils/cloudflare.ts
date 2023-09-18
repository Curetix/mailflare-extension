import type { CloudflareEmailRule } from "~lib/cloudflare.types";

import { QueryClient } from "@tanstack/query-core";
import { atom } from "jotai";
import { atomsWithMutation, atomsWithQuery } from "jotai-tanstack-query";

import { isWebApp } from "~const";
import { CloudflareApiClient } from "~lib/cloudflare";
import { Alias } from "~utils/alias";
import { aliasSearchAtom, apiTokenAtom, ruleFilterAtom, selectedZoneIdAtom } from "~utils/state";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const queryClientAtom = atom(queryClient);

export const apiClientAtom = atom(async (get) => {
  const apiUrl = isWebApp
    ? import.meta.env.DEV
      ? "http://localhost:4001/api"
      : "/api"
    : "https://api.cloudflare.com/client/v4";
  return new CloudflareApiClient((await get(apiTokenAtom)) || "", apiUrl);
});

const accountIdAtom = atom((get) => {
  const zones = get(zonesStatusAtom);
  if (!zones.isSuccess || !zones.data || zones.data.length === 0) return null;
  return zones.data[0].account.id;
});

export const [, zonesStatusAtom] = atomsWithQuery(
  (get) => ({
    queryKey: ["zones"],
    queryFn: async () => {
      const apiClient = await get(apiClientAtom);
      const response = await apiClient.getZones();
      if (!response.success) {
        throw new Error(response.errors[0].message);
      }
      return response.result;
    },
    enabled: !!get(apiTokenAtom),
    placeholderData: [],
    retry: false,
  }),
  (get) => get(queryClientAtom),
);

export const [, destinationsStatusAtom] = atomsWithQuery(
  (get) => ({
    queryKey: ["destinations", get(accountIdAtom)],
    queryFn: async ({ queryKey: [, accountId] }) => {
      if (!accountId) throw new Error("No account identifier provided.");

      const apiClient = await get(apiClientAtom);
      const response = await apiClient.getDestinations(accountId as string);
      if (!response.success) {
        throw new Error(response.errors[0].message);
      }
      return response.result;
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
    queryFn: async ({ queryKey: [, zoneId] }) => {
      if (!(await zoneId)) throw new Error("No zone identifier provided.");

      const apiClient = await get(apiClientAtom);
      const response = await apiClient.getEmailRules((await zoneId) as string);
      if (!response.success) {
        throw new Error(response.errors[0].message);
      }
      return response.result;
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

type RuleMutation<T> = {
  zoneId: string | null;
  rule: T;
};

export const [, createEmailRuleAtom] = atomsWithMutation(
  (get) => ({
    mutationFn: async ({ zoneId, rule }: RuleMutation<Omit<CloudflareEmailRule, "tag">>) => {
      const apiClient = await get(apiClientAtom);
      const response = await apiClient.createEmailRule(zoneId!, rule);
      if (!response.success) {
        throw new Error(response.errors[0].message);
      }
      return response.result;
    },
  }),
  (get) => get(queryClientAtom),
);

export const [, editEmailRuleAtom] = atomsWithMutation(
  (get) => ({
    mutationFn: async ({ zoneId, rule }: RuleMutation<CloudflareEmailRule>) => {
      const apiClient = await get(apiClientAtom);
      const response = await apiClient.updateEmailRule(zoneId!, rule);
      if (!response.success) {
        throw new Error(response.errors[0].message);
      }
      return response.result;
    },
  }),
  (get) => get(queryClientAtom),
);

export const [, deleteEmailAtom] = atomsWithMutation(
  (get) => ({
    mutationFn: async ({ zoneId, rule }: RuleMutation<CloudflareEmailRule>) => {
      const apiClient = await get(apiClientAtom);
      const response = await apiClient.deleteEmailRule(zoneId!, rule);
      if (!response.success) {
        throw new Error(response.errors[0].message);
      }
      return response.result;
    },
  }),
  (get) => get(queryClientAtom),
);
