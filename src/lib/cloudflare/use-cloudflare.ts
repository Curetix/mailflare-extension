import type {
  CloudflareBaseResponse,
  CloudflareEmailDestination,
  CloudflareEmailRule,
  CloudflareZone,
} from "~lib/cloudflare/cloudflare.types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";

import { isWebApp } from "~const";
import { CloudflareApiClient } from "~lib/cloudflare/api";
import { apiTokenAtom, selectedZoneIdAtom } from "~utils/state";

type RuleMutation<T> = {
  zoneId: string | null;
  rule: T;
};

const apiUrl = isWebApp ? (import.meta.env.DEV ? "http://localhost:4001/api" : "/api") : undefined;

async function getAllPages<T>(fn: (page: number) => Promise<CloudflareBaseResponse<Array<T>>>) {
  const items: Array<T> = [];
  let page = 1;

  while (true) {
    const response = await fn(page);

    if (!response.success) {
      throw new Error(response.errors[0].message);
    }

    items.push(...response.result);

    if (
      Math.ceil(response.result_info.total_count / response.result_info.per_page) >
      response.result_info.page
    ) {
      page += 1;
    } else {
      break;
    }
  }

  return items;
}

export async function handleResponse<T>(fn: Promise<CloudflareBaseResponse<T>>) {
  const response = await fn;
  if (!response.success) {
    throw new Error(response.errors[0].message);
  }
  return response.result;
}

export function useCloudflare() {
  const queryClient = useQueryClient();
  const apiClient = useRef(new CloudflareApiClient("", apiUrl));
  const [apiToken, setApiToken] = useAtom(apiTokenAtom);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom);

  useEffect(() => {
    apiClient.current.apiToken = apiToken || "";
  }, [apiToken]);

  const verifyToken = useCallback(
    async (token: string, store = true) => {
      try {
        const response = await apiClient.current.verifyToken(token);
        if (!response.success) {
          console.error(response);
          return { success: false, error: response.errors[0].message };
        }

        if (store) {
          await setApiToken(token);
        }
        return { success: true };
      } catch (error: any) {
        console.error(error);
        return { success: false, error: error.toString() };
      }
    },
    [setApiToken],
  );

  const zones = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      return getAllPages((page: number) => apiClient.current.getZones(page));
    },
    enabled: !!apiToken,
    placeholderData: [],
    retry: false,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (zones.data && zones.data.length > 0) {
      if (!accountId) {
        setAccountId(zones.data[0].account.id);
      }
      if (!selectedZoneId) {
        setSelectedZoneId(zones.data[0].id);
      }
    }
  }, [zones.data, accountId, selectedZoneId]);

  const emailDestinations = useQuery({
    queryKey: ["destinations", accountId],
    queryFn: async ({ queryKey: [, accountId] }) => {
      if (!accountId) throw new Error("No account identifier provided.");
      return getAllPages((page: number) => apiClient.current.getDestinations(accountId, page));
    },
    enabled: !!accountId,
    placeholderData: [],
    retry: false,
  });

  const emailRules = useQuery({
    queryKey: ["emailRules", selectedZoneId],
    queryFn: async ({ queryKey: [, zoneId] }) => {
      if (!zoneId) throw new Error("No zone identifier provided.");
      return getAllPages((page: number) => apiClient.current.getEmailRules(zoneId, page));
    },
    enabled: !!selectedZoneId,
    placeholderData: [],
    retry: false,
  });

  const createEmailRule = useMutation({
    mutationFn: async ({ zoneId, rule }: RuleMutation<Omit<CloudflareEmailRule, "tag">>) => {
      if (!zoneId) return;
      return handleResponse(apiClient.current.createEmailRule(zoneId, rule));
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["emailRules", selectedZoneId] });
    },
  });

  const updateEmailRule = useMutation({
    mutationFn: async ({ zoneId, rule }: RuleMutation<CloudflareEmailRule>) => {
      if (!zoneId) return;
      return handleResponse(apiClient.current.updateEmailRule(zoneId, rule));
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["emailRules", selectedZoneId] });
    },
  });

  const deleteEmailRule = useMutation({
    mutationFn: async ({ zoneId, rule }: RuleMutation<CloudflareEmailRule>) => {
      if (!zoneId) return;
      return handleResponse(apiClient.current.deleteEmailRule(zoneId, rule));
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["emailRules", selectedZoneId] });
    },
  });

  return {
    apiClient,
    verifyToken,
    accountId,
    zones,
    selectedZoneId,
    setSelectedZoneId,
    emailDestinations,
    emailRules,
    createEmailRule,
    updateEmailRule,
    deleteEmailRule,
  };
}
