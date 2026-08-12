import { HStack, IconButton, Text, VStack } from "chakra-ui-solid";
import { For } from "solid-js";
import { VoicemailIcon } from "../components/site/icons";

export default function IconButtonWithVariants() {
  return (
    <HStack wrap="wrap" gap="8">
      <For each={["solid", "subtle", "surface", "outline", "ghost"] as const}>
        {(variant) => (
          <VStack>
            <IconButton aria-label="Call support" variant={variant}>
              <VoicemailIcon />
            </IconButton>
            <Text textStyle="sm">{variant}</Text>
          </VStack>
        )}
      </For>
    </HStack>
  );
}
