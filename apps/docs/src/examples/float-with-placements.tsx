import { Box, Circle, Float, HStack, Stack } from "@chakra-ui-solid/components";
import { For } from "solid-js";

const placements = [
  "bottom-end",
  "bottom-start",
  "top-end",
  "top-start",
  "bottom-center",
  "top-center",
  "middle-center",
  "middle-end",
  "middle-start",
] as const;

export default function FloatWithPlacements() {
  return (
    <HStack gap="14" wrap="wrap">
      <For each={placements}>
        {(placement) => (
          <Stack gap="3">
            <Box as="p">{placement}</Box>
            <Box position="relative" width="80px" height="80px" bg="bg.emphasized">
              <Float placement={placement}>
                <Circle size="5" bg="red.solid" color="red.contrast">
                  3
                </Circle>
              </Float>
            </Box>
          </Stack>
        )}
      </For>
    </HStack>
  );
}
