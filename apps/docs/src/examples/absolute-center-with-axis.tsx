import { AbsoluteCenter, Box, VStack } from "@chakra-ui-solid/components";
import { For } from "solid-js";

const axes = ["horizontal", "vertical", "both"] as const;

export default function AbsoluteCenterWithAxis() {
  return (
    <VStack gap="6" align="stretch">
      <For each={axes}>
        {(axis) => (
          <VStack gap="2">
            <Box as="p" fontWeight="medium">{`<AbsoluteCenter axis="${axis}" />`}</Box>
            <Box position="relative" h="80px" outline="1px solid red">
              <AbsoluteCenter axis={axis}>
                <Box bg="blue.solid" px="3" py="1" borderRadius="sm" color="white">
                  {axis}
                </Box>
              </AbsoluteCenter>
            </Box>
          </VStack>
        )}
      </For>
    </VStack>
  );
}
