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
  verified: string;
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
  tag?: string;
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

// const storage = new Storage();
// const cloudflareApi = wretch(CloudflareApiBaseUrl).auth(await storage.get("apiToken"));
//
// function getZones(): Promise<CloudflareListZonesResponse> {
//   return cloudflareApi.url("/zones").get().json();
// }
//
// function getEmailRules(zoneId: string): Promise<CloudflareListEmailRulesResponse> {
//   return cloudflareApi.url(`/zones/${zoneId}/email/routing/rules`).get().json();
// }

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
