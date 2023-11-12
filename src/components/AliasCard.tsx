import type { Alias } from "~utils/alias";
import type { ReactNode } from "react";

import { IconClipboard, IconEdit, IconTrash } from "@tabler/icons-react";
import { ActionIcon, Button, Card, Checkbox, Group, Text } from "@mantine/core";
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
      {/* ADDRESS AND CHECKBOX */}
      <Group justify="space-between">
        <Group gap="xs">
          {selectEnabled && (
            <Checkbox
              size="xs"
              checked={isSelected}
              onChange={(event) => {
                onSelect(event.currentTarget.checked);
              }}
            />
          )}

          <Text truncate style={{ width: selectEnabled ? 230 : 260 }}>
            {alias.address}
          </Text>
        </Group>

        {/* ACTION BUTTONS */}
        <Button.Group>
          <ActionIcon
            variant="subtle"
            size="sm"
            onClick={() => {
              clipboard.copy(alias.address);
              showNotification({
                color: "green",
                message: "Email address was copied to the clipboard.",
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
      </Group>

      {/* DESCRIPTION AND BADGE */}
      <Group justify="space-between" ml={selectEnabled ? 26 : 0}>
        <Text size="sm" c="dimmed" truncate style={{ width: selectEnabled ? 240 : 265 }}>
          {alias.name.replace(emailRuleNamePrefix, "").trim() || "(no description)"}
        </Text>
        {badge}
      </Group>
    </Card>
  );
}