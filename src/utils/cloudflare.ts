import { QueryClient } from "@tanstack/query-core";
import { atom } from "jotai";
import { atomsWithMutation, atomsWithQuery } from "jotai-tanstack-query";

import { emailRuleNamePrefix } from "~const";
import { apiTokenAtom, ruleFilterAtom, selectedZoneIdAtom } from "~utils/state";

const CloudflareApiBaseUrl = "https://api.cloudflare.com/client/v4";

type CloudflareVerifyToken = {
  expires_on?: string;
  id: string;
  not_before?: string;
  status: string;
};

type CloudflareZone = {
  id: string;
  name: string;
  status: string;
  account: {
    id: string;
    name: string;
  };
};

type CloudflareEmailDestination = {
  created: string;
  email: string;
  modified: string;
  tag: string;
  verified: string | null; // null means not verified
};

type CloudflareEmailRule = {
  actions: {
    type: "forward" | "worker";
    value: string[];
  }[];
  matchers: {
    field: "to";
    type: "literal" | "all";
    value: string;
  }[];
  enabled: boolean;
  name: string;
  priority: number;
  tag: string;
};

type CloudflareResponseResultInfo = {
  count: number;
  page: number;
  per_page: number;
  total_count: number;
};

type CloudflareSuccessResponse<T> = {
  errors: [];
  messages: {
    code: number;
    message: string;
  }[];
  result: T;
  success: true;
  result_info: CloudflareResponseResultInfo;
};

type CloudflareErrorResponse = {
  errors: {
    code: number;
    message: string;
  }[];
  messages: [];
  result: null;
  success: false;
  result_info: CloudflareResponseResultInfo;
};

type CloudflareBaseResponse<T> = CloudflareSuccessResponse<T> | CloudflareErrorResponse;

type CloudflareVerifyTokenResponse = CloudflareBaseResponse<CloudflareVerifyToken>;

type CloudflareListZonesResponse = CloudflareBaseResponse<CloudflareZone[]>;

type CloudflareListEmailDestinationsResponse = CloudflareBaseResponse<CloudflareEmailDestination[]>;

type CloudflareListEmailRulesResponse = CloudflareBaseResponse<CloudflareEmailRule[]>;

type CloudflareCreateEmailRuleResponse = CloudflareBaseResponse<CloudflareEmailRule>;

export { CloudflareApiBaseUrl };
export type {
  CloudflareZone,
  CloudflareListZonesResponse,
  CloudflareVerifyToken,
  CloudflareVerifyTokenResponse,
  CloudflareEmailDestination,
  CloudflareListEmailDestinationsResponse,
  CloudflareEmailRule,
  CloudflareListEmailRulesResponse,
  CloudflareCreateEmailRuleResponse,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
    },
  },
});

const queryClientAtom = atom(queryClient);

export const [zonesAtom, zonesStatusAtom] = atomsWithQuery(
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
    retry: 1,
  }),
  (get) => get(queryClientAtom),
);

const accountIdAtom = atom((get) => {
  const zones = get(zonesStatusAtom);
  if (!zones.isSuccess || !zones.data || zones.data.length === 0) return null;
  return zones.data[0].account.id;
});

export const [destinationsAtom, destinationsStatusAtom] = atomsWithQuery(
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
    retry: 1,
  }),
  (get) => get(queryClientAtom),
);

export const [emailRulesAtom, emailRulesStatusAtom] = atomsWithQuery(
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
        return json.result.filter(
          (r) =>
            (!get(ruleFilterAtom) || r.name.toLowerCase().startsWith(emailRuleNamePrefix)) &&
            r.matchers[0].type === "literal" &&
            r.actions[0].type === "forward",
        );
      }
      throw new Error(json.errors[0].message);
    },
    enabled: !!get(selectedZoneIdAtom),
    placeholderData: [],
    retry: 1,
  }),
  (get) => get(queryClientAtom),
);

export const [, createEmailRuleAtom] = atomsWithMutation(
  (get) => ({
    mutationFn: async (rule: CloudflareEmailRule) => {
      const response = await fetch(
        `${CloudflareApiBaseUrl}/zones/${get(selectedZoneIdAtom)}/email/routing/rules`,
        {
          method: "POST",
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
