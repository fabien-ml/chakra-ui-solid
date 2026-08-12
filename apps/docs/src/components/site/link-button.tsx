import { Button, type ButtonProps } from "chakra-ui-solid";
import { omit } from "solid-js";
import { DocLink } from "~/components/doc-link";

/**
 * The landing page's call to action: our own `Button`, pointed at a docs page.
 *
 * The router link is reached through Button's **`render` prop**, our whole answer to polymorphism: a
 * function that receives the component's computed props and returns the element, never a JSX element
 * and never `asChild` (`component-blueprint.md` §3.5). It is also the only route that reaches
 * `DocLink`, whose props are a slug and a class rather than an anchor's.
 *
 * `size="xl"` is the 48px control this file used to spell as `minH="12"` plus a dozen siblings, and
 * it sits before the spread so a caller that wants another size just passes one and wins. `variant`
 * needs no declaration at all now — it arrives with `ButtonProps` and covers all six looks.
 */
export function DocLinkButton(props: ButtonProps & { slug: string }) {
  const rest = omit(props, "slug", "children");

  return (
    <Button
      size="xl"
      {...rest}
      render={(renderProps) => (
        <DocLink slug={props.slug} class={renderProps.class as string}>
          {renderProps.children}
        </DocLink>
      )}
    >
      {props.children}
    </Button>
  );
}
