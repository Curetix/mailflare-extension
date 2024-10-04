import { createRoute } from "@tanstack/react-router";
import { rootRoute } from "./_root";
import { useState } from "react";
import { useI18nContext } from "~/i18n/i18n-react";
import { generateAliasAddress } from "~/utils/alias";
import {
  Button,
  Field,
  HStack,
  IconButton,
  Input,
  Spinner,
  Stack,
  Box,
  Heading,
  Menu,
} from "@chakra-ui/react";
import { MailIcon } from "lucide-react";
import { Toaster, toaster } from "~/components/ui/toaster";

const generateAliasOptions = {
  format: "characters",
  characterCount: 5,
  prefixFormat: "domainWithoutExtension",
  hostname: "example.com",
} as const;

export function DemoRoute() {
  const { LL } = useI18nContext();
  const [isLoading, setIsLoading] = useState(false);

  const generateButton = () => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      toaster.create({
        title: "MailFlare",
        description: LL.BG_ALERT_CREATED({
          alias: `${generateAliasAddress(generateAliasOptions)}@mailflare.cc`,
        }),
        type: "success",
        duration: 10000,
      });
      setIsLoading(false);
    }, 2000);
  };

  const generateContext = () => {
    if (isLoading) return;
    setIsLoading(true);
    const id = toaster.create({
      title: "MailFlare",
      description: LL.BG_ALERT_LOADING(),
      type: "info",
      duration: 10000,
    });
    setTimeout(() => {
      setIsLoading(false);
      toaster.update(id as string, {
        description: LL.BG_ALERT_CREATED({
          alias: `${generateAliasAddress(generateAliasOptions)}@mailflare.cc`,
        }),
        type: "success",
        duration: 10000,
      });
    }, 2000);
  };

  return (
    <Box h="full">
      <Toaster />
      <Menu.Root onSelect={({ value }) => value === "mailflare" && generateContext()}>
        <Menu.ContextTrigger asChild>
          <Box position="relative" bg="black" h="full" p={5}>
            <Stack gap={2}>
              <Heading size="xl" alignSelf="center">
                Example Inc.
              </Heading>
              <Heading alignSelf="center">Create Account</Heading>
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <HStack position="relative" width="full">
                  <Input type="email" placeholder="Email" pe={5} autoComplete="off" />
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="absolute"
                    height="full"
                    zIndex={2}
                    p={1}
                    insetInlineEnd={0}>
                    <IconButton size="sm" disabled={isLoading} onClick={() => generateButton()}>
                      {isLoading ? <Spinner color="white" /> : <MailIcon color="white" />}
                    </IconButton>
                  </Box>
                </HStack>
              </Field.Root>
              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input type="password" placeholder="Password" disabled />
              </Field.Root>
              <Field.Root>
                <Field.Label>Confirm Password</Field.Label>
                <Input type="password" placeholder="Confirm Password" disabled />
              </Field.Root>
              <Button disabled>Signup</Button>
            </Stack>
          </Box>
        </Menu.ContextTrigger>
        <Menu.Positioner>
          <Menu.Content>
            <Menu.Item value="back" disabled>
              Back
            </Menu.Item>
            <Menu.Item value="forward" disabled>
              Forward
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value="save" disabled>
              Save as...
            </Menu.Item>
            <Menu.Item value="print" disabled>
              Print...
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value="mailflare">Generate and copy new MailFlare alias</Menu.Item>
            <Menu.Separator />
            <Menu.Item value="source" disabled>
              View page source
            </Menu.Item>
            <Menu.Item value="inspect" disabled>
              Inspect
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
    </Box>
  );
}

export const demoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/demo",
  component: DemoRoute,
});
