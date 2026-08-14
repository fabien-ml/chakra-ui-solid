import type { ComponentProps } from "@solidjs/web";
import { Heading, Link, LinkBox, LinkOverlay, Span, Text } from "chakra-ui-solid";

export default function LinkOverlayArticle() {
  return (
    <LinkBox as="article" maxW="sm" p="5" borderWidth="1px" rounded="md">
      {/* A `time` element wearing Span's styles. The cast is the composition page's: a `render`
          target that is a different host element has a different `ref` type. */}
      <Span
        color="fg.muted"
        textStyle="sm"
        render={(spanProps) => (
          <time
            {...(spanProps as ComponentProps<"time">)}
            datetime="2021-01-15 15:30:00 +0000 UTC"
          />
        )}
      >
        13 days ago
      </Span>
      <Heading size="lg" my="2">
        <LinkOverlay href="#">Chakra V3 Workshop</LinkOverlay>
      </Heading>
      <Text mb="3" color="fg.muted">
        Catch up on whats been cooking at Chakra UI and explore some of the popular community
        resources.
      </Text>
      <Link href="#inner-link" variant="underline" colorPalette="teal">
        Inner Link
      </Link>
    </LinkBox>
  );
}
