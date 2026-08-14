import { Spinner, Text, VStack } from "chakra-ui-solid";

/**
 * The label reads `colorPalette.fg` where the React version reads `colorPalette.600`.
 *
 * `teal.600` on the panel is 3.7:1 — a real WCAG AA failure for 16px text, which axe reports as a
 * violation and the examples suite refuses. `colorPalette.fg` is the token the preset ships for
 * text on a plain background (`teal.700` in light, `teal.300` in dark) and measures 7.2:1. The
 * spinner keeps `600`: it carries no text, so no contrast rule applies to it.
 */
export default function SpinnerWithLabel() {
  return (
    <VStack colorPalette="teal">
      <Spinner color="colorPalette.600" />
      <Text color="colorPalette.fg">Loading...</Text>
    </VStack>
  );
}
