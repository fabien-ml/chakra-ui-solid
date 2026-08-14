import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import * as barrel from "../index";
import {
  AbsoluteCenter,
  AspectRatio,
  Badge,
  BadgePropsProvider,
  Bleed,
  Box,
  Button,
  ButtonGroup,
  ButtonPropsProvider,
  Center,
  Checkmark,
  Circle,
  CloseButton,
  Code,
  CodePropsProvider,
  CollapsibleContent,
  CollapsibleContext,
  CollapsibleIndicator,
  CollapsiblePropsProvider,
  CollapsibleRoot,
  CollapsibleRootProvider,
  CollapsibleTrigger,
  ColorSwatch,
  ColorSwatchMix,
  ColorSwatchPropsProvider,
  Container,
  createCollapsible,
  createDialog,
  createPopover,
  DialogActionTrigger,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogContext,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogPropsProvider,
  DialogRoot,
  DialogRootProvider,
  DialogTitle,
  DialogTrigger,
  Em,
  EnvironmentProvider,
  FieldContext,
  FieldErrorIcon,
  FieldErrorText,
  FieldHelperText,
  FieldItem,
  FieldLabel,
  FieldPropsProvider,
  FieldRequiredIndicator,
  FieldRoot,
  Flex,
  Float,
  Grid,
  GridItem,
  Group,
  Heading,
  HeadingPropsProvider,
  HStack,
  Icon,
  IconButton,
  IconPropsProvider,
  Input,
  InputPropsProvider,
  Kbd,
  KbdPropsProvider,
  Link,
  LinkBox,
  LinkOverlay,
  LinkPropsProvider,
  Loader,
  LoaderOverlay,
  LocaleProvider,
  Mark,
  MarkPropsProvider,
  PopoverAnchor,
  PopoverArrow,
  PopoverArrowTip,
  PopoverBody,
  PopoverCloseTrigger,
  PopoverContent,
  PopoverContext,
  PopoverDescription,
  PopoverFooter,
  PopoverHeader,
  PopoverPositioner,
  PopoverPropsProvider,
  PopoverRoot,
  PopoverRootProvider,
  PopoverTitle,
  PopoverTrigger,
  Quote,
  Radiomark,
  Separator,
  SeparatorPropsProvider,
  SimpleGrid,
  Skeleton,
  SkeletonCircle,
  SkeletonPropsProvider,
  SkeletonText,
  SkipNavContent,
  SkipNavLink,
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
  Badge: () => <Badge colorPalette="green">New</Badge>,
  BadgePropsProvider: () => (
    <BadgePropsProvider value={{ size: "lg" }}>
      <Badge>New</Badge>
    </BadgePropsProvider>
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
  // Checked, because that is the arm that draws a glyph — the unchecked one renders an empty `svg`
  // and would pass the "did any element come back" check with the whole `Switch` dead.
  Checkmark: () => <Checkmark checked />,
  Circle: () => <Circle size="10">1</Circle>,
  // Its default ✕ is a leaf `<svg>` written inside the component rather than hoisted beside it —
  // JSX at module scope is constructed at *import* time and 500s the route before anything renders.
  CloseButton: () => <CloseButton />,
  // Open, because that is the branch whose content element exists: a closed one still renders (it
  // carries `hidden`), but an open one is the state the machine's `initialState` had to reach on a
  // server where `onSettled` never runs.
  CollapsibleContent: () => (
    <CollapsibleRoot defaultOpen>
      <CollapsibleContent>body</CollapsibleContent>
    </CollapsibleRoot>
  ),
  CollapsibleContext: () => (
    <CollapsibleRoot>
      <CollapsibleContext>
        {(collapsible) => <span>{collapsible.open ? "open" : "closed"}</span>}
      </CollapsibleContext>
    </CollapsibleRoot>
  ),
  CollapsibleIndicator: () => (
    <CollapsibleRoot>
      <CollapsibleIndicator>▾</CollapsibleIndicator>
    </CollapsibleRoot>
  ),
  CollapsiblePropsProvider: () => (
    <CollapsiblePropsProvider value={{ defaultOpen: true }}>
      <CollapsibleRoot>
        <CollapsibleContent>body</CollapsibleContent>
      </CollapsibleRoot>
    </CollapsiblePropsProvider>
  ),
  CollapsibleRoot: () => (
    <CollapsibleRoot>
      <CollapsibleTrigger>Show</CollapsibleTrigger>
    </CollapsibleRoot>
  ),
  // The one subject that starts its machine outside the component that renders it, which is the
  // path a server render would take through `createCollapsible` with no Root above it.
  CollapsibleRootProvider: () => {
    const Subject = () => {
      const collapsible = createCollapsible({ defaultOpen: true });
      return (
        <CollapsibleRootProvider value={collapsible}>
          <CollapsibleContent>body</CollapsibleContent>
        </CollapsibleRootProvider>
      );
    };
    return <Subject />;
  },
  CollapsibleTrigger: () => (
    <CollapsibleRoot>
      <CollapsibleTrigger>Show</CollapsibleTrigger>
    </CollapsibleRoot>
  ),
  // Its colour is an inline `style`, not a class — the one component whose whole appearance is
  // missing from the server's markup if the custom property is not written there.
  ColorSwatch: () => <ColorSwatch value="#bada55" />,
  // Three colours, because that is the arm with a spanning last cell: two colours render a plain
  // grid and would exercise neither the span nor the `width: unset` beside it.
  ColorSwatchMix: () => <ColorSwatchMix items={["red", "pink", "green"]} />,
  ColorSwatchPropsProvider: () => (
    <ColorSwatchPropsProvider value={{ shape: "circle" }}>
      <ColorSwatch value="#bada55" />
    </ColorSwatchPropsProvider>
  ),
  Code: () => <Code>console.log()</Code>,
  CodePropsProvider: () => (
    <CodePropsProvider value={{ size: "lg" }}>
      <Code>console.log()</Code>
    </CodePropsProvider>
  ),
  Container: () => <Container>page</Container>,
  // Chakra defaults `lazyMount` and `unmountOnExit` to `true` on Dialog, so a closed dialog's
  // backdrop, positioner and content are not in the served markup at all. Every gated subject below
  // opts out with `lazyMount={false}`, which is what leaves an element for this suite to find; the
  // defaults are `dialog.ssr.test.tsx`'s subject instead.
  DialogActionTrigger: () => (
    <DialogRoot>
      <DialogActionTrigger>Cancel</DialogActionTrigger>
    </DialogRoot>
  ),
  DialogBackdrop: () => (
    <DialogRoot lazyMount={false}>
      <DialogBackdrop />
    </DialogRoot>
  ),
  DialogBody: () => (
    <DialogRoot>
      <DialogBody>body</DialogBody>
    </DialogRoot>
  ),
  DialogCloseTrigger: () => (
    <DialogRoot>
      <DialogCloseTrigger>✕</DialogCloseTrigger>
    </DialogRoot>
  ),
  DialogContent: () => (
    <DialogRoot lazyMount={false}>
      <DialogContent>body</DialogContent>
    </DialogRoot>
  ),
  DialogContext: () => (
    <DialogRoot>
      <DialogContext>{(dialog) => <span>{dialog.open ? "open" : "closed"}</span>}</DialogContext>
    </DialogRoot>
  ),
  DialogDescription: () => (
    <DialogRoot>
      <DialogDescription>This cannot be undone.</DialogDescription>
    </DialogRoot>
  ),
  DialogFooter: () => (
    <DialogRoot>
      <DialogFooter>actions</DialogFooter>
    </DialogRoot>
  ),
  DialogHeader: () => (
    <DialogRoot>
      <DialogHeader>head</DialogHeader>
    </DialogRoot>
  ),
  DialogPositioner: () => (
    <DialogRoot lazyMount={false}>
      <DialogPositioner>placed</DialogPositioner>
    </DialogRoot>
  ),
  DialogPropsProvider: () => (
    <DialogPropsProvider value={{ lazyMount: false }}>
      <DialogRoot>
        <DialogContent>body</DialogContent>
      </DialogRoot>
    </DialogPropsProvider>
  ),
  // The Root renders no element of its own — `dialog.anatomy` has no `root` part — so the trigger is
  // what makes this subject produce markup at all.
  DialogRoot: () => (
    <DialogRoot>
      <DialogTrigger>Open</DialogTrigger>
    </DialogRoot>
  ),
  // The one subject that starts its machine outside the component that renders it, and the one open
  // dialog in this file: `defaultOpen` is the state the presence machine has to reach on a server
  // where no effect ever runs.
  DialogRootProvider: () => {
    const Subject = () => {
      const dialog = createDialog({ defaultOpen: true });
      return (
        <DialogRootProvider value={dialog}>
          <DialogContent>body</DialogContent>
        </DialogRootProvider>
      );
    };
    return <Subject />;
  },
  DialogTitle: () => (
    <DialogRoot>
      <DialogTitle>Delete file</DialogTitle>
    </DialogRoot>
  ),
  DialogTrigger: () => (
    <DialogRoot>
      <DialogTrigger>Open</DialogTrigger>
    </DialogRoot>
  ),
  Em: () => <Em>emphasis</Em>,
  // Given no `value` it renders a probe element and discovers its root node from a ref, which is a
  // client-only answer — so what this asserts is that the discovery path is deferred rather than
  // attempted where there is no `document`.
  EnvironmentProvider: () => (
    <EnvironmentProvider>
      <span>scoped</span>
    </EnvironmentProvider>
  ),
  FieldContext: () => (
    <FieldRoot>
      <FieldContext>{(field) => <span>{field.ids.control}</span>}</FieldContext>
    </FieldRoot>
  ),
  FieldErrorIcon: () => <FieldErrorIcon />,
  // `invalid`, because that is the arm with an element: a valid field renders no error text at all,
  // and the subject would come back as its Root's empty `div`.
  FieldErrorText: () => (
    <FieldRoot invalid>
      <FieldErrorText>Enter an email address</FieldErrorText>
    </FieldRoot>
  ),
  FieldHelperText: () => (
    <FieldRoot>
      <FieldHelperText>We never share it.</FieldHelperText>
    </FieldRoot>
  ),
  FieldItem: () => (
    <FieldRoot target="red">
      <FieldItem value="red">
        <FieldLabel>Red</FieldLabel>
      </FieldItem>
    </FieldRoot>
  ),
  FieldLabel: () => (
    <FieldRoot>
      <FieldLabel>Email</FieldLabel>
    </FieldRoot>
  ),
  FieldPropsProvider: () => (
    <FieldPropsProvider value={{ required: true }}>
      <FieldRoot>
        <FieldRequiredIndicator />
      </FieldRoot>
    </FieldPropsProvider>
  ),
  // `required`, because that is the arm that renders the indicator — an optional field renders its
  // `fallback`, which is nothing unless the caller passed one.
  FieldRequiredIndicator: () => (
    <FieldRoot required>
      <FieldRequiredIndicator />
    </FieldRoot>
  ),
  FieldRoot: () => (
    <FieldRoot>
      <FieldLabel>Email</FieldLabel>
    </FieldRoot>
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
  Icon: () => (
    <Icon size="lg">
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  ),
  IconButton: () => (
    <IconButton aria-label="Search">
      <span>⌕</span>
    </IconButton>
  ),
  IconPropsProvider: () => (
    <IconPropsProvider value={{ size: "sm" }}>
      <Icon />
    </IconPropsProvider>
  ),
  Input: () => <Input placeholder="Enter your email" size="lg" />,
  InputPropsProvider: () => (
    <InputPropsProvider value={{ size: "lg" }}>
      <Input />
    </InputPropsProvider>
  ),
  Kbd: () => <Kbd>Shift + Tab</Kbd>,
  KbdPropsProvider: () => (
    <KbdPropsProvider value={{ size: "lg" }}>
      <Kbd>⌘</Kbd>
    </KbdPropsProvider>
  ),
  Link: () => <Link href="#target">Visit</Link>,
  // The pair, because the box's rule is written *about* the overlay's class name — rendered apart
  // they would each produce an element and prove nothing about the selector that joins them.
  LinkBox: () => (
    <LinkBox as="article">
      <LinkOverlay href="#target">Chakra V3 Workshop</LinkOverlay>
    </LinkBox>
  ),
  LinkOverlay: () => <LinkOverlay href="#target">Read more</LinkOverlay>,
  LinkPropsProvider: () => (
    <LinkPropsProvider value={{ variant: "underline" }}>
      <Link href="#target">Visit</Link>
    </LinkPropsProvider>
  ),
  Loader: () => <Loader text="Saving…">Save</Loader>,
  LoaderOverlay: () => <LoaderOverlay>loading</LoaderOverlay>,
  LocaleProvider: () => (
    <LocaleProvider locale="ar-AE">
      <span>مرحبا</span>
    </LocaleProvider>
  ),
  // The inversion of the Dialog block above, and the reason none of these carries a render-strategy
  // prop: `popover.tsx` hands `withRootProvider` no options object, so `createRenderStrategy`'s own
  // `false`/`false` stand and a closed popover's positioner and content are in the served markup
  // from the first render. Bare roots are the real default shape here; the lazy one is
  // `popover.ssr.test.tsx`'s subject instead.
  Mark: () => <Mark variant="subtle">design system</Mark>,
  MarkPropsProvider: () => (
    <MarkPropsProvider value={{ variant: "solid" }}>
      <Mark>design system</Mark>
    </MarkPropsProvider>
  ),
  PopoverAnchor: () => (
    <PopoverRoot>
      <PopoverAnchor>anchored</PopoverAnchor>
    </PopoverRoot>
  ),
  // Given no child it resolves its default `<PopoverArrowTip />` through `children()`, which is the
  // one arm that constructs JSX inside the component body — hoisted beside the export it would run
  // at import time and 500 the route.
  PopoverArrow: () => (
    <PopoverRoot>
      <PopoverArrow />
    </PopoverRoot>
  ),
  PopoverArrowTip: () => (
    <PopoverRoot>
      <PopoverArrowTip />
    </PopoverRoot>
  ),
  PopoverBody: () => (
    <PopoverRoot>
      <PopoverBody>body</PopoverBody>
    </PopoverRoot>
  ),
  PopoverCloseTrigger: () => (
    <PopoverRoot>
      <PopoverCloseTrigger>✕</PopoverCloseTrigger>
    </PopoverRoot>
  ),
  PopoverContent: () => (
    <PopoverRoot>
      <PopoverContent>body</PopoverContent>
    </PopoverRoot>
  ),
  PopoverContext: () => (
    <PopoverRoot>
      <PopoverContext>
        {(popover) => <span>{popover.open ? "open" : "closed"}</span>}
      </PopoverContext>
    </PopoverRoot>
  ),
  PopoverDescription: () => (
    <PopoverRoot>
      <PopoverDescription>This cannot be undone.</PopoverDescription>
    </PopoverRoot>
  ),
  PopoverFooter: () => (
    <PopoverRoot>
      <PopoverFooter>actions</PopoverFooter>
    </PopoverRoot>
  ),
  PopoverHeader: () => (
    <PopoverRoot>
      <PopoverHeader>head</PopoverHeader>
    </PopoverRoot>
  ),
  PopoverPositioner: () => (
    <PopoverRoot>
      <PopoverPositioner>placed</PopoverPositioner>
    </PopoverRoot>
  ),
  PopoverPropsProvider: () => (
    <PopoverPropsProvider value={{ size: "sm" }}>
      <PopoverRoot>
        <PopoverContent>body</PopoverContent>
      </PopoverRoot>
    </PopoverPropsProvider>
  ),
  // The Root renders no element of its own — `popover.anatomy` has no `root` part — so the trigger is
  // what makes this subject produce markup at all.
  PopoverRoot: () => (
    <PopoverRoot>
      <PopoverTrigger>Open</PopoverTrigger>
    </PopoverRoot>
  ),
  // The one subject that starts its machine outside the component that renders it, and the one open
  // popover in this file: `defaultOpen` is the state the presence machine has to reach on a server
  // where no effect ever runs.
  PopoverRootProvider: () => {
    const Subject = () => {
      const popover = createPopover({ defaultOpen: true });
      return (
        <PopoverRootProvider value={popover}>
          <PopoverContent>body</PopoverContent>
        </PopoverRootProvider>
      );
    };
    return <Subject />;
  },
  PopoverTitle: () => (
    <PopoverRoot>
      <PopoverTitle>Delete file</PopoverTitle>
    </PopoverRoot>
  ),
  PopoverTrigger: () => (
    <PopoverRoot>
      <PopoverTrigger>Open</PopoverTrigger>
    </PopoverRoot>
  ),
  Quote: () => <Quote>quoted</Quote>,
  // Checked, because that is the arm that renders a child — the unchecked one is an empty `span`
  // and would pass the "did any element come back" check with the dot never built.
  Radiomark: () => <Radiomark checked />,
  // Responsive, because that is the arm whose `role` is decided rather than fixed: a conditional
  // orientation has no single `aria-orientation`, so the element drops to `presentation` — and the
  // server is where that decision has to be made, since no effect runs to correct it later.
  Separator: () => <Separator orientation={{ base: "vertical", sm: "horizontal" }} />,
  SeparatorPropsProvider: () => (
    <SeparatorPropsProvider value={{ size: "lg" }}>
      <Separator />
    </SeparatorPropsProvider>
  ),
  SimpleGrid: () => (
    <SimpleGrid columns={3}>
      <div>cell</div>
    </SimpleGrid>
  ),
  Skeleton: () => <Skeleton height="5" />,
  // One element built from two components — the Circle's computed props handed to the Skeleton
  // through `render` — so a server that resolved the composition differently would send a different
  // element rather than a differently-styled one.
  SkeletonCircle: () => <SkeletonCircle size="10" />,
  SkeletonPropsProvider: () => (
    <SkeletonPropsProvider value={{ variant: "shine" }}>
      <Skeleton height="5" />
    </SkeletonPropsProvider>
  ),
  // Loading, because that is the arm whose `<For>` really has a length — `loading={false}` collapses
  // it to one line and would exercise neither the count nor the short last line.
  SkeletonText: () => <SkeletonText noOfLines={3} />,
  SkipNavContent: () => <SkipNavContent>main</SkipNavContent>,
  SkipNavLink: () => <SkipNavLink>Skip to content</SkipNavLink>,
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
