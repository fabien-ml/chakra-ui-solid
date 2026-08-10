import { Box, Circle, Float, HStack, Stack } from "@chakra-ui-solid/components";
import type { JSX } from "@solidjs/web";

/**
 * The nine written out, where the React version maps over a list.
 *
 * `placement` decides four insets and a `translate`, and Panda generates those rules by reading
 * this file — so a placement it can only know at runtime reaches the element as a class with no
 * rule, and the badge lands wherever static position puts it (`CLAUDE.md`, *The hazard*). The
 * scaffolding around each one is a component; the `<Float>` line itself is not, because that is the
 * line the extractor has to be able to read.
 */
export default function FloatWithPlacements() {
  return (
    <HStack gap="14" wrap="wrap">
      <PlacementBox label="bottom-end">
        <Float placement="bottom-end">
          <Count />
        </Float>
      </PlacementBox>

      <PlacementBox label="bottom-start">
        <Float placement="bottom-start">
          <Count />
        </Float>
      </PlacementBox>

      <PlacementBox label="top-end">
        <Float placement="top-end">
          <Count />
        </Float>
      </PlacementBox>

      <PlacementBox label="top-start">
        <Float placement="top-start">
          <Count />
        </Float>
      </PlacementBox>

      <PlacementBox label="bottom-center">
        <Float placement="bottom-center">
          <Count />
        </Float>
      </PlacementBox>

      <PlacementBox label="top-center">
        <Float placement="top-center">
          <Count />
        </Float>
      </PlacementBox>

      <PlacementBox label="middle-center">
        <Float placement="middle-center">
          <Count />
        </Float>
      </PlacementBox>

      <PlacementBox label="middle-end">
        <Float placement="middle-end">
          <Count />
        </Float>
      </PlacementBox>

      <PlacementBox label="middle-start">
        <Float placement="middle-start">
          <Count />
        </Float>
      </PlacementBox>
    </HStack>
  );
}

/** The positioned parent every Float needs, plus the name of the placement being shown. */
function PlacementBox(props: { label: string; children: JSX.Element }) {
  return (
    <Stack gap="3">
      <Box as="p">{props.label}</Box>
      <Box position="relative" width="80px" height="80px" bg="bg.emphasized">
        {props.children}
      </Box>
    </Stack>
  );
}

const Count = () => (
  <Circle size="5" bg="red.solid" color="red.contrast">
    3
  </Circle>
);
