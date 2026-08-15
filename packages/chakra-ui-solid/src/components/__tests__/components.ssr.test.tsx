import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import * as barrel from "../index";
import {
  AbsoluteCenter,
  AlertContent,
  AlertDescription,
  AlertIndicator,
  AlertPropsProvider,
  AlertRoot,
  AlertTitle,
  AspectRatio,
  Badge,
  BadgePropsProvider,
  Bleed,
  BlockquoteCaption,
  BlockquoteContent,
  BlockquoteIcon,
  BlockquotePropsProvider,
  BlockquoteRoot,
  Box,
  BreadcrumbCurrentLink,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPropsProvider,
  BreadcrumbRoot,
  BreadcrumbSeparator,
  Button,
  ButtonGroup,
  ButtonPropsProvider,
  CardBody,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPropsProvider,
  CardRoot,
  CardTitle,
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
  ContainerPropsProvider,
  createCollapsible,
  createDialog,
  createPopover,
  createTabs,
  DataListItem,
  DataListItemLabel,
  DataListItemValue,
  DataListPropsProvider,
  DataListRoot,
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
  DownloadTrigger,
  Em,
  EmptyStateContent,
  EmptyStateDescription,
  EmptyStateIndicator,
  EmptyStatePropsProvider,
  EmptyStateRoot,
  EmptyStateTitle,
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
  FieldsetContent,
  FieldsetContext,
  FieldsetErrorText,
  FieldsetHelperText,
  FieldsetLegend,
  FieldsetRoot,
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
  ListIndicator,
  ListItem,
  ListRoot,
  ListRootPropsProvider,
  Loader,
  LoaderOverlay,
  LocaleProvider,
  Mark,
  MarkPropsProvider,
  NativeSelectField,
  NativeSelectIndicator,
  NativeSelectPropsProvider,
  NativeSelectRoot,
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
  StatDownIndicator,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatPropsProvider,
  StatRoot,
  StatUpIndicator,
  StatusIndicator,
  StatusPropsProvider,
  StatusRoot,
  StatValueText,
  StatValueUnit,
  Sticky,
  Strong,
  TableBody,
  TableCaption,
  TableCell,
  TableColumn,
  TableColumnGroup,
  TableColumnHeader,
  TableFooter,
  TableHeader,
  TableRoot,
  TableRootPropsProvider,
  TableRow,
  TableScrollArea,
  TabsContent,
  TabsContentGroup,
  TabsContext,
  TabsIndicator,
  TabsList,
  TabsPropsProvider,
  TabsRoot,
  TabsRootProvider,
  TabsTrigger,
  TagCloseTrigger,
  TagEndElement,
  TagLabel,
  TagRoot,
  TagRootPropsProvider,
  TagStartElement,
  Text,
  Textarea,
  TextareaPropsProvider,
  TextPropsProvider,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineIndicator,
  TimelineItem,
  TimelineRoot,
  TimelineRootPropsProvider,
  TimelineSeparator,
  TimelineTitle,
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
  // `error`, because that is a status whose glyph is shared with `warning` — the map has to be read
  // rather than guessed — and the indicator's default children are built on the server, where a JSX
  // constant hoisted beside the component would already have been constructed at import time.
  AlertContent: () => (
    <AlertRoot status="error">
      <AlertContent>
        <AlertTitle>Invalid fields</AlertTitle>
      </AlertContent>
    </AlertRoot>
  ),
  AlertDescription: () => (
    <AlertRoot>
      <AlertDescription>Please fix them and try again.</AlertDescription>
    </AlertRoot>
  ),
  AlertIndicator: () => (
    <AlertRoot status="success">
      <AlertIndicator />
    </AlertRoot>
  ),
  // Responsive, because that is the arm where the status names no single glyph and the indicator
  // draws nothing — the branch a server has to take the same way the client will.
  AlertPropsProvider: () => (
    <AlertPropsProvider value={{ variant: "solid" }}>
      <AlertRoot>
        <AlertTitle>Heads up</AlertTitle>
      </AlertRoot>
    </AlertPropsProvider>
  ),
  AlertRoot: () => (
    <AlertRoot status={{ base: "info", md: "warning" }}>
      <AlertIndicator />
      <AlertTitle>Heads up</AlertTitle>
    </AlertRoot>
  ),
  AlertTitle: () => (
    <AlertRoot>
      <AlertTitle>Heads up</AlertTitle>
    </AlertRoot>
  ),
  Badge: () => <Badge colorPalette="green">New</Badge>,
  BadgePropsProvider: () => (
    <BadgePropsProvider value={{ size: "lg" }}>
      <Badge>New</Badge>
    </BadgePropsProvider>
  ),
  Bleed: () => <Bleed inline="4">wide</Bleed>,
  BlockquoteCaption: () => (
    <BlockquoteRoot>
      <BlockquoteCaption>Uzumaki Naruto</BlockquoteCaption>
    </BlockquoteRoot>
  ),
  BlockquoteContent: () => (
    <BlockquoteRoot>
      <BlockquoteContent cite="https://example.com">Quoted.</BlockquoteContent>
    </BlockquoteRoot>
  ),
  // The one part of this family whose element is a **component** rather than a tag, so the slot's
  // class has to survive being handed to `chakra.svg` rather than written on a host element.
  BlockquoteIcon: () => (
    <BlockquoteRoot variant="plain">
      <BlockquoteIcon />
    </BlockquoteRoot>
  ),
  BlockquotePropsProvider: () => (
    <BlockquotePropsProvider value={{ variant: "solid" }}>
      <BlockquoteRoot>
        <BlockquoteContent>Quoted.</BlockquoteContent>
      </BlockquoteRoot>
    </BlockquotePropsProvider>
  ),
  BlockquoteRoot: () => (
    <BlockquoteRoot justify="center">
      <BlockquoteContent>Quoted.</BlockquoteContent>
    </BlockquoteRoot>
  ),
  Box: () => <Box p="4">boxed</Box>,
  BreadcrumbCurrentLink: () => (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbCurrentLink>Props</BreadcrumbCurrentLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  ),
  // Bare, because that is the arm whose glyph the component builds itself — a child of the
  // consumer's own would leave the default `<EllpsisIcon />` unconstructed on the server.
  BreadcrumbEllipsis: () => (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbEllipsis />
      </BreadcrumbList>
    </BreadcrumbRoot>
  ),
  BreadcrumbItem: () => (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Docs</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  ),
  BreadcrumbLink: () => (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Docs</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  ),
  BreadcrumbList: () => (
    <BreadcrumbRoot>
      <BreadcrumbList gap="4">
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Docs</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  ),
  BreadcrumbPropsProvider: () => (
    <BreadcrumbPropsProvider value={{ variant: "underline" }}>
      <BreadcrumbRoot>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Docs</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </BreadcrumbRoot>
    </BreadcrumbPropsProvider>
  ),
  BreadcrumbRoot: () => (
    <BreadcrumbRoot size="lg">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Docs</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </BreadcrumbRoot>
  ),
  // Bare, for the reason `BreadcrumbEllipsis` is: the default `<ChevronRightIcon />` is built here
  // and nowhere else.
  BreadcrumbSeparator: () => (
    <BreadcrumbRoot>
      <BreadcrumbList>
        <BreadcrumbSeparator />
      </BreadcrumbList>
    </BreadcrumbRoot>
  ),
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
  CardBody: () => (
    <CardRoot>
      <CardBody>body</CardBody>
    </CardRoot>
  ),
  CardDescription: () => (
    <CardRoot>
      <CardDescription>About one subject.</CardDescription>
    </CardRoot>
  ),
  CardFooter: () => (
    <CardRoot>
      <CardFooter>actions</CardFooter>
    </CardRoot>
  ),
  CardHeader: () => (
    <CardRoot>
      <CardHeader>head</CardHeader>
    </CardRoot>
  ),
  CardPropsProvider: () => (
    <CardPropsProvider value={{ size: "lg" }}>
      <CardRoot>
        <CardBody>body</CardBody>
      </CardRoot>
    </CardPropsProvider>
  ),
  CardRoot: () => (
    <CardRoot variant="elevated">
      <CardBody>body</CardBody>
    </CardRoot>
  ),
  CardTitle: () => (
    <CardRoot>
      <CardTitle>Nue Camp</CardTitle>
    </CardRoot>
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
  ContainerPropsProvider: () => (
    <ContainerPropsProvider value={{ fluid: true }}>
      <Container>page</Container>
    </ContainerPropsProvider>
  ),
  DataListItem: () => (
    <DataListRoot>
      <DataListItem>
        <DataListItemLabel>Name</DataListItemLabel>
        <DataListItemValue>John Doe</DataListItemValue>
      </DataListItem>
    </DataListRoot>
  ),
  DataListItemLabel: () => (
    <DataListRoot>
      <DataListItem>
        <DataListItemLabel>Name</DataListItemLabel>
      </DataListItem>
    </DataListRoot>
  ),
  DataListItemValue: () => (
    <DataListRoot>
      <DataListItem>
        <DataListItemValue>John Doe</DataListItemValue>
      </DataListItem>
    </DataListRoot>
  ),
  DataListPropsProvider: () => (
    <DataListPropsProvider value={{ size: "lg" }}>
      <DataListRoot>
        <DataListItem>
          <DataListItemLabel>Name</DataListItemLabel>
        </DataListItem>
      </DataListRoot>
    </DataListPropsProvider>
  ),
  // Two items rather than one, because the part repeats: the same component minted once and
  // rendered per row is what a server has to produce twice from one class map.
  DataListRoot: () => (
    <DataListRoot orientation="horizontal" variant="bold">
      <DataListItem>
        <DataListItemLabel>Name</DataListItemLabel>
        <DataListItemValue>John Doe</DataListItemValue>
      </DataListItem>
      <DataListItem>
        <DataListItemLabel>Email</DataListItemLabel>
        <DataListItemValue>john@example.com</DataListItemValue>
      </DataListItem>
    </DataListRoot>
  ),
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
  // Its `data` is the one prop here that would be a problem if it reached the element: the component
  // omits the three download props, and a server render is where an unomitted `Blob` would be
  // stringified into an attribute rather than merely set as one.
  DownloadTrigger: () => (
    <DownloadTrigger data="hello" fileName="hello.txt" mimeType="text/plain">
      Download
    </DownloadTrigger>
  ),
  Em: () => <Em>emphasis</Em>,
  EmptyStateContent: () => (
    <EmptyStateRoot>
      <EmptyStateContent>
        <EmptyStateTitle>Your cart is empty</EmptyStateTitle>
      </EmptyStateContent>
    </EmptyStateRoot>
  ),
  EmptyStateDescription: () => (
    <EmptyStateRoot>
      <EmptyStateDescription>Explore our products.</EmptyStateDescription>
    </EmptyStateRoot>
  ),
  EmptyStateIndicator: () => (
    <EmptyStateRoot>
      <EmptyStateIndicator>🛒</EmptyStateIndicator>
    </EmptyStateRoot>
  ),
  EmptyStatePropsProvider: () => (
    <EmptyStatePropsProvider value={{ size: "lg" }}>
      <EmptyStateRoot>
        <EmptyStateTitle>Your cart is empty</EmptyStateTitle>
      </EmptyStateRoot>
    </EmptyStatePropsProvider>
  ),
  EmptyStateRoot: () => (
    <EmptyStateRoot size="sm">
      <EmptyStateContent>
        <EmptyStateTitle>Your cart is empty</EmptyStateTitle>
      </EmptyStateContent>
    </EmptyStateRoot>
  ),
  EmptyStateTitle: () => (
    <EmptyStateRoot>
      <EmptyStateTitle>Your cart is empty</EmptyStateTitle>
    </EmptyStateRoot>
  ),
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
  FieldsetContent: () => (
    <FieldsetRoot>
      <FieldsetContent>fields</FieldsetContent>
    </FieldsetRoot>
  ),
  FieldsetContext: () => (
    <FieldsetRoot>
      <FieldsetContext>{(fieldset) => <span>{fieldset.ids.legend}</span>}</FieldsetContext>
    </FieldsetRoot>
  ),
  // `invalid`, because that is the arm with an element: a valid fieldset renders no error text.
  FieldsetErrorText: () => (
    <FieldsetRoot invalid>
      <FieldsetErrorText>Some fields are invalid.</FieldsetErrorText>
    </FieldsetRoot>
  ),
  FieldsetHelperText: () => (
    <FieldsetRoot>
      <FieldsetHelperText>Where the parcel goes.</FieldsetHelperText>
    </FieldsetRoot>
  ),
  FieldsetLegend: () => (
    <FieldsetRoot>
      <FieldsetLegend>Shipping details</FieldsetLegend>
    </FieldsetRoot>
  ),
  FieldsetRoot: () => (
    <FieldsetRoot>
      <FieldsetLegend>Shipping details</FieldsetLegend>
    </FieldsetRoot>
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
  ListIndicator: () => (
    <ListRoot variant="plain">
      <ListItem>
        <ListIndicator>✓</ListIndicator>
        Shipped
      </ListItem>
    </ListRoot>
  ),
  ListItem: () => (
    <ListRoot>
      <ListItem>First</ListItem>
    </ListRoot>
  ),
  // `as="ol"` rather than the default `ul`, because the tag is the one thing about this Root a
  // consumer chooses and the `role="list"` default has to survive it.
  ListRoot: () => (
    <ListRoot as="ol" align="center">
      <ListItem>First</ListItem>
    </ListRoot>
  ),
  ListRootPropsProvider: () => (
    <ListRootPropsProvider value={{ variant: "plain" }}>
      <ListRoot>
        <ListItem>First</ListItem>
      </ListRoot>
    </ListRootPropsProvider>
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
  NativeSelectField: () => (
    <NativeSelectRoot>
      <NativeSelectField placeholder="Select option">
        <option value="react">React</option>
      </NativeSelectField>
    </NativeSelectRoot>
  ),
  NativeSelectIndicator: () => (
    <NativeSelectRoot>
      <NativeSelectIndicator />
    </NativeSelectRoot>
  ),
  NativeSelectPropsProvider: () => (
    <NativeSelectPropsProvider value={{ size: "sm" }}>
      <NativeSelectRoot>
        <NativeSelectField>
          <option value="react">React</option>
        </NativeSelectField>
      </NativeSelectRoot>
    </NativeSelectPropsProvider>
  ),
  NativeSelectRoot: () => (
    <NativeSelectRoot>
      <NativeSelectField>
        <option value="react">React</option>
      </NativeSelectField>
      <NativeSelectIndicator />
    </NativeSelectRoot>
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
  // Its default arrow is built inside the component rather than hoisted beside it — JSX at module
  // scope is constructed at *import* time and 500s the route before anything renders.
  StatDownIndicator: () => (
    <StatRoot>
      <StatHelpText>
        <StatDownIndicator />
        9.05%
      </StatHelpText>
    </StatRoot>
  ),
  // The one component in this family the styling seam does not mint: a plain div that writes the
  // props context every Stat below it reads.
  StatGroup: () => (
    <StatGroup size="lg">
      <StatRoot>
        <StatLabel>Sent</StatLabel>
        <StatValueText>345,670</StatValueText>
      </StatRoot>
    </StatGroup>
  ),
  StatHelpText: () => (
    <StatRoot>
      <StatHelpText>since last month</StatHelpText>
    </StatRoot>
  ),
  StatLabel: () => (
    <StatRoot>
      <StatLabel>Unique visitors</StatLabel>
    </StatRoot>
  ),
  StatPropsProvider: () => (
    <StatPropsProvider value={{ size: "lg" }}>
      <StatRoot>
        <StatValueText>192.1k</StatValueText>
      </StatRoot>
    </StatPropsProvider>
  ),
  StatRoot: () => (
    <StatRoot size="sm">
      <StatLabel>Unique visitors</StatLabel>
      <StatValueText>192.1k</StatValueText>
    </StatRoot>
  ),
  StatUpIndicator: () => (
    <StatRoot>
      <StatHelpText>
        <StatUpIndicator />
        23.36%
      </StatHelpText>
    </StatRoot>
  ),
  StatValueText: () => (
    <StatRoot>
      <StatValueText>192.1k</StatValueText>
    </StatRoot>
  ),
  StatValueUnit: () => (
    <StatRoot>
      <StatValueText>
        3 <StatValueUnit>hr</StatValueUnit>
      </StatValueText>
    </StatRoot>
  ),
  StatusIndicator: () => (
    <StatusRoot colorPalette="green">
      <StatusIndicator />
    </StatusRoot>
  ),
  StatusPropsProvider: () => (
    <StatusPropsProvider value={{ size: "lg" }}>
      <StatusRoot>
        <StatusIndicator />
      </StatusRoot>
    </StatusPropsProvider>
  ),
  StatusRoot: () => (
    <StatusRoot colorPalette="orange">
      <StatusIndicator />
      In Review
    </StatusRoot>
  ),
  Sticky: () => <Sticky top="0">pinned</Sticky>,
  Strong: () => <Strong>bold</Strong>,
  TableBody: () => (
    <TableRoot>
      <TableBody>
        <TableRow>
          <TableCell>Laptop</TableCell>
        </TableRow>
      </TableBody>
    </TableRoot>
  ),
  // `captionSide` is the family's one default, and it is a style prop written before the spread —
  // so what the server has to get right is a class, not an attribute.
  TableCaption: () => (
    <TableRoot>
      <TableCaption>Product inventory</TableCaption>
    </TableRoot>
  ),
  TableCell: () => (
    <TableRoot>
      <TableBody>
        <TableRow>
          <TableCell>Laptop</TableCell>
        </TableRow>
      </TableBody>
    </TableRoot>
  ),
  TableColumn: () => (
    <TableRoot>
      <TableColumnGroup>
        <TableColumn htmlWidth="50%" />
      </TableColumnGroup>
    </TableRoot>
  ),
  // The two slotless parts: `withContext` with no slot reads no context at all, so this is the
  // arm that would throw the "no Root" error if it ever did.
  TableColumnGroup: () => (
    <TableRoot>
      <TableColumnGroup>
        <TableColumn htmlWidth="50%" />
      </TableColumnGroup>
    </TableRoot>
  ),
  TableColumnHeader: () => (
    <TableRoot>
      <TableHeader>
        <TableRow>
          <TableColumnHeader>Product</TableColumnHeader>
        </TableRow>
      </TableHeader>
    </TableRoot>
  ),
  TableFooter: () => (
    <TableRoot>
      <TableFooter>
        <TableRow>
          <TableCell>Total</TableCell>
        </TableRow>
      </TableFooter>
    </TableRoot>
  ),
  TableHeader: () => (
    <TableRoot>
      <TableHeader>
        <TableRow>
          <TableColumnHeader>Product</TableColumnHeader>
        </TableRow>
      </TableHeader>
    </TableRoot>
  ),
  // Every boolean variant at once, because each one is a separate `sva()` input and a class the
  // server has to compute the same way the client will.
  TableRoot: () => (
    <TableRoot variant="outline" size="lg" interactive stickyHeader striped showColumnBorder>
      <TableBody>
        <TableRow>
          <TableCell>Laptop</TableCell>
        </TableRow>
      </TableBody>
    </TableRoot>
  ),
  TableRootPropsProvider: () => (
    <TableRootPropsProvider value={{ size: "sm" }}>
      <TableRoot>
        <TableBody>
          <TableRow>
            <TableCell>Laptop</TableCell>
          </TableRow>
        </TableBody>
      </TableRoot>
    </TableRootPropsProvider>
  ),
  TableRow: () => (
    <TableRoot>
      <TableBody>
        <TableRow>
          <TableCell>Laptop</TableCell>
        </TableRow>
      </TableBody>
    </TableRoot>
  ),
  // The one part of this family with no Root above it, which is the whole point of it: it wraps the
  // table rather than belonging to it.
  TableScrollArea: () => (
    <TableScrollArea maxW="xl">
      <TableRoot>
        <TableBody>
          <TableRow>
            <TableCell>Laptop</TableCell>
          </TableRow>
        </TableBody>
      </TableRoot>
    </TableScrollArea>
  ),
  // Every panel builds a presence machine of its own, so a selected `defaultValue` is what makes
  // this family's gated part render at all — the render strategy's own `false`/`false` keep an
  // unselected panel in the served markup, hidden.
  TabsContent: () => (
    <TabsRoot defaultValue="one">
      <TabsContent value="one">first</TabsContent>
    </TabsRoot>
  ),
  TabsContentGroup: () => (
    <TabsRoot defaultValue="one">
      <TabsContentGroup>
        <TabsContent value="one">first</TabsContent>
      </TabsContentGroup>
    </TabsRoot>
  ),
  TabsContext: () => (
    <TabsRoot defaultValue="one">
      <TabsContext>{(tabs) => <span>{tabs.value}</span>}</TabsContext>
    </TabsRoot>
  ),
  // Inside the list, which is the only place it positions correctly — and `hidden` on the server,
  // because the machine's rect starts `null` and nothing has measured a trigger yet.
  TabsIndicator: () => (
    <TabsRoot defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">First</TabsTrigger>
        <TabsIndicator />
      </TabsList>
    </TabsRoot>
  ),
  TabsList: () => (
    <TabsRoot defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">First</TabsTrigger>
      </TabsList>
    </TabsRoot>
  ),
  TabsPropsProvider: () => (
    <TabsPropsProvider value={{ variant: "enclosed" }}>
      <TabsRoot defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">First</TabsTrigger>
        </TabsList>
      </TabsRoot>
    </TabsPropsProvider>
  ),
  TabsRoot: () => (
    <TabsRoot defaultValue="one" orientation="vertical">
      <TabsList>
        <TabsTrigger value="one">First</TabsTrigger>
      </TabsList>
    </TabsRoot>
  ),
  // The one subject that starts its machine outside the component that renders it, which is the
  // path a server render would take through `createTabs` with no Root above it.
  TabsRootProvider: () => {
    const Subject = () => {
      const tabs = createTabs({ defaultValue: "one" });
      return (
        <TabsRootProvider value={tabs}>
          <TabsContent value="one">first</TabsContent>
        </TabsRootProvider>
      );
    };
    return <Subject />;
  },
  TabsTrigger: () => (
    <TabsRoot defaultValue="one">
      <TabsList>
        <TabsTrigger value="one">First</TabsTrigger>
        <TabsTrigger value="two" disabled>
          Second
        </TabsTrigger>
      </TabsList>
    </TabsRoot>
  ),
  // Its default ✕ is built inside the component rather than hoisted beside it — JSX at module scope
  // is constructed at *import* time and 500s the route before anything renders.
  TagCloseTrigger: () => (
    <TagRoot>
      <TagEndElement>
        <TagCloseTrigger />
      </TagEndElement>
    </TagRoot>
  ),
  TagEndElement: () => (
    <TagRoot>
      <TagEndElement>+</TagEndElement>
    </TagRoot>
  ),
  TagLabel: () => (
    <TagRoot>
      <TagLabel>Fish</TagLabel>
    </TagRoot>
  ),
  TagRoot: () => (
    <TagRoot size="lg" variant="solid">
      <TagLabel>Fish</TagLabel>
    </TagRoot>
  ),
  TagRootPropsProvider: () => (
    <TagRootPropsProvider value={{ size: "xl" }}>
      <TagRoot>
        <TagLabel>Fish</TagLabel>
      </TagRoot>
    </TagRootPropsProvider>
  ),
  TagStartElement: () => (
    <TagRoot>
      <TagStartElement>@</TagStartElement>
    </TagRoot>
  ),
  Text: () => <Text textStyle="lg">paragraph</Text>,
  // `autoresize`, because that is the arm with the inline `style` and the subscription — a plain
  // one exercises neither.
  Textarea: () => <Textarea placeholder="Comment..." size="lg" autoresize />,
  TextareaPropsProvider: () => (
    <TextareaPropsProvider value={{ size: "lg" }}>
      <Textarea />
    </TextareaPropsProvider>
  ),
  TextPropsProvider: () => (
    <TextPropsProvider value={{ textStyle: "sm" }}>
      <Text>paragraph</Text>
    </TextPropsProvider>
  ),
  TimelineConnector: () => (
    <TimelineRoot>
      <TimelineItem>
        <TimelineConnector>
          <TimelineSeparator />
          <TimelineIndicator />
        </TimelineConnector>
      </TimelineItem>
    </TimelineRoot>
  ),
  TimelineContent: () => (
    <TimelineRoot>
      <TimelineItem>
        <TimelineContent>
          <TimelineTitle>Product Shipped</TimelineTitle>
        </TimelineContent>
      </TimelineItem>
    </TimelineRoot>
  ),
  TimelineDescription: () => (
    <TimelineRoot>
      <TimelineItem>
        <TimelineContent>
          <TimelineDescription>13th May 2021</TimelineDescription>
        </TimelineContent>
      </TimelineItem>
    </TimelineRoot>
  ),
  TimelineIndicator: () => (
    <TimelineRoot>
      <TimelineItem>
        <TimelineConnector>
          <TimelineIndicator>1</TimelineIndicator>
        </TimelineConnector>
      </TimelineItem>
    </TimelineRoot>
  ),
  TimelineItem: () => (
    <TimelineRoot>
      <TimelineItem>
        <TimelineContent>
          <TimelineTitle>Product Shipped</TimelineTitle>
        </TimelineContent>
      </TimelineItem>
    </TimelineRoot>
  ),
  // `showLastSeparator`, because it is the one variant whose whole effect is a custom property on
  // the last item — a value the server has to write into the markup or the line ends early.
  TimelineRoot: () => (
    <TimelineRoot size="lg" variant="outline" showLastSeparator>
      <TimelineItem>
        <TimelineConnector>
          <TimelineSeparator />
          <TimelineIndicator />
        </TimelineConnector>
      </TimelineItem>
    </TimelineRoot>
  ),
  TimelineRootPropsProvider: () => (
    <TimelineRootPropsProvider value={{ size: "xl" }}>
      <TimelineRoot>
        <TimelineItem>
          <TimelineContent>
            <TimelineTitle>Product Shipped</TimelineTitle>
          </TimelineContent>
        </TimelineItem>
      </TimelineRoot>
    </TimelineRootPropsProvider>
  ),
  TimelineSeparator: () => (
    <TimelineRoot>
      <TimelineItem>
        <TimelineConnector>
          <TimelineSeparator />
        </TimelineConnector>
      </TimelineItem>
    </TimelineRoot>
  ),
  TimelineTitle: () => (
    <TimelineRoot>
      <TimelineItem>
        <TimelineContent>
          <TimelineTitle>Product Shipped</TimelineTitle>
        </TimelineContent>
      </TimelineItem>
    </TimelineRoot>
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
