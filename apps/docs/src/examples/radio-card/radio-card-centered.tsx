import { HStack, Icon, RadioCard } from "chakra-ui-solid";
import { For } from "solid-js";
import { ArrowUpRightIcon, CircleDashedIcon, DollarSignIcon } from "../../components/ui/icons";

const items = [
  { icon: DollarSignIcon, value: "fixed", title: "Fixed Rate" },
  { icon: ArrowUpRightIcon, value: "milestone", title: "Milestone" },
  { icon: CircleDashedIcon, value: "hourly", title: "Hourly" },
];

export default function RadioCardCentered() {
  return (
    <RadioCard.Root orientation="vertical" align="center" defaultValue="fixed">
      <RadioCard.Label>Select contract type</RadioCard.Label>
      <HStack align="stretch">
        <For each={items}>
          {(item) => (
            <RadioCard.Item value={item.value}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <Icon as={item.icon} size="xl" color="fg.muted" mb="2" />
                <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </HStack>
    </RadioCard.Root>
  );
}
