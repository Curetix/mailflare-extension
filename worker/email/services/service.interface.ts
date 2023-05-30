export type Address = {
  email: string;
  name?: string;
};

export interface EmailService {
  send(from: Address, to: Address, subject: string, body: string): Promise<boolean>;
}
