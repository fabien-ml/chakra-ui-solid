import { AbsoluteCenter, Box, HStack, Span, VStack } from "@chakra-ui-solid/components";
import { For } from "solid-js";

const axes = ["horizontal", "vertical", "both"] as const;

export default function AbsoluteCenterWithRtl() {
  return (
    <VStack gap="6" align="stretch">
      <For each={axes}>
        {(axis) => (
          <VStack gap="2" dir="rtl">
            <Box as="p" fontWeight="medium">
              RTL ({axis})
            </Box>
            <Box
              position="relative"
              h="100px"
              bg="bg.muted"
              borderRadius="md"
              outline="1px solid red"
            >
              <AbsoluteCenter axis={axis}>
                <HStack bg="green.solid" color="white" px="4" py="2" borderRadius="md" gap="2">
                  <Span>البداية</Span>
                </HStack>
              </AbsoluteCenter>
            </Box>
          </VStack>
        )}
      </For>
    </VStack>
  );
}
