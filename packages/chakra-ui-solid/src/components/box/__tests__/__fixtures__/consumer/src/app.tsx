import {
  AbsoluteCenter,
  AspectRatio,
  Bleed,
  Box,
  Button,
  CardBody,
  CardRoot,
  CardTitle,
  Center,
  Circle,
  Container,
  chakra,
  Dialog,
  Em,
  Field,
  Flex,
  Float,
  Grid,
  GridItem,
  Group,
  Quote,
  SimpleGrid,
  Spacer,
  Span,
  Square,
  Stack,
  StackSeparator,
  Sticky,
  Strong,
  Tabs,
  VisuallyHidden,
  Wrap,
  WrapItem,
} from "chakra-ui-solid";
import { flex } from "../styled-system-app/patterns";

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

/**
 * A pattern called out of **their own outdir**, which is ordinary Panda usage and the one thing in
 * this file that our `importMap` decides rather than merely permits.
 *
 * `css()` is matched by identifier and extracts from any specifier; a pattern or a recipe is matched
 * only through the import map, and the entry that keeps `./styled-system-app/patterns` on it is the
 * `{ jsx: … }` object in `LOCKED` — an object entry leaves every key it does not name at Panda's
 * `<outdir>` default. Spelled as a bare string instead, this line produces zero rules and nothing
 * says so. `layout-extraction.test.ts` reads the answer out of their sheet.
 */
export const gutter = flex({ gap: "13px" });

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

/**
 * The layout tier as a consumer writes it.
 *
 * Half of these names — `Center`, `Square`, `Circle`, `Spacer`, `VisuallyHidden` — are also the
 * JSX names of Panda's own *patterns*, so a consumer's extractor runs the pattern's mapping over
 * these lines whether or not they imported anything from `styled-system/patterns`. That is why the
 * components reuse `pattern.raw()` rather than re-implementing the mapping: it is the only way the
 * class our runtime computes and the rule their build emits can be guaranteed to be the same one.
 */
const LayoutTier = () => (
  <Span fontSize="sm">
    <AbsoluteCenter axis="horizontal" />
    <Center inline p="2" />
    <Circle size="12" />
    <Em letterSpacing="wide" />
    <Quote color="fg.muted" />
    <Spacer />
    <Square size="12" />
    <Sticky top="2" />
    <Strong textTransform="uppercase" />
    <VisuallyHidden />

    <Flex direction="row-reverse" align="center" grow="1" />
    <Grid templateColumns="repeat(3, 1fr)" gap="6">
      <GridItem colSpan={2} />
    </Grid>
    <Group attached grow align="stretch" />
    <Stack direction="row" justify="space-evenly" gap="3" separator={StackSeparator} />
    <Wrap justify="space-around" gap="3">
      <WrapItem />
    </Wrap>

    <Container centerContent px="10" />
    <AspectRatio ratio={16 / 9} />
    <Bleed inline="4" blockEnd="2" />
    <Float placement="bottom-center" offset="1" />
    <SimpleGrid columns={4} />
  </Span>
);

/**
 * The recipe tier, which reaches their sheet by a different route than everything above it: a recipe
 * is named by a **key** at render time, so nothing in this file is what Panda extracts it from — the
 * import specifier is, through the gate `defineChakraConfig()` appends. Both kinds are here because
 * an atomic recipe is one class and a slot recipe is one per part.
 */
const RecipeTier = () => (
  <Box>
    <Button size="lg">Save</Button>
    <CardRoot>
      <CardTitle>Total</CardTitle>
      <CardBody />
    </CardRoot>
  </Box>
);

/**
 * The three things only this config can decide, each written the way a consumer writes it.
 *
 * They are here for the usual reason every other line in this file is — extraction is a source scan,
 * so a rule for `elevation="high"`, for `_supportsGrid` and for `tone="brand"` exists in their sheet
 * only because these lines do. What is *new* about them is that they are also the type gate: none of
 * the three type-checks unless `panda codegen` wrote `chakra-system-types.d.ts` beside the system
 * module, and this file sits in a typechecked tree.
 */
const ConsumerAdditions = () => (
  <Box elevation="high" _supportsGrid={{ display: "grid", gap: "4" }}>
    <Button tone="brand">Brand</Button>
  </Box>
);

/**
 * The variant key again, on the three shapes a **slot recipe** reaches a Root in — one per shape
 * rather than one per component, because the other six Roots in the library are one of these three.
 *
 * `Tabs.Root` renders its own element, `Dialog.Root` renders none and publishes a class per slot to
 * its parts, and `Field.Root` is hand-written over the slot-recipe seam. All three read the key list
 * off the recipe *this* config produced, so `tone` is fed to the recipe instead of landing on an
 * element as an attribute — and each line here is the type half of that, since `tone` is on
 * `PresetVariantProps<"tabs">` and friends only because `panda codegen` wrote the matching
 * `RecipeVariantOverrides` row.
 */
const ConsumerSlotVariants = () => (
  <Box>
    <Tabs.Root tone="brand" defaultValue="one">
      <Tabs.List>
        <Tabs.Trigger value="one">One</Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="one">First</Tabs.Content>
    </Tabs.Root>

    <Dialog.Root tone="brand" defaultOpen>
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Title>Delete file</Dialog.Title>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>

    <Field.Root tone="brand">
      <Field.Label>Email</Field.Label>
    </Field.Root>
  </Box>
);

/**
 * The same two names one level in, which is the gate on *which* interfaces the generated
 * declarations augment.
 *
 * A pair of interfaces of our own can only be mixed into the JSX props, so a custom name is a
 * top-level prop and an unknown key everywhere else. Augmenting Panda's `SystemProperties` and
 * `Conditions` puts it in every style object the library has — `css`, a condition, a condition
 * inside a condition — and each line below is one of those positions failing to compile if that
 * stops being true.
 *
 * `data-hover` is what makes the hover half assertable: Chakra spells `_hover` as
 * `&:is(:hover, [data-hover])`, so the attribute matches with no pointer involved.
 */
const NestedConsumerAdditions = () => (
  <Box css={{ elevation: "high", _supportsGrid: { display: "grid", gap: "4" } }}>
    <Box data-hover _hover={{ elevation: "low", _supportsGrid: { columnGap: "4" } }} />
  </Box>
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
    <LayoutTier />
    <RecipeTier />
    <ConsumerAdditions />
    <ConsumerSlotVariants />
    <NestedConsumerAdditions />
  </Box>
);
