import fetcher from "shared/fetcher";
import { Address, EmailService } from "./service.interface";

/*
Mailjet API docs:
https://dev.mailjet.com/email/guides/send-api-v31/#send-a-basic-email
 */

type MailjetAddress = {
  Email: string;
  Name?: string;
};

type MailjetSendPayload = {
  Messages: {
    From: MailjetAddress;
    To: MailjetAddress[];
    Cc?: MailjetAddress[];
    Bcc?: MailjetAddress[];
    Subject: string;
    TextPart?: string;
    HTMLPart?: string;
  }[];
};

type MailjetSendResponse = {
  Messages: {
    Status: string;
    To: {
      Email: string;
      MessageUUID: string;
      MessageID: number;
      MessageHref: string;
    }[];
  }[];
};

export class Mailjet implements EmailService {
  apiKey: string;
  apiSecretKey: string;

  constructor(apiKey: string, apiSecretKey: string) {
    this.apiKey = apiKey;
    this.apiSecretKey = apiSecretKey;
  }

  async send(from: Address, to: Address, subject: string, body: string) {
    const payload: MailjetSendPayload = {
      Messages: [
        {
          From: {
            Email: from.email,
            Name: from.name,
          },
          To: [
            {
              Email: to.email,
              Name: to.name,
            },
          ],
          Subject: subject,
          HTMLPart: body,
        },
      ],
    };

    const response = await fetcher<MailjetSendResponse>("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${this.apiKey}:${this.apiSecretKey}`)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.Messages[0].Status === "success";
  }
}
