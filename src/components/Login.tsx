import { useState } from "react";
import { Accordion, Anchor, Button, List, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";

import { useCloudflare } from "~lib/cloudflare/use-cloudflare";

function Login() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cloudflare = useCloudflare();

  async function verifyToken(token: string) {
    setIsLoading(true);
    const response = await cloudflare.verifyToken(token);
    setIsLoading(false);
    if (!response.success) {
      showNotification({
        title: "Error",
        message: "Token could not be verified. Is it correct?",
        color: "red",
      });
    }
  }

  const tokenForm = useForm({
    initialValues: {
      token: "",
    },
    validate: {
      token: (value) => value.trim().length !== 40,
    },
  });

  return (
    <form onSubmit={tokenForm.onSubmit((values) => verifyToken(values.token))}>
      <Stack p="md" gap="sm">
        <TextInput
          label="Cloudflare API token"
          placeholder="Paste your Cloudflare API token here"
          disabled={isLoading}
          autoComplete="off"
          {...tokenForm.getInputProps("token")}
        />
        <Button
          type="submit"
          disabled={tokenForm.values.token.trim().length != 40}
          loading={isLoading}>
          Save
        </Button>
        <Accordion variant="filled" defaultValue="instructions">
          <Accordion.Item value="instructions">
            <Accordion.Control>Instructions</Accordion.Control>
            <Accordion.Panel>
              <List size="sm" type="ordered">
                <List.Item>
                  Open{" "}
                  <Anchor
                    href="https://dash.cloudflare.com/profile/api-tokens/"
                    target="_blank"
                    size="sm">
                    https://dash.cloudflare.com/profile/api-tokens
                  </Anchor>
                </List.Item>
                <List.Item>Click "Create Token", select "Create Custom Token"</List.Item>
                <List.Item>Choose a name, like "Email Extension"</List.Item>
                <List.Item>
                  Configure the following permissions:
                  <List withPadding listStyleType="disc" size="sm">
                    <List.Item>Account | Email Routing Addresses | Read</List.Item>
                    <List.Item>Zone | Email Routing Rules | Edit</List.Item>
                    <List.Item>Zone | Zone | Read</List.Item>
                  </List>
                </List.Item>
                <List.Item>Set "Account Resources" to your account</List.Item>
                <List.Item>
                  Set "Zone Resources" to "All zones" or select the zone you want to use
                </List.Item>
                <List.Item>
                  Configure "Client IP Address Filtering" and "TTL" if you want to
                </List.Item>
                <List.Item>Click "Continue to summary" and then "Create token"</List.Item>
                <List.Item>Paste the generated token above</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </form>
  );
}

export default Login;
