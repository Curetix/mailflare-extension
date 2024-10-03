import ky from "ky";
import type {
  CloudflareBaseResponse,
  CloudflareCreateEmailRuleResponse,
  CloudflareEmailRule,
  CloudflareListEmailDestinationsResponse,
  CloudflareListEmailRulesResponse,
  CloudflareListZonesResponse,
  CloudflareVerifyTokenResponse,
  CloudflareEmailRoutingStatusResponse,
} from "./cloudflare.types";

export const CloudflareApiBaseUrl = "https://api.cloudflare.com/client/v4";

export class CloudflareApiClient {
  baseUrl: string;
  apiToken: string;
  itemsPerPage = 50;

  constructor(apiToken: string, baseUrl?: string, itemsPerPage?: number) {
    this.apiToken = apiToken;
    this.baseUrl = baseUrl || CloudflareApiBaseUrl;
    if (itemsPerPage !== undefined && itemsPerPage > 0 && itemsPerPage <= 50) {
      this.itemsPerPage = itemsPerPage;
    }
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.apiToken}`,
      "Content-Type": "application/json",
    };
  }

  private getPaginationParams(page = 1) {
    return new URLSearchParams({
      page: page.toString(),
      per_page: this.itemsPerPage.toString(),
    });
  }

  /**
   * Verify if the provided Cloudflare API Token is valid
   * @param token
   */
  async verifyToken(token?: string) {
    return ky
      .get(`${this.baseUrl}/user/tokens/verify`, {
        headers: {
          Authorization: `Bearer ${token || this.apiToken}`,
        },
      })
      .json<CloudflareVerifyTokenResponse>();
  }

  /**
   * Get Cloudflare Zones
   * Reference: https://developers.cloudflare.com/api/operations/zones-get
   * @param page pagination page
   */
  async getZones(page = 1) {
    return ky
      .get(`${this.baseUrl}/zones?${this.getPaginationParams(page)}`, {
        headers: this.getHeaders(),
      })
      .json<CloudflareListZonesResponse>();
  }

  /**
   * Get Cloudflare Email Routing destination addresses
   * Reference: https://developers.cloudflare.com/api/operations/email-routing-destination-addresses-list-destination-addresses
   * @param accountId ID of the Cloudflare account
   * @param page pagination page
   */
  async getDestinations(accountId: string, page = 1) {
    return ky
      .get(
        `${this.baseUrl}/accounts/${accountId}/email/routing/addresses?${this.getPaginationParams(
          page,
        )}`,
        {
          headers: this.getHeaders(),
        },
      )
      .json<CloudflareListEmailDestinationsResponse>();
  }

  /**
   * Get the Email Routing configuration for the given zone
   * Requires the permission: Zone | Zone Settings | Read
   * @param zoneId
   */
  async getEmailRoutingStatus(zoneId: string) {
    return ky
      .get(`${this.baseUrl}/zones/${zoneId}/email/routing`, { headers: this.getHeaders() })
      .json<CloudflareEmailRoutingStatusResponse>();
  }

  /**
   * Get Cloudflare Email Routing rules
   * Reference: https://developers.cloudflare.com/api/operations/email-routing-routing-rules-list-routing-rules
   * @param zoneId ID of the Cloudflare ZOne
   * @param page pagination page
   */
  async getEmailRules(zoneId: string, page = 1) {
    return ky
      .get(
        `${this.baseUrl}/zones/${zoneId}/email/routing/rules?${this.getPaginationParams(page)}`,
        {
          headers: this.getHeaders(),
        },
      )
      .json<CloudflareListEmailRulesResponse>();
  }

  /**
   * Create a new Cloudflare Email Routing Rule
   * Reference: https://developers.cloudflare.com/api/operations/email-routing-routing-rules-create-routing-rule
   * @param zoneId ID of the zone to create the rule in
   * @param rule rule to be created
   */
  async createEmailRule(zoneId: string, rule: Omit<CloudflareEmailRule, "tag">) {
    return ky
      .get(`${this.baseUrl}/zones/${zoneId}/email/routing/rules`, {
        method: "POST",
        headers: this.getHeaders(),
        body: JSON.stringify(rule),
      })
      .json<CloudflareCreateEmailRuleResponse>();
  }

  /**
   * Update a Cloudflare Email Routing Rule
   * Reference: https://developers.cloudflare.com/api/operations/email-routing-routing-rules-update-routing-rule
   * @param zoneId ID of the zone the rule is in
   * @param rule rule to be updated
   */
  async updateEmailRule(zoneId: string, rule: CloudflareEmailRule) {
    return ky
      .get(`${this.baseUrl}/zones/${zoneId}/email/routing/rules/${rule.tag}`, {
        method: "PUT",
        headers: this.getHeaders(),
        body: JSON.stringify(rule),
      })
      .json<CloudflareCreateEmailRuleResponse>();
  }

  /**
   * Delete a Cloudflare Email Routing Rule
   * Reference: https://developers.cloudflare.com/api/operations/email-routing-routing-rules-delete-routing-rule
   * @param zoneId ID of the zone the rule is in
   * @param rule rule to be deleted
   */
  async deleteEmailRule(zoneId: string, rule: CloudflareEmailRule) {
    return ky
      .get(`${this.baseUrl}/zones/${zoneId}/email/routing/rules/${rule.tag}`, {
        method: "DELETE",
        headers: this.getHeaders(),
      })
      .json<CloudflareBaseResponse<null>>();
  }
}
