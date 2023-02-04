import { Anchor, Button, Divider, Stack, Text, TextInput } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import { CloudflareApiBaseUrl, CloudflareVerifyTokenResponse } from "~utils/cloudflare";

function Login() {
  const [storedToken, setStoredToken] = useStorage<string>("apiToken", "");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [token, setToken] = useState<string>("");
  const [verifyError, setVerifyError] = useState<boolean>(false);

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
    <Stack miw={400} p="lg">
      <Text fw="bold" size="xl">
        Login
      </Text>
      {/*<Divider my="sm" />*/}
      <Anchor href="https://github.com/curetix/mailflare" target="_blank">
        View instructions for generating the token.
      </Anchor>
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
    </Stack>
  );
}

export default Login;
