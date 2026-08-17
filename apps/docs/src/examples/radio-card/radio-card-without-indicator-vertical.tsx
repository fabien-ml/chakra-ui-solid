import { HStack, Icon, RadioCard } from "chakra-ui-solid";
import { For } from "solid-js";
import { AtSignIcon, PhoneIcon, ShoppingCartIcon } from "../../components/ui/icons";

const items = [
  { value: "paypal", title: "Paypal", icon: AtSignIcon },
  { value: "apple-pay", title: "Apple Pay", icon: PhoneIcon },
  { value: "card", title: "Card", icon: ShoppingCartIcon },
];

export default function RadioCardWithoutIndicatorVertical() {
  return (
    <RadioCard.Root orientation="vertical" align="center" maxW="400px" defaultValue="paypal">
      <RadioCard.Label>Payment method</RadioCard.Label>
      <HStack>
        <For each={items}>
          {(item) => (
            <RadioCard.Item value={item.value}>
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <Icon as={item.icon} size="xl" color="fg.muted" />
                <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </HStack>
    </RadioCard.Root>
  );
}
