import { Select as ChakraSelect, createListCollection, Spinner } from "@chakra-ui/react";
import { useMemo } from "react";
import { TbCheck, TbSelector } from "react-icons/tb";

type SimpleSelectProps = {
  items: { value: string; label: string }[];
  value?: string | null;
  onValueChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  loading?: boolean;
} & Omit<ChakraSelect.RootProps, "collection" | "value" | "onValueChange">;

export function Select({
  items,
  value,
  onValueChange,
  label,
  placeholder,
  loading,
  ...props
}: SimpleSelectProps) {
  const collection = useMemo(
    () =>
      createListCollection({
        items,
      }),
    [items],
  );

  return (
    <ChakraSelect.Root
      collection={collection}
      positioning={{ sameWidth: true }}
      value={value ? [value] : undefined}
      onValueChange={({ items }) => onValueChange?.(items[0].value)}
      {...props}>
      {label && <ChakraSelect.Label>{label}</ChakraSelect.Label>}
      <ChakraSelect.Control>
        <ChakraSelect.Trigger>
          <ChakraSelect.ValueText placeholder={placeholder} />
          {loading && <Spinner />}
          <TbSelector />
        </ChakraSelect.Trigger>
      </ChakraSelect.Control>
      <ChakraSelect.Positioner>
        <ChakraSelect.Content>
          {items.map((item) => (
            <ChakraSelect.Item key={item.value} item={item}>
              <ChakraSelect.ItemText>{item.label}</ChakraSelect.ItemText>
              <ChakraSelect.ItemIndicator>
                <TbCheck />
              </ChakraSelect.ItemIndicator>
            </ChakraSelect.Item>
          ))}
        </ChakraSelect.Content>
      </ChakraSelect.Positioner>
    </ChakraSelect.Root>
  );
}
