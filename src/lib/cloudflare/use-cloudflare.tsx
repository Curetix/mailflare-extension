import type {
  CloudflareBaseResponse,
  CloudflareEmailDestination,
  CloudflareEmailRule,
  CloudflareZone,
} from "~lib/cloudflare/cloudflare.types";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";

import { isWebApp } from "~const";
import { CloudflareApiClient } from "~lib/cloudflare/api";
import { apiTokenAtom, selectedZoneIdAtom } from "~utils/state";

const apiUrl = isWebApp ? (import.meta.env.DEV ? "http://localhost:4001/api" : "/api") : undefined;

type RuleMutation<T> = {
  zoneId: string | null;
  rule: T;
};

export function useCloudflare() {
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
      if (response.success) {
        if (store) {
          await setApiToken(token);
        }
        return { success: true };
      } else {
        console.error(response);
        return { success: false, error: response.errors[0].message };
      }
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

  useEffect(() => {
    if (zones.data && zones.data.length > 0) {
      if (!accountId) {
        setAccountId(zones.data[0].account.id);
      }
      if (!selectedZoneId) {
        setSelectedZoneId(zones.data[0].id);
      }
    }
  }, [zones.data]);

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
      return handleResponse<CloudflareEmailRule>(apiClient.current.createEmailRule(zoneId!, rule));
    },
  });

  const updateEmailRule = useMutation({
    mutationFn: async ({ zoneId, rule }: RuleMutation<CloudflareEmailRule>) => {
      return handleResponse<CloudflareEmailRule>(apiClient.current.updateEmailRule(zoneId!, rule));
    },
  });

  const deleteEmailRule = useMutation({
    mutationFn: async ({ zoneId, rule }: RuleMutation<CloudflareEmailRule>) => {
      return handleResponse<null>(apiClient.current.deleteEmailRule(zoneId!, rule));
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
