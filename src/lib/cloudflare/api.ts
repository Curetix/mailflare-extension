import type {
  CloudflareBaseResponse,
  CloudflareCreateEmailRuleResponse,
  CloudflareEmailRule,
  CloudflareListEmailDestinationsResponse,
  CloudflareListEmailRulesResponse,
  CloudflareListZonesResponse,
  CloudflareVerifyTokenResponse,
} from "./cloudflare.types";

import fetcher from "../fetcher";

export const CloudflareApiBaseUrl = "https://api.cloudflare.com/client/v4";

export class CloudflareApiClient {
  baseUrl: string;
  apiToken: string;

  constructor(apiToken: string, baseUrl?: string) {
    this.apiToken = apiToken;
    this.baseUrl = baseUrl || CloudflareApiBaseUrl;
  }

  getHeaders() {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  async verifyToken(token?: string) {
    return await fetcher<CloudflareVerifyTokenResponse>(`${this.baseUrl}/user/tokens/verify`, {
      headers: {
        Authorization: `Bearer ${token || this.apiToken}`,
      },
    });
  }

  async getZones() {
    return await fetcher<CloudflareListZonesResponse>(`${this.baseUrl}/zones`, {
      headers: this.getHeaders(),
    });
  }

  async getDestinations(accountId: string) {
    return await fetcher<CloudflareListEmailDestinationsResponse>(
      `${this.baseUrl}/accounts/${accountId}/email/routing/addresses`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  async getEmailRules(zoneId: string) {
    return await fetcher<CloudflareListEmailRulesResponse>(
      `${this.baseUrl}/zones/${zoneId}/email/routing/rules`,
      {
        headers: this.getHeaders(),
      },
    );
  }

  async createEmailRule(zoneId: string, rule: Omit<CloudflareEmailRule, "tag">) {
    return await fetcher<CloudflareCreateEmailRuleResponse>(
      `${this.baseUrl}/zones/${zoneId}/email/routing/rules`,
      {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(rule),
      },
    );
  }

  async updateEmailRule(zoneId: string, rule: CloudflareEmailRule) {
    return await fetcher<CloudflareCreateEmailRuleResponse>(
      `${this.baseUrl}/zones/${zoneId}/email/routing/rules/${rule.tag}`,
      {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(rule),
      },
    );
  }

  async deleteEmailRule(zoneId: string, rule: CloudflareEmailRule) {
    return await fetcher<CloudflareBaseResponse<null>>(
      `${this.baseUrl}/zones/${zoneId}/email/routing/rules/${rule.tag}`,
      {
        method: "DELETE",
        headers: this.getHeaders(),
      },
    );
  }
}
