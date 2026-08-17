import { Group, RadioCard } from "chakra-ui-solid";
import { For } from "solid-js";

const items = [
  { value: "advanced", title: "Advanced", description: "I love complex things" },
  { value: "professional", title: "Professional", description: "I can hack simple things" },
  { value: "beginner", title: "Beginner", description: "I don't write code" },
];

export default function RadioCardComposition() {
  return (
    <RadioCard.Root defaultValue="advanced" gap="4" maxW="sm">
      <RadioCard.Label>How well do you know SolidJS?</RadioCard.Label>
      <Group attached orientation="vertical">
        <For each={items}>
          {(item) => (
            <RadioCard.Item value={item.value} width="full">
              <RadioCard.ItemHiddenInput />
              <RadioCard.ItemControl>
                <RadioCard.ItemIndicator />
                <RadioCard.ItemContent>
                  <RadioCard.ItemText>{item.title}</RadioCard.ItemText>
                  <RadioCard.ItemDescription>{item.description}</RadioCard.ItemDescription>
                </RadioCard.ItemContent>
              </RadioCard.ItemControl>
            </RadioCard.Item>
          )}
        </For>
      </Group>
    </RadioCard.Root>
  );
}
