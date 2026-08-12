import { HStack, IconButton, Text, VStack } from "chakra-ui-solid";
import { For } from "solid-js";
import { PhoneIcon } from "../components/site/icons";

export default function IconButtonWithSizes() {
  return (
    <HStack wrap="wrap" gap="8">
      <For each={["xs", "sm", "md", "lg"] as const}>
        {(size) => (
          <VStack>
            <IconButton aria-label="Search database" variant="outline" size={size}>
              <PhoneIcon />
            </IconButton>
            <Text textStyle="sm">{size}</Text>
          </VStack>
        )}
      </For>
    </HStack>
  );
}
