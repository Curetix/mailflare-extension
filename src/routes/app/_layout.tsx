import { createRoute, Link, Outlet } from "@tanstack/react-router";
import { Suspense } from "react";
import { TbSettings } from "react-icons/tb";
import { rootRoute } from "../_root";
import { AbsoluteCenter, Box, Flex, HStack, IconButton, Spinner, Text } from "@chakra-ui/react";

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
        <Text fontWeight="bold" fontSize="md">
          <Link to="/app">MailFlare</Link>
        </Text>
        <IconButton size="sm" variant="ghost" asChild>
          <Link to="/app/settings">
            <TbSettings />
          </Link>
        </IconButton>
      </HStack>
      <Box p={2}>
        <Suspense
          fallback={
            <AbsoluteCenter>
              <Spinner />
            </AbsoluteCenter>
          }>
          <Outlet />
        </Suspense>
      </Box>
    </Flex>
  ),
});
