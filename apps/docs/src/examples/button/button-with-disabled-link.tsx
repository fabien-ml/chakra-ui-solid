import type { JSX } from "@solidjs/web";
import { Button } from "chakra-ui-solid";

export default function ButtonWithDisabledLink() {
  return (
    // `render` is this port's `asChild`, and the cast is what a render prop costs — the computed
    // props are typed against the `button` the component would otherwise have rendered
    // (`concepts/composition.mdx`, *Best Practices*).
    <Button
      render={(props) => (
        // An anchor that cancels its own navigation is what this section documents, so the rule's
        // advice — "use a button instead" — is the element the example deliberately is not.
        // biome-ignore lint/a11y/useValidAnchor: the disabled link is the subject of the example
        <a
          {...(props as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)}
          href="#disabled-link"
          data-disabled=""
          onClick={(event) => event.preventDefault()}
        />
      )}
    >
      Button
    </Button>
  );
}
