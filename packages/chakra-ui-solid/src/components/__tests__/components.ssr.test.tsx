import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import * as barrel from "../index";
import {
  AbsoluteCenter,
  AspectRatio,
  Bleed,
  Box,
  Button,
  ButtonGroup,
  ButtonPropsProvider,
  Center,
  Circle,
  CloseButton,
  Container,
  Em,
  EnvironmentProvider,
  Flex,
  Float,
  Grid,
  GridItem,
  Group,
  Heading,
  HeadingPropsProvider,
  HStack,
  IconButton,
  Loader,
  LoaderOverlay,
  LocaleProvider,
  Quote,
  SimpleGrid,
  Spacer,
  Span,
  Spinner,
  SpinnerPropsProvider,
  Square,
  Stack,
  StackSeparator,
  Sticky,
  Strong,
  Text,
  TextPropsProvider,
  VisuallyHidden,
  VStack,
  Wrap,
  WrapItem,
} from "../index";

/**
 * Every exported component, rendered once on the server.
 *
 * This is the cheap half of the SSR contract, and it catches the two failures that take a whole
 * route down rather than one element:
 *
 * - **A JSX constant at module scope.** It is constructed at *import* time, in whatever runtime
 *   loaded the module, so a component that hoists its default icon or spinner out of its body 500s
 *   the page before any of it renders.
 * - **A DOM global read during render.** `child instanceof Element` is a `ReferenceError` on the
 *   server, not a `false` — the failure `Group` was written around, found by a docs page returning
 *   `Element is not defined` with every unit and browser test green.
 *
 * Neither is visible to the `browser` project, which has a DOM and imports in a client runtime, and
 * neither needs a per-component file to catch. The **expensive** half — that the server's markup
 * still hydrates — stays per-component and opt-in, because it costs a fixture entry and a bridge
 * registration each: `box`, `loader` and `button` carry one today.
 */
const SUBJECTS: Record<string, () => JSX.Element> = {
  AbsoluteCenter: () => <AbsoluteCenter>centred</AbsoluteCenter>,
  AspectRatio: () => (
    <AspectRatio ratio={16 / 9}>
      <div>media</div>
    </AspectRatio>
  ),
  Bleed: () => <Bleed inline="4">wide</Bleed>,
  Box: () => <Box p="4">boxed</Box>,
  // Loading, because that is the branch that mounts a Loader and resolves the children through
  // `children()` — the idle branch writes them straight in and would not exercise either.
  Button: () => (
    <Button loading loadingText="Saving…">
      Save
    </Button>
  ),
  ButtonGroup: () => (
    <ButtonGroup size="sm">
      <Button>One</Button>
    </ButtonGroup>
  ),
  ButtonPropsProvider: () => (
    <ButtonPropsProvider value={{ variant: "outline" }}>
      <Button>One</Button>
    </ButtonPropsProvider>
  ),
  Center: () => <Center>middle</Center>,
  Circle: () => <Circle size="10">1</Circle>,
  // Its default ✕ is a leaf `<svg>` written inside the component rather than hoisted beside it —
  // JSX at module scope is constructed at *import* time and 500s the route before anything renders.
  CloseButton: () => <CloseButton />,
  Container: () => <Container>page</Container>,
  Em: () => <Em>emphasis</Em>,
  // Given no `value` it renders a probe element and discovers its root node from a ref, which is a
  // client-only answer — so what this asserts is that the discovery path is deferred rather than
  // attempted where there is no `document`.
  EnvironmentProvider: () => (
    <EnvironmentProvider>
      <span>scoped</span>
    </EnvironmentProvider>
  ),
  Flex: () => <Flex direction="column">row</Flex>,
  Float: () => <Float placement="top-end">3</Float>,
  Grid: () => (
    <Grid templateColumns="repeat(2, 1fr)">
      <div>cell</div>
    </Grid>
  ),
  GridItem: () => <GridItem colSpan={2}>cell</GridItem>,
  // Two children and `attached`, which is the shape whose decoration is client-only: the server
  // sends no `data-first`, and asserting that it sends the markup anyway is `group.ssr.test.tsx`'s.
  Group: () => (
    <Group attached>
      <button type="button">one</button>
      <button type="button">two</button>
    </Group>
  ),
  HStack: () => <HStack>side by side</HStack>,
  Heading: () => <Heading size="lg">Title</Heading>,
  HeadingPropsProvider: () => (
    <HeadingPropsProvider value={{ size: "sm" }}>
      <Heading>Title</Heading>
    </HeadingPropsProvider>
  ),
  IconButton: () => (
    <IconButton aria-label="Search">
      <span>⌕</span>
    </IconButton>
  ),
  Loader: () => <Loader text="Saving…">Save</Loader>,
  LoaderOverlay: () => <LoaderOverlay>loading</LoaderOverlay>,
  LocaleProvider: () => (
    <LocaleProvider locale="ar-AE">
      <span>مرحبا</span>
    </LocaleProvider>
  ),
  Quote: () => <Quote>quoted</Quote>,
  SimpleGrid: () => (
    <SimpleGrid columns={3}>
      <div>cell</div>
    </SimpleGrid>
  ),
  Spacer: () => <Spacer />,
  Span: () => <Span>inline</Span>,
  Spinner: () => <Spinner size="lg" />,
  SpinnerPropsProvider: () => (
    <SpinnerPropsProvider value={{ size: "sm" }}>
      <Spinner />
    </SpinnerPropsProvider>
  ),
  Square: () => <Square size="10">1</Square>,
  Stack: () => <Stack gap="4">stacked</Stack>,
  StackSeparator: () => <StackSeparator />,
  Sticky: () => <Sticky top="0">pinned</Sticky>,
  Strong: () => <Strong>bold</Strong>,
  Text: () => <Text textStyle="lg">paragraph</Text>,
  TextPropsProvider: () => (
    <TextPropsProvider value={{ textStyle: "sm" }}>
      <Text>paragraph</Text>
    </TextPropsProvider>
  ),
  VStack: () => <VStack>one above the other</VStack>,
  VisuallyHidden: () => <VisuallyHidden>screen readers only</VisuallyHidden>,
  Wrap: () => (
    <Wrap>
      <WrapItem>tag</WrapItem>
    </Wrap>
  ),
  WrapItem: () => <WrapItem>tag</WrapItem>,
};

describe("every exported component renders on the server", () => {
  it.each(Object.keys(SUBJECTS))("%s", async (name) => {
    const render = SUBJECTS[name];
    if (render === undefined) {
      throw new Error(`no subject registered for ${name}`);
    }

    const html = await renderToStream(render);

    // An element, not merely a non-empty string: a component that server-rendered to its children
    // and nothing else would pass a length check while having dropped its own markup.
    expect(html).toMatch(/<[a-z]/);
  });

  it("has a subject for every component the barrel exports", () => {
    // Asserted against the **real module** rather than a list a script greps out of this file, so a
    // component added to the barrel and not to `SUBJECTS` fails here rather than going unrendered.
    // Lowercase exports are the factory and the hooks (`chakra`, `useFilter`, `visuallyHiddenStyle`);
    // types are erased and never reach this object.
    const exported = Object.entries(barrel)
      .filter(([name, value]) => /^[A-Z]/.test(name) && typeof value === "function")
      .map(([name]) => name);

    expect(Object.keys(SUBJECTS).sort()).toEqual(exported.sort());
  });
});
