import { createRoute, Link, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { TbSettings } from "react-icons/tb";
import { Flex, HStack, Box } from "styled-system/jsx";
import { IconButton } from "~/components/ui/icon-button";
import { Spinner } from "~/components/ui/spinner";
import { rootRoute } from "../_root";
import { Text } from "~/components/ui/text";

export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "app-layout",
  component: () => (
    <Flex direction="column" h="100%" maxW="600px" m="auto">
      <HStack
        justify="space-between"
        px={4}
        py={2}
        bg="bg.subtle"
        borderWidth={1}
        borderTopWidth={0}
        borderBottomRadius="md"
        shadow="sm">
        <Text fontWeight="bold" size="md">
          <Link to="/app">MailFlare</Link>
        </Text>
        <IconButton size="sm" variant="ghost" asChild>
          <Link to="/app/settings">
            <TbSettings />
          </Link>
        </IconButton>
      </HStack>
      <Box p={2}>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </Box>
    </Flex>
  ),
});
