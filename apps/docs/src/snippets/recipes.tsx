import { Box } from "chakra-ui-solid";
import { cva } from "../../styled-system/css";

const badge = cva({
  base: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: "l1",
    fontWeight: "medium",
    px: "3",
    py: "1",
  },
  variants: {
    tone: {
      subtle: { bg: "colorPalette.subtle", color: "colorPalette.fg" },
      solid: { bg: "colorPalette.solid", color: "colorPalette.contrast" },
    },
  },
  defaultVariants: { tone: "subtle" },
});

export function Badge() {
  return (
    <Box colorPalette="teal" display="flex" gap="2">
      <Box class={badge()}>Draft</Box>
      <Box class={badge({ tone: "solid" })}>Shipped</Box>
    </Box>
  );
}
