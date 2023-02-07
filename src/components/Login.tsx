import { Anchor, Button, Divider, List, Stack, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { Navigate } from "react-router";

import { useStorage } from "@plasmohq/storage/hook";

import { CloudflareApiBaseUrl, CloudflareVerifyTokenResponse } from "~utils/cloudflare";

function Login() {
  const [storedToken, setStoredToken] = useStorage<string>("apiToken", "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [verifyError, setVerifyError] = useState<boolean>(false);

  if (storedToken !== "") {
    return <Navigate to="/aliases" state={{ from: location }} replace />;
  }

  async function verifyToken() {
    setVerifyError(false);
    setIsLoading(true);
    const response = await fetch(`${CloudflareApiBaseUrl}/user/tokens/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setIsLoading(false);

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
  }

  return (
    <Stack p="lg">
      <Text fw="bold" size="xl">
        Login
      </Text>
      <TextInput
        onChange={(e) => setToken(e.target.value)}
        value={token}
        label="Cloudflare API token"
        placeholder={storedToken.length > 0 ? "Saved token will be overridden" : undefined}
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
      <Divider />
      <Text fw="bold" size="md">
        Instructions
      </Text>
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
            <List.Item>Account | Email Routing Addresses | Edit</List.Item>
            <List.Item>Zone | Email Routing Rules | Edit</List.Item>
            <List.Item>Zone | Zone | Read</List.Item>
          </List>
        </List.Item>
        <List.Item>Set "Account Resources" to your account</List.Item>
        <List.Item>
          Set "Zone Resources" to "All zones" or select the zone you want to use
        </List.Item>
        <List.Item>Configure "Client IP Address Filtering" and "TTL" if you want to</List.Item>
        <List.Item>Click "Continue to summary" and then "Create token"</List.Item>
        <List.Item>Paste the generated token above</List.Item>
      </List>
    </Stack>
  );
}

export default Login;
