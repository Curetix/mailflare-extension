import { Accordion, Anchor, Button, List, Stack, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useAtom } from "jotai";
import { useState } from "react";

import { CloudflareApiBaseUrl, CloudflareVerifyTokenResponse } from "~utils/cloudflare";
import { apiTokenAtom } from "~utils/state";

function Login() {
  const [, setStoredToken] = useAtom(apiTokenAtom);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [verifyError, setVerifyError] = useState<boolean>(false);

  async function verifyToken() {
    setVerifyError(false);
    setIsLoading(true);
    try {
      const response = await fetch(`${CloudflareApiBaseUrl}/user/tokens/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json: CloudflareVerifyTokenResponse = await response.json();
      if (response.ok && json.success) {
        await setStoredToken(token);
      } else {
        setVerifyError(true);
        console.error(json);
        showNotification({
          title: "Error",
          message: "Token could not be verified. Is it correct?",
          color: "red",
        });
      }
    } catch (error) {
      setVerifyError(true);
      console.error(error);
      showNotification({
        title: "Error",
        message: "Token could not be verified. Is it correct?",
        color: "red",
      });
    }
    setIsLoading(false);
  }

  return (
    <Stack p="md" spacing="sm">
      <TextInput
        onChange={(e) => setToken(e.target.value)}
        value={token}
        label="Cloudflare API token"
        placeholder="Paste your Cloudflare API token here"
        disabled={isLoading}
        error={verifyError}
        autoComplete="off"
      />
      <Button
        onClick={() => verifyToken()}
        disabled={token.trim().length != 40}
        loading={isLoading}>
        Save
      </Button>
      <Accordion variant="filled">
        <Accordion.Item value="instructions">
          <Accordion.Control>Instructions</Accordion.Control>
          <Accordion.Panel>
            <List size="sm" type="ordered">
              <List.Item>
                Open{" "}
                <Anchor href="https://dash.cloudflare.com/profile/api-tokens/" target="_blank">
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
  );
}

export default Login;
