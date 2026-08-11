import { Box, type BoxProps } from "chakra-ui-solid";
import { omit } from "solid-js";
import { DocLink } from "~/components/doc-link";

/**
 * The landing page's call to action, in Chakra's two button looks.
 *
 * **Not the Button component** — that ships at step 6 (`roadmap.md` §4). Until it does this is Box
 * with style props, which is what a consumer would write today, and the swap is one file.
 *
 * The router link is reached through Box's **`render` prop**, our whole answer to polymorphism: a
 * function that receives Box's computed props, never a JSX element and never `asChild`
 * (`component-blueprint.md` §3.5). It is also the only route that reaches `DocLink`, whose props
 * are a slug and a class rather than an anchor's.
 *
 * Each look is a ternary between two literal values, which is static to Panda's extractor and to
 * `check:style-contract` alike — a class assembled from a variable is a class nobody generated.
 */
export function DocLinkButton(props: BoxProps & { slug: string; variant?: "solid" | "outline" }) {
  const rest = omit(props, "slug", "variant", "children");
  const isOutline = () => props.variant === "outline";

  return (
    <Box
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      gap="2"
      minH="12"
      px="6"
      fontSize="md"
      fontWeight="semibold"
      borderRadius="l2"
      textDecoration="none"
      transition="background-color 0.2s, border-color 0.2s"
      focusRing="outside"
      borderWidth={isOutline() ? "1px" : "0"}
      borderColor={isOutline() ? "border.emphasized" : "transparent"}
      bg={isOutline() ? "transparent" : "colorPalette.solid"}
      color={isOutline() ? "fg" : "colorPalette.contrast"}
      _hover={isOutline() ? { bg: "bg.subtle" } : { bg: "colorPalette.emphasized" }}
      render={(renderProps) => (
        <DocLink slug={props.slug} class={renderProps.class as string}>
          {renderProps.children}
        </DocLink>
      )}
      {...rest}
    >
      {props.children}
    </Box>
  );
}
