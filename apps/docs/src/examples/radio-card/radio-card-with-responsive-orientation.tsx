import { Box, HStack, Icon, RadioCard } from "chakra-ui-solid";
import { For } from "solid-js";
import { AtSignIcon, PhoneIcon, ShoppingCartIcon } from "../../components/ui/icons";

const items = [
  { value: "paypal", title: "Paypal", icon: AtSignIcon },
  { value: "apple-pay", title: "Apple Pay", icon: PhoneIcon },
  { value: "card", title: "Card", icon: ShoppingCartIcon },
];

/**
 * `orientation` is a recipe variant, and a variant resolves to one value — so it is the one prop on
 * this component a responsive object cannot answer. The way round it is two groups and a `display`
 * that swaps them, which is the alternative the React version's page names beside its own
 * `useBreakpointValue` answer.
 *
 * The `display` sits on a `Box` rather than on the group, so Panda reads it off a JSX element it
 * knows is styled — a style prop on a component of your own is a value its extractor never sees, and
 * a class it never generated renders nothing and raises nothing.
 *
 * Both are real radio groups, so the pair shares one `name`: a form submits one value however wide
 * the window is.
 */
export default function RadioCardWithResponsiveOrientation() {
  return (
    <>
      <Box display={{ base: "block", md: "none" }}>
        <PaymentMethods orientation="horizontal" />
      </Box>
      <Box display={{ base: "none", md: "block" }}>
        <PaymentMethods orientation="vertical" />
      </Box>
    </>
  );
}

const PaymentMethods = (props: { orientation: "horizontal" | "vertical" }) => (
  <RadioCard.Root
    name="payment-method"
    orientation={props.orientation}
    align="center"
    maxW="400px"
    defaultValue="paypal"
  >
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
