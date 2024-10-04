import type { ReactNode } from "react";
import type { Alias } from "~/utils/alias";
import { useI18nContext } from "~/i18n/i18n-react";
import { emailRuleNamePrefix } from "~/const";
import { TbCheck, TbClipboardCopy, TbEdit, TbTrash } from "react-icons/tb";
import { Box, Card, Clipboard, Flex, IconButton, Text } from "@chakra-ui/react";
import { Tooltip } from "~/components/ui/tooltip";
import { Checkbox } from "~/components/ui/checkbox";
import { toaster } from "~/components/ui/toaster";

type AliasCardProps = {
  alias: Alias;
  badge: ReactNode;
  selectEnabled?: boolean;
  isSelected?: boolean;
  onSelect: (value: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function AliasCard({
  alias,
  badge,
  selectEnabled,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: AliasCardProps) {
  const { LL } = useI18nContext();

  return (
    <Card.Root
      onClick={() => {
        if (selectEnabled) {
          onSelect(!isSelected);
        }
      }}
      shadow="none"
      borderWidth={1}
      data-checked={isSelected ? "" : undefined}
      transition="colors"
      _checked={{ borderColor: "accent.emphasized" }}>
      <Flex px={4} py={2} gap={2} align="center">
        {/* SELECT CHECKBOX */}
        {selectEnabled && (
          <Checkbox
            size="sm"
            checked={isSelected}
            onCheckedChange={({ checked }) => {
              onSelect(checked === "indeterminate" ? true : checked);
            }}
          />
        )}

        {/* ADDRESS AND DESCRIPTION */}
        <Box flex={1} minWidth={0}>
          <Text truncate>{alias.address}</Text>
          <Text fontSize="sm" color="fg.subtle" truncate>
            {alias.name.replace(emailRuleNamePrefix, "").trim() || LL.NO_ALIAS_DESCRIPTION()}
          </Text>
        </Box>

        {/* ACTION BUTTONS */}
        <Flex flexDirection="column" alignItems="flex-end" gap={1}>
          <Flex gap={1}>
            <Tooltip content={LL.COPY()}>
              <Clipboard.Root value={alias.address}>
                <Clipboard.Control>
                  <Clipboard.Trigger>
                    <IconButton
                      variant="ghost"
                      size="xs"
                      onClick={() =>
                        toaster.create({
                          description: LL.COPY_SUCCESS(),
                          type: "success",
                        })
                      }>
                      <Clipboard.Indicator copied={<TbCheck />}>
                        <TbClipboardCopy />
                      </Clipboard.Indicator>
                    </IconButton>
                  </Clipboard.Trigger>
                </Clipboard.Control>
              </Clipboard.Root>
            </Tooltip>
            <Tooltip content={LL.EDIT()}>
              <IconButton
                variant="ghost"
                size="xs"
                disabled={selectEnabled}
                onClick={() => {
                  onEdit();
                }}>
                <TbEdit />
              </IconButton>
            </Tooltip>
            <Tooltip content={LL.DELETE()}>
              <IconButton
                variant="ghost"
                size="xs"
                disabled={selectEnabled}
                onClick={() => {
                  onDelete();
                }}>
                <TbTrash />
              </IconButton>
            </Tooltip>
          </Flex>
          {badge}
        </Flex>
      </Flex>
    </Card.Root>
  );
}
