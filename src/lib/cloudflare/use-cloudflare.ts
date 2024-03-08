import type {
  CloudflareBaseResponse,
  CloudflareEmailDestination,
  CloudflareEmailRule,
  CloudflareZone,
} from "~lib/cloudflare/cloudflare.types";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { useEffect, useRef, useState } from "react";

import { isWebApp } from "~const";
import { CloudflareApiClient } from "~lib/cloudflare/api";
import { apiTokenAtom, selectedZoneIdAtom } from "~utils/state";

const apiUrl = isWebApp ? (import.meta.env.DEV ? "http://localhost:4001/api" : "/api") : undefined;

type RuleMutation<T> = {
  zoneId: string | null;
  rule: T;
};

export function useCloudflare() {
  const queryClient = useQueryClient();
  const apiClient = useRef(new CloudflareApiClient("", apiUrl));
  const [apiToken, setApiToken] = useAtom(apiTokenAtom);
  const [accountId, setAccountId] = useState<string | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useAtom(selectedZoneIdAtom);

  useEffect(() => {
    apiClient.current.apiToken = apiToken || "";
  }, [apiToken]);

  async function verifyToken(token: string, store = true) {
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
  }

  async function handleResponse<T>(fn: Promise<CloudflareBaseResponse<T>>) {
    const response = await fn;
    if (!response.success) {
      throw new Error(response.errors[0].message);
    }
    return response.result;
  }

  const zones = useQuery({
    queryKey: ["zones"],
    queryFn: async () => {
      return handleResponse<CloudflareZone[]>(apiClient.current.getZones());
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
      return handleResponse<CloudflareEmailDestination[]>(
        apiClient.current.getDestinations(accountId),
      );
    },
    enabled: !!accountId,
    placeholderData: [],
    retry: false,
  });

  const emailRules = useQuery({
    queryKey: ["emailRules", selectedZoneId],
    queryFn: async ({ queryKey: [, zoneId] }) => {
      if (!zoneId) throw new Error("No zone identifier provided.");
      return handleResponse(apiClient.current.getEmailRules(zoneId as string));
    },
    enabled: !!selectedZoneId,
    placeholderData: [],
    retry: false,
  });

  const createEmailRule = useMutation({
    mutationFn: async ({ zoneId, rule }: RuleMutation<Omit<CloudflareEmailRule, "tag">>) => {
      if (!zoneId) return;
      return handleResponse<CloudflareEmailRule>(apiClient.current.createEmailRule(zoneId, rule));
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["emailRules", selectedZoneId] });
    },
  });

  const updateEmailRule = useMutation({
    mutationFn: async ({ zoneId, rule }: RuleMutation<CloudflareEmailRule>) => {
      if (!zoneId) return;
      return handleResponse<CloudflareEmailRule>(apiClient.current.updateEmailRule(zoneId, rule));
    },
    onSuccess: () => {
      return queryClient.invalidateQueries({ queryKey: ["emailRules", selectedZoneId] });
    },
  });

  const deleteEmailRule = useMutation({
    mutationFn: async ({ zoneId, rule }: RuleMutation<CloudflareEmailRule>) => {
      if (!zoneId) return;
      return handleResponse<null>(apiClient.current.deleteEmailRule(zoneId, rule));
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
