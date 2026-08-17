import { HStack, Icon, RadioCard } from "chakra-ui-solid";
import { For } from "solid-js";
import { AtSignIcon, PhoneIcon, ShoppingCartIcon } from "../../components/ui/icons";

const items = [
  { value: "paypal", title: "Paypal", icon: AtSignIcon },
  { value: "apple-pay", title: "Apple Pay", icon: PhoneIcon },
  { value: "card", title: "Card", icon: ShoppingCartIcon },
];

export default function RadioCardWithoutIndicator() {
  return (
    <RadioCard.Root
      orientation="horizontal"
      align="center"
      justify="center"
      maxW="lg"
      defaultValue="paypal"
    >
      <RadioCard.Label>Payment method</RadioCard.Label>
      <HStack align="stretch">
        <For each={items}>
          {(item) => (
            <RadioCard.Item value={item.value}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <Icon as={item.icon} size="xl" color="fg.subtle" />
                <RadioCard.ItemText ms="-4">{item.title}</RadioCard.ItemText>
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </HStack>
    </RadioCard.Root>
  );
}
