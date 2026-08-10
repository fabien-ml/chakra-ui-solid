import { Box, chakra } from "@chakra-ui-solid/components";

/**
 * A consumer's source file, and the only thing their Panda run scans.
 *
 * It is not compiled or rendered by any test — Panda reads it as **text**, which is the whole
 * point: extraction is a source scan, so what a consumer writes here is what ends up in their
 * stylesheet, and nothing about our components participates.
 *
 * The four `chakra` call forms below are here because they are the only place a
 * `jsxFactory` / `importMap` regression is visible. Every runtime test passes on a completely
 * unstyled element, so an unregistered factory emits zero rules with a green suite.
 */

/** Form 2 — the factory as a function, with a style config and no variants. */
const FactoryLink = chakra("a", {
  base: { textDecorationLine: "underline", color: "purple.500" },
});

/** Form 3 — a config with variants and a default. */
const FactoryButton = chakra("button", {
  base: { fontWeight: "bold" },
  variants: {
    tone: {
      solid: { background: "blue.600" },
      subtle: { background: "blue.100" },
    },
  },
  defaultVariants: { tone: "solid" },
});

/**
 * Form 4 — the options argument. `r` is a style prop to Panda, so without the SVG exception table
 * the circle would render with no radius; `defaultProps` is what supplies it here.
 */
const FactoryCircle = chakra(
  "circle",
  { base: { fill: "orange.500" } },
  { defaultProps: { r: 20 } },
);

export const App = () => (
  <Box p="4" bg="red.500" gapX="4">
    {/* Form 1 — the JSX namespace, and the form `isUpperCase` cannot rescue. */}
    <chakra.div marginTop="7" background="teal.400" />
    <FactoryLink href="/docs" paddingInline="3" />
    <FactoryButton tone="subtle" />
    <svg viewBox="0 0 40 40">
      <title>a circle</title>
      <FactoryCircle cx={20} cy={20} />
    </svg>
  </Box>
);
