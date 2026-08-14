import { Heading, Link, LinkOverlay, type LinkProps, Stack, Text } from "chakra-ui-solid";

export default function LinkOverlayBasic() {
  return (
    <Stack position="relative">
      <Heading as="h4">Wanna try it out?</Heading>
      <Text color="fg.muted">This entire area is a link. Click it to see the effect.</Text>
      {/* `render` where the React version writes `asChild`: the overlay hands its computed props to
          the Link to place, rather than cloning them onto an element that was already built. */}
      <LinkOverlay
        href="#"
        render={(overlayProps) => <Link {...(overlayProps as LinkProps)} variant="underline" />}
      >
        Click me
      </LinkOverlay>
    </Stack>
  );
}
