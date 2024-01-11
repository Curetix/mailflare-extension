import type { Alias } from "~utils/alias";
import type { ReactNode } from "react";

import { IconClipboard, IconEdit, IconTrash } from "@tabler/icons-react";
import { useI18nContext } from "~i18n/i18n-react";
import { ActionIcon, Box, Button, Card, Checkbox, Flex, Group, Text } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";

import { emailRuleNamePrefix } from "~const";

type AliasCardProps = {
  alias: Alias;
  badge: ReactNode;
  selectEnabled: boolean;
  isSelected: boolean;
  onSelect: (value: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export default function AliasCard({
  alias,
  badge,
  selectEnabled,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}: AliasCardProps) {
  const { LL } = useI18nContext();
  const clipboard = useClipboard();

  return (
    <Card
      p="xs"
      radius="sm"
      withBorder
      key={alias.tag}
      onClick={() => {
        if (selectEnabled) {
          onSelect(!isSelected);
        }
      }}>
      <Flex gap="xs" align="center">
        {/* SELECT CHECKBOX */}
        {selectEnabled && (
          <Checkbox
            size="xs"
            checked={isSelected}
            onChange={(event) => {
              onSelect(event.currentTarget.checked);
            }}
          />
        )}

        {/* ADDRESS AND DESCRIPTION */}
        <Box flex={1} miw={0}>
          <Text truncate>{alias.address}</Text>
          <Text size="sm" c="dimmed" truncate>
            {alias.name.replace(emailRuleNamePrefix, "").trim() || LL.NO_ALIAS_DESCRIPTION()}
          </Text>
        </Box>

        {/* ACTION BUTTONS */}
        <Box>
          <Button.Group>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => {
                clipboard.copy(alias.address);
                showNotification({
                  color: "green",
                  message: LL.COPY_SUCCESS(),
                  autoClose: 2000,
                });
              }}>
              <IconClipboard size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              disabled={selectEnabled}
              onClick={() => {
                onEdit();
              }}>
              <IconEdit size={16} />
            </ActionIcon>
            <ActionIcon
              variant="subtle"
              size="sm"
              disabled={selectEnabled}
              onClick={() => {
                onDelete();
              }}>
              <IconTrash size={16} />
            </ActionIcon>
          </Button.Group>
          {badge}
        </Box>
      </Flex>
    </Card>
  );
}
