export interface Env {
  cloudflareApiToken: string;
  cloudflareAccountId: string;

  emailService?: "mailjet";
  mailjetApiKey?: string;
  mailjetApiSecret?: string;
}
