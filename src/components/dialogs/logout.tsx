import { TbX } from "react-icons/tb";
import { useI18nContext } from "~/i18n/i18n-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAtom } from "jotai/index";
import { RESET } from "jotai/utils";
import { apiTokenAtom, selectedZoneIdAtom } from "~/utils/state";
import { extensionStoragePersister } from "~/utils/storage";
import { useRouter } from "@tanstack/react-router";
import { Button, Dialog, HStack, IconButton, Stack } from "@chakra-ui/react";
import { toaster } from "~/components/ui/toaster";

export function LogoutDialog({ children, ...props }: Dialog.RootProps) {
  const { LL } = useI18nContext();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [, setToken] = useAtom(apiTokenAtom);
  const [, setSelectedZoneId] = useAtom(selectedZoneIdAtom);

  const logout = async () => {
    await setToken(RESET);
    await setSelectedZoneId(RESET);
    await queryClient.invalidateQueries();
    await extensionStoragePersister.removeClient();
    toaster.create({
      type: "success",
      description: LL.LOGOUT_SUCCESS(),
      duration: 3000,
    });
    router.navigate({ to: "/app/login" });
  };

  return (
    <Dialog.Root {...props}>
      {children && <Dialog.Trigger asChild>{children}</Dialog.Trigger>}
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content maxWidth="300px">
          <Stack p="6">
            <Stack gap={2}>
              <Dialog.Title>{LL.LOGOUT()}</Dialog.Title>
              <Dialog.Description>{LL.LOGOUT_CONFIRM()}</Dialog.Description>
            </Stack>
            <HStack gap={2} width="full">
              <Dialog.CloseTrigger asChild>
                <Button variant="subtle">{LL.NO()}</Button>
              </Dialog.CloseTrigger>
              <Button colorPalette="red" onClick={logout}>
                {LL.YES()}
              </Button>
            </HStack>
          </Stack>

          <Dialog.CloseTrigger asChild position="absolute" top="2" right="2">
            <IconButton aria-label="Close Dialog" variant="ghost" size="sm">
              <TbX />
            </IconButton>
          </Dialog.CloseTrigger>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
