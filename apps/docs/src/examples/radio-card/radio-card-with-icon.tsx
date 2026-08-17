import { HStack, Icon, RadioCard } from "chakra-ui-solid";
import { For } from "solid-js";
import { ArrowRightIcon, SlashIcon, XIcon } from "../../components/ui/icons";

const items = [
  {
    icon: ArrowRightIcon,
    value: "allow",
    title: "Allow",
    description: "This user can access the system",
  },
  {
    icon: SlashIcon,
    value: "deny",
    title: "Deny",
    description: "This user will be denied access to the system",
  },
  {
    icon: XIcon,
    value: "lock",
    title: "Lock",
    description: "This user will be locked out of the system",
  },
];

export default function RadioCardWithIcon() {
  return (
    <RadioCard.Root defaultValue="allow">
      <RadioCard.Label>Select permission</RadioCard.Label>
      <HStack align="stretch">
        <For each={items}>
          {(item) => (
            <RadioCard.Item value={item.value}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemContent>
                  <Icon as={item.icon} size="xl" color="fg.muted" mb="2" />
                  <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                  <RadioCard.ItemDescription>{item.description}</RadioCard.ItemDescription>
                </RadioCard.ItemContent>
                <RadioCard.ItemIndicator />
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </HStack>
    </RadioCard.Root>
  );
}
