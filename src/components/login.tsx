import { Accordion, Anchor, Button, List, PasswordInput, Stack } from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useState } from "react";
import { useI18nContext } from "~i18n/i18n-react";

import { useCloudflare } from "~lib/cloudflare/use-cloudflare";

function Login() {
  const { LL } = useI18nContext();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const cloudflare = useCloudflare();

  async function verifyToken(token: string) {
    setIsLoading(true);
    const response = await cloudflare.verifyToken(token);
    setIsLoading(false);
    if (!response.success) {
      showNotification({
        title: LL.ERROR(),
        message: LL.CLOUDFLARE_LOGIN_ERROR(),
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
      <Stack p="md" gap="xs">
        <PasswordInput
          label={LL.CLOUDFlARE_TOKEN_LABEL()}
          placeholder={LL.CLOUDFLARE_TOKEN_PLACEHOLDER()}
          disabled={isLoading}
          autoComplete="off"
          {...tokenForm.getInputProps("token")}
        />
        <Button
          type="submit"
          disabled={tokenForm.values.token.trim().length !== 40}
          loading={isLoading}>
          {LL.SAVE()}
        </Button>
        <Accordion variant="filled" defaultValue="instructions">
          <Accordion.Item value="instructions">
            <Accordion.Control>{LL.INSTRUCTIONS()}</Accordion.Control>
            <Accordion.Panel>
              <List size="sm" type="ordered">
                <List.Item>
                  <Anchor
                    href="https://dash.cloudflare.com/profile/api-tokens/"
                    target="_blank"
                    size="sm">
                    {LL.CLOUDFLARE_TOKEN_STEP_1()}
                  </Anchor>
                </List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_2()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_3()}</List.Item>
                <List.Item>
                  {LL.CLOUDFLARE_TOKEN_STEP_4()}
                  <List withPadding listStyleType="disc" size="sm">
                    <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_4_1()}</List.Item>
                    <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_4_2()}</List.Item>
                    <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_4_3()}</List.Item>
                  </List>
                </List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_5()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_6()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_7()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_8()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_9()}</List.Item>
              </List>
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </form>
  );
}

export default Login;
