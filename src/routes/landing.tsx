import { createRoute, redirect, Link as RouterLink } from "@tanstack/react-router";
import { rootRoute } from "./_root";
import { useEffect, useState } from "react";
import { extensionLocalStorageInterface as storage, StorageKeys } from "~/utils/storage";
import { isWebApp } from "~/const";
import firefoxLogo from "~/assets/firefox_logo.svg";
import googleChromeLogo from "~/assets/google_chrome_logo.svg";
import msEdgeLogo from "~/assets/microsoft_edge_logo.svg";
import { hasSeenLandingPage, isAuthenticated } from "./_auth";
import {
  Stack,
  Button,
  HStack,
  Flex,
  Card,
  IconButton,
  Tabs,
  Container,
  Heading,
  Grid,
  Box,
  Badge,
  Span,
  Text,
  SimpleGrid,
  Link,
} from "@chakra-ui/react";
import { useI18nContext } from "~/i18n/i18n-react";
import {
  TbDeviceDesktop,
  TbSearch,
  TbPlus,
  TbPencil,
  TbPackageImport,
  TbClipboardCopy,
  TbEdit,
  TbTrash,
} from "react-icons/tb";
import { SiGithub } from "react-icons/si";
import { Select } from "~/components/ui/select";
import { Tooltip } from "~/components/ui/tooltip";

function Hero() {
  return (
    <Container py={{ base: "16", md: "24" }} maxW="3xl">
      <Stack gap={{ base: "8", md: "12" }} align="center" textAlign="center">
        <Stack gap={{ base: "4", md: "6" }}>
          <Stack gap="4">
            <Heading fontWeight="bold" textStyle={{ base: "4xl", md: "6xl" }}>
              Create Email <Span color="orange.fg">Aliases</Span> with{" "}
              <Span color="orange.fg">Cloudflare </Span> Email Routing
            </Heading>
          </Stack>
          <Text textStyle={{ base: "lg", md: "xl" }} color="fg.subtle">
            MailFlare is a browser extension and web app to turn Cloudflare Email Routing into your
            own private email alias service, similar to AnonAddy, SimpleLogin, and others. No
            third-party services or tedious configuration of a self-hosted email server needed.
          </Text>
        </Stack>
        <Stack direction={{ base: "column", sm: "row" }} gap="3" justifyContent="center">
          <Button asChild size="lg">
            <a href="#downloads">Download</a>
          </Button>
          <Button asChild size="lg" variant="surface">
            {import.meta.env.DEV ? (
              <RouterLink to="/app">Open Web App</RouterLink>
            ) : (
              <a href="https://mailflare.pages.dev/" target="_blank" rel="noreferrer">
                Open Web App
              </a>
            )}
          </Button>
          <Button asChild size="lg" variant="surface" colorPalette="gray">
            <a
              href="https://github.com/Curetix/mailflare-extension"
              target="_blank"
              rel="noreferrer">
              <SiGithub />
              GitHub
            </a>
          </Button>
        </Stack>
        <HStack gap="10" justifyContent="center">
          <HStack>
            <img src={googleChromeLogo} width={24} alt="Google Chrome logo" />
            <Text color="fg.subtle">Chrome</Text>
          </HStack>
          <HStack>
            <img src={msEdgeLogo} width={24} alt="Microsoft Edge logo" />
            <Text color="fg.subtle">Edge</Text>
          </HStack>
          <HStack>
            <img src={firefoxLogo} width={24} alt="Firefox logo" />
            <Text color="fg.subtle">Firefox</Text>
          </HStack>
        </HStack>
      </Stack>
    </Container>
  );
}

const features = [
  {
    icon: TbDeviceDesktop,
    title: "Install",
    description:
      "Available as an externsion for various browser, or as an installable web app for any platform.",
  },
  {
    icon: TbSearch,
    title: "List and Search",
    description: "List and search your addresses for each Cloudflare domain.",
  },
  {
    icon: TbPlus,
    title: "Generate",
    description:
      "Generate new addresses with the settings you prefer, either through the MailFlare popup, an overlay button on email inputs, or through the page context menu.",
  },
  {
    icon: TbPencil,
    title: "Edit",
    description: "Easily edit and delete your existing addresses.",
  },
  {
    icon: TbPackageImport,
    title: "Import & Export (Coming soon)",
    description:
      "Coming from another email alias service using your own domain(s)? MailFlare provides an easy way to import your existing addresses. If you want to migrate the other way, from MailFlare to another service, we support that too.",
  },
];

export const Highlights = () => {
  return (
    <Container py={{ base: "16", md: "24" }}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: "16", lg: "24" }}>
        <Stack width="full" gap={10}>
          <Heading textStyle={{ base: "3xl", md: "4xl" }} fontWeight="semibold">
            Features
          </Heading>
          <Stack gap="10">
            {features.map((feature) => (
              <Stack key={feature.title} direction="row" gap={{ base: "5", md: "6" }}>
                <Flex
                  align="center"
                  justify="center"
                  background="bg.default"
                  borderRadius="l2"
                  borderWidth="1px"
                  color="orange.fg"
                  flexShrink={0}
                  height={{ base: "10", md: "12" }}
                  width={{ base: "10", md: "12" }}>
                  <feature.icon size="20" />
                </Flex>
                <Stack gap={{ base: "1", md: "2" }}>
                  <Heading textStyle="lg" fontWeight="semibold">
                    {feature.title}
                  </Heading>
                  <Text color="fg.subtle">{feature.description}</Text>
                </Stack>
              </Stack>
            ))}
          </Stack>
        </Stack>
        <Stack width="full" gap={10}>
          <Heading textStyle={{ base: "3xl", md: "4xl" }} fontWeight="semibold">
            Demos
          </Heading>
          <Demos />
        </Stack>
      </SimpleGrid>
    </Container>
  );
};

const demoZones: Array<{ id: string; name: string }> = [
  { id: "1", name: "mailflare.cc" },
  { id: "2", name: "curetix.eu" },
] as const;
const demoAliases: Array<{
  zoneId: string;
  address: string;
  name: string;
  disabled?: boolean;
}> = [
  { zoneId: "1", address: "discord_wpyy@mailflare.cc", name: "discord.com" },
  { zoneId: "1", address: "twitch_xbqu@mailflare.cc", name: "www.twitch.tv" },
  { zoneId: "1", address: "github_ctck@mailflare.cc", name: "github.com" },
  { zoneId: "1", address: "ycombinator_8bge@mailflare.cc", name: "news.ycombinator.com" },
  { zoneId: "2", address: "contact@curetix.eu", name: "Contact" },
  { zoneId: "2", address: "mailflare@curetix.eu", name: "MailFlare support" },
] as const;

function AliasListDemo() {
  const { LL } = useI18nContext();

  const [selectedZoneId, setSelectedZoneId] = useState(() => demoZones[0].id);

  return (
    <Stack gap={2}>
      <Select
        placeholder={LL.DOMAIN()}
        value={selectedZoneId}
        onValueChange={setSelectedZoneId}
        items={demoZones.map((z) => ({
          value: z.id,
          label: z.name,
        }))}
      />
      {demoAliases
        .filter((a) => a.zoneId === selectedZoneId)
        .map((a) => (
          <Card.Root key={a.address} shadow="none" borderWidth={1}>
            <Flex px={4} py={2} gap={2} align="center">
              {/* ADDRESS AND DESCRIPTION */}
              <Box flex={1} minWidth={0}>
                <Text truncate>{a.address}</Text>
                <Text fontSize="sm" color="fg.subtle" truncate>
                  {a.name || LL.NO_ALIAS_DESCRIPTION()}
                </Text>
              </Box>

              {/* ACTION BUTTONS */}
              <Flex flexDirection="column" alignItems="flex-end" gap={1}>
                <Flex gap={1}>
                  <Tooltip content={LL.COPY()}>
                    <IconButton variant="ghost" size="xs" disabled>
                      <TbClipboardCopy />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={LL.EDIT()}>
                    <IconButton variant="ghost" size="xs" disabled>
                      <TbEdit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content={LL.DELETE()}>
                    <IconButton variant="ghost" size="xs" disabled>
                      <TbTrash />
                    </IconButton>
                  </Tooltip>
                </Flex>
                {a.disabled && (
                  <Badge colorPalette="red" variant="solid" size="sm">
                    {LL.DISABLED()}
                  </Badge>
                )}
              </Flex>
            </Flex>
          </Card.Root>
        ))}
    </Stack>
  );
}

function Demos() {
  const items = [
    {
      label: "List Aliases",
      value: "list",
    },
    {
      label: "Create Alias",
      value: "create",
      disabled: true,
    },
    {
      label: "Generate Alias",
      value: "generate",
    },
  ];

  return (
    <Tabs.Root
      minHeight="600px"
      defaultValue="list"
      variant="line"
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      fitted>
      <Tabs.List pt="2" px="4">
        {items.map(({ label, value, disabled }) => (
          <Tabs.Trigger
            key={value}
            value={value}
            disabled={disabled}
            textTransform="capitalize"
            color="gray.dark.11"
            _selected={{ color: "white" }}>
            {label}
          </Tabs.Trigger>
        ))}
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Content value="list" p={2}>
        <AliasListDemo />
      </Tabs.Content>
      <Tabs.Content value="create" p={2}>
        {/* <AliasCreateForm /> */}
      </Tabs.Content>
      <Tabs.Content value="generate" bg="black" h="full" p={5} asChild>
        <iframe src="/demo" title="Demo" />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function Downloads() {
  return (
    <Box id="downloads" bg="bg.emphasized" borderYWidth="1px">
      <Container py={{ base: "16", md: "24" }}>
        <Stack
          direction={{ base: "column", lg: "row" }}
          gap={{ base: "12", lg: "16" }}
          justifyContent="center">
          <Stack gap={{ base: "8", md: "10" }} alignItems="start">
            <Stack gap={{ base: "4", md: "5" }} maxW="3xl">
              <Heading textStyle={{ base: "2xl", md: "3xl" }} fontWeight="semibold">
                Extension Downloads
              </Heading>
              <Text color="fg.subtle" textStyle={{ base: "lg", md: "xl" }}>
                For any Chromium-based Browser (Google Chrome, Brave, Microsoft Edge, Opera),
                install the extension through the Google Chrome Webstore. For Firefox, download the
                extension through our GitHub Releases page.
              </Text>
            </Stack>
          </Stack>
          <Stack gap={4} justifyContent="center">
            <Button size="lg" variant="subtle" colorPalette="blue" asChild>
              <a
                href="https://chromewebstore.google.com/detail/mailflare-email-alias-ext/aomfbgcabccoecaoimicmmkjdmdgcfpi"
                target="_blank"
                rel="noreferrer">
                <img src={googleChromeLogo} width={20} alt="Google Chrome logo" />
                Download for Chrome
              </a>
            </Button>

            <Button size="lg" variant="subtle" colorPalette="orange" asChild>
              <a
                href="https://github.com/Curetix/mailflare-extension/releases/latest"
                target="_blank"
                rel="noreferrer">
                <img src={firefoxLogo} width={20} alt="Firefox logo" />
                Download for Firefox
              </a>
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <footer role="contentinfo">
      <Container py={8}>
        <Stack direction="row" justify="space-between" align="center">
          <Text color="fg.muted">© Curetix {new Date().getFullYear()}</Text>
          <Link
            href="https://github.com/Curetix/mailflare-extension"
            target="_blank"
            rel="noreferrer"
            colorPalette="gray">
            <SiGithub />
            GitHub
          </Link>
        </Stack>
      </Container>
    </footer>
  );
}

function LandingPage() {
  useEffect(() => {
    storage.setItem(StorageKeys.SeenLandingPage, true);
  }, []);

  return (
    <Box
      height="100%"
      overflowY="auto"
      overflowX="hidden"
      position="relative"
      scrollBehavior="smooth">
      <Hero />
      <Highlights />
      <Downloads />
      <Footer />
    </Box>
  );
}

export const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
  beforeLoad: async () => {
    if (!isWebApp) {
      throw redirect({ to: "/app" });
    }

    if (
      import.meta.env.PROD &&
      isWebApp &&
      (await hasSeenLandingPage()) &&
      (await isAuthenticated())
    ) {
      throw redirect({
        to: "/app",
      });
    }
  },
});
