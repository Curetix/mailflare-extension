import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useI18nContext } from "~/i18n/i18n-react";
import { useCloudflare } from "~/lib/cloudflare/use-cloudflare";
import { Link, useRouter } from "@tanstack/react-router";
import { Stack, Field, Accordion, List, Input } from "@chakra-ui/react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toaster } from "~/components/ui/toaster";

export function Login() {
  const { LL } = useI18nContext();
  const cloudflare = useCloudflare();
  const router = useRouter();

  const { isPending, mutate } = useMutation({
    mutationKey: ["verifyToken"],
    mutationFn: async (token: string) => {
      const result = await cloudflare.verifyToken(token);
      if (!result.success) throw result.error;
    },
    onSuccess: () => {
      router.navigate({ to: "/app" });
    },
    onError: () => {
      toaster.create({
        title: LL.ERROR(),
        description: LL.CLOUDFLARE_LOGIN_ERROR(),
        type: "error",
      });
    },
  });

  const form = useForm({
    values: {
      token: "",
    },
  });

  return (
    <form onSubmit={form.handleSubmit((values) => mutate(values.token))}>
      <Stack gap={2}>
        <Field.Root invalid={!!form.formState.errors.token}>
          <Field.Label>{LL.CLOUDFlARE_TOKEN_LABEL()}</Field.Label>
          <Input
            type="password"
            placeholder={LL.CLOUDFLARE_TOKEN_PLACEHOLDER()}
            disabled={isPending}
            autoComplete="off"
            // TODO: translate this
            {...form.register("token", { required: "Required" })}
          />
          <Field.ErrorText>{form.formState.errors.token?.message}</Field.ErrorText>
        </Field.Root>

        <Button type="submit" loading={isPending}>
          {LL.SAVE()}
        </Button>

        <Accordion.Root multiple defaultValue={["instructions"]}>
          <Accordion.Item value="instructions">
            <Accordion.ItemTrigger>
              {LL.INSTRUCTIONS()}
              <Accordion.ItemIndicator>
                <ChevronDownIcon />
              </Accordion.ItemIndicator>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <List.Root listStyle="numeral inside">
                <List.Item>
                  <Link href="https://dash.cloudflare.com/profile/api-tokens/" target="_blank">
                    {LL.CLOUDFLARE_TOKEN_STEP_1()}
                  </Link>
                </List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_2()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_3()}</List.Item>
                <List.Item>
                  {LL.CLOUDFLARE_TOKEN_STEP_4()}
                  <List.Root listStyle="square inside" ps={6}>
                    <List.Item>Account | Email Routing Addresses | Read</List.Item>
                    <List.Item>Zone | Email Routing Rules | Edit</List.Item>
                    <List.Item>Zone | Zone | Read</List.Item>
                    <List.Item>Zone | Zone Settings | Read</List.Item>
                  </List.Root>
                </List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_5()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_6()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_7()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_8()}</List.Item>
                <List.Item>{LL.CLOUDFLARE_TOKEN_STEP_9()}</List.Item>
              </List.Root>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </Stack>
    </form>
  );
}
